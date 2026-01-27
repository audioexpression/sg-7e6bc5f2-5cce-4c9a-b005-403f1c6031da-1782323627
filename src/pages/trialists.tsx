import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, UserPlus, XCircle, Trash2, Check, ChevronsUpDown, PlayCircle, CalendarClock, AlertCircle, FileText, Pencil } from "lucide-react";
import { useRouter } from "next/router";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { COUNTRIES, DEFAULT_SCHOOLS } from "@/lib/constants";
import { format, differenceInDays, parseISO, isValid } from "date-fns";

type TrialStatus = "Inquiry" | "Trial Scheduled" | "Active Trial" | "Postponed" | "Converted" | "Did Not Join";

interface Team {
  id: string;
  name: string;
  category: "Junior" | "Youth" | "Adult";
  monthlyFee: number;
  taxRate?: number;
}

interface Trialist {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  category: "Junior" | "Youth" | "Adult";
  potentialTeam: string;
  status: TrialStatus;
  email: string;
  trialDate?: string;
  
  // Junior/Youth Fields
  dateOfBirth?: string;
  age?: number;
  primaryParentName?: string;
  primaryParentContact?: string;
  secondaryContactName?: string;
  secondaryContactNumber?: string;
  kidsNationality?: string;
  school?: string;
  
  // Adult Fields
  footballExperience?: string;
  stayDuration?: string;
  address?: string;
  contactNumber?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  nationality?: string;

  // Common
  medicalConditions?: string;
  allergies?: string;
  rejectionReason?: string;
}

export default function TrialistsPage() {
  const router = useRouter();
  const [trialists, setTrialists] = useState<Trialist[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availableSchools, setAvailableSchools] = useState<string[]>(DEFAULT_SCHOOLS);

  // Combobox States
  const [openNationality, setOpenNationality] = useState(false);
  const [openSchool, setOpenSchool] = useState(false);
  const [openTeam, setOpenTeam] = useState(false);
  
  // Form State
  const [formCategory, setFormCategory] = useState<"Junior" | "Youth" | "Adult">("Junior");
  const [formData, setFormData] = useState<Partial<Trialist>>({
    firstName: "",
    lastName: "",
    email: "",
    potentialTeam: "",
    medicalConditions: "",
    allergies: "",
    status: "Inquiry"
  });

  // Action Dialogs
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  const [selectedTrialist, setSelectedTrialist] = useState<Trialist | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  // Invoice State for Conversion
  const [invoiceData, setInvoiceData] = useState({
    billingPeriod: "2026 Q1",
    joiningFee: 1000000,
    baseAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    generateInvoice: true,
    isProRata: false,
    proRataStartDate: new Date().toISOString().split('T')[0],
    detectedFee: 0,
    detectedTeamName: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("trialists");
    if (saved) {
      setTrialists(JSON.parse(saved));
    }
    
    // Load schools
    const savedSchools = localStorage.getItem("schools");
    if (savedSchools) {
      setAvailableSchools(JSON.parse(savedSchools));
    } else {
      setAvailableSchools(DEFAULT_SCHOOLS);
    }

    // Load teams for fees
    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  // Pro-rata Calculator Effect
  useEffect(() => {
    if (!convertDialogOpen || !selectedTrialist) return;
    
    // REFRESH TEAMS from localStorage to ensure we have latest fees
    const currentTeamsStr = localStorage.getItem("teams");
    const currentTeams: Team[] = currentTeamsStr ? JSON.parse(currentTeamsStr) : teams;
    if (currentTeamsStr) setTeams(currentTeams);

    // 1. Find Team Fee from dynamic teams list
    // Try exact match first, then case-insensitive
    const targetTeamName = selectedTrialist.potentialTeam || "";
    let team = currentTeams.find(t => t.name === targetTeamName);
    
    if (!team) {
       team = currentTeams.find(t => t.name.toLowerCase() === targetTeamName.toLowerCase());
    }

    // Fallback: If "Social Team" vs "Social", try contains
    if (!team) {
      team = currentTeams.find(t => targetTeamName.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(targetTeamName.toLowerCase()));
    }

    const monthlyFee = team ? team.monthlyFee : 0;
    
    // Update detected info for UI
    setInvoiceData(prev => ({
        ...prev, 
        detectedFee: monthlyFee,
        detectedTeamName: team ? team.name : "Unknown"
    }));
    
    let calculatedBase = 0;

    if (invoiceData.isProRata && invoiceData.proRataStartDate) {
      // Calculate Days Remaining in Quarter
      const year = parseInt(invoiceData.billingPeriod.split(" ")[0]);
      const quarter = invoiceData.billingPeriod.split(" ")[1];
      
      let quarterEndString = "";
      if (quarter === "Q1") quarterEndString = `${year}-03-31`;
      if (quarter === "Q2") quarterEndString = `${year}-06-30`;
      if (quarter === "Q3") quarterEndString = `${year}-09-30`;
      if (quarter === "Q4") quarterEndString = `${year}-12-31`;

      const end = parseISO(quarterEndString);
      const start = parseISO(invoiceData.proRataStartDate);
      
      if (isValid(end) && isValid(start)) {
        const daysRemaining = differenceInDays(end, start) + 1; // Inclusive
        const daysInQuarter = 91; // Approx
        if (daysRemaining > 0) {
           const quarterlyFee = monthlyFee * 3;
           // Daily rate calc
           calculatedBase = Math.round((quarterlyFee / daysInQuarter) * daysRemaining);
        } else {
           calculatedBase = 0;
        }
      }
    } else {
      // Standard Full Quarter (Default)
      calculatedBase = monthlyFee * 3;
    }

    // Calculate Tax & Total
    // Tax is 10% of (Base + Joining)
    const taxableAmount = calculatedBase + invoiceData.joiningFee;
    const tax = taxableAmount * 0.10;

    setInvoiceData(prev => ({
      ...prev,
      baseAmount: calculatedBase,
      taxAmount: tax,
      totalAmount: taxableAmount + tax
    }));

  }, [invoiceData.isProRata, invoiceData.proRataStartDate, invoiceData.billingPeriod, selectedTrialist, convertDialogOpen]);


  const saveTrialists = (updated: Trialist[]) => {
    setTrialists(updated);
    localStorage.setItem("trialists", JSON.stringify(updated));
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (field: keyof Trialist, value: any) => {
    if (field === "dateOfBirth") {
      const age = calculateAge(value);
      setFormData(prev => ({ ...prev, [field]: value, age }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddNew = () => {
    setSelectedTrialist(null);
    setFormData({ 
      firstName: "", 
      lastName: "", 
      email: "", 
      potentialTeam: "", 
      medicalConditions: "", 
      allergies: "", 
      status: "Inquiry",
      age: undefined,
      dateOfBirth: "",
      primaryParentName: "",
      primaryParentContact: "",
      kidsNationality: "",
      school: "",
      contactNumber: "",
      nationality: "",
      footballExperience: "",
      stayDuration: "",
      address: ""
    });
    setFormCategory("Junior");
    setIsEditing(false);
    setIsAddOpen(true);
  };

  const handleEdit = (trialist: Trialist) => {
    setSelectedTrialist(trialist);
    setFormCategory(trialist.category);
    setFormData({
      firstName: trialist.firstName,
      lastName: trialist.lastName,
      email: trialist.email,
      potentialTeam: trialist.potentialTeam,
      status: trialist.status,
      medicalConditions: trialist.medicalConditions,
      allergies: trialist.allergies,
      
      // Junior/Youth
      dateOfBirth: trialist.dateOfBirth,
      age: trialist.age,
      primaryParentName: trialist.primaryParentName,
      primaryParentContact: trialist.primaryParentContact,
      secondaryContactName: trialist.secondaryContactName,
      secondaryContactNumber: trialist.secondaryContactNumber,
      kidsNationality: trialist.kidsNationality,
      school: trialist.school,

      // Adult
      footballExperience: trialist.footballExperience,
      stayDuration: trialist.stayDuration,
      address: trialist.address,
      contactNumber: trialist.contactNumber,
      emergencyContactName: trialist.emergencyContactName,
      emergencyContactNumber: trialist.emergencyContactNumber,
      nationality: trialist.nationality,
    });
    setIsEditing(true);
    setIsAddOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName) return;

    const commonData = {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email || "",
      potentialTeam: formData.potentialTeam || "",
      status: formData.status || "Inquiry",
      medicalConditions: formData.medicalConditions || "",
      allergies: formData.allergies || "",
      category: formCategory,
      
      // Junior specific
      dateOfBirth: formData.dateOfBirth,
      age: formData.age, // Allow manual age
      primaryParentName: formData.primaryParentName,
      primaryParentContact: formData.primaryParentContact,
      secondaryContactName: formData.secondaryContactName,
      secondaryContactNumber: formData.secondaryContactNumber,
      kidsNationality: formData.kidsNationality,
      school: formData.school,

      // Adult specific
      footballExperience: formData.footballExperience,
      stayDuration: formData.stayDuration,
      address: formData.address,
      contactNumber: formData.contactNumber,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactNumber: formData.emergencyContactNumber,
      nationality: formData.nationality,
    };

    if (isEditing && selectedTrialist) {
      // Update existing
      const updated = trialists.map(t => 
        t.id === selectedTrialist.id 
          ? { ...t, ...commonData } 
          : t
      );
      saveTrialists(updated);
    } else {
      // Create new
      const newTrialist: Trialist = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...commonData
      } as Trialist;
      const updated = [newTrialist, ...trialists];
      saveTrialists(updated);
    }

    setIsAddOpen(false);
  };

  const handleStatusChange = (trialistId: string, newStatus: TrialStatus, extraData: Partial<Trialist> = {}) => {
    const updatedTrialists = trialists.map(t => 
      t.id === trialistId ? { ...t, status: newStatus, ...extraData } : t
    );
    saveTrialists(updatedTrialists);
  };

  const handleScheduleTrial = () => {
    if (!selectedTrialist || !scheduledDate) return;
    handleStatusChange(selectedTrialist.id, "Trial Scheduled", { trialDate: scheduledDate });
    setScheduleDialogOpen(false);
    setScheduledDate("");
  };

  const prepareConversion = (trialist: Trialist) => {
    setSelectedTrialist(trialist);
    setConvertDialogOpen(true);
    
    // Reset to defaults - calculation happens in useEffect
    setInvoiceData(prev => ({
      ...prev,
      billingPeriod: "2026 Q1",
      joiningFee: 1000000,
      isProRata: false,
      proRataStartDate: new Date().toISOString().split('T')[0]
    }));
  };

  // Manual override handler for the Base Amount input
  const handleManualBaseAmountChange = (newAmount: number) => {
    const taxableAmount = newAmount + invoiceData.joiningFee;
    const tax = taxableAmount * 0.10;
    setInvoiceData(prev => ({
      ...prev,
      baseAmount: newAmount,
      taxAmount: tax,
      totalAmount: taxableAmount + tax
    }));
  };

  const handleConvert = () => {
    if (!selectedTrialist) return;

    // 1. Create Member Object
    const memberId = crypto.randomUUID();
    // Use pro-rata start date as joining date if pro-rata is active, otherwise today
    const joiningDate = invoiceData.isProRata ? invoiceData.proRataStartDate : new Date().toISOString().split("T")[0];
    
    const notes = [
      selectedTrialist.medicalConditions ? `Medical: ${selectedTrialist.medicalConditions}` : "",
      selectedTrialist.allergies ? `Allergies: ${selectedTrialist.allergies}` : "",
      selectedTrialist.footballExperience ? `Exp: ${selectedTrialist.footballExperience}` : "",
      selectedTrialist.stayDuration ? `Stay: ${selectedTrialist.stayDuration}` : "",
      selectedTrialist.school ? `School: ${selectedTrialist.school}` : ""
    ].filter(Boolean).join(". ");

    const newMember = {
      id: memberId,
      membershipId: "",
      firstName: selectedTrialist.firstName,
      lastName: selectedTrialist.lastName,
      email: selectedTrialist.email,
      category: selectedTrialist.category,
      role: "Player",
      teamAssignment: selectedTrialist.potentialTeam,
      type: "Member",
      joiningDate: joiningDate,
      contactNumber: selectedTrialist.category === "Adult" ? selectedTrialist.contactNumber : "",
      primaryContact: selectedTrialist.category === "Adult" ? "" : selectedTrialist.primaryParentName,
      primaryContactNumber: selectedTrialist.category === "Adult" ? "" : selectedTrialist.primaryParentContact,
      secondaryContact: selectedTrialist.category === "Adult" ? selectedTrialist.emergencyContactName : selectedTrialist.secondaryContactName,
      secondaryContactNumber: selectedTrialist.category === "Adult" ? selectedTrialist.emergencyContactNumber : selectedTrialist.secondaryContactNumber,
      dateOfBirth: selectedTrialist.dateOfBirth,
      nationality: selectedTrialist.category === "Adult" ? selectedTrialist.nationality : selectedTrialist.kidsNationality,
      address: selectedTrialist.address || "",
      medicalNotes: notes,
      coachingCredits: 0,
      isArchived: false
    };

    const existingMembers = JSON.parse(localStorage.getItem("members") || "[]");
    localStorage.setItem("members", JSON.stringify([...existingMembers, newMember]));

    // 2. Generate Invoice if checked
    if (invoiceData.generateInvoice) {
      const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
      const newInvoice = {
        id: crypto.randomUUID(),
        memberId: memberId,
        billingPeriod: invoiceData.billingPeriod,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 7 days
        baseAmount: invoiceData.baseAmount + invoiceData.joiningFee, // Combine for base
        taxAmount: invoiceData.taxAmount,
        amount: invoiceData.totalAmount,
        monthExemptions: [],
        status: "Draft",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("invoices", JSON.stringify([...invoices, newInvoice]));
    }

    // 3. Update Trialist Status
    const updatedTrialists = trialists.map(t => 
      t.id === selectedTrialist.id ? { ...t, status: "Converted" as TrialStatus } : t
    );
    saveTrialists(updatedTrialists);
    
    setConvertDialogOpen(false);
    router.push("/members");
  };

  const handleReject = () => {
    if (!selectedTrialist) return;
    handleStatusChange(selectedTrialist.id, "Did Not Join", { rejectionReason: rejectReason });
    setRejectDialogOpen(false);
    setRejectReason("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this trialist record?")) {
      saveTrialists(trialists.filter(t => t.id !== id));
    }
  };

  const filteredTrialists = trialists.filter(t => {
    const matchesSearch = 
      t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: TrialStatus) => {
    switch (status) {
      case "Inquiry": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Trial Scheduled": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Active Trial": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Postponed": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Converted": return "bg-green-100 text-green-800 border-green-200";
      case "Did Not Join": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "";
    }
  };

  const getTeamsForCategory = (category: string) => {
    // Dynamic grouping from state
    if (!teams || teams.length === 0) return [];
    
    const relevantTeams = teams
      .filter(t => t.category === category)
      .map(t => t.name)
      .sort();
      
    return relevantTeams;
  };

  return (
    <>
      <SEO title="Trialists - Bali Bulldogs" description="Manage potential new members and free trials" />
      
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trialist Pipeline</h1>
              <p className="text-gray-500">Manage inquiries, free trials, and member conversions.</p>
            </div>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              New Inquiry
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Youth">Youth</SelectItem>
                <SelectItem value="Adult">Adult</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Inquiry">Inquiry</SelectItem>
                <SelectItem value="Trial Scheduled">Trial Scheduled</SelectItem>
                <SelectItem value="Active Trial">Active Trial</SelectItem>
                <SelectItem value="Postponed">Postponed</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Did Not Join">Did Not Join</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category / Team</TableHead>
                  <TableHead>Age / DOB</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrialists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No trialists found. Click "New Inquiry" to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrialists.map((trialist) => (
                    <TableRow key={trialist.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {trialist.firstName} {trialist.lastName}
                        <div className="text-xs text-muted-foreground">{new Date(trialist.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="mr-2">{trialist.category}</Badge>
                        <span className="text-sm">{trialist.potentialTeam || "Unassigned"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {trialist.age ? `${trialist.age} yrs` : "—"}
                          {trialist.dateOfBirth && <div className="text-xs text-muted-foreground">{trialist.dateOfBirth}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {trialist.email && <div className="text-blue-600">{trialist.email}</div>}
                          {trialist.category === "Adult" ? (
                             trialist.contactNumber && <div>{trialist.contactNumber} (WA)</div>
                          ) : (
                             trialist.primaryParentContact && <div>Parent: {trialist.primaryParentContact}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(trialist.status)}>
                          {trialist.status}
                        </Badge>
                        {trialist.status === "Trial Scheduled" && trialist.trialDate && (
                          <div className="text-xs text-purple-700 mt-1 font-medium">
                            {format(new Date(trialist.trialDate), "d MMM yyyy")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                             onClick={() => handleEdit(trialist)}
                             title="Edit Details"
                           >
                             <Pencil className="h-4 w-4" />
                           </Button>
                          
                          {/* Status Progression Actions */}
                          {trialist.status === "Inquiry" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                                onClick={() => {
                                  setSelectedTrialist(trialist);
                                  setScheduleDialogOpen(true);
                                }}
                                title="Schedule Trial"
                              >
                                <CalendarClock className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                onClick={() => handleStatusChange(trialist.id, "Postponed")}
                                title="Postpone"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {(trialist.status === "Inquiry" || trialist.status === "Trial Scheduled" || trialist.status === "Postponed") && (
                             <Button 
                              size="sm" 
                              className="bg-yellow-500 hover:bg-yellow-600 text-white"
                              onClick={() => handleStatusChange(trialist.id, "Active Trial")}
                              title="Start Active Trial"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Convert / Reject Buttons */}
                          {trialist.status !== "Converted" && trialist.status !== "Did Not Join" && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => prepareConversion(trialist)}
                                title="Promote to Member"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => {
                                  setSelectedTrialist(trialist);
                                  setRejectDialogOpen(true);
                                }}
                                title="Did Not Join"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleDelete(trialist.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add/Edit Trialist Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Trialist Details" : "New Inquiry / Trialist"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update details for this trialist." : "Enter details for a potential new member."}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={formCategory} onValueChange={(v) => setFormCategory(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="Junior">Junior</TabsTrigger>
                <TabsTrigger value="Youth">Youth</TabsTrigger>
                <TabsTrigger value="Adult">Adult</TabsTrigger>
              </TabsList>
              
              {isEditing && (
                  <div className="bg-gray-50 p-3 rounded-lg border mb-4 flex gap-4 items-center justify-between">
                    <div className="flex-1">
                      <Label className="mb-1.5 block">Current Status</Label>
                      <Select value={formData.status} onValueChange={(v) => handleInputChange("status", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inquiry">Inquiry</SelectItem>
                          <SelectItem value="Trial Scheduled">Trial Scheduled</SelectItem>
                          <SelectItem value="Active Trial">Active Trial</SelectItem>
                          <SelectItem value="Postponed">Postponed</SelectItem>
                          <SelectItem value="Converted">Converted</SelectItem>
                          <SelectItem value="Did Not Join">Did Not Join</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
              )}

              <div className="space-y-4 py-2">
                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{(formCategory === "Junior" || formCategory === "Youth") ? "Parent's Email" : "Email"}</Label>
                    <Input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label className="mb-2">Potential Team</Label>
                    <Popover open={openTeam} onOpenChange={setOpenTeam} modal={true}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openTeam} className="w-full justify-between font-normal">
                          {formData.potentialTeam || "Select Team..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search team..." autoFocus />
                          <CommandList className="max-h-[250px] overflow-y-auto">
                            <CommandEmpty>No team found.</CommandEmpty>
                            <CommandGroup heading="Teams">
                              {getTeamsForCategory(formCategory).map(t => (
                                <CommandItem
                                  key={t}
                                  value={t}
                                  onSelect={() => {
                                    handleInputChange("potentialTeam", t);
                                    setOpenTeam(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", formData.potentialTeam === t ? "opacity-100" : "opacity-0")} />
                                  {t}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Junior Content */}
                <TabsContent value="Junior" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input 
                        type="number" 
                        value={formData.age || ""} 
                        onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)} 
                        placeholder="Age" 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Parent Name</Label>
                      <Input value={formData.primaryParentName} onChange={(e) => handleInputChange("primaryParentName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Contact (Phone)</Label>
                      <Input value={formData.primaryParentContact} onChange={(e) => handleInputChange("primaryParentContact", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col">
                      <Label className="mb-2">Kids Nationality</Label>
                      <Popover open={openNationality} onOpenChange={setOpenNationality} modal={true}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={openNationality} className="w-full justify-between font-normal">
                            {formData.kidsNationality || "Select Nationality..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search country..." autoFocus />
                            <CommandList className="max-h-[250px] overflow-y-auto">
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((country) => (
                                  <CommandItem
                                    key={country}
                                    value={country}
                                    onSelect={() => {
                                      handleInputChange("kidsNationality", country);
                                      setOpenNationality(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", formData.kidsNationality === country ? "opacity-100" : "opacity-0")} />
                                    {country}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <Label className="mb-2">School</Label>
                      <Popover open={openSchool} onOpenChange={setOpenSchool} modal={true}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={openSchool} className="w-full justify-between font-normal">
                            {formData.school || "Select School..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search school..." autoFocus />
                            <CommandList className="max-h-[250px] overflow-y-auto">
                              <CommandEmpty>No school found.</CommandEmpty>
                              <CommandGroup>
                                {availableSchools.map((school) => (
                                  <CommandItem
                                    key={school}
                                    value={school}
                                    onSelect={() => {
                                      handleInputChange("school", school);
                                      setOpenSchool(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", formData.school === school ? "opacity-100" : "opacity-0")} />
                                    {school}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </TabsContent>

                {/* Youth Content */}
                <TabsContent value="Youth" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input 
                        type="number" 
                        value={formData.age || ""} 
                        onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)} 
                        placeholder="Age" 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Parent Name</Label>
                      <Input value={formData.primaryParentName} onChange={(e) => handleInputChange("primaryParentName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Contact (Phone)</Label>
                      <Input value={formData.primaryParentContact} onChange={(e) => handleInputChange("primaryParentContact", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col">
                      <Label className="mb-2">Kids Nationality</Label>
                      <Popover open={openNationality} onOpenChange={setOpenNationality} modal={true}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={openNationality} className="w-full justify-between font-normal">
                            {formData.kidsNationality || "Select Nationality..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search country..." autoFocus />
                            <CommandList className="max-h-[250px] overflow-y-auto">
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((country) => (
                                  <CommandItem
                                    key={country}
                                    value={country}
                                    onSelect={() => {
                                      handleInputChange("kidsNationality", country);
                                      setOpenNationality(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", formData.kidsNationality === country ? "opacity-100" : "opacity-0")} />
                                    {country}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <Label className="mb-2">School</Label>
                      <Popover open={openSchool} onOpenChange={setOpenSchool} modal={true}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={openSchool} className="w-full justify-between font-normal">
                            {formData.school || "Select School..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search school..." autoFocus />
                            <CommandList className="max-h-[250px] overflow-y-auto">
                              <CommandEmpty>No school found.</CommandEmpty>
                              <CommandGroup>
                                {availableSchools.map((school) => (
                                  <CommandItem
                                    key={school}
                                    value={school}
                                    onSelect={() => {
                                      handleInputChange("school", school);
                                      setOpenSchool(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", formData.school === school ? "opacity-100" : "opacity-0")} />
                                    {school}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </TabsContent>

                {/* Adult Specific */}
                <TabsContent value="Adult" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input 
                        type="number" 
                        value={formData.age || ""} 
                        onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)} 
                        placeholder="Age" 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <Input value={formData.contactNumber} onChange={(e) => handleInputChange("contactNumber", e.target.value)} />
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <Label className="mb-2">Nationality</Label>
                       <Popover open={openNationality} onOpenChange={setOpenNationality} modal={true}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={openNationality} className="w-full justify-between font-normal">
                             {formData.nationality || "Select Nationality..."}
                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search country..." autoFocus />
                            <CommandList className="max-h-[250px] overflow-y-auto">
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((c) => (
                                  <CommandItem key={c} value={c} onSelect={() => {
                                    handleInputChange("nationality", c);
                                    setOpenNationality(false);
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", formData.nationality === c ? "opacity-100" : "opacity-0")} />
                                    {c}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                       </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Football Experience / Background</Label>
                    <Textarea 
                      value={formData.footballExperience} 
                      onChange={(e) => handleInputChange("footballExperience", e.target.value)} 
                      placeholder="e.g. Played semi-pro in UK..." 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stay Duration in Bali</Label>
                      <Input value={formData.stayDuration} onChange={(e) => handleInputChange("stayDuration", e.target.value)} placeholder="e.g. 6 months, Permanent" />
                    </div>
                    <div className="space-y-2">
                      <Label>Address Area</Label>
                      <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="e.g. Canggu" />
                    </div>
                  </div>
                </TabsContent>

                {/* Medical - Common */}
                <div className="space-y-2">
                  <Label>Medical Conditions / Allergies</Label>
                  <Textarea 
                    value={formData.medicalConditions} 
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)} 
                    placeholder="List any conditions or allergies here..." 
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>{isEditing ? "Update Details" : "Create Inquiry"}</Button>
              </DialogFooter>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Schedule Trial Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Trial Session</DialogTitle>
              <DialogDescription>
                Set a date for {selectedTrialist?.firstName}'s trial session.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Trial Date</Label>
              <Input 
                type="date" 
                value={scheduledDate} 
                onChange={(e) => setScheduledDate(e.target.value)} 
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleScheduleTrial} disabled={!scheduledDate} className="bg-purple-600 hover:bg-purple-700">
                Confirm Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert Dialog */}
        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Promote to Member</DialogTitle>
              <DialogDescription>
                Convert <strong>{selectedTrialist?.firstName}</strong> to a paid member.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-start gap-2">
                <FileText className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Invoice Generation</p>
                  <p>A draft invoice will be created automatically.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billing Period</Label>
                  <Select 
                    value={invoiceData.billingPeriod} 
                    onValueChange={(v) => setInvoiceData(prev => ({ ...prev, billingPeriod: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026 Q1">2026 Q1</SelectItem>
                      <SelectItem value="2026 Q2">2026 Q2</SelectItem>
                      <SelectItem value="2026 Q3">2026 Q3</SelectItem>
                      <SelectItem value="2026 Q4">2026 Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label>Joining Fee</Label>
                   <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm">Rp</span>
                      <Input 
                        type="number" 
                        value={invoiceData.joiningFee} 
                        readOnly
                        className="pl-10 bg-gray-50 text-gray-500"
                      />
                   </div>
                </div>
              </div>

              {/* Pro-Rata Toggle Section */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="proRata" 
                  checked={invoiceData.isProRata}
                  onCheckedChange={(checked) => setInvoiceData(prev => ({ ...prev, isProRata: !!checked }))}
                />
                <label
                  htmlFor="proRata"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apply Pro-Rata Calculation? (Starting mid-quarter)
                </label>
              </div>

              {/* Pro-Rata Date Picker */}
              {invoiceData.isProRata && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label>Start Date (for calculation)</Label>
                  <Input 
                    type="date" 
                    value={invoiceData.proRataStartDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, proRataStartDate: e.target.value }))}
                  />
                  <p className="text-xs text-blue-600">
                    * Fee calculated based on remaining days in the selected quarter.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                 <div className="flex justify-between items-end">
                    <Label>Quarterly Fee (Base Amount)</Label>
                    {invoiceData.detectedTeamName && (
                        <span className="text-xs text-muted-foreground">
                            Rate based on: <span className="font-medium text-blue-600">{invoiceData.detectedTeamName}</span>
                            {invoiceData.detectedFee === 0 && <span className="text-amber-600 ml-1">(Fee is Rp 0)</span>}
                        </span>
                    )}
                 </div>
                 <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">Rp</span>
                    <Input 
                      type="number" 
                      value={invoiceData.baseAmount} 
                      onChange={(e) => handleManualBaseAmountChange(Number(e.target.value))}
                      className="pl-10 font-medium"
                    />
                 </div>
                 <p className="text-xs text-gray-500">
                   {invoiceData.isProRata 
                     ? "Auto-calculated based on start date. You can override this manually."
                     : "Standard 3-month fee. Check 'Pro-Rata' above to calculate for a partial quarter."}
                 </p>
              </div>

              <div className="bg-gray-100 p-3 rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Quarterly Fee:</span>
                  <span>Rp {invoiceData.baseAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Joining Fee:</span>
                  <span>Rp {invoiceData.joiningFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%):</span>
                  <span>Rp {invoiceData.taxAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300">
                  <span>Total Due:</span>
                  <span className="text-blue-600">Rp {invoiceData.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConvert} className="bg-green-600 hover:bg-green-700">
                Confirm & Create Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as "Did Not Join"</DialogTitle>
              <DialogDescription>
                Why did this trialist decide not to join?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Schedule Conflict">Schedule Conflict</SelectItem>
                  <SelectItem value="Too Expensive">Too Expensive</SelectItem>
                  <SelectItem value="Moving Away">Moving Away / Left Bali</SelectItem>
                  <SelectItem value="Level Mismatch">Level Mismatch</SelectItem>
                  <SelectItem value="No Response">Ghosted / No Response</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleReject} disabled={!rejectReason} variant="destructive">
                Confirm Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}