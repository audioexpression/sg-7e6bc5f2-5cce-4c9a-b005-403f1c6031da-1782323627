import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Search, Upload, Download, Plus, ArrowLeft, User } from "lucide-react";

// Define teams by category
const TEAMS_BY_CATEGORY = {
  Junior: [
    "Toddler",
    "Kindy/U6 1",
    "Kindy/U6 2",
    "U8 Dev",
    "U8 Adv",
    "U10 Dev",
    "U10 Adv",
    "U12 Girls",
    "U12 Dev",
    "U12 Adv"
  ],
  Youth: [
    "U14",
    "U14 Girls",
    "U16",
    "U18 Girls",
    "U18"
  ],
  Adult: [
    "1st Team",
    "Social Team",
    "Legends 35+",
    "Masters 45+"
  ]
};

const ROLES = ["Player", "Player-Coach", "Coach", "Admin"];

// Create a flat list of all teams for the filter dropdown
const ALL_TEAMS = Object.values(TEAMS_BY_CATEGORY).flat();

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  shirtNumber: string;
  category: "Junior" | "Youth" | "Adult";
  type: "Member" | "Sponsored" | "Scholarship";
  role: string;
  teamAssignment: string;
  joiningDate: string;
  contactNumber: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact: string;
  secondaryContactNumber: string;
  medicalNotes: string;
  coachingCredits: number;
  photoUrl?: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");

  const teamOptions = ALL_TEAMS;

  const [formData, setFormData] = useState<Partial<Member>>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    email: "",
    shirtNumber: "",
    category: "Junior",
    type: "Member",
    role: "Player",
    teamAssignment: "",
    joiningDate: new Date().toISOString().split("T")[0],
    contactNumber: "",
    primaryContact: "",
    primaryContactNumber: "",
    secondaryContact: "",
    secondaryContactNumber: "",
    medicalNotes: "",
    coachingCredits: 0,
    photoUrl: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("members");
    if (stored) {
      setMembers(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMember) {
      const updated = members.map(m => 
        m.id === editingMember.id ? { ...formData, id: editingMember.id } as Member : m
      );
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
    } else {
      const newMember: Member = {
        ...formData,
        id: Date.now().toString(),
      } as Member;
      const updated = [...members, newMember];
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
    }

    setIsFormOpen(false);
    setEditingMember(null);
    resetForm();
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      email: "",
      shirtNumber: "",
      category: "Junior",
      type: "Member",
      role: "Player",
      teamAssignment: "",
      joiningDate: new Date().toISOString().split("T")[0],
      contactNumber: "",
      primaryContact: "",
      primaryContactNumber: "",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      photoUrl: "",
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").filter(row => row.trim());
      const headers = rows[0].split(",").map(h => h.trim());
      
      const imported = rows.slice(1).map(row => {
        const values = row.split(",").map(v => v.trim());
        const member: any = { id: Date.now().toString() + Math.random() };
        
        headers.forEach((header, index) => {
          const value = values[index] || "";
          switch(header.toLowerCase()) {
            case "first name": member.firstName = value; break;
            case "last name": member.lastName = value; break;
            case "date of birth": member.dateOfBirth = value; break;
            case "nationality": member.nationality = value; break;
            case "address": member.address = value; break;
            case "email": member.email = value; break;
            case "shirt number": member.shirtNumber = value; break;
            case "category": member.category = value; break;
            case "type": member.type = value; break;
            case "role": member.role = value; break;
            case "team": member.teamAssignment = value; break;
            case "joining date": member.joiningDate = value; break;
            case "contact number": member.contactNumber = value; break;
            case "primary contact": member.primaryContact = value; break;
            case "primary contact number": member.primaryContactNumber = value; break;
            case "secondary contact": member.secondaryContact = value; break;
            case "secondary contact number": member.secondaryContactNumber = value; break;
            case "medical notes": member.medicalNotes = value; break;
            case "coaching credits": member.coachingCredits = parseInt(value) || 0; break;
            case "photo url": member.photoUrl = value; break;
          }
        });
        
        return member as Member;
      });

      const updated = [...members, ...imported];
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
      setIsImportOpen(false);
    };
    
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const headers = [
      "First Name", "Last Name", "Date of Birth", "Nationality", "Address", "Email",
      "Shirt Number", "Category", "Type", "Role", "Team", "Joining Date",
      "Contact Number", "Primary Contact", "Primary Contact Number",
      "Secondary Contact", "Secondary Contact Number", "Medical Notes", "Coaching Credits", "Photo URL"
    ];
    
    const csv = [
      headers.join(","),
      ...members.map(m => [
        m.firstName, m.lastName, m.dateOfBirth, m.nationality, m.address, m.email,
        m.shirtNumber, m.category, m.type, m.role, m.teamAssignment, m.joiningDate,
        m.contactNumber, m.primaryContact, m.primaryContactNumber,
        m.secondaryContact, m.secondaryContactNumber, m.medicalNotes, m.coachingCredits, m.photoUrl || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulldogs_members.csv";
    a.click();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.teamAssignment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || member.category === filterCategory;
    const matchesTeam = filterTeam === "all" || member.teamAssignment === filterTeam;
    
    return matchesSearch && matchesCategory && matchesTeam;
  });

  const getWhatsAppLink = (number: string) => {
    const cleaned = number.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  };

  return (
    <>
      <SEO 
        title="Members - Bali Bulldogs Club Manager"
        description="Manage club members, teams, and contacts"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-blue-800"
                onClick={() => window.location.href = "/"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight">MEMBER DATABASE</h1>
                <p className="text-blue-100 text-lg">Bali Bulldogs Club Manager</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-yellow-400">{members.length}</div>
                <div className="text-sm text-blue-200 uppercase tracking-wide">Total Members</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 shadow-lg border-2 border-blue-100">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-blue-200">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Youth">Youth</SelectItem>
                  <SelectItem value="Adult">Adult</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-blue-200">
                  <SelectValue placeholder="Filter by Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamOptions.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingMember(null);
                  setIsFormOpen(true);
                }}
                className="bg-blue-700 hover:bg-blue-800 h-12 px-6 font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Member
              </Button>
              
              <Button 
                onClick={() => setIsImportOpen(true)}
                variant="outline"
                className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 h-12 px-6 font-bold"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import CSV
              </Button>
              
              <Button 
                onClick={handleExportCSV}
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 h-12 px-6 font-bold"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-blue-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-700 hover:bg-blue-700">
                    <TableHead className="text-white font-bold">Photo</TableHead>
                    <TableHead className="text-white font-bold">Name</TableHead>
                    <TableHead className="text-white font-bold">Shirt #</TableHead>
                    <TableHead className="text-white font-bold">Team</TableHead>
                    <TableHead className="text-white font-bold">Category</TableHead>
                    <TableHead className="text-white font-bold">Type</TableHead>
                    <TableHead className="text-white font-bold">Role</TableHead>
                    <TableHead className="text-white font-bold">Contact</TableHead>
                    <TableHead className="text-white font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                        No members found. Add your first member to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-blue-50">
                        <TableCell>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            {member.photoUrl ? (
                              <img src={member.photoUrl} alt={member.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-bold">
                            #{member.shirtNumber || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{member.teamAssignment}</TableCell>
                        <TableCell>
                          <Badge className={
                            member.category === "Junior" ? "bg-green-600" :
                            member.category === "Youth" ? "bg-blue-600" :
                            "bg-purple-600"
                          }>
                            {member.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.type === "Member" ? "default" : "outline"} className={member.type !== "Member" ? "border-green-600 text-green-600" : ""}>
                            {member.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          {member.contactNumber && (
                            <a 
                              href={getWhatsAppLink(member.contactNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              WhatsApp
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(member)}
                              className="hover:bg-blue-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(member.id)}
                              className="hover:bg-red-100 text-red-600"
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
          </Card>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-700">
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="font-semibold">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="font-semibold">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Photo Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full p-2 border-2 border-blue-200 rounded-md text-sm"
                  />
                  {formData.photoUrl && (
                    <div className="mt-2 relative w-20 h-20">
                      <img src={formData.photoUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border-2 border-blue-200" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, photoUrl: ""})}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 font-semibold">
                    Category (Age Group) *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 border-2 border-blue-200 rounded-md bg-background"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Junior">Junior</option>
                    <option value="Youth">Youth</option>
                    <option value="Adult">Adult</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="font-semibold">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="nationality" className="font-semibold">Nationality *</Label>
                <Input
                  id="nationality"
                  required
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="address" className="font-semibold">Address (Area of Bali) *</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-semibold">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="shirtNumber" className="font-semibold">Shirt Number</Label>
                <Input
                  id="shirtNumber"
                  value={formData.shirtNumber}
                  onChange={(e) => setFormData({...formData, shirtNumber: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 font-semibold">
                    Type (Payment Status) *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 border-2 border-blue-200 rounded-md bg-background"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Member">Member (Paying)</option>
                    <option value="Sponsored">Sponsored (Free)</option>
                    <option value="Scholarship">Scholarship (Free)</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="role" className="font-semibold">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({...formData, role: value as any})}
                  >
                    <SelectTrigger className="border-2 border-blue-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Player">Player</SelectItem>
                      <SelectItem value="Coach">Coach</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "Junior" | "Youth" | "Adult") => {
                  setFormData({ 
                    ...formData, 
                    category: value,
                    teamAssignment: "" // Reset team when category changes
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Youth">Youth</SelectItem>
                  <SelectItem value="Adult">Adult</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="teamAssignment">Team Assignment *</Label>
              <Select
                value={formData.teamAssignment}
                onValueChange={(value) =>
                  setFormData({ ...formData, teamAssignment: value })
                }
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.category ? "Select team" : "Select category first"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.category && TEAMS_BY_CATEGORY[formData.category].map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.category && (
                <p className="text-sm text-gray-500 mt-1">Please select a category first to see available teams</p>
              )}
            </div>

              <div>
                <Label htmlFor="joiningDate" className="font-semibold">Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="contactNumber" className="font-semibold">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="primaryContact" className="font-semibold">Primary Contact Name</Label>
                <Input
                  id="primaryContact"
                  value={formData.primaryContact}
                  onChange={(e) => setFormData({...formData, primaryContact: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="primaryContactNumber" className="font-semibold">Primary Contact Number</Label>
                <Input
                  id="primaryContactNumber"
                  value={formData.primaryContactNumber}
                  onChange={(e) => setFormData({...formData, primaryContactNumber: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="secondaryContact" className="font-semibold">Secondary Contact Name</Label>
                <Input
                  id="secondaryContact"
                  value={formData.secondaryContact}
                  onChange={(e) => setFormData({...formData, secondaryContact: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="secondaryContactNumber" className="font-semibold">Secondary Contact Number</Label>
                <Input
                  id="secondaryContactNumber"
                  value={formData.secondaryContactNumber}
                  onChange={(e) => setFormData({...formData, secondaryContactNumber: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="coachingCredits" className="font-semibold">Coaching Credits</Label>
                <Input
                  id="coachingCredits"
                  type="number"
                  min="0"
                  value={formData.coachingCredits}
                  onChange={(e) => setFormData({...formData, coachingCredits: parseInt(e.target.value) || 0})}
                  className="border-2 border-blue-200"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medicalNotes" className="font-semibold">Medical Notes</Label>
              <Textarea
                id="medicalNotes"
                placeholder="Known allergies, pre-existing conditions..."
                value={formData.medicalNotes}
                onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                className="border-2 border-blue-200 min-h-24"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFormOpen(false)}
                className="border-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 font-bold"
              >
                {editingMember ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-700">Import Members from CSV</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-900 font-semibold mb-2">CSV Format:</p>
              <p className="text-xs text-blue-700">
                First Name, Last Name, Date of Birth, Nationality, Address, Email, Shirt Number, 
                Category, Type, Role, Team, Joining Date, Contact Number, 
                Primary Contact, Primary Contact Number, Secondary Contact, Secondary Contact Number, 
                Medical Notes, Coaching Credits, Photo URL
              </p>
            </div>

            <Input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="border-2 border-blue-200"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}