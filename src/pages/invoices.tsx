import { useState, useEffect, useMemo } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Search, TrendingUp, AlertCircle, Download, Trash2, Edit, DollarSign, CheckCircle, MessageCircle, Clock, FileText, Copy, CheckCircle2, AlertTriangle, FilterX, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { 
  REMINDER_TEMPLATES, 
  calculateReminderStatus, 
  generateWhatsAppLink, 
  type ReminderLog, 
  type ReminderData 
} from "@/lib/reminder-templates";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  address?: string;
  type: "Member" | "Sponsored" | "Scholarship";
  teamAssignment?: string;
  feeStructure?: "Standard" | "Reduced";
  membershipCategory?: string;
}

interface Team {
  id: string;
  name: string;
  category: "Junior" | "Youth" | "Adult";
  monthlyFee: number;
  reducedMonthlyFee?: number;
}

interface MonthExemption {
  month: string;
  exempt: boolean;
  reason?: "Injury" | "Not in Bali" | "Other";
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  memberId: string;
  billingPeriod: string;
  dueDate: string;
  baseAmount: number;
  taxAmount: number;
  amount: number;
  discount?: number;
  monthExemptions?: MonthExemption[];
  paymentLink?: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  createdAt?: string;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  lastReminderSent?: string;
  reminderCount?: number;
}

const QUARTER_MONTHS: Record<string, string[]> = {
  "2026 Q1": ["January", "February", "March"],
  "2026 Q2": ["April", "May", "June"],
  "2026 Q3": ["July", "August", "September"],
  "2026 Q4": ["October", "November", "December"],
  "2026 Annual": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const TAX_RATE = 0.10;

const generateInvoiceNumber = (billingPeriod: string, teamName: string, existingInvoices: Invoice[]): string => {
  const year = billingPeriod.includes("2026") ? "2026" : "2025";
  const period = billingPeriod.includes("Annual") ? "ANNUAL" : billingPeriod.split(" ")[1];
  const teamCode = teamName.replace(/\s+/g, "").substring(0, 4).toUpperCase();
  
  const prefix = `BBFC-${period}-${year}-${teamCode}`;
  const existingNumbers = existingInvoices
    .filter(inv => inv.invoiceNumber?.startsWith(prefix))
    .map(inv => {
      const match = inv.invoiceNumber?.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });
  
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
};

const normalizeTeamName = (name: string) => {
  if (!name) return "";
  const normalized = name.toLowerCase().trim();

  if (normalized.includes("kindy") && (normalized.includes("1") || normalized.includes("u61"))) return "kindy1";
  if (normalized.includes("kindy") && (normalized.includes("2") || normalized.includes("u62"))) return "kindy2";
  
  return normalized
    .replace(/\s+/g, "")
    .replace("35+", "")
    .replace("45+", "")
    .replace("team", "")
    .replace(/[^a-z0-9]/g, "");
};

const areTeamNamesMatch = (name1: string, name2: string) => {
  const n1 = normalizeTeamName(name1);
  const n2 = normalizeTeamName(name2);
  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
};

export default function Invoices() {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"created" | "date" | "name" | "number">("created");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [bulkStatusValue, setBulkStatusValue] = useState<Invoice["status"]>("Sent");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Invoice>>({
    memberId: "",
    billingPeriod: "",
    dueDate: "",
    baseAmount: 0,
    taxAmount: 0,
    amount: 0,
    monthExemptions: [],
    paymentLink: "",
    status: "Draft",
  });

  const [bulkFormData, setBulkFormData] = useState({
    teamName: "",
    billingPeriod: "",
    dueDate: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("invoices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        const migrated = parsed.map((invoice: any) => {
          if (!invoice.monthExemptions) {
            const totalAmount = invoice.amount || 0;
            const baseAmount = totalAmount / 1.1;
            const taxAmount = totalAmount - baseAmount;

            const months = QUARTER_MONTHS[invoice.billingPeriod] || [];

            return {
              ...invoice,
              baseAmount: Math.round(baseAmount),
              taxAmount: Math.round(taxAmount),
              monthExemptions: months.map((month: string) => ({
                  month,
                  exempt: false,
                  reason: undefined,
                })
              ),
            };
          }
          return invoice;
        });

        setInvoices(migrated);
        localStorage.setItem("invoices", JSON.stringify(migrated));
      } catch (error) {
        console.error("Failed to load invoices:", error);
      }
    }
  }, []);

  useEffect(() => {
    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
      try {
        const parsed = JSON.parse(savedTeams);
        setTeams(parsed);
      } catch (error) {
        console.error("Failed to load teams:", error);
      }
    }
  }, []);

  useEffect(() => {
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      try {
        const parsed = JSON.parse(savedMembers);
        setMembers(parsed);
      } catch (error) {
        console.error("Failed to load members:", error);
      }
    }
  }, []);

  // Calculate duplicates
  const duplicateInvoiceIds = useMemo(() => {
    const lookup = new Map<string, string[]>();
    const duplicates: string[] = [];

    invoices.forEach(inv => {
      const key = `${inv.memberId}-${inv.billingPeriod}`;
      const existing = lookup.get(key) || [];
      lookup.set(key, [...existing, inv.id]);
    });

    lookup.forEach((ids) => {
      if (ids.length > 1) {
        duplicates.push(...ids);
      }
    });

    return new Set(duplicates);
  }, [invoices]);

  // Auto-switch sort when duplicates mode is toggled
  useEffect(() => {
    if (showDuplicatesOnly) {
      setSortBy("name");
    } else {
      setSortBy("created");
    }
  }, [showDuplicatesOnly]);

  const saveInvoices = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
  };

  const calculateInvoiceAmount = (monthlyFee: number, exemptions: MonthExemption[] = [], isAnnual: boolean = false) => {
    const activeMonths = exemptions.filter(e => !e.exempt).length;
    const baseAmount = monthlyFee * activeMonths;
    
    let discount = 0;
    let discountedBase = baseAmount;
    
    if (isAnnual && activeMonths === 12) {
      discount = baseAmount * 0.10;
      discountedBase = baseAmount - discount;
    }
    
    const taxAmount = discountedBase * TAX_RATE;
    const totalAmount = discountedBase + taxAmount;
    
    return {
      baseAmount,
      discount,
      taxAmount,
      amount: totalAmount,
    };
  };

  const initializeMonthExemptions = (billingPeriod: string): MonthExemption[] => {
    const months = QUARTER_MONTHS[billingPeriod] || [];
    return months.map(month => ({
      month,
      exempt: false,
      reason: undefined,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      memberId: "",
      billingPeriod: "",
      dueDate: "",
      baseAmount: 0,
      taxAmount: 0,
      amount: 0,
      monthExemptions: [],
      paymentLink: "",
      status: "Draft",
    });
    setFormErrors({});
  };

  const handleMemberChange = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member && member.teamAssignment) {
      const team = teams.find(t => areTeamNamesMatch(t.name, member.teamAssignment || ""));
      if (team && formData.billingPeriod) {
        const exemptions = initializeMonthExemptions(formData.billingPeriod);
        const isAnnual = formData.billingPeriod.includes("Annual");
        
        let monthlyFee = team.monthlyFee;
        const isReduced = member.feeStructure === "Reduced";
        if (isReduced && team.reducedMonthlyFee) {
          monthlyFee = team.reducedMonthlyFee;
        }

        const amounts = calculateInvoiceAmount(monthlyFee, exemptions, isAnnual);
        setFormData({
          ...formData,
          memberId,
          monthExemptions: exemptions,
          ...amounts,
        });
      } else {
        setFormData({ ...formData, memberId });
      }
    } else {
      setFormData({ ...formData, memberId });
    }
  };

  const handleBillingPeriodChange = (billingPeriod: string) => {
    const member = members.find(m => m.id === formData.memberId);
    if (member && member.teamAssignment) {
      const team = teams.find(t => areTeamNamesMatch(t.name, member.teamAssignment || ""));
      if (team) {
        const exemptions = initializeMonthExemptions(billingPeriod);
        const isAnnual = billingPeriod.includes("Annual");

        let monthlyFee = team.monthlyFee;
        const isReduced = member.feeStructure === "Reduced";
        if (isReduced && team.reducedMonthlyFee) {
          monthlyFee = team.reducedMonthlyFee;
        }

        const amounts = calculateInvoiceAmount(monthlyFee, exemptions, isAnnual);
        setFormData({
          ...formData,
          billingPeriod,
          monthExemptions: exemptions,
          ...amounts,
        });
      } else {
        setFormData({ ...formData, billingPeriod });
      }
    } else {
      setFormData({ ...formData, billingPeriod });
    }
  };

  const handleExemptionChange = (index: number, exempt: boolean) => {
    const member = members.find(m => m.id === formData.memberId);
    if (!member || !member.teamAssignment || !formData.monthExemptions) return;

    const team = teams.find(t => areTeamNamesMatch(t.name, member.teamAssignment || ""));
    if (!team) return;

    const updatedExemptions = [...formData.monthExemptions];
    updatedExemptions[index] = {
      ...updatedExemptions[index],
      exempt,
      reason: exempt ? updatedExemptions[index].reason || "Injury" : undefined,
    };

    const isAnnual = formData.billingPeriod?.includes("Annual") || false;
    
    let monthlyFee = team.monthlyFee;
    const isReduced = member.feeStructure === "Reduced";
    if (isReduced && team.reducedMonthlyFee) {
      monthlyFee = team.reducedMonthlyFee;
    }

    const amounts = calculateInvoiceAmount(monthlyFee, updatedExemptions, isAnnual);
    setFormData({
      ...formData,
      monthExemptions: updatedExemptions,
      ...amounts,
    });
  };

  const handleReasonChange = (index: number, reason: "Injury" | "Not in Bali" | "Other") => {
    if (!formData.monthExemptions) return;

    const updatedExemptions = [...formData.monthExemptions];
    updatedExemptions[index] = {
      ...updatedExemptions[index],
      reason,
    };

    setFormData({
      ...formData,
      monthExemptions: updatedExemptions,
    });
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingId(invoice.id);
    setFormData({
      memberId: invoice.memberId,
      billingPeriod: invoice.billingPeriod,
      dueDate: invoice.dueDate,
      baseAmount: invoice.baseAmount,
      taxAmount: invoice.taxAmount,
      amount: invoice.amount,
      monthExemptions: invoice.monthExemptions || initializeMonthExemptions(invoice.billingPeriod),
      paymentLink: invoice.paymentLink || "",
      status: invoice.status,
    });
    setFormErrors({});
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!invoiceToDelete || !deletionReason.trim()) {
      setFormErrors({ deletionReason: "Please provide a reason for deletion" });
      return;
    }

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceToDelete
        ? {
            ...inv,
            deletedAt: new Date().toISOString(),
            deletedBy: "Admin",
            deletionReason: deletionReason.trim(),
          }
        : inv
    ).filter(inv => inv.id !== invoiceToDelete);

    saveInvoices(updatedInvoices);
    
    const deletedInvoices = JSON.parse(localStorage.getItem("deletedInvoices") || "[]");
    const deletedInvoice = invoices.find(inv => inv.id === invoiceToDelete);
    if (deletedInvoice) {
      deletedInvoices.push({
        ...deletedInvoice,
        deletedAt: new Date().toISOString(),
        deletedBy: "Admin",
        deletionReason: deletionReason.trim(),
      });
      localStorage.setItem("deletedInvoices", JSON.stringify(deletedInvoices));
    }

    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
    setDeletionReason("");
    setFormErrors({});
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    if (!deletionReason.trim()) {
      setFormErrors({ deletionReason: "Please provide a reason for bulk deletion" });
      return;
    }

    const deletedInvoices = JSON.parse(localStorage.getItem("deletedInvoices") || "[]");
    const timestamp = new Date().toISOString();
    
    selectedInvoices.forEach(invId => {
      const invoice = invoices.find(inv => inv.id === invId);
      if (invoice) {
        deletedInvoices.push({
          ...invoice,
          deletedAt: timestamp,
          deletedBy: "Admin",
          deletionReason: deletionReason.trim(),
        });
      }
    });

    localStorage.setItem("deletedInvoices", JSON.stringify(deletedInvoices));

    const updatedInvoices = invoices.filter((inv) => !selectedInvoices.has(inv.id));
    saveInvoices(updatedInvoices);
    
    setSelectedInvoices(new Set());
    setBulkDeleteDialogOpen(false);
    setDeletionReason("");
    setFormErrors({});
  };

  const handleBulkStatusChange = () => {
    setShowBulkStatusDialog(true);
  };

  const confirmBulkStatusChange = () => {
    const updatedInvoices = invoices.map((inv) =>
      selectedInvoices.has(inv.id)
        ? { ...inv, status: bulkStatusValue }
        : inv
    );
    saveInvoices(updatedInvoices);
    setSelectedInvoices(new Set());
    setShowBulkStatusDialog(false);
    setBulkStatusValue("Sent");
  };

  const filteredInvoices = useMemo(() => {
    const result = invoices.filter((invoice) => {
      const member = members.find((m) => m.id === invoice.memberId);
      const memberName = member ? `${member.firstName} ${member.lastName}`.toLowerCase() : "";
      const memberTeam = member?.teamAssignment || "";

      const matchesSearch = memberName.includes(searchTerm.toLowerCase()) || (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus;
      const matchesTeam = selectedTeam === "all" || memberTeam === selectedTeam;
      
      const matchesDuplicates = !showDuplicatesOnly || duplicateInvoiceIds.has(invoice.id);

      return matchesSearch && matchesStatus && matchesTeam && matchesDuplicates;
    });

    // Sort Logic
    result.sort((a, b) => {
      const memberA = members.find(m => m.id === a.memberId);
      const memberB = members.find(m => m.id === b.memberId);
      const nameA = memberA ? `${memberA.firstName} ${memberA.lastName}` : "";
      const nameB = memberB ? `${memberB.firstName} ${memberB.lastName}` : "";

      if (sortBy === "name") {
        if (nameA.localeCompare(nameB) !== 0) return nameA.localeCompare(nameB);
        return a.billingPeriod.localeCompare(b.billingPeriod); // Secondary sort by period
      }
      
      if (sortBy === "date") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (sortBy === "number") {
        return (a.invoiceNumber || "").localeCompare(b.invoiceNumber || "");
      }

      // Default: Created Date Descending
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [invoices, members, searchTerm, selectedStatus, selectedTeam, showDuplicatesOnly, duplicateInvoiceIds, sortBy]);

  // Updated Revenue & Outstanding Logic
  const paidInvoicesList = invoices.filter((inv) => {
      const member = members.find((m) => m.id === inv.memberId);
      return member && (member.type === "Member" || member.type === "Sponsored") && inv.status === "Paid";
  });
  const totalRevenue = paidInvoicesList.reduce((sum, inv) => sum + inv.amount, 0);
  const paidCount = paidInvoicesList.length;

  const outstandingInvoicesList = invoices.filter((inv) => {
      const member = members.find((m) => m.id === inv.memberId);
      return member && (member.type === "Member" || member.type === "Sponsored") && inv.status !== "Paid";
  });
  const outstandingAmount = outstandingInvoicesList.reduce((sum, inv) => sum + inv.amount, 0);
  const outstandingCount = outstandingInvoicesList.length;

  const handleStatusChange = (id: string, newStatus: Invoice["status"]) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv);
    saveInvoices(updated);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    const member = members.find(m => m.id === invoice.memberId);
    if (!member) {
      toast({
        title: "Error",
        description: "Member not found",
        variant: "destructive"
      });
      return;
    }

    const team = teams.find(t => areTeamNamesMatch(t.name, member.teamAssignment || ""));
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber || "N/A",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: invoice.dueDate,
      member: {
        name: `${member.firstName} ${member.lastName}`,
        address: member.address || "No address provided",
        email: member.email || "No email provided",
      },
      billingPeriod: invoice.billingPeriod,
      items: [],
      baseAmount: invoice.baseAmount,
      discount: invoice.discount,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.amount,
      monthExemptions: invoice.monthExemptions,
    };

    try {
      const pdf = await generateInvoicePDF(invoiceData);
      pdf.save(`${invoice.invoiceNumber || invoice.id}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the invoice PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!formData.memberId) {
      errors.memberId = "Please select a member";
    }

    if (!formData.billingPeriod) {
      errors.billingPeriod = "Please select a billing period";
    }

    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    if (formData.amount === undefined || formData.amount < 0) {
      errors.amount = "Amount cannot be negative";
    }

    if (formData.paymentLink && !formData.paymentLink.match(/^https?:\/\/.+/)) {
      errors.paymentLink = "Payment link must be a valid URL (starting with http:// or https://)";
    }
    
    // Check for duplicate invoice
    if (formData.memberId && formData.billingPeriod) {
      const isDuplicate = invoices.some(inv => 
        inv.memberId === formData.memberId && 
        inv.billingPeriod === formData.billingPeriod && 
        inv.id !== editingId
      );
      
      if (isDuplicate) {
        errors.billingPeriod = "An invoice already exists for this member and billing period.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingId) {
      const updatedInvoices = invoices.map((invoice) =>
        invoice.id === editingId
          ? { ...invoice, ...formData } as Invoice
          : invoice
      );
      saveInvoices(updatedInvoices);
      toast({
        title: "Invoice Updated",
        description: "Invoice details have been saved.",
      });
    } else {
      const member = members.find(m => m.id === formData.memberId);
      const teamAssignment = member?.teamAssignment || "General";
      
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: generateInvoiceNumber(formData.billingPeriod!, teamAssignment, invoices),
        memberId: formData.memberId!,
        billingPeriod: formData.billingPeriod!,
        dueDate: formData.dueDate!,
        baseAmount: formData.baseAmount!,
        taxAmount: formData.taxAmount!,
        amount: formData.amount!,
        monthExemptions: formData.monthExemptions || [],
        paymentLink: formData.paymentLink || "",
        status: formData.status || "Draft",
        createdAt: new Date().toISOString(),
      };
      saveInvoices([...invoices, newInvoice]);
      toast({
        title: "Invoice Created",
        description: "New invoice has been generated.",
      });
    }

    setShowAddDialog(false);
    resetForm();
  };

  const getEligibleMembersForTeam = (teamName: string) => {
    return members.filter((m) => {
      const teamMatch = areTeamNamesMatch(m.teamAssignment || "", teamName);
      const isStandard = m.membershipCategory === "Standard" || (!m.membershipCategory && m.type === "Member");
      const isNotSponsored = m.membershipCategory !== "Sponsored" && m.type !== "Sponsored";
      const isNotScholarship = m.membershipCategory !== "Scholarship" && m.type !== "Scholarship";

      return teamMatch && isStandard && isNotSponsored && isNotScholarship;
    });
  };

  const handleBulkGenerate = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!bulkFormData.teamName) {
      errors.teamName = "Please select a team";
    }
    if (!bulkFormData.billingPeriod) {
      errors.billingPeriod = "Please select a billing period";
    }
    if (!bulkFormData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const team = teams.find(t => t.name === bulkFormData.teamName);
    if (!team) {
      setFormErrors({ teamName: "Team not found in settings" });
      return;
    }

    const teamMembers = getEligibleMembersForTeam(bulkFormData.teamName);
    
    if (teamMembers.length === 0) {
      setFormErrors({ teamName: "No paying members found in this team" });
      return;
    }
    
    // Check for existing invoices for this period
    const existingInvoicesForPeriod = invoices.filter(inv => inv.billingPeriod === bulkFormData.billingPeriod);
    const existingMemberIds = new Set(existingInvoicesForPeriod.map(inv => inv.memberId));
    
    const membersToInvoice = teamMembers.filter(m => !existingMemberIds.has(m.id));
    
    if (membersToInvoice.length === 0) {
      toast({
        title: "No Invoices Generated",
        description: "All eligible members already have invoices for this period.",
        variant: "default"
      });
      setShowBulkDialog(false);
      return;
    }

    const exemptions = initializeMonthExemptions(bulkFormData.billingPeriod);
    const isAnnual = bulkFormData.billingPeriod.includes("Annual");

    const newInvoices = membersToInvoice.map((member) => {
      let monthlyFee = team.monthlyFee;
      const isReduced = member.feeStructure === "Reduced";
      if (isReduced && team.reducedMonthlyFee) {
        monthlyFee = team.reducedMonthlyFee;
      }

      const amounts = calculateInvoiceAmount(monthlyFee, exemptions, isAnnual);

      return {
        id: Date.now().toString() + Math.random(),
        invoiceNumber: "", // Will be set in second pass
        memberId: member.id,
        billingPeriod: bulkFormData.billingPeriod,
        dueDate: bulkFormData.dueDate,
        baseAmount: amounts.baseAmount,
        taxAmount: amounts.taxAmount,
        amount: amounts.amount,
        discount: amounts.discount,
        monthExemptions: exemptions,
        paymentLink: "",
        status: "Draft" as const,
        createdAt: new Date().toISOString(),
      };
    });

    // Fix invoice numbering to ensure uniqueness in batch
    const currentInvoices = [...invoices];
    const finalInvoices = newInvoices.map(inv => {
        const num = generateInvoiceNumber(inv.billingPeriod, team.name, currentInvoices);
        const newInv = { ...inv, invoiceNumber: num };
        currentInvoices.push(newInv);
        return newInv;
    });

    saveInvoices(currentInvoices);
    
    const skippedCount = teamMembers.length - membersToInvoice.length;
    toast({
      title: "Bulk Generation Complete",
      description: `Generated ${finalInvoices.length} invoices. ${skippedCount > 0 ? `Skipped ${skippedCount} existing invoices.` : ""}`,
    });
    
    setShowBulkDialog(false);
    setBulkFormData({
      teamName: "",
      billingPeriod: "",
      dueDate: "",
    });
  };

  const toggleInvoiceSelection = (id: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
    }
  };

  // Reminder System Functions
  const openReminderDialog = (invoice: Invoice) => {
    setSelectedInvoiceForReminder(invoice);
    const status = calculateReminderStatus({ 
      dueDate: invoice.dueDate, 
      status: invoice.status 
    });
    
    if (status.suggestedTemplate) {
      setSelectedReminderTemplate(status.suggestedTemplate);
      const template = REMINDER_TEMPLATES.find(t => t.id === status.suggestedTemplate);
      const member = members.find(m => m.id === invoice.memberId);
      
      if (template && member) {
        const data: ReminderData = {
          memberName: `${member.firstName} ${member.lastName}`,
          invoiceNumber: invoice.invoiceNumber || "DRAFT",
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          billingPeriod: invoice.billingPeriod,
          daysUntilDue: status.daysUntilDue,
          daysOverdue: status.daysOverdue,
          paymentLink: invoice.paymentLink
        };
        setCustomReminderMessage(template.message(data));
      }
    } else {
      setSelectedReminderTemplate("custom");
      setCustomReminderMessage("");
    }
    setShowReminderDialog(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedReminderTemplate(templateId);
    if (!selectedInvoiceForReminder) return;
    
    const template = REMINDER_TEMPLATES.find(t => t.id === templateId);
    const member = members.find(m => m.id === selectedInvoiceForReminder.memberId);
    
    if (template && member) {
      const status = calculateReminderStatus({ 
        dueDate: selectedInvoiceForReminder.dueDate, 
        status: selectedInvoiceForReminder.status 
      });
      
      const data: ReminderData = {
        memberName: `${member.firstName} ${member.lastName}`,
        invoiceNumber: selectedInvoiceForReminder.invoiceNumber || "DRAFT",
        amount: selectedInvoiceForReminder.amount,
        dueDate: selectedInvoiceForReminder.dueDate,
        billingPeriod: selectedInvoiceForReminder.billingPeriod,
        daysUntilDue: status.daysUntilDue,
        daysOverdue: status.daysOverdue,
        paymentLink: selectedInvoiceForReminder.paymentLink
      };
      setCustomReminderMessage(template.message(data));
    }
  };

  const sendWhatsAppReminder = () => {
    if (!selectedInvoiceForReminder) return;
    const member = members.find(m => m.id === selectedInvoiceForReminder.memberId);
    if (!member || !member.contactNumber) {
      toast({
        title: "No Contact Number",
        description: "This member doesn't have a contact number saved.",
        variant: "destructive"
      });
      return;
    }

    const link = generateWhatsAppLink(member.contactNumber, customReminderMessage);
    window.open(link, '_blank');
    
    const newLog: ReminderLog = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceId: selectedInvoiceForReminder.id,
      sentAt: new Date().toISOString(),
      sentBy: "Admin",
      templateUsed: selectedReminderTemplate,
      status: "Sent"
    };
    
    setReminderLogs([newLog, ...reminderLogs]);
    
    setInvoices(invoices.map(inv => {
      if (inv.id === selectedInvoiceForReminder.id) {
        return {
          ...inv,
          lastReminderSent: new Date().toISOString(),
          reminderCount: (inv.reminderCount || 0) + 1
        };
      }
      return inv;
    }));
    
    toast({
      title: "Reminder Sent",
      description: "WhatsApp opened with reminder message.",
    });
    
    setShowReminderDialog(false);
  };

  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<Invoice | null>(null);
  const [selectedReminderTemplate, setSelectedReminderTemplate] = useState("");
  const [customReminderMessage, setCustomReminderMessage] = useState("");
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);

  return (
    <>
      <SEO
        title="Invoices - Bali Bulldogs Club Manager"
        description="Manage quarterly member payments and track revenue"
      />
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mb-4 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-blue-900">Invoices</h1>
                <p className="text-gray-600 mt-1">Manage quarterly member payments and track revenue</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    resetForm();
                    setShowBulkDialog(true);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Bulk Generate
                </Button>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowAddDialog(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Invoice
                </Button>
              </div>
            </div>
          </div>

          {duplicateInvoiceIds.size > 0 && (
            <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Duplicate Invoices Detected</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  We found {duplicateInvoiceIds.size} invoices that appear to be duplicates (same member and billing period).
                  This may affect your revenue reports.
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={() => {
                    if (!showDuplicatesOnly) {
                      // We are turning ON duplicate mode - Reset filters
                      setSelectedStatus("all");
                      setSelectedTeam("all");
                      setSearchTerm("");
                    }
                    setShowDuplicatesOnly(!showDuplicatesOnly);
                  }}
                >
                  {showDuplicatesOnly ? "Show All" : "Review Duplicates"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-l-green-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  Total Revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </div>
                <p className="text-sm text-gray-500 mt-1">From {paidCount} paid invoices</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  Outstanding Invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-700">{outstandingCount}</div>
                <p className="text-sm text-gray-500 mt-1">Pending invoices</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  Outstanding Amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">
                  Rp {outstandingAmount.toLocaleString("id-ID")}
                </div>
                <p className="text-sm text-gray-500 mt-1">Total due from {outstandingCount} invoices</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by member name or invoice #..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {Array.from(new Set(members.map(m => m.teamAssignment).filter(Boolean))).sort().map(team => (
                        <SelectItem key={team} value={team!}>{team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Created (Newest)</SelectItem>
                      <SelectItem value="date">Due Date</SelectItem>
                      <SelectItem value="name">Member Name</SelectItem>
                      <SelectItem value="number">Invoice Number</SelectItem>
                    </SelectContent>
                  </Select>
                  {showDuplicatesOnly && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDuplicatesOnly(false)}
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 whitespace-nowrap"
                    >
                      <FilterX className="h-4 w-4 mr-2" />
                      Clear Filter
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Invoice List
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    Total: {filteredInvoices.length} invoices
                    {selectedInvoices.size > 0 && ` (${selectedInvoices.size} selected)`}
                  </span>
                </CardTitle>
                {selectedInvoices.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleBulkStatusChange}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Status ({selectedInvoices.size})
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedInvoices.size})
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium mb-2">No invoices found</p>
                  <p className="text-sm">Generate invoices for your teams to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedInvoices.size === filteredInvoices.length && filteredInvoices.length > 0}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Base</TableHead>
                        <TableHead>Tax (10%)</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => {
                        const member = members.find((m) => m.id === invoice.memberId);
                        const activeMonths = invoice.monthExemptions?.filter(e => !e.exempt).length || 3;
                        const isDuplicate = duplicateInvoiceIds.has(invoice.id);
                        
                        return (
                          <TableRow key={invoice.id} className={isDuplicate ? "bg-red-50 hover:bg-red-100" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedInvoices.has(invoice.id)}
                                onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                                aria-label={`Select invoice ${invoice.invoiceNumber || invoice.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {invoice.invoiceNumber || "—"}
                              {isDuplicate && (
                                <div className="flex items-center text-xs text-red-600 mt-1">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Duplicate
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {member ? `${member.firstName} ${member.lastName}` : "Unknown"}
                            </TableCell>
                            <TableCell>{member?.teamAssignment || "—"}</TableCell>
                            <TableCell>
                              {invoice.billingPeriod}
                              {activeMonths < 3 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {activeMonths} month{activeMonths !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("id-ID") : "—"}
                            </TableCell>
                            <TableCell>{new Date(invoice.dueDate).toLocaleDateString("id-ID")}</TableCell>
                            <TableCell className="text-sm">
                              Rp {invoice.baseAmount.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="text-sm">
                              Rp {invoice.taxAmount.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0
                              }).format(invoice.amount || (invoice.baseAmount || 0) + (invoice.taxAmount || 0))}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={invoice.status}
                                onValueChange={(value) => handleStatusChange(invoice.id, value as Invoice["status"])}
                              >
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Draft">
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">Draft</Badge>
                                  </SelectItem>
                                  <SelectItem value="Sent">
                                    <Badge className="bg-blue-100 text-blue-700">Sent</Badge>
                                  </SelectItem>
                                  <SelectItem value="Paid">
                                    <Badge className="bg-green-100 text-green-700">Paid</Badge>
                                  </SelectItem>
                                  <SelectItem value="Overdue">
                                    <Badge variant="destructive" className="bg-red-100 text-red-700">Overdue</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadPDF(invoice)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                
                                {invoice.status !== "Paid" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openReminderDialog(invoice)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(invoice)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(invoice.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Invoice" : "Add New Invoice"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update invoice details" : "Create a quarterly invoice for a member"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Member *</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={handleMemberChange}
                >
                  <SelectTrigger className={formErrors.memberId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} {member.teamAssignment && `(${member.teamAssignment})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.memberId && <p className="text-red-500 text-sm mt-1">{formErrors.memberId}</p>}
              </div>

              <div>
                <Label>Billing Period *</Label>
                <Select
                  value={formData.billingPeriod}
                  onValueChange={handleBillingPeriodChange}
                >
                  <SelectTrigger className={formErrors.billingPeriod ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026 Q1">2026 Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2026 Q2">2026 Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="2026 Q3">2026 Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="2026 Q4">2026 Q4 (Oct-Dec)</SelectItem>
                    <SelectItem value="2026 Annual">2026 Annual (Jan-Dec) - 10% Discount</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.billingPeriod && <p className="text-red-500 text-sm mt-1">{formErrors.billingPeriod}</p>}
              </div>
            </div>

            {formData.monthExemptions && formData.monthExemptions.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label className="text-base font-semibold mb-3 block">Monthly Billing</Label>
                <p className="text-sm text-gray-600 mb-3">Uncheck months that should not be charged (e.g., injury, away from Bali)</p>
                <div className="space-y-3">
                  {formData.monthExemptions.map((exemption, index) => (
                    <div key={exemption.month} className="flex items-center gap-4 bg-white p-3 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          id={`month-${index}`}
                          checked={!exemption.exempt}
                          onCheckedChange={(checked) => handleExemptionChange(index, !checked)}
                        />
                        <Label htmlFor={`month-${index}`} className="font-medium cursor-pointer">
                          {exemption.month}
                        </Label>
                      </div>
                      {exemption.exempt && (
                        <Select
                          value={exemption.reason}
                          onValueChange={(value) => handleReasonChange(index, value as "Injury" | "Not in Bali" | "Other")}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Injury">Injury</SelectItem>
                            <SelectItem value="Not in Bali">Not in Bali</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    if (formErrors.dueDate) {
                      setFormErrors({ ...formErrors, dueDate: "" });
                    }
                  }}
                  className={formErrors.dueDate ? "border-red-500" : ""}
                />
                {formErrors.dueDate && <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>}
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Invoice["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.amount !== undefined && (
              <div className="space-y-2">
                <Label>Invoice Breakdown</Label>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Amount ({formData.monthExemptions?.filter(m => !m.exempt).length || 0} months):</span>
                    <span className="font-medium">
                      Rp {(formData.baseAmount || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {formData.discount && formData.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Annual Discount (10%):</span>
                      <span>- Rp {formData.discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Government Tax (10%):</span>
                    <span>Rp {(formData.taxAmount || 0).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">
                      Rp {((formData.baseAmount || 0) - (formData.discount || 0) + (formData.taxAmount || 0)).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>Payment Link</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={formData.paymentLink}
                onChange={(e) => {
                  setFormData({ ...formData, paymentLink: e.target.value });
                  if (formErrors.paymentLink) {
                    setFormErrors({ ...formErrors, paymentLink: "" });
                  }
                }}
                className={formErrors.paymentLink ? "border-red-500" : ""}
              />
              {formErrors.paymentLink && <p className="text-red-500 text-sm mt-1">{formErrors.paymentLink}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingId ? "Update Invoice" : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Team Invoices</DialogTitle>
            <DialogDescription>
              Create quarterly invoices for all paying members of a team. Invoices will use the team's monthly fee × 3 months + 10% tax.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team *</Label>
              <Select
                value={bulkFormData.teamName}
                onValueChange={(value) => {
                  setBulkFormData({ ...bulkFormData, teamName: value });
                  if (formErrors.teamName) {
                    setFormErrors({ ...formErrors, teamName: "" });
                  }
                }}
              >
                <SelectTrigger className={formErrors.teamName ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.name}>
                      {team.name} (Rp {team.monthlyFee.toLocaleString("id-ID")}/month)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.teamName && <p className="text-red-500 text-sm mt-1">{formErrors.teamName}</p>}
            </div>

            <div>
              <Label>Billing Period *</Label>
              <Select
                value={bulkFormData.billingPeriod}
                onValueChange={(value) => {
                  setBulkFormData({ ...bulkFormData, billingPeriod: value });
                  if (formErrors.billingPeriod) {
                    setFormErrors({ ...formErrors, billingPeriod: "" });
                  }
                }}
              >
                <SelectTrigger className={formErrors.billingPeriod ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026 Q1">2026 Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="2026 Q2">2026 Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="2026 Q3">2026 Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="2026 Q4">2026 Q4 (Oct-Dec)</SelectItem>
                  <SelectItem value="2026 Annual">2026 Annual (Jan-Dec) - 10% Discount</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.billingPeriod && <p className="text-red-500 text-sm mt-1">{formErrors.billingPeriod}</p>}
            </div>

            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={bulkFormData.dueDate}
                onChange={(e) => {
                  setBulkFormData({ ...bulkFormData, dueDate: e.target.value });
                  if (formErrors.dueDate) {
                    setFormErrors({ ...formErrors, dueDate: "" });
                  }
                }}
                className={formErrors.dueDate ? "border-red-500" : ""}
              />
              {formErrors.dueDate && <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>}
            </div>

            {bulkFormData.teamName && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-blue-900">
                  <strong>
                    {getEligibleMembersForTeam(bulkFormData.teamName).length}
                  </strong>{" "}
                  paying member{getEligibleMembersForTeam(bulkFormData.teamName).length !== 1 ? "s" : ""} in {bulkFormData.teamName}
                </p>
                {teams.find(t => t.name === bulkFormData.teamName) && (
                  <div className="text-sm text-blue-900 border-t border-blue-200 pt-2">
                    <div className="flex justify-between">
                      <span>Monthly Fee:</span>
                      <span className="font-medium">Rp {teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee.toLocaleString("id-ID")}</span>
                    </div>
                    {bulkFormData.billingPeriod === "2026 Annual" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Annual (12 months):</span>
                          <span className="font-medium">Rp {(teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 12).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Annual Discount (10%):</span>
                          <span className="font-medium">- Rp {(teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 12 * 0.10).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>After Discount:</span>
                          <span className="font-medium">Rp {(teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 12 * 0.9).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (10%):</span>
                          <span className="font-medium">Rp {(teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 12 * 0.9 * 0.10).toLocaleString("id-ID")}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Quarterly (3 months):</span>
                          <span className="font-medium">Rp {(teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 3).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (10%):</span>
                          <span className="font-medium">Rp {(teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 3 * 0.10).toLocaleString("id-ID")}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between border-t border-blue-300 pt-1 mt-1">
                      <span className="font-bold">Total per member:</span>
                      <span className="font-bold">
                        Rp {bulkFormData.billingPeriod === "2026 Annual" 
                          ? (teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 12 * 0.9 * 1.10).toLocaleString("id-ID")
                          : (teams.find(t => t.name === bulkFormData.teamName)!.monthlyFee * 3 * 1.10).toLocaleString("id-ID")
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkGenerate} className="bg-yellow-600 hover:bg-yellow-700">
              Generate Invoices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Multiple Invoices</DialogTitle>
            <DialogDescription>
              Please provide a reason for deleting these {selectedInvoices.size} invoices. This action cannot be undone, but the deletion will be recorded for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-900 font-medium">
                ⚠️ You are about to delete {selectedInvoices.size} invoice{selectedInvoices.size !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <Label>Reason for Bulk Deletion *</Label>
              <Input
                placeholder="e.g., Incorrect billing period, Team restructure, Data cleanup..."
                value={deletionReason}
                onChange={(e) => {
                  setDeletionReason(e.target.value);
                  if (formErrors.deletionReason) {
                    setFormErrors({ ...formErrors, deletionReason: "" });
                  }
                }}
                className={formErrors.deletionReason ? "border-red-500" : ""}
              />
              {formErrors.deletionReason && (
                <p className="text-red-500 text-sm mt-1">{formErrors.deletionReason}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkDeleteDialogOpen(false);
                setDeletionReason("");
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
            >
              Delete {selectedInvoices.size} Invoice{selectedInvoices.size !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Please provide a reason for deleting this invoice. This action cannot be undone, but the deletion will be recorded for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Deletion *</Label>
              <Input
                placeholder="e.g., Duplicate entry, Member withdrew, Billing error..."
                value={deletionReason}
                onChange={(e) => {
                  setDeletionReason(e.target.value);
                  if (formErrors.deletionReason) {
                    setFormErrors({ ...formErrors, deletionReason: "" });
                  }
                }}
                className={formErrors.deletionReason ? "border-red-500" : ""}
              />
              {formErrors.deletionReason && (
                <p className="text-red-500 text-sm mt-1">{formErrors.deletionReason}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setInvoiceToDelete(null);
                setDeletionReason("");
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Invoice Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedInvoices.size} selected invoice{selectedInvoices.size !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status *</Label>
              <Select
                value={bulkStatusValue}
                onValueChange={(value) => setBulkStatusValue(value as Invoice["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">Draft</Badge>
                  </SelectItem>
                  <SelectItem value="Sent">
                    <Badge className="bg-blue-100 text-blue-700">Sent</Badge>
                  </SelectItem>
                  <SelectItem value="Paid">
                    <Badge className="bg-green-100 text-green-700">Paid</Badge>
                  </SelectItem>
                  <SelectItem value="Overdue">
                    <Badge variant="destructive" className="bg-red-100 text-red-700">Overdue</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                This will update the status of <strong>{selectedInvoices.size}</strong> selected invoice{selectedInvoices.size !== 1 ? "s" : ""} to <strong>{bulkStatusValue}</strong>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkStatusChange} className="bg-blue-600 hover:bg-blue-700">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a WhatsApp reminder to {selectedInvoiceForReminder && members.find(m => m.id === selectedInvoiceForReminder.memberId)?.firstName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select 
                value={selectedReminderTemplate} 
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.timing})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Message Preview</Label>
              <Textarea 
                value={customReminderMessage} 
                onChange={(e) => setCustomReminderMessage(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This message will be pre-filled in WhatsApp. You can edit it there before sending.
              </p>
            </div>

            {selectedInvoiceForReminder && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Status: <span className="font-medium text-foreground">{selectedInvoiceForReminder.status}</span>
                  {calculateReminderStatus({dueDate: selectedInvoiceForReminder.dueDate, status: selectedInvoiceForReminder.status}).daysOverdue ? 
                    ` • ${calculateReminderStatus({dueDate: selectedInvoiceForReminder.dueDate, status: selectedInvoiceForReminder.status}).daysOverdue} days overdue` : 
                    ""
                  }
                </span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={sendWhatsAppReminder} className="bg-[#25D366] hover:bg-[#128C7E] text-white">
              <MessageCircle className="mr-2 h-4 w-4" />
              Open WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}