import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Search, Edit, Trash2, ArrowLeft, DollarSign, Plus, Send } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  team: string;
  membershipCategory: "Standard" | "Sponsored" | "Scholarship";
}

interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  team: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  paymentLink: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
}

const billingPeriods = [
  "2025 Q1", "2025 Q2", "2025 Q3", "2025 Q4", "2025 Annual",
  "2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4", "2026 Annual",
  "2027 Q1", "2027 Q2", "2027 Q3", "2027 Q4", "2027 Annual"
];

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isSingleDialogOpen, setIsSingleDialogOpen] = useState(false);
  const [teams, setTeams] = useState<string[]>([]);

  const [formData, setFormData] = useState<Omit<Invoice, "id" | "memberName" | "team">>({
    memberId: "",
    billingPeriod: "2026 Q1",
    dueDate: "",
    amount: 0,
    paymentLink: "",
    status: "Draft",
  });

  const [bulkData, setBulkData] = useState({
    team: "",
    billingPeriod: "2026 Q1",
    dueDate: "",
    amount: 0,
  });

  useEffect(() => {
    const storedInvoices = localStorage.getItem("invoices");
    const storedMembers = localStorage.getItem("members");
    
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }

    // Load teams from settings or use defaults
    const storedTeams = localStorage.getItem("teams");
    const defaultTeams = [
      "Toddler", "Kindy 1", "Kindy 2", "U6", "U8 Dev", "U8 Adv", 
      "U10 Dev", "U10 Adv", "U12 Dev", "U12 Adv", "U12 Girls",
      "U14", "U14 Girls", "U16", "U18 Girls", "U18",
      "Women", "Masters", "Legends", "Social", "1st Team"
    ];
    
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
      if (JSON.parse(storedTeams).length > 0) {
        setBulkData(prev => ({ ...prev, team: JSON.parse(storedTeams)[0] }));
      }
    } else {
      setTeams(defaultTeams);
      setBulkData(prev => ({ ...prev, team: defaultTeams[0] }));
    }
  }, []);

  const saveInvoice = () => {
    const member = members.find(m => m.id === formData.memberId);
    if (!member) return;

    let updatedInvoices: Invoice[];
    
    if (editingInvoice) {
      updatedInvoices = invoices.map(inv => 
        inv.id === editingInvoice.id 
          ? { 
              ...formData, 
              id: editingInvoice.id,
              memberName: `${member.firstName} ${member.lastName}`,
              team: member.team
            } 
          : inv
      );
    } else {
      const newInvoice: Invoice = {
        ...formData,
        id: Date.now().toString(),
        memberName: `${member.firstName} ${member.lastName}`,
        team: member.team,
      };
      updatedInvoices = [...invoices, newInvoice];
    }
    
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    resetForm();
  };

  const generateBulkInvoices = () => {
    const teamMembers = members.filter(m => m.team === bulkData.team);
    if (teamMembers.length === 0) {
      alert("No members found in this team");
      return;
    }

    const newInvoices: Invoice[] = teamMembers.map(member => ({
      id: `${Date.now()}-${member.id}`,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      team: member.team,
      billingPeriod: bulkData.billingPeriod,
      dueDate: bulkData.dueDate,
      amount: bulkData.amount,
      paymentLink: "",
      status: "Draft" as const,
    }));

    const updatedInvoices = [...invoices, ...newInvoices];
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    
    setBulkData({
      team: "",
      billingPeriod: "2026 Q1",
      dueDate: "",
      amount: 0,
    });
    setIsBulkDialogOpen(false);
    alert(`Generated ${newInvoices.length} invoices for ${bulkData.team}`);
  };

  const deleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      const updated = invoices.filter(inv => inv.id !== id);
      setInvoices(updated);
      localStorage.setItem("invoices", JSON.stringify(updated));
    }
  };

  const updateInvoiceStatus = (id: string, status: "Draft" | "Sent" | "Paid" | "Overdue") => {
    const updated = invoices.map(inv => 
      inv.id === id ? { ...inv, status } : inv
    );
    setInvoices(updated);
    localStorage.setItem("invoices", JSON.stringify(updated));
  };

  const resetForm = () => {
    setFormData({
      memberId: "",
      billingPeriod: "2026 Q1",
      dueDate: "",
      amount: 0,
      paymentLink: "",
      status: "Draft",
    });
    setEditingInvoice(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (invoice: Invoice) => {
    setFormData({
      memberId: invoice.memberId,
      billingPeriod: invoice.billingPeriod,
      dueDate: invoice.dueDate,
      amount: invoice.amount,
      paymentLink: invoice.paymentLink,
      status: invoice.status,
    });
    setEditingInvoice(invoice);
    setIsAddDialogOpen(true);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.team.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesPeriod = filterPeriod === "all" || invoice.billingPeriod === filterPeriod;
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const totalRevenue = invoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
  const outstandingAmount = invoices.filter(inv => inv.status !== "Paid").reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <>
      <SEO 
        title="Invoicing - Bali Bulldogs Club Manager"
        description="Generate and track quarterly membership invoices"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
        <header className="bg-bulldogs-blue text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">INVOICING</h1>
                  <p className="text-yellow-300 text-sm font-semibold">Bali Bulldogs Club Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-green-500 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue (Paid)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-green-600">
                  IDR {totalRevenue.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-yellow-500 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Outstanding Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-yellow-600">
                  IDR {outstandingAmount.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-bulldogs-blue shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Total Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-bulldogs-blue">
                  {invoices.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-black text-bulldogs-blue">All Invoices</CardTitle>
                  <CardDescription>Total: {filteredInvoices.length} invoices</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Send className="h-4 w-4" />
                        Bulk Generate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-bulldogs-blue">
                          Generate Team Invoices
                        </DialogTitle>
                        <DialogDescription>
                          Create invoices for all members in a team
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="bulk-team">Target Team</Label>
                          <select
                            id="bulk-team"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={bulkData.team}
                            onChange={e => setBulkData({...bulkData, team: e.target.value})}
                          >
                            {teams.map(team => (
                              <option key={team} value={team}>{team}</option>
                            ))}
                          </select>
                          <p className="text-sm text-gray-500">
                            Will generate {members.filter(m => m.team === bulkData.team).length} invoices
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bulk-period">Billing Period *</Label>
                          <Select
                            value={bulkData.billingPeriod}
                            onValueChange={(value) => setBulkData({...bulkData, billingPeriod: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {billingPeriods.map(period => (
                                <SelectItem key={period} value={period}>{period}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bulk-due">Due Date *</Label>
                          <Input
                            id="bulk-due"
                            type="date"
                            value={bulkData.dueDate}
                            onChange={e => setBulkData({...bulkData, dueDate: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bulk-amount">Amount (IDR) *</Label>
                          <Input
                            id="bulk-amount"
                            type="number"
                            value={bulkData.amount}
                            onChange={e => setBulkData({...bulkData, amount: parseInt(e.target.value) || 0})}
                            placeholder="e.g., 1500000"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={generateBulkInvoices} className="bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                          Generate Invoices
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                        <Plus className="h-4 w-4" />
                        Add Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-bulldogs-blue">
                          {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                        </DialogTitle>
                        <DialogDescription>
                          Invoice details for a member
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="member">Member *</Label>
                          <Select
                            value={formData.memberId}
                            onValueChange={(value) => setFormData({...formData, memberId: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                              {members.map(member => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.firstName} {member.lastName} ({member.team})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="period">Billing Period *</Label>
                          <Select
                            value={formData.billingPeriod}
                            onValueChange={(value) => setFormData({...formData, billingPeriod: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {billingPeriods.map(period => (
                                <SelectItem key={period} value={period}>{period}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date *</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={e => setFormData({...formData, dueDate: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (IDR) *</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                            placeholder="e.g., 1500000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paymentLink">Payment Link</Label>
                          <Input
                            id="paymentLink"
                            value={formData.paymentLink}
                            onChange={e => setFormData({...formData, paymentLink: e.target.value})}
                            placeholder="Xendit/Wise/Stripe link"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: "Draft" | "Sent" | "Paid" | "Overdue") => 
                              setFormData({...formData, status: value})}
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

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={saveInvoice} className="bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                          {editingInvoice ? "Update Invoice" : "Create Invoice"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by member or team..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Status" />
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
                    <SelectValue placeholder="All Periods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {billingPeriods.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
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
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No invoices found. Create your first invoice to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.memberName}</TableCell>
                          <TableCell>{invoice.team}</TableCell>
                          <TableCell>{invoice.billingPeriod}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold">IDR {invoice.amount.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            <Select
                              value={invoice.status}
                              onValueChange={(value: "Draft" | "Sent" | "Paid" | "Overdue") => 
                                updateInvoiceStatus(invoice.id, value)}
                            >
                              <SelectTrigger className={`w-32 ${
                                invoice.status === "Paid" ? "bg-green-100 text-green-800 border-green-300" :
                                invoice.status === "Overdue" ? "bg-red-100 text-red-800 border-red-300" :
                                invoice.status === "Sent" ? "bg-blue-100 text-blue-800 border-blue-300" :
                                "bg-gray-100 text-gray-800 border-gray-300"
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Sent">Sent</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {invoice.paymentLink && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(invoice.paymentLink, "_blank")}
                                >
                                  Pay Link
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(invoice)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteInvoice(invoice.id)}
                                className="text-red-600 hover:text-red-700"
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
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}