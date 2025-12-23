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
import { ArrowLeft, Plus, Search, TrendingUp, AlertCircle, Download, Trash2, Edit, DollarSign } from "lucide-react";
import { useRouter } from "next/router";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: "Member" | "Sponsored" | "Scholarship";
  teamAssignment?: string;
}

interface Invoice {
  id: string;
  memberId: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  paymentLink?: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
}

export default function Invoices() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
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
    amount: 0,
    paymentLink: "",
    status: "Draft",
  });

  // Bulk Generation Form State
  const [bulkFormData, setBulkFormData] = useState({
    teamName: "",
    billingPeriod: "",
    dueDate: "",
    amount: 0,
  });

  useEffect(() => {
    const storedMembers = localStorage.getItem("members");
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }

    const storedInvoices = localStorage.getItem("invoices");
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
  }, []);

  const saveInvoices = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      memberId: "",
      billingPeriod: "",
      dueDate: "",
      amount: 0,
      paymentLink: "",
      status: "Draft",
    });
    setFormErrors({});
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingId(invoice.id);
    setFormData({
      memberId: invoice.memberId,
      billingPeriod: invoice.billingPeriod,
      dueDate: invoice.dueDate,
      amount: invoice.amount,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setFormErrors({});
    const errors: Record<string, string> = {};

    // Validate member selection
    if (!formData.memberId) {
      errors.memberId = "Please select a member";
    }

    // Validate billing period
    if (!formData.billingPeriod) {
      errors.billingPeriod = "Please select a billing period";
    }

    // Validate due date
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    // Validate payment link format if provided
    if (formData.paymentLink && !formData.paymentLink.match(/^https?:\/\/.+/)) {
      errors.paymentLink = "Payment link must be a valid URL (starting with http:// or https://)";
    }

    // If there are errors, show them and stop submission
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
        amount: formData.amount!,
        paymentLink: formData.paymentLink || "",
        status: formData.status || "Draft",
      };
      saveInvoices([...invoices, newInvoice]);
    }

    setShowAddDialog(false);
    resetForm();
  };

  const handleBulkGenerate = () => {
    // Reset errors
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
    if (!bulkFormData.amount || bulkFormData.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const teamMembers = members.filter((m) => m.teamAssignment === bulkFormData.teamName && m.type === "Member");
    
    if (teamMembers.length === 0) {
      setFormErrors({ teamName: "No paying members found in this team" });
      return;
    }

    const newInvoices = teamMembers.map((member) => ({
      id: Date.now().toString() + Math.random(),
      memberId: member.id,
      billingPeriod: bulkFormData.billingPeriod,
      dueDate: bulkFormData.dueDate,
      amount: bulkFormData.amount,
      paymentLink: "",
      status: "Draft" as const,
    }));

    saveInvoices([...invoices, ...newInvoices]);
    setShowBulkDialog(false);
    setBulkFormData({
      teamName: "",
      billingPeriod: "",
      dueDate: "",
      amount: 0,
    });
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const member = members.find((m) => m.id === invoice.memberId);
    const memberName = member ? `${member.firstName} ${member.lastName}`.toLowerCase() : "";

    const matchesSearch = memberName.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats - only for "Member" type
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
                        <TableHead>Member</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => {
                        const member = members.find((m) => m.id === invoice.memberId);
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {member ? `${member.firstName} ${member.lastName}` : "Unknown"}
                            </TableCell>
                            <TableCell>{member?.teamAssignment || "—"}</TableCell>
                            <TableCell>{invoice.billingPeriod}</TableCell>
                            <TableCell>{new Date(invoice.dueDate).toLocaleDateString("id-ID")}</TableCell>
                            <TableCell className="font-semibold">
                              Rp {invoice.amount.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Invoice" : "Add New Invoice"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update invoice details" : "Create a new invoice for a member"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Member *</Label>
              <Select
                value={formData.memberId}
                onValueChange={(value) => {
                  setFormData({ ...formData, memberId: value });
                  if (formErrors.memberId) {
                    setFormErrors({ ...formErrors, memberId: "" });
                  }
                }}
              >
                <SelectTrigger className={formErrors.memberId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
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
                onValueChange={(value) => {
                  setFormData({ ...formData, billingPeriod: value });
                  if (formErrors.billingPeriod) {
                    setFormErrors({ ...formErrors, billingPeriod: "" });
                  }
                }}
              >
                <SelectTrigger className={formErrors.billingPeriod ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026 Q1">2026 Q1</SelectItem>
                  <SelectItem value="2026 Q2">2026 Q2</SelectItem>
                  <SelectItem value="2026 Q3">2026 Q3</SelectItem>
                  <SelectItem value="2026 Q4">2026 Q4</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.billingPeriod && <p className="text-red-500 text-sm mt-1">{formErrors.billingPeriod}</p>}
            </div>

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
              <Label>Amount (Rp) *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: Number(e.target.value) });
                  if (formErrors.amount) {
                    setFormErrors({ ...formErrors, amount: "" });
                  }
                }}
                className={formErrors.amount ? "border-red-500" : ""}
              />
              {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
            </div>

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
              Create quarterly invoices for all paying members of a team (excludes Sponsored & Scholarship members)
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
                  {Array.from(new Set(members.map((m) => m.teamAssignment))).filter(Boolean).map((team) => (
                    <SelectItem key={team} value={team!}>
                      {team}
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
                  <SelectItem value="2026 Q1">2026 Q1</SelectItem>
                  <SelectItem value="2026 Q2">2026 Q2</SelectItem>
                  <SelectItem value="2026 Q3">2026 Q3</SelectItem>
                  <SelectItem value="2026 Q4">2026 Q4</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
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

            <div>
              <Label>Amount per Member (Rp) *</Label>
              <Input
                type="number"
                value={bulkFormData.amount}
                onChange={(e) => {
                  setBulkFormData({ ...bulkFormData, amount: Number(e.target.value) });
                  if (formErrors.amount) {
                    setFormErrors({ ...formErrors, amount: "" });
                  }
                }}
                className={formErrors.amount ? "border-red-500" : ""}
              />
              {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
            </div>

            {bulkFormData.teamName && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>
                    {members.filter((m) => m.teamAssignment === bulkFormData.teamName && m.type === "Member").length}
                  </strong>{" "}
                  paying member{members.filter((m) => m.teamAssignment === bulkFormData.teamName && m.type === "Member").length !== 1 ? "s" : ""} in {bulkFormData.teamName}
                </p>
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