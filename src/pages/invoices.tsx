import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import {
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Users,
  Settings,
  TrendingUp,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamAssignment: string;
  membershipCategory: string;
}

interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  teamAssignment: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  paymentLink: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  createdAt: string;
}

interface TeamPricing {
  teamName: string;
  monthlyCost: number;
}

const TEAMS = [
  "Toddler", "Kindy 1", "Kindy 2", "U6", "U8 Dev", "U8 Adv", 
  "U10 Dev", "U10 Adv", "U12 Dev", "U12 Adv", "U12 Girls",
  "U14", "U14 Girls", "U16", "U18 Girls", "U18",
  "Women", "Masters", "Legends", "Social", "1st Team"
];

const QUARTERS = ["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4"];

export default function InvoicesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teamPricing, setTeamPricing] = useState<TeamPricing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [showBulkGenerate, setShowBulkGenerate] = useState(false);
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [pricingTeam, setPricingTeam] = useState("");
  const [pricingAmount, setPricingAmount] = useState("");

  const [formData, setFormData] = useState({
    memberId: "",
    billingPeriod: "",
    dueDate: "",
    amount: "",
    paymentLink: "",
    status: "Draft" as Invoice["status"]
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

    const storedPricing = localStorage.getItem("teamPricing");
    if (storedPricing) {
      setTeamPricing(JSON.parse(storedPricing));
    }
  }, []);

  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem("invoices", JSON.stringify(newInvoices));
  };

  const saveTeamPricing = (newPricing: TeamPricing[]) => {
    setTeamPricing(newPricing);
    localStorage.setItem("teamPricing", JSON.stringify(newPricing));
  };

  const calculateQuarterlyAmount = (monthlyCost: number): number => {
    const quarterly = monthlyCost * 3;
    const withTax = quarterly * 1.1; // 10% government tax
    return Math.round(withTax);
  };

  const getTeamPricing = (teamName: string): number => {
    const pricing = teamPricing.find(p => p.teamName === teamName);
    return pricing ? pricing.monthlyCost : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const member = members.find(m => m.id === formData.memberId);
    if (!member) return;

    if (editingInvoice) {
      const updated = invoices.map(inv =>
        inv.id === editingInvoice.id
          ? {
              ...inv,
              ...formData,
              memberName: `${member.firstName} ${member.lastName}`,
              teamAssignment: member.teamAssignment,
              amount: parseFloat(formData.amount)
            }
          : inv
      );
      saveInvoices(updated);
    } else {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        memberId: formData.memberId,
        memberName: `${member.firstName} ${member.lastName}`,
        teamAssignment: member.teamAssignment,
        billingPeriod: formData.billingPeriod,
        dueDate: formData.dueDate,
        amount: parseFloat(formData.amount),
        paymentLink: formData.paymentLink,
        status: formData.status,
        createdAt: new Date().toISOString()
      };
      saveInvoices([...invoices, newInvoice]);
    }

    resetForm();
  };

  const handleBulkGenerate = () => {
    if (!selectedTeam || !selectedQuarter) {
      alert("Please select both team and quarter");
      return;
    }

    const teamMembers = members.filter(m => m.teamAssignment === selectedTeam);
    
    if (teamMembers.length === 0) {
      alert("No members found in this team");
      return;
    }

    const monthlyCost = getTeamPricing(selectedTeam);
    if (monthlyCost === 0) {
      alert("Please set pricing for this team first in Team Pricing Configuration");
      return;
    }

    const quarterlyAmount = calculateQuarterlyAmount(monthlyCost);
    
    const quarterDueDates: { [key: string]: string } = {
      "2026 Q1": "2026-03-31",
      "2026 Q2": "2026-06-30",
      "2026 Q3": "2026-09-30",
      "2026 Q4": "2026-12-31"
    };

    const newInvoices = teamMembers.map(member => {
      const existingInvoice = invoices.find(
        inv => inv.memberId === member.id && inv.billingPeriod === selectedQuarter
      );

      if (existingInvoice) {
        return null;
      }

      return {
        id: `${Date.now()}-${member.id}`,
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        teamAssignment: member.teamAssignment,
        billingPeriod: selectedQuarter,
        dueDate: quarterDueDates[selectedQuarter],
        amount: quarterlyAmount,
        paymentLink: "",
        status: "Draft" as Invoice["status"],
        createdAt: new Date().toISOString()
      };
    }).filter(Boolean) as Invoice[];

    if (newInvoices.length === 0) {
      alert("All members already have invoices for this period");
      return;
    }

    saveInvoices([...invoices, ...newInvoices]);
    alert(`Generated ${newInvoices.length} invoices for ${selectedTeam} - ${selectedQuarter}`);
    setShowBulkGenerate(false);
    setSelectedTeam("");
    setSelectedQuarter("");
  };

  const handlePricingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pricingTeam || !pricingAmount) return;

    const existingIndex = teamPricing.findIndex(p => p.teamName === pricingTeam);
    
    if (existingIndex >= 0) {
      const updated = [...teamPricing];
      updated[existingIndex] = {
        teamName: pricingTeam,
        monthlyCost: parseFloat(pricingAmount)
      };
      saveTeamPricing(updated);
    } else {
      saveTeamPricing([...teamPricing, {
        teamName: pricingTeam,
        monthlyCost: parseFloat(pricingAmount)
      }]);
    }

    setPricingTeam("");
    setPricingAmount("");
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      memberId: invoice.memberId,
      billingPeriod: invoice.billingPeriod,
      dueDate: invoice.dueDate,
      amount: invoice.amount.toString(),
      paymentLink: invoice.paymentLink,
      status: invoice.status
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      saveInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      memberId: "",
      billingPeriod: "",
      dueDate: "",
      amount: "",
      paymentLink: "",
      status: "Draft"
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.teamAssignment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesPeriod = filterPeriod === "all" || invoice.billingPeriod === filterPeriod;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const totalRevenue = invoices
    .filter(inv => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingAmount = invoices
    .filter(inv => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingCount = invoices.filter(inv => inv.status !== "Paid").length;

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800 border-green-200";
      case "Sent": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid": return <CheckCircle className="w-4 h-4" />;
      case "Sent": return <Clock className="w-4 h-4" />;
      case "Overdue": return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMemberPaymentStatus = (memberId: string, quarter: string): Invoice | undefined => {
    return invoices.find(inv => inv.memberId === memberId && inv.billingPeriod === quarter);
  };

  const exportInvoices = () => {
    const csvContent = [
      ["Member Name", "Team", "Billing Period", "Due Date", "Amount", "Status", "Payment Link"],
      ...filteredInvoices.map(inv => [
        inv.memberName,
        inv.teamAssignment,
        inv.billingPeriod,
        inv.dueDate,
        inv.amount,
        inv.status,
        inv.paymentLink
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <>
      <SEO 
        title="Invoicing - Bali Bulldogs"
        description="Manage member invoices and quarterly payments"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/"}
                className="text-white hover:text-yellow-400 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-4xl font-bold text-white mb-2">Invoicing & Payments</h1>
              <p className="text-blue-200">Manage quarterly member payments and track revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-blue-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-sm text-gray-600 mt-1">From paid invoices</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600">
                  {formatCurrency(outstandingAmount)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{outstandingCount} unpaid invoices</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Total Invoices
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">
                  {invoices.length}
                </div>
                <p className="text-sm text-gray-600 mt-1">All periods</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-blue-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-yellow-500">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">Invoice Management</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={showPricingConfig} onOpenChange={setShowPricingConfig}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-blue-700 hover:bg-blue-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Team Pricing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Team Pricing Configuration</DialogTitle>
                        <DialogDescription>
                          Set monthly cost per team. Quarterly invoices will be calculated as: Monthly × 3 + 10% tax
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handlePricingSubmit} className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Team</Label>
                            <Select value={pricingTeam} onValueChange={setPricingTeam}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team" />
                              </SelectTrigger>
                              <SelectContent>
                                {TEAMS.map(team => (
                                  <SelectItem key={team} value={team}>{team}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Monthly Cost (IDR)</Label>
                            <Input
                              type="number"
                              value={pricingAmount}
                              onChange={(e) => setPricingAmount(e.target.value)}
                              placeholder="e.g., 500000"
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Add/Update Pricing</Button>
                      </form>

                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Team</TableHead>
                              <TableHead>Monthly</TableHead>
                              <TableHead>Quarterly (with 10% tax)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teamPricing.map(pricing => (
                              <TableRow key={pricing.teamName}>
                                <TableCell className="font-medium">{pricing.teamName}</TableCell>
                                <TableCell>{formatCurrency(pricing.monthlyCost)}</TableCell>
                                <TableCell className="font-bold text-blue-600">
                                  {formatCurrency(calculateQuarterlyAmount(pricing.monthlyCost))}
                                </TableCell>
                              </TableRow>
                            ))}
                            {teamPricing.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-gray-500">
                                  No team pricing configured yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showBulkGenerate} onOpenChange={setShowBulkGenerate}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-blue-700 hover:bg-blue-50">
                        <Users className="w-4 h-4 mr-2" />
                        Bulk Generate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate Team Invoices</DialogTitle>
                        <DialogDescription>
                          Create quarterly invoices for all members of a team
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
                              {TEAMS.map(team => (
                                <SelectItem key={team} value={team}>{team}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Quarter</Label>
                          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quarter" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUARTERS.map(quarter => (
                                <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedTeam && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">
                              Team members: {members.filter(m => m.teamAssignment === selectedTeam).length}
                            </p>
                            {getTeamPricing(selectedTeam) > 0 ? (
                              <>
                                <p className="text-sm text-blue-700 mt-1">
                                  Monthly cost: {formatCurrency(getTeamPricing(selectedTeam))}
                                </p>
                                <p className="text-sm font-bold text-blue-900 mt-1">
                                  Quarterly amount (with 10% tax): {formatCurrency(calculateQuarterlyAmount(getTeamPricing(selectedTeam)))}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-red-600 mt-1">
                                ⚠️ No pricing set for this team. Please configure in Team Pricing.
                              </p>
                            )}
                          </div>
                        )}

                        <Button 
                          onClick={handleBulkGenerate}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Generate Invoices
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500">
                        <Plus className="w-4 h-4 mr-2" />
                        New Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label>Member</Label>
                          <Select
                            value={formData.memberId}
                            onValueChange={(value) => setFormData({...formData, memberId: value})}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                              {members.map(member => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.firstName} {member.lastName} - {member.teamAssignment}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Billing Period</Label>
                          <Select
                            value={formData.billingPeriod}
                            onValueChange={(value) => setFormData({...formData, billingPeriod: value})}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUARTERS.map(quarter => (
                                <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <Label>Amount (IDR)</Label>
                          <Input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            placeholder="e.g., 1650000"
                            required
                          />
                        </div>

                        <div>
                          <Label>Payment Link</Label>
                          <Input
                            type="url"
                            value={formData.paymentLink}
                            onChange={(e) => setFormData({...formData, paymentLink: e.target.value})}
                            placeholder="https://payment-gateway.com/..."
                          />
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({...formData, status: value as Invoice["status"]})}
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

                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            {editingInvoice ? "Update" : "Create"} Invoice
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search by member or team..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {QUARTERS.map(quarter => (
                      <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={exportInvoices}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
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
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No invoices found. Create your first invoice or use bulk generation.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-blue-50">
                          <TableCell className="font-medium">{invoice.memberName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              {invoice.teamAssignment}
                            </Badge>
                          </TableCell>
                          <TableCell>{invoice.billingPeriod}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(invoice)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(invoice.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}