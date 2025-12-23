import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Phone,
  Users,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TEAMS = [
  "Toddler",
  "Kindy 1",
  "Kindy 2",
  "U6",
  "U8 Dev",
  "U8 Adv",
  "U10 Dev",
  "U10 Adv",
  "U12 Dev",
  "U12 Adv",
  "U12 Girls",
  "U14",
  "U14 Girls",
  "U16",
  "U18 Girls",
  "U18",
  "Women",
  "Masters",
  "Legends",
  "Social",
  "1st Team",
];

const ROLES = ["Player", "Coach", "Admin"];
const TYPES = ["Junior", "Youth", "Adult"];
const MEMBERSHIP_CATEGORIES = ["Standard", "Sponsored", "Scholarship"];

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
  coachingCredits: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  
  const [bulkEditFields, setBulkEditFields] = useState({
    team: "no-change",
    role: "no-change",
    type: "no-change",
    membershipCategory: "no-change",
  });

  const [formData, setFormData] = useState<Partial<Member>>({
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
    coachingCredits: 0,
  });

  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, teamFilter]);

  const loadMembers = () => {
    const stored = localStorage.getItem("members");
    if (stored) {
      setMembers(JSON.parse(stored));
    }
  };

  const saveMembers = (updatedMembers: Member[]) => {
    localStorage.setItem("members", JSON.stringify(updatedMembers));
    setMembers(updatedMembers);
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.firstName.toLowerCase().includes(query) ||
          m.lastName.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      );
    }

    if (teamFilter !== "all") {
      filtered = filtered.filter((m) => m.team === teamFilter);
    }

    setFilteredMembers(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMember) {
      const updated = members.map((m) =>
        m.id === editingMember.id ? { ...formData, id: m.id } as Member : m
      );
      saveMembers(updated);
      setShowEditDialog(false);
    } else {
      const newMember: Member = {
        ...formData,
        id: Date.now().toString(),
      } as Member;
      saveMembers([...members, newMember]);
      setShowAddDialog(false);
    }

    resetForm();
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setShowEditDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      saveMembers(members.filter((m) => m.id !== id));
      // Remove from selection if deleted
      if (selectedMembers.has(id)) {
        const newSelected = new Set(selectedMembers);
        newSelected.delete(id);
        setSelectedMembers(newSelected);
      }
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
      coachingCredits: 0,
    });
    setEditingMember(null);
  };

  const exportToCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "DOB",
      "Nationality",
      "Address",
      "Email",
      "Shirt #",
      "Type",
      "Role",
      "Team",
      "Membership",
      "Joining Date",
      "Contact",
      "Primary Contact",
      "Primary Phone",
      "Secondary Contact",
      "Secondary Phone",
      "Medical Notes",
      "Coaching Credits",
    ];

    const rows = members.map((m) => [
      m.firstName,
      m.lastName,
      m.dateOfBirth,
      m.nationality,
      m.address,
      m.email,
      m.shirtNumber || "",
      m.type,
      m.role,
      m.team,
      m.membershipCategory,
      m.joiningDate,
      m.contactNumber,
      m.primaryContact,
      m.primaryContactNumber,
      m.secondaryContact || "",
      m.secondaryContactNumber || "",
      m.medicalNotes || "",
      m.coachingCredits,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bali-bulldogs-members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim()));

      setCsvHeaders(headers);
      setCsvData(data);
      setShowImportDialog(true);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const imported: Member[] = csvData.map((row) => {
      const member: any = { id: Date.now().toString() + Math.random() };

      Object.entries(csvMapping).forEach(([csvHeader, memberField]) => {
        const index = csvHeaders.indexOf(csvHeader);
        if (index !== -1 && memberField) {
          let value: any = row[index];

          if (memberField === "shirtNumber" || memberField === "coachingCredits") {
            value = value ? parseInt(value) : 0;
          }

          member[memberField] = value;
        }
      });

      member.type = member.type || "Junior";
      member.role = member.role || "Player";
      member.team = member.team || "U6";
      member.membershipCategory = member.membershipCategory || "Standard";
      member.coachingCredits = member.coachingCredits || 0;

      return member as Member;
    });

    saveMembers([...members, ...imported]);
    setShowImportDialog(false);
    setCsvMapping({});
    setCsvHeaders([]);
    setCsvData([]);
  };

  const toggleSelectMember = (id: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleBulkEdit = () => {
    if (selectedMembers.size === 0) {
      alert("Please select at least one member");
      return;
    }
    setShowBulkEditDialog(true);
  };

  const applyBulkEdit = () => {
    const updated = members.map((member) => {
      if (selectedMembers.has(member.id)) {
        const changes: Partial<Member> = {};
        
        if (bulkEditFields.team && bulkEditFields.team !== "no-change") {
          changes.team = bulkEditFields.team;
        }
        if (bulkEditFields.role && bulkEditFields.role !== "no-change") {
          changes.role = bulkEditFields.role as Member["role"];
        }
        if (bulkEditFields.type && bulkEditFields.type !== "no-change") {
          changes.type = bulkEditFields.type as Member["type"];
        }
        if (bulkEditFields.membershipCategory && bulkEditFields.membershipCategory !== "no-change") {
          changes.membershipCategory = bulkEditFields.membershipCategory as Member["membershipCategory"];
        }

        return { ...member, ...changes };
      }
      return member;
    });

    saveMembers(updated);
    setSelectedMembers(new Set());
    setShowBulkEditDialog(false);
    setBulkEditFields({
      team: "no-change",
      role: "no-change",
      type: "no-change",
      membershipCategory: "no-change",
    });
  };

  const memberFieldOptions = [
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "dateOfBirth", label: "Date of Birth" },
    { value: "nationality", label: "Nationality" },
    { value: "address", label: "Address" },
    { value: "email", label: "Email" },
    { value: "shirtNumber", label: "Shirt Number" },
    { value: "type", label: "Type" },
    { value: "role", label: "Role" },
    { value: "team", label: "Team" },
    { value: "membershipCategory", label: "Membership Category" },
    { value: "joiningDate", label: "Joining Date" },
    { value: "contactNumber", label: "Contact Number" },
    { value: "primaryContact", label: "Primary Contact" },
    { value: "primaryContactNumber", label: "Primary Contact Number" },
    { value: "secondaryContact", label: "Secondary Contact" },
    { value: "secondaryContactNumber", label: "Secondary Contact Number" },
    { value: "medicalNotes", label: "Medical Notes" },
    { value: "coachingCredits", label: "Coaching Credits" },
  ];

  return (
    <>
      <SEO
        title="Members - Bali Bulldogs"
        description="Manage club members, teams, and player information"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Members</h1>
              <p className="text-gray-600">
                Total: {filteredMembers.length} of {members.length} members
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.size > 0 && (
                <Button
                  onClick={handleBulkEdit}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Bulk Edit ({selectedMembers.size})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById("csv-upload")?.click()}
                className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {TEAMS.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={toggleSelectAll}
                        className="hover:bg-blue-500 rounded p-1 transition-colors"
                      >
                        {selectedMembers.size === filteredMembers.length && filteredMembers.length > 0 ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Team</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Membership</th>
                    <th className="px-4 py-3 text-left font-semibold">Contact</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member, index) => (
                    <tr
                      key={member.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        selectedMembers.has(member.id) ? "bg-blue-50" : ""
                      } ${index % 2 === 0 ? "bg-gray-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelectMember(member.id)}
                          className="hover:bg-blue-100 rounded p-1 transition-colors"
                        >
                          {selectedMembers.has(member.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{member.shirtNumber || "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">{member.team}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-medium">
                          {member.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">{member.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            member.membershipCategory === "Scholarship"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : member.membershipCategory === "Sponsored"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {member.membershipCategory}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${member.contactNumber.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          WhatsApp
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No members found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery || teamFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first member to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Member Dialog */}
      <Dialog
        open={showAddDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update member information"
                : "Enter member details to add them to the database"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address (Area of Bali) *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="shirtNumber">Shirt Number</Label>
                <Input
                  id="shirtNumber"
                  type="number"
                  value={formData.shirtNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shirtNumber: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as Member["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as Member["role"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team">Team Assignment *</Label>
                <Select
                  value={formData.team}
                  onValueChange={(value) => setFormData({ ...formData, team: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="membershipCategory">Membership Category *</Label>
                <Select
                  value={formData.membershipCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, membershipCategory: value as Member["membershipCategory"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="primaryContact">Primary Contact Name *</Label>
                <Input
                  id="primaryContact"
                  value={formData.primaryContact}
                  onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="primaryContactNumber">Primary Contact Number *</Label>
                <Input
                  id="primaryContactNumber"
                  type="tel"
                  value={formData.primaryContactNumber}
                  onChange={(e) => setFormData({ ...formData, primaryContactNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="secondaryContact">Secondary Contact Name</Label>
                <Input
                  id="secondaryContact"
                  value={formData.secondaryContact}
                  onChange={(e) => setFormData({ ...formData, secondaryContact: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="secondaryContactNumber">Secondary Contact Number</Label>
                <Input
                  id="secondaryContactNumber"
                  type="tel"
                  value={formData.secondaryContactNumber}
                  onChange={(e) => setFormData({ ...formData, secondaryContactNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="coachingCredits">Private Coaching Credits</Label>
                <Input
                  id="coachingCredits"
                  type="number"
                  min="0"
                  value={formData.coachingCredits}
                  onChange={(e) =>
                    setFormData({ ...formData, coachingCredits: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medicalNotes">Medical Notes (Allergies & Conditions)</Label>
              <Textarea
                id="medicalNotes"
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder="Known allergies, pre-existing medical conditions..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setShowEditDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingMember ? "Update Member" : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900">
              Bulk Edit Members
            </DialogTitle>
            <DialogDescription>
              Update common fields for {selectedMembers.size} selected member(s). Leave fields empty to
              keep existing values.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bulkTeam">Team Assignment</Label>
              <Select
                value={bulkEditFields.team}
                onValueChange={(value) => setBulkEditFields({ ...bulkEditFields, team: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Keep existing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">Keep existing</SelectItem>
                  {TEAMS.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulkRole">Role</Label>
              <Select
                value={bulkEditFields.role}
                onValueChange={(value) => setBulkEditFields({ ...bulkEditFields, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Keep existing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">Keep existing</SelectItem>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulkType">Type</Label>
              <Select
                value={bulkEditFields.type}
                onValueChange={(value) => setBulkEditFields({ ...bulkEditFields, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Keep existing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">Keep existing</SelectItem>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulkMembership">Membership Category</Label>
              <Select
                value={bulkEditFields.membershipCategory}
                onValueChange={(value) =>
                  setBulkEditFields({ ...bulkEditFields, membershipCategory: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Keep existing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">Keep existing</SelectItem>
                  {MEMBERSHIP_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">
                📝 {selectedMembers.size} member(s) will be updated with the selected values
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBulkEditDialog(false);
                setBulkEditFields({
                  team: "no-change",
                  role: "no-change",
                  type: "no-change",
                  membershipCategory: "no-change",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={applyBulkEdit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">Import Members from CSV</DialogTitle>
            <DialogDescription>
              Map your CSV columns to member fields. Found {csvData.length} row(s) to import.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900 font-medium">
                💡 Map your CSV column headers to the corresponding member fields. Unmapped columns
                will be ignored.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {csvHeaders.map((header) => (
                <div key={header}>
                  <Label>CSV Column: "{header}"</Label>
                  <Select
                    value={csvMapping[header] || ""}
                    onValueChange={(value) =>
                      setCsvMapping({ ...csvMapping, [header]: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Don't import" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Don't import</SelectItem>
                      {memberFieldOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setCsvMapping({});
                setCsvHeaders([]);
                setCsvData([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} className="bg-blue-600 hover:bg-blue-700">
              Import {csvData.length} Member(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}