import { useState, useEffect } from "react";
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
import { ArrowLeft, Plus, Search, TrendingUp, AlertCircle, Download, Trash2, Edit, DollarSign } from "lucide-react";
import { useRouter } from "next/router";
import { generateInvoicePDF } from "@/lib/invoice-generator";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: string; // Added address field
  type: "Member" | "Sponsored" | "Scholarship";
  teamAssignment?: string;
}

interface Team {
  id: string;
  name: string;
  category: "Junior" | "Youth" | "Adult";
  monthlyFee: number;
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
}

const QUARTER_MONTHS: Record<string, string[]> = {
  "2026 Q1": ["January", "February", "March"],
  "2026 Q2": ["April", "May", "June"],
  "2026 Q3": ["July", "August", "September"],
  "2026 Q4": ["October", "November", "December"],
  "2026 Annual": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const TAX_RATE = 0.10; // 10% government tax

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

export default function Invoices() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Validation State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Single Invoice Form State
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

  // Bulk Generation Form State
  const [bulkFormData, setBulkFormData] = useState({
    teamName: "",
    billingPeriod: "",
    dueDate: "",
  });

  // Load invoices from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Migrate old invoices to new format
        const migrated = parsed.map((invoice: any) => {
          if (!invoice.monthExemptions) {
            // Old format - reverse calculate base from total (total = base × 1.1)
            const totalAmount = invoice.amount || 0;
            const baseAmount = totalAmount / 1.1; // Remove the 10% to get base
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

  // Load teams from localStorage
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

  // Load members from localStorage
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
      discount = baseAmount * 0.10; // 10% discount for annual
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
      const team = teams.find(t => t.name === member.teamAssignment);
      if (team && formData.billingPeriod) {
        const exemptions = initializeMonthExemptions(formData.billingPeriod);
        const amounts = calculateInvoiceAmount(team.monthlyFee, exemptions);
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
      const team = teams.find(t => t.name === member.teamAssignment);
      if (team) {
        const exemptions = initializeMonthExemptions(billingPeriod);
        const amounts = calculateInvoiceAmount(team.monthlyFee, exemptions);
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

    const team = teams.find(t => t.name === member.teamAssignment);
    if (!team) return;

    const updatedExemptions = [...formData.monthExemptions];
    updatedExemptions[index] = {
      ...updatedExemptions[index],
      exempt,
      reason: exempt ? updatedExemptions[index].reason || "Injury" : undefined,
    };

    const amounts = calculateInvoiceAmount(team.monthlyFee, updatedExemptions);
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
    if (confirm("Are you sure you want to delete this invoice?")) {
      const updatedInvoices = invoices.filter((inv) => inv.id !== id);
      saveInvoices(updatedInvoices);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const member = members.find(m => m.id === invoice.memberId);
    if (!member) {
      alert("Member not found");
      return;
    }

    const team = teams.find(t => t.name === member.teamAssignment);
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

    const pdf = generateInvoicePDF(invoiceData);
    pdf.save(`${invoice.invoiceNumber || invoice.id}.pdf`);
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

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (formData.paymentLink && !formData.paymentLink.match(/^https?:\/\/.+/)) {
      errors.paymentLink = "Payment link must be a valid URL (starting with http:// or https://)";
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
    } else {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        memberId: formData.memberId!,
        billingPeriod: formData.billingPeriod!,
        dueDate: formData.dueDate!,
        baseAmount: formData.baseAmount!,
        taxAmount: formData.taxAmount!,
        amount: formData.amount!,
        monthExemptions: formData.monthExemptions || [],
        paymentLink: formData.paymentLink || "",
        status: formData.status || "Draft",
      };
      saveInvoices([...invoices, newInvoice]);
    }

    setShowAddDialog(false);
    resetForm();
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

    const teamMembers = members.filter((m) => m.teamAssignment === bulkFormData.teamName && m.type === "Member");
    
    if (teamMembers.length === 0) {
      setFormErrors({ teamName: "No paying members found in this team" });
      return;
    }

    const exemptions = initializeMonthExemptions(bulkFormData.billingPeriod);
    const amounts = calculateInvoiceAmount(team.monthlyFee, exemptions);

    const newInvoices = teamMembers.map((member) => ({
      id: Date.now().toString() + Math.random(),
      invoiceNumber: generateInvoiceNumber(bulkFormData.billingPeriod, team.name, invoices),
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
    }));

    saveInvoices([...invoices, ...newInvoices]);
    setShowBulkDialog(false);
    setBulkFormData({
      teamName: "",
      billingPeriod: "",
      dueDate: "",
    });
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const member = members.find((m) => m.id === invoice.memberId);
    const memberName = member ? `${member.firstName} ${member.lastName}`.toLowerCase() : "";

    const matchesSearch = memberName.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices
    .filter((inv) => {
      const member = members.find((m) => m.id === inv.memberId);
      return member && member.type === "Member" && inv.status === "Paid";
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingAmount = invoices
    .filter((inv) => {
      const member = members.find((m) => m.id === inv.memberId);
      return member && member.type === "Member" && inv.status !== "Paid";
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingCount = invoices.filter((inv) => {
    const member = members.find((m) => m.id === inv.memberId);
    return member && member.type === "Member" && inv.status !== "Paid";
  }).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      Draft: { variant: "secondary", className: "bg-gray-100 text-gray-700" },
      Sent: { variant: "default", className: "bg-blue-100 text-blue-700" },
      Paid: { variant: "default", className: "bg-green-100 text-green-700" },
      Overdue: { variant: "destructive", className: "bg-red-100 text-red-700" },
    };
    const config = variants[status] || variants.Draft;
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  // Calculate invoice amounts based on team monthly fee and active months
  const calculateInvoiceAmounts = (
    monthlyFee: number,
    monthExemptions: MonthExemption[]
  ) => {
    const activeMonths = monthExemptions.filter((m) => !m.exempt).length;
    const baseAmount = monthlyFee * activeMonths;
    const taxAmount = baseAmount * 0.1; // 10% government tax ADDED ON TOP
    const totalAmount = baseAmount + taxAmount;

    return { baseAmount, taxAmount, totalAmount };
  };

  return (
    <>
      <SEO
        title="Invoices - Bali Bulldogs Club Manager"
        description="Manage quarterly member payments and track revenue"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
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

          {/* Summary Cards */}
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
                <p className="text-sm text-gray-500 mt-1">From paid invoices</p>
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
                <p className="text-sm text-gray-500 mt-1">Total due</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by member name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[200px]">
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
              </div>
            </CardContent>
          </Card>

          {/* Invoice List */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice List</CardTitle>
              <CardDescription>
                Total: {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No invoices found. Create your first invoice or use bulk generation.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Period</TableHead>
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
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-mono text-sm">
                              {invoice.invoiceNumber || "—"}
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
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
      </div>

      {/* Add/Edit Invoice Dialog */}
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

            {/* Month Exemptions */}
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

            {/* Amount Breakdown */}
            {formData.amount > 0 && (
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

      {/* Bulk Generation Dialog */}
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
                    {members.filter((m) => m.teamAssignment === bulkFormData.teamName && m.type === "Member").length}
                  </strong>{" "}
                  paying member{members.filter((m) => m.teamAssignment === bulkFormData.teamName && m.type === "Member").length !== 1 ? "s" : ""} in {bulkFormData.teamName}
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
    </>
  );
}