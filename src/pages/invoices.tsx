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
import { TEAMS } from "@/lib/members-data";

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

const BILLING_PERIODS = [
  "2026 Q1",
  "2026 Q2",
  "2026 Q3",
  "2026 Q4",
  "2027 Q1",
  "2027 Q2",
  "2027 Q3",
  "2027 Q4",
  "Annual 2026",
  "Annual 2027",
];

export default function Invoices() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Form state
  const [selectedMember, setSelectedMember] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [status, setStatus] = useState<"Draft" | "Sent" | "Paid" | "Overdue">("Draft");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk generation state
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [quarterAmount, setQuarterAmount] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember || !billingPeriod || !dueDate || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    const invoice: Invoice = {
      id: editingId || Date.now().toString(),
      memberId: selectedMember,
      billingPeriod,
      dueDate,
      amount: parseFloat(amount),
      paymentLink: paymentLink || undefined,
      status,
    };

    let updatedInvoices;
    if (editingId) {
      updatedInvoices = invoices.map((inv) => (inv.id === editingId ? invoice : inv));
    } else {
      updatedInvoices = [...invoices, invoice];
    }

    saveInvoices(updatedInvoices);
    resetForm();
    setShowAddDialog(false);
  };

  const handleBulkGenerate = () => {
    if (!selectedTeam || !selectedQuarter || !quarterAmount) {
      alert("Please fill in all fields");
      return;
    }

    // Filter members who are in the selected team AND have type "Member" (exclude Sponsored/Scholarship)
    const teamMembers = members.filter(
      (m) => m.teamAssignment === selectedTeam && m.type === "Member"
    );

    if (teamMembers.length === 0) {
      alert("No paying members found in this team (Sponsored and Scholarship members excluded)");
      return;
    }

    // Calculate due date (30 days from now for quarterly invoices)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    // Generate invoices for all team members
    const newInvoices: Invoice[] = teamMembers.map((member) => ({
      id: `${Date.now()}-${member.id}`,
      memberId: member.id,
      billingPeriod: selectedQuarter,
      dueDate: dueDateStr,
      amount: parseFloat(quarterAmount),
      status: "Draft" as const,
    }));

    const updatedInvoices = [...invoices, ...newInvoices];
    saveInvoices(updatedInvoices);

    alert(`Successfully generated ${newInvoices.length} invoices for ${selectedTeam}`);
    setShowBulkDialog(false);
    setSelectedTeam("");
    setSelectedQuarter("");
    setQuarterAmount("");
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingId(invoice.id);
    setSelectedMember(invoice.memberId);
    setBillingPeriod(invoice.billingPeriod);
    setDueDate(invoice.dueDate);
    setAmount(invoice.amount.toString());
    setPaymentLink(invoice.paymentLink || "");
    setStatus(invoice.status);
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      const updatedInvoices = invoices.filter((inv) => inv.id !== id);
      saveInvoices(updatedInvoices);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedMember("");
    setBillingPeriod("");
    setDueDate("");
    setAmount("");
    setPaymentLink("");
    setStatus("Draft");
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
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter((m) => m.type === "Member")
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Billing Period *</Label>
              <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_PERIODS.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Amount (IDR) *</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 2500000"
                required
              />
            </div>

            <div>
              <Label>Payment Link (Optional)</Label>
              <Input
                type="url"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://payment-provider.com/..."
              />
            </div>

            <div>
              <Label>Status *</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as any)}>
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
              <Label>Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Billing Period</Label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_PERIODS.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount per Member (IDR)</Label>
              <Input
                type="number"
                value={quarterAmount}
                onChange={(e) => setQuarterAmount(e.target.value)}
                placeholder="e.g., 2500000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Standard quarterly fee (11% tax): Rp 2,145,000
              </p>
            </div>

            {selectedTeam && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>
                    {members.filter((m) => m.teamAssignment === selectedTeam && m.type === "Member").length}
                  </strong>{" "}
                  paying member{members.filter((m) => m.teamAssignment === selectedTeam && m.type === "Member").length !== 1 ? "s" : ""} in {selectedTeam}
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