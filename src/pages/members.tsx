import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, Upload, Search, Users, UserPlus, ChevronLeft, ChevronRight, Home, DollarSign, Calendar, Settings, Pencil, User, Phone } from "lucide-react";
import Link from "next/link";
import { ImageModal } from "@/components/ImageModal";
import { useRouter } from "next/router";

const TEAMS_BY_CATEGORY = {
  Junior: ["Toddler", "Kindy/U6 1", "Kindy/U6 2", "U8 Dev", "U8 Adv", "U10 Dev", "U10 Adv", "U12 Girls", "U12 Dev", "U12 Adv"],
  Youth: ["U14", "U14 Girls", "U16", "U18 Girls", "U18"],
  Adult: ["1st Team", "Social Team", "Legends 35+", "Masters 45+"],
};

const ROLES = ["Admin", "Coach", "Player-Coach", "Player"];

const teamOptions = [...TEAMS_BY_CATEGORY.Junior, ...TEAMS_BY_CATEGORY.Youth, ...TEAMS_BY_CATEGORY.Adult];

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  email?: string;
  shirtNumber: string;
  category: "Junior" | "Youth" | "Adult";
  type: "Member" | "Sponsored" | "Scholarship";
  role: string;
  teamAssignment: string;
  joiningDate: string;
  contactNumber?: string;
  profileImage?: string;
  whatsappLink?: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact: string;
  secondaryContactNumber: string;
  medicalNotes: string;
  coachingCredits: number;
  photoUrl?: string;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterRole, setFilterRole] = useState("");
  const [filterMembershipCategory, setFilterMembershipCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [formData, setFormData] = useState<Partial<Member>>({
    category: "Junior",
    type: "Member",
    role: "Player",
    coachingCredits: 0,
    teamAssignment: "",
  });

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [bulkTeam, setBulkTeam] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkRole, setBulkRole] = useState("");
  const [bulkMembershipCategory, setBulkMembershipCategory] = useState("");

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Image modal state
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  // Handle opening edit dialog from URL query param
  useEffect(() => {
    const { memberId } = router.query;
    if (memberId && typeof memberId === "string") {
      const member = members.find(m => m.id === memberId);
      if (member) {
        setEditingMember(member);
        setIsDialogOpen(true);
        // Clear the query param after opening
        router.replace("/members", undefined, { shallow: true });
      }
    }
  }, [router.query, members]);

  const resetForm = () => {
    setFormData({
      category: "Junior",
      type: "Member",
      role: "Player",
      coachingCredits: 0,
      teamAssignment: "",
    });
    setValidationErrors({});
    setEditingMember(null);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({ 
      ...member,
      // Ensure profileImage is explicitly included
      profileImage: member.profileImage || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    let updatedMembers;
    if (editingMember) {
      updatedMembers = members.map((m) =>
        m.id === editingMember.id ? { 
          ...m, 
          ...formData,
          // Preserve profileImage if not being updated
          profileImage: formData.profileImage || m.profileImage
        } as Member : m
      );
    } else {
      const newMember = {
        ...formData,
        id: crypto.randomUUID(),
        joiningDate: formData.joiningDate || new Date().toISOString().split("T")[0],
      } as Member;
      updatedMembers = [...members, newMember];
    }

    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
    setIsDialogOpen(false);
    resetForm();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterTeam("all");
    setFilterRole("");
    setFilterMembershipCategory("");
    setCurrentPage(1);
  };

  const handleLoadLegends = () => {
    if (!confirm("This will add 27 Legends players to your database. Continue?")) return;
    
    const legendsMembers: Member[] = [
      { id: crypto.randomUUID(), firstName: "Pradana", lastName: "Ardhabanu", dateOfBirth: "1985-01-01", nationality: "Indonesia", address: "", email: "", shirtNumber: "1", category: "Adult", type: "Member", role: "Player", teamAssignment: "Legends 35+", joiningDate: "2024-01-01", contactNumber: "628777", whatsappLink: "https://wa.me/628777", primaryContact: "", primaryContactNumber: "", secondaryContact: "", secondaryContactNumber: "", medicalNotes: "", coachingCredits: 0, photoUrl: "" },
      { id: crypto.randomUUID(), firstName: "Markez", lastName: "Laws", dateOfBirth: "1985-01-01", nationality: "Bermuda", address: "", email: "", shirtNumber: "2", category: "Adult", type: "Member", role: "Player", teamAssignment: "Legends 35+", joiningDate: "2024-01-01", contactNumber: "144159", whatsappLink: "https://wa.me/144159", primaryContact: "", primaryContactNumber: "", secondaryContact: "", secondaryContactNumber: "", medicalNotes: "", coachingCredits: 0, photoUrl: "" }
    ];
    
    const updated = [...members, ...legendsMembers];
    setMembers(updated);
    localStorage.setItem("members", JSON.stringify(updated));
    alert("Legends players added!");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setIsImportOpen(false);
      alert("CSV Import feature coming soon");
    };
    reader.readAsText(file);
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === currentMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(currentMembers.map(m => m.id));
    }
  };

  const handleSelectMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = () => {
    if (selectedMembers.length === 0) return;

    const updatedMembers = members.map(member => {
      if (selectedMembers.includes(member.id)) {
        return {
          ...member,
          ...(bulkTeam && { teamAssignment: bulkTeam }),
          ...(bulkCategory && { category: bulkCategory as "Junior" | "Youth" | "Adult" }),
          ...(bulkRole && { role: bulkRole }),
          ...(bulkMembershipCategory && { type: bulkMembershipCategory as "Member" | "Sponsored" | "Scholarship" })
        };
      }
      return member;
    });

    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
    setSelectedMembers([]);
    setIsBulkActionsOpen(false);
    setBulkTeam("");
    setBulkCategory("");
    setBulkRole("");
    setBulkMembershipCategory("");
  };

  const handleDeleteMembers = () => {
    const updated = members.filter(m => !selectedMembers.includes(m.id));
    setMembers(updated);
    localStorage.setItem("members", JSON.stringify(updated));
    setSelectedMembers([]);
  };

  const filteredAndSortedMembers = members.filter((member) => {
    const matchesSearch = searchTerm === "" || member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || member.email?.toLowerCase().includes(searchTerm.toLowerCase()) || member.contactNumber?.includes(searchTerm);
    const matchesCategory = filterCategory === "all" || member.category === filterCategory;
    const matchesTeam = filterTeam === "all" || member.teamAssignment === filterTeam;
    const matchesRole = filterRole === "" || member.role === filterRole;
    const matchesMembershipStatus = filterMembershipCategory === "" || member.type === filterMembershipCategory;
    return matchesSearch && matchesCategory && matchesTeam && matchesRole && matchesMembershipStatus;
  }).sort((a, b) => a.firstName.localeCompare(b.firstName));

  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredAndSortedMembers.slice(startIndex, endIndex);

  return (
    <>
      <SEO title="Members - Bali Bulldogs" description="Club Member Management" />
      
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center font-bold text-lg">
              <Users className="h-5 w-5 text-yellow-400 mr-2" />
              Bali Bulldogs
            </div>
            <div className="flex space-x-1">
              <Link href="/"><Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-9"><Home className="h-4 w-4 mr-1" />Home</Button></Link>
              <Link href="/teams"><Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-9"><Users className="h-4 w-4 mr-1" />Teams</Button></Link>
              <Link href="/invoices"><Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-9"><DollarSign className="h-4 w-4 mr-1" />Invoices</Button></Link>
              <Link href="/coaching"><Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-9"><Calendar className="h-4 w-4 mr-1" />Coaching</Button></Link>
              <Link href="/settings"><Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-9"><Settings className="h-4 w-4 mr-1" />Settings</Button></Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto w-full px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Member Database</h1>
              <p className="text-sm text-gray-500">Manage all club registrations</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLoadLegends} variant="outline" size="sm" className="bg-yellow-50 hover:bg-yellow-100">
                <Upload className="w-4 h-4 mr-2" />Load Legends
              </Button>
              <Button onClick={() => setIsImportOpen(true)} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />Import CSV
              </Button>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} size="sm" className="bg-blue-600">
                <UserPlus className="w-4 h-4 mr-2" />Add Member
              </Button>
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-900">
                    {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMembers([])}
                  >
                    Clear Selection
                  </Button>
                </div>
                <Button
                  onClick={() => setIsBulkActionsOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Bulk Update
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Youth">Youth</SelectItem>
                  <SelectItem value="Adult">Adult</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {(searchTerm || filterTeam !== "all" || filterCategory !== "all") && (
                <Button variant="ghost" onClick={handleClearFilters} className="text-red-600">
                  <X className="w-4 h-4 mr-1" />Clear
                </Button>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === currentMembers.length && currentMembers.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </TableHead>
                    <TableHead className="w-[60px]">Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No members found. Try adjusting filters or adding a new member.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleSelectMember(member.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </TableCell>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={member.profileImage} alt={`${member.firstName} ${member.lastName}`} />
                            <AvatarFallback>
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                        <TableCell>{member.teamAssignment || "-"}</TableCell>
                        <TableCell><Badge variant="outline">{member.category}</Badge></TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          {member.contactNumber ? (
                            <a
                              href={`https://wa.me/${member.contactNumber.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
                            >
                              <Phone className="h-4 w-4" />
                              {member.contactNumber}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(member)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(member.id)} className="h-8 w-8 p-0 text-red-600"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        {isBulkActionsOpen && (
          <Dialog open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Update Members</DialogTitle>
                <DialogDescription>
                  Update {selectedMembers.length} selected member{selectedMembers.length !== 1 ? "s" : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Change Team</label>
                  <select
                    value={bulkTeam}
                    onChange={(e) => setBulkTeam(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Keep Current</option>
                    {teamOptions.map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Change Category</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Keep Current</option>
                    <option value="Junior">Junior</option>
                    <option value="Youth">Youth</option>
                    <option value="Adult">Adult</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Change Role</label>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Keep Current</option>
                    <option value="Player">Player</option>
                    <option value="Coach">Coach</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Change Membership</label>
                  <select
                    value={bulkMembershipCategory}
                    onChange={(e) => setBulkMembershipCategory(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Keep Current</option>
                    <option value="Member">Member</option>
                    <option value="Sponsored">Sponsored</option>
                    <option value="Scholarship">Scholarship</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsBulkActionsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkUpdate} className="bg-blue-600 hover:bg-blue-700">
                  Update {selectedMembers.length} Member{selectedMembers.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Member" : "Add New Member"}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={formData.profileImage} alt="Profile" />
                      <AvatarFallback className="text-2xl">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {formData.profileImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, profileImage: "" })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, profileImage: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a profile photo (JPG, PNG, GIF)
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={formData.firstName || ""} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={formData.lastName || ""} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Junior">Junior</SelectItem><SelectItem value="Youth">Youth</SelectItem><SelectItem value="Adult">Adult</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Select value={formData.teamAssignment} onValueChange={v => setFormData({...formData, teamAssignment: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger>
                  <SelectContent>
                    {(TEAMS_BY_CATEGORY[formData.category as keyof typeof TEAMS_BY_CATEGORY] || []).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input value={formData.contactNumber || ""} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={formData.dateOfBirth || ""} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={(e) => handleSubmit(e)}>Save Member</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
          <DialogContent className="max-w-lg p-0 border-0 bg-transparent shadow-none">
            <div className="relative"><img src={previewPhotoUrl} className="rounded-lg max-w-full" alt="Member" /><Button className="absolute top-2 right-2 rounded-full" size="icon" variant="destructive" onClick={() => setIsPhotoPreviewOpen(false)}><X className="w-4 h-4" /></Button></div>
          </DialogContent>
        </Dialog>

        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Import CSV</DialogTitle></DialogHeader>
            <div className="py-4"><Input type="file" accept=".csv" onChange={handleImportCSV} /></div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage?.url || ""}
        name={selectedImage?.name || ""}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}