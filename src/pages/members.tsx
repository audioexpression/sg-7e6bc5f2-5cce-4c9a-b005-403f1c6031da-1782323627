import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Edit, Trash2, ArrowLeft, UserPlus, Upload, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  shirtNumber?: number;
  type: "Junior" | "Youth" | "Adult";
  role: "Player" | "Coach" | "Admin";
  team: string;
  membershipCategory: "Standard" | "Sponsored" | "Scholarship";
  joiningDate: string;
  contactNumber: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact?: string;
  secondaryContactNumber?: string;
  medicalNotes?: string;
  privateCoachingCredits: number;
}

const teams = [
  "Toddler", "Kindy 1", "Kindy 2", "U6", "U8 Dev", "U8 Adv", 
  "U10 Dev", "U10 Adv", "U12 Dev", "U12 Adv", "U12 Girls",
  "U14", "U14 Girls", "U16", "U18 Girls", "U18",
  "Women", "Masters", "Legends", "Social", "1st Team"
];

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [importStatus, setImportStatus] = useState("");

  const [formData, setFormData] = useState<Member>({
    id: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    email: "",
    shirtNumber: undefined,
    type: "Junior",
    role: "Player",
    team: "U6",
    membershipCategory: "Standard",
    joiningDate: new Date().toISOString().split("T")[0],
    contactNumber: "",
    primaryContact: "",
    primaryContactNumber: "",
    secondaryContact: "",
    secondaryContactNumber: "",
    medicalNotes: "",
    privateCoachingCredits: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("members");
    if (stored) {
      setMembers(JSON.parse(stored));
    }
  }, []);

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").map(row => row.split(",").map(cell => cell.trim()));
      
      if (rows.length < 2) {
        setImportStatus("❌ Invalid CSV file");
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase());
      const importedMembers: Member[] = [];
      let successCount = 0;
      let skipCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 2 || !row[0]) {
          skipCount++;
          continue;
        }

        const member: Member = {
          id: Date.now().toString() + i,
          firstName: row[headers.indexOf("first name")] || row[headers.indexOf("firstname")] || "",
          lastName: row[headers.indexOf("last name")] || row[headers.indexOf("lastname")] || "",
          dateOfBirth: row[headers.indexOf("date of birth")] || row[headers.indexOf("dob")] || "",
          nationality: row[headers.indexOf("nationality")] || "",
          address: row[headers.indexOf("address")] || row[headers.indexOf("area")] || "",
          email: row[headers.indexOf("email")] || "",
          shirtNumber: parseInt(row[headers.indexOf("shirt nr")] || row[headers.indexOf("shirt number")] || "0"),
          type: (row[headers.indexOf("type")] as "Junior" | "Youth" | "Adult") || "Junior",
          role: (row[headers.indexOf("role")] as "Player" | "Coach" | "Admin") || "Player",
          team: (row[headers.indexOf("team")] || row[headers.indexOf("team assignment")] as any) || "U6",
          membershipCategory: (row[headers.indexOf("membership category")] || row[headers.indexOf("category")] as any) || "Standard",
          joiningDate: row[headers.indexOf("joining date")] || new Date().toISOString().split("T")[0],
          contactNumber: row[headers.indexOf("contact number")] || row[headers.indexOf("phone")] || "",
          primaryContact: row[headers.indexOf("primary contact")] || "",
          primaryContactNumber: row[headers.indexOf("primary contact number")] || "",
          secondaryContact: row[headers.indexOf("secondary contact")] || "",
          secondaryContactNumber: row[headers.indexOf("secondary contact number")] || "",
          medicalNotes: row[headers.indexOf("medical notes")] || "",
          privateCoachingCredits: parseInt(row[headers.indexOf("private coaching credits")] || row[headers.indexOf("credits")] || "0"),
        };

        if (member.firstName && member.lastName) {
          importedMembers.push(member);
          successCount++;
        } else {
          skipCount++;
        }
      }

      const updatedMembers = [...members, ...importedMembers];
      setMembers(updatedMembers);
      localStorage.setItem("members", JSON.stringify(updatedMembers));
      setImportStatus(`✅ Imported ${successCount} members${skipCount > 0 ? ` (${skipCount} rows skipped)` : ""}`);
      
      setTimeout(() => {
        setIsImportDialogOpen(false);
        setImportStatus("");
      }, 2000);
    };

    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = [
      "First Name", "Last Name", "Date of Birth", "Nationality", "Address", "Email",
      "Shirt Nr", "Type", "Role", "Team", "Membership Category", "Joining Date",
      "Contact Number", "Primary Contact", "Primary Contact Number",
      "Secondary Contact", "Secondary Contact Number", "Medical Notes",
      "Private Coaching Credits"
    ];

    const rows = members.map(m => [
      m.firstName, m.lastName, m.dateOfBirth, m.nationality, m.address, m.email,
      m.shirtNumber, m.type, m.role, m.team, m.membershipCategory, m.joiningDate,
      m.contactNumber, m.primaryContact, m.primaryContactNumber,
      m.secondaryContact, m.secondaryContactNumber, m.medicalNotes,
      m.privateCoachingCredits
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bali-bulldogs-members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const saveMember = () => {
    let updatedMembers: Member[];
    
    if (editingMember) {
      updatedMembers = members.map(m => m.id === editingMember.id ? { ...formData, id: editingMember.id } : m);
    } else {
      const newMember = { ...formData, id: Date.now().toString() };
      updatedMembers = [...members, newMember];
    }
    
    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
    resetForm();
  };

  const deleteMember = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      email: "",
      shirtNumber: undefined,
      type: "Junior",
      role: "Player",
      team: "U6",
      membershipCategory: "Standard",
      joiningDate: new Date().toISOString().split("T")[0],
      contactNumber: "",
      primaryContact: "",
      primaryContactNumber: "",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      privateCoachingCredits: 0,
    });
    setEditingMember(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (member: Member) => {
    setFormData(member);
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = filterTeam === "all" || member.team === filterTeam;
    const matchesType = filterType === "all" || member.type === filterType;
    
    return matchesSearch && matchesTeam && matchesType;
  });

  return (
    <>
      <SEO 
        title="Member Database - Bali Bulldogs Club Manager"
        description="Complete member registry and management system"
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
                  <h1 className="text-3xl font-black tracking-tight">MEMBER DATABASE</h1>
                  <p className="text-yellow-300 text-sm font-semibold">Bali Bulldogs Club Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-black text-bulldogs-blue">Members</CardTitle>
                  <CardDescription>Total: {filteredMembers.length} of {members.length} members</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={exportToCSV}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-bulldogs-blue">
                          Import Members from CSV
                        </DialogTitle>
                        <DialogDescription>
                          Upload your Excel/CSV file to import members
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="csv-file">CSV File</Label>
                          <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleCSVImport}
                          />
                          <p className="text-xs text-gray-500">
                            Expected columns: First Name, Last Name, Date of Birth, Nationality, Address, Email, 
                            Shirt Nr, Type, Role, Team, Membership Category, Joining Date, Contact Number, 
                            Primary Contact, Primary Contact Number, Secondary Contact, Secondary Contact Number, 
                            Medical Notes, Private Coaching Credits
                          </p>
                        </div>

                        {importStatus && (
                          <Alert className={importStatus.startsWith("✅") ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                            <AlertDescription>{importStatus}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                        <UserPlus className="h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-bulldogs-blue">
                          {editingMember ? "Edit Member" : "Add New Member"}
                        </DialogTitle>
                        <DialogDescription>
                          Fill in all member details below
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-6 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={e => setFormData({...formData, firstName: e.target.value})}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={e => setFormData({...formData, lastName: e.target.value})}
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nationality">Nationality</Label>
                            <Input
                              id="nationality"
                              value={formData.nationality}
                              onChange={e => setFormData({...formData, nationality: e.target.value})}
                              placeholder="e.g., Indonesian, Australian"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address">Address (Area of Bali)</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={e => setFormData({...formData, address: e.target.value})}
                              placeholder="e.g., Canggu, Seminyak"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(value: "Junior" | "Youth" | "Adult") => setFormData({...formData, type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Junior">Junior</SelectItem>
                                <SelectItem value="Youth">Youth</SelectItem>
                                <SelectItem value="Adult">Adult</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                              value={formData.role}
                              onValueChange={(value: "Player" | "Coach" | "Admin") => setFormData({...formData, role: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Player">Player</SelectItem>
                                <SelectItem value="Coach">Coach</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="shirtNumber">Shirt Number</Label>
                            <Input
                              id="shirtNumber"
                              type="number"
                              value={formData.shirtNumber || ""}
                              onChange={e => setFormData({...formData, shirtNumber: e.target.value ? parseInt(e.target.value) : undefined})}
                              placeholder="Number"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="team">Team Assignment *</Label>
                            <Select
                              value={formData.team}
                              onValueChange={(value) => setFormData({...formData, team: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {teams.map(team => (
                                  <SelectItem key={team} value={team}>{team}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="membershipCategory">Membership Category *</Label>
                            <Select
                              value={formData.membershipCategory}
                              onValueChange={(value: "Standard" | "Sponsored" | "Scholarship") => 
                                setFormData({...formData, membershipCategory: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Standard">Standard</SelectItem>
                                <SelectItem value="Sponsored">Sponsored</SelectItem>
                                <SelectItem value="Scholarship">Scholarship</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="joiningDate">Joining Date *</Label>
                            <Input
                              id="joiningDate"
                              type="date"
                              value={formData.joiningDate}
                              onChange={e => setFormData({...formData, joiningDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactNumber">Contact Number *</Label>
                            <Input
                              id="contactNumber"
                              value={formData.contactNumber}
                              onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                              placeholder="+62 xxx xxx xxxx"
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h3 className="font-bold text-lg mb-4">Emergency Contacts</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="primaryContact">Primary Contact Name *</Label>
                              <Input
                                id="primaryContact"
                                value={formData.primaryContact}
                                onChange={e => setFormData({...formData, primaryContact: e.target.value})}
                                placeholder="Parent/Guardian name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="primaryContactNumber">Primary Contact Number *</Label>
                              <Input
                                id="primaryContactNumber"
                                value={formData.primaryContactNumber}
                                onChange={e => setFormData({...formData, primaryContactNumber: e.target.value})}
                                placeholder="+62 xxx xxx xxxx"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="secondaryContact">Secondary Contact Name</Label>
                              <Input
                                id="secondaryContact"
                                value={formData.secondaryContact || ""}
                                onChange={e => setFormData({...formData, secondaryContact: e.target.value})}
                                placeholder="Optional"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="secondaryContactNumber">Secondary Contact Number</Label>
                              <Input
                                id="secondaryContactNumber"
                                value={formData.secondaryContactNumber || ""}
                                onChange={e => setFormData({...formData, secondaryContactNumber: e.target.value})}
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="medicalNotes">Medical Notes</Label>
                          <Textarea
                            id="medicalNotes"
                            value={formData.medicalNotes || ""}
                            onChange={e => setFormData({...formData, medicalNotes: e.target.value})}
                            placeholder="Known allergies, medical conditions, etc."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="privateCoachingCredits">Private Coaching Credits</Label>
                          <Input
                            id="privateCoachingCredits"
                            type="number"
                            value={formData.privateCoachingCredits}
                            onChange={e => setFormData({...formData, privateCoachingCredits: parseInt(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={saveMember} className="bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                          {editingMember ? "Update Member" : "Add Member"}
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
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No members found. Add your first member to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map(member => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{member.firstName} {member.lastName}</div>
                              {member.shirtNumber && (
                                <div className="text-xs text-gray-500">#{member.shirtNumber}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{member.team}</TableCell>
                          <TableCell>{member.type}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.membershipCategory === "Standard" ? "bg-blue-100 text-blue-800" :
                              member.membershipCategory === "Sponsored" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {member.membershipCategory}
                            </span>
                          </TableCell>
                          <TableCell>
                            <a 
                              href={`https://wa.me/${member.contactNumber.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              WhatsApp
                            </a>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMember(member.id)}
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