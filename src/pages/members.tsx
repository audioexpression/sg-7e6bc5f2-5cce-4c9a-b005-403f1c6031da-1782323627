import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  Download,
  Plus,
  Search,
  Pencil,
  Trash2,
  MessageCircle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
  UserMinus,
  UserX,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { TEAMS, TYPES, ROLES, MEMBERSHIP_CATEGORIES } from "@/lib/members-data";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  shirtNumber: number | null;
  type: string;
  role: string;
  teamAssignment: string;
  membershipCategory: string;
  joiningDate: string;
  contactNumber: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact: string;
  secondaryContactNumber: string;
  medicalNotes: string;
  coachingCredits: number;
  photo?: string;
};

type SortConfig = {
  key: keyof Member | null;
  direction: "asc" | "desc" | null;
};

type DeleteAction = "remove-from-team" | "delete-member" | null;

const COLUMN_OPTIONS = [
  { key: "photo", label: "Photo" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "team", label: "Team" },
  { key: "type", label: "Type" },
  { key: "role", label: "Role" },
  { key: "membership", label: "Membership" },
  { key: "shirtNumber", label: "Shirt #" },
  { key: "coachingCredits", label: "Credits" },
  { key: "contactNumber", label: "Contact" },
  { key: "joiningDate", label: "Joined" },
  { key: "dateOfBirth", label: "DOB" },
  { key: "nationality", label: "Nationality" },
  { key: "address", label: "Address" },
];

export default function Members() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "photo",
    "name",
    "email",
    "team",
    "type",
    "role",
    "membership",
    "shirtNumber",
    "coachingCredits",
  ]);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    memberId: string | null;
    memberName: string;
  }>({ isOpen: false, memberId: null, memberName: "" });

  const [formData, setFormData] = useState<Partial<Member>>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    email: "",
    shirtNumber: null,
    type: "Member",
    role: "Player",
    teamAssignment: "",
    membershipCategory: "Standard",
    joiningDate: new Date().toISOString().split("T")[0],
    contactNumber: "",
    primaryContact: "",
    primaryContactNumber: "",
    secondaryContact: "",
    secondaryContactNumber: "",
    medicalNotes: "",
    coachingCredits: 0,
    photo: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("bulldogs_members");
    if (stored) {
      setMembers(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    let result = members;

    if (searchQuery) {
      result = result.filter(
        (m) =>
          m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "all") {
      result = result.filter((m) => m.type === filterType);
    }

    if (filterTeam !== "all") {
      result = result.filter((m) => m.teamAssignment === filterTeam);
    }

    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (sortConfig.key === "firstName" || sortConfig.key === "lastName") {
          const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
          const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
          return sortConfig.direction === "asc"
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName);
        }

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    setFilteredMembers(result);
  }, [members, searchQuery, filterType, filterTeam, sortConfig]);

  const handleSort = (key: keyof Member) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { key: null, direction: null };
        }
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key: keyof Member) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    }
    if (sortConfig.direction === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4 text-blue-600" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />;
  };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((k) => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  const saveMember = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    const isDuplicate = members.some(
      (m) =>
        m.id !== editingMember?.id &&
        m.teamAssignment === formData.teamAssignment &&
        m.role === formData.role &&
        `${m.firstName} ${m.lastName}` ===
          `${formData.firstName} ${formData.lastName}`
    );

    if (isDuplicate) {
      alert(
        `${formData.firstName} ${formData.lastName} already has the role "${formData.role}" in team "${formData.teamAssignment}". Players can only have one role per team.`
      );
      return;
    }

    if (editingMember) {
      const updated = members.map((m) =>
        m.id === editingMember.id ? { ...m, ...formData } : m
      );
      setMembers(updated);
      localStorage.setItem("bulldogs_members", JSON.stringify(updated));
    } else {
      const newMember = {
        ...formData,
        id: Date.now().toString(),
      } as Member;
      const updated = [...members, newMember];
      setMembers(updated);
      localStorage.setItem("bulldogs_members", JSON.stringify(updated));
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (member: Member) => {
    setDeleteDialog({
      isOpen: true,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
    });
  };

  const handleDeleteAction = (action: DeleteAction) => {
    if (!deleteDialog.memberId) return;

    if (action === "remove-from-team") {
      const updated = members.map((m) =>
        m.id === deleteDialog.memberId
          ? { ...m, teamAssignment: "", role: "Player" }
          : m
      );
      setMembers(updated);
      localStorage.setItem("bulldogs_members", JSON.stringify(updated));
    } else if (action === "delete-member") {
      const updated = members.filter((m) => m.id !== deleteDialog.memberId);
      setMembers(updated);
      localStorage.setItem("bulldogs_members", JSON.stringify(updated));
      setSelectedMembers((prev) =>
        prev.filter((id) => id !== deleteDialog.memberId)
      );
    }

    setDeleteDialog({ isOpen: false, memberId: null, memberName: "" });
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      email: "",
      shirtNumber: null,
      type: "Member",
      role: "Player",
      teamAssignment: "",
      membershipCategory: "Standard",
      joiningDate: new Date().toISOString().split("T")[0],
      contactNumber: "",
      primaryContact: "",
      primaryContactNumber: "",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      photo: "",
    });
    setEditingMember(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const exportCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Date of Birth",
      "Nationality",
      "Address",
      "Email",
      "Shirt Number",
      "Type",
      "Role",
      "Team",
      "Membership Category",
      "Joining Date",
      "Contact Number",
      "Primary Contact",
      "Primary Contact Number",
      "Secondary Contact",
      "Secondary Contact Number",
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
      m.teamAssignment,
      m.membershipCategory,
      m.joiningDate,
      m.contactNumber,
      m.primaryContact,
      m.primaryContactNumber,
      m.secondaryContact,
      m.secondaryContactNumber,
      m.medicalNotes,
      m.coachingCredits,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulldogs_members.csv";
    a.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const defaultMapping: Record<string, string> = {};
        headers.forEach((header) => {
          const lower = header.toLowerCase();
          if (lower.includes("first") && lower.includes("name"))
            defaultMapping.firstName = header;
          if (lower.includes("last") && lower.includes("name"))
            defaultMapping.lastName = header;
          if (lower.includes("email")) defaultMapping.email = header;
          if (lower.includes("date") && lower.includes("birth"))
            defaultMapping.dateOfBirth = header;
          if (lower.includes("nationality"))
            defaultMapping.nationality = header;
          if (lower.includes("address")) defaultMapping.address = header;
          if (lower.includes("shirt")) defaultMapping.shirtNumber = header;
          if (lower.includes("type")) defaultMapping.type = header;
          if (lower.includes("role")) defaultMapping.role = header;
          if (lower.includes("team")) defaultMapping.teamAssignment = header;
          if (lower.includes("membership"))
            defaultMapping.membershipCategory = header;
          if (lower.includes("joining") || lower.includes("join"))
            defaultMapping.joiningDate = header;
          if (lower.includes("contact") && lower.includes("number"))
            defaultMapping.contactNumber = header;
        });

        setCsvMapping(defaultMapping);
      };
      reader.readAsText(file);
    }
  };

  const importCSV = () => {
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const imported: Member[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        if (values.length < headers.length) continue;

        const member: Partial<Member> = {
          id: Date.now().toString() + i,
          coachingCredits: 0,
        };

        Object.entries(csvMapping).forEach(([field, csvHeader]) => {
          const index = headers.indexOf(csvHeader);
          if (index !== -1) {
            const value = values[index]?.trim();
            if (field === "shirtNumber" || field === "coachingCredits") {
              (member as any)[field] = value ? parseInt(value) : null;
            } else {
              (member as any)[field] = value;
            }
          }
        });

        if (member.firstName && member.lastName && member.email) {
          imported.push(member as Member);
        }
      }

      const updated = [...members, ...imported];
      setMembers(updated);
      localStorage.setItem("bulldogs_members", JSON.stringify(updated));
      setIsImportOpen(false);
      setCsvFile(null);
      setCsvMapping({});
    };
    reader.readAsText(csvFile);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    }
  };

  const toggleSelectMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <SEO title="Members - Bali Bulldogs" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-4xl font-bold">Members</h1>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Members
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Total: {filteredMembers.length} of {members.length} members
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={exportCSV}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsImportOpen(true)}
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedMembers.length === filteredMembers.length &&
                    filteredMembers.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedMembers.length > 0 &&
                    `${selectedMembers.length} selected`}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {COLUMN_OPTIONS.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.key}
                      checked={visibleColumns.includes(col.key)}
                      onCheckedChange={() => handleColumnToggle(col.key)}
                    >
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedMembers.length === filteredMembers.length &&
                          filteredMembers.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    {visibleColumns.includes("photo") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("firstName")}
                      >
                        <div className="flex items-center">
                          Photo
                          {getSortIcon("firstName")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("name") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("firstName")}
                      >
                        <div className="flex items-center">
                          Name
                          {getSortIcon("firstName")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("email") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Email
                          {getSortIcon("email")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("team") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("teamAssignment")}
                      >
                        <div className="flex items-center">
                          Team
                          {getSortIcon("teamAssignment")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("type") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type
                          {getSortIcon("type")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("role") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center">
                          Role
                          {getSortIcon("role")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("membership") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("membershipCategory")}
                      >
                        <div className="flex items-center">
                          Membership
                          {getSortIcon("membershipCategory")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("shirtNumber") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("shirtNumber")}
                      >
                        <div className="flex items-center">
                          Shirt #
                          {getSortIcon("shirtNumber")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("coachingCredits") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("coachingCredits")}
                      >
                        <div className="flex items-center">
                          Credits
                          {getSortIcon("coachingCredits")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("contactNumber") && (
                      <TableHead>Contact</TableHead>
                    )}
                    {visibleColumns.includes("joiningDate") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("joiningDate")}
                      >
                        <div className="flex items-center">
                          Joined
                          {getSortIcon("joiningDate")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("dateOfBirth") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("dateOfBirth")}
                      >
                        <div className="flex items-center">
                          DOB
                          {getSortIcon("dateOfBirth")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("nationality") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("nationality")}
                      >
                        <div className="flex items-center">
                          Nationality
                          {getSortIcon("nationality")}
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.includes("address") && (
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleSort("address")}
                      >
                        <div className="flex items-center">
                          Address
                          {getSortIcon("address")}
                        </div>
                      </TableHead>
                    )}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => toggleSelectMember(member.id)}
                        />
                      </TableCell>
                      {visibleColumns.includes("photo") && (
                        <TableCell>
                          <div
                            className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-yellow-400 flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            onClick={() => setLightboxPhoto(member.photo || "")}
                          >
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {member.firstName[0]}
                                {member.lastName[0]}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.includes("name") && (
                        <TableCell className="font-medium">
                          {member.firstName} {member.lastName}
                        </TableCell>
                      )}
                      {visibleColumns.includes("email") && (
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {member.email || "—"}
                        </TableCell>
                      )}
                      {visibleColumns.includes("team") && (
                        <TableCell>{member.teamAssignment || "—"}</TableCell>
                      )}
                      {visibleColumns.includes("type") && (
                        <TableCell>{member.type}</TableCell>
                      )}
                      {visibleColumns.includes("role") && (
                        <TableCell>{member.role}</TableCell>
                      )}
                      {visibleColumns.includes("membership") && (
                        <TableCell>
                          <Badge
                            variant={
                              member.membershipCategory === "Standard"
                                ? "default"
                                : member.membershipCategory === "Sponsored"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              member.membershipCategory === "Standard"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : member.membershipCategory === "Sponsored"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            }
                          >
                            {member.membershipCategory}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("shirtNumber") && (
                        <TableCell>{member.shirtNumber || "—"}</TableCell>
                      )}
                      {visibleColumns.includes("coachingCredits") && (
                        <TableCell>
                          <Badge variant="outline">
                            {member.coachingCredits}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("contactNumber") && (
                        <TableCell>
                          {member.contactNumber ? (
                            <a
                              href={`https://wa.me/${member.contactNumber.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-green-600 hover:text-green-700"
                            >
                              <MessageCircle className="w-4 h-4" />
                              WhatsApp
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes("joiningDate") && (
                        <TableCell>
                          {member.joiningDate
                            ? new Date(member.joiningDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      )}
                      {visibleColumns.includes("dateOfBirth") && (
                        <TableCell>
                          {member.dateOfBirth
                            ? new Date(member.dateOfBirth).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      )}
                      {visibleColumns.includes("nationality") && (
                        <TableCell>{member.nationality || "—"}</TableCell>
                      )}
                      {visibleColumns.includes("address") && (
                        <TableCell>{member.address || "—"}</TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMember(member);
                              setFormData(member);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(member)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              {formData.photo ? (
                <div className="space-y-4">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, photo: "" });
                    }}
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag & drop a photo here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              )}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Nationality</Label>
                <Input
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Address (Area)</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Shirt Number</Label>
                <Input
                  type="number"
                  value={formData.shirtNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shirtNumber: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
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
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
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
                <Label>Team</Label>
                <Select
                  value={formData.teamAssignment}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teamAssignment: value })
                  }
                >
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Membership Category</Label>
                <Select
                  value={formData.membershipCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, membershipCategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Joining Date</Label>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joiningDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Coaching Credits</Label>
                <Input
                  type="number"
                  value={formData.coachingCredits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coachingCredits: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Emergency Contacts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Contact Name</Label>
                  <Input
                    value={formData.primaryContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryContact: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Primary Contact Number</Label>
                  <Input
                    value={formData.primaryContactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryContactNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Secondary Contact Name</Label>
                  <Input
                    value={formData.secondaryContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryContact: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Secondary Contact Number</Label>
                  <Input
                    value={formData.secondaryContactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryContactNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Medical Notes</Label>
              <Textarea
                value={formData.medicalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, medicalNotes: e.target.value })
                }
                placeholder="Known allergies, pre-existing medical conditions..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveMember} className="bg-blue-600">
                {editingMember ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Members from CSV</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Upload CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="mt-2"
              />
            </div>

            {csvFile && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Map your CSV columns to member fields:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "firstName", label: "First Name" },
                    { key: "lastName", label: "Last Name" },
                    { key: "email", label: "Email" },
                    { key: "dateOfBirth", label: "Date of Birth" },
                    { key: "nationality", label: "Nationality" },
                    { key: "address", label: "Address" },
                    { key: "contactNumber", label: "Contact Number" },
                    { key: "shirtNumber", label: "Shirt Number" },
                    { key: "type", label: "Type" },
                    { key: "role", label: "Role" },
                    { key: "teamAssignment", label: "Team" },
                    { key: "membershipCategory", label: "Membership" },
                    { key: "joiningDate", label: "Joining Date" },
                  ].map((field) => (
                    <div key={field.key}>
                      <Label>{field.label}</Label>
                      <Input
                        value={csvMapping[field.key] || ""}
                        onChange={(e) =>
                          setCsvMapping({
                            ...csvMapping,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder="CSV column name"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsImportOpen(false);
                      setCsvFile(null);
                      setCsvMapping({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={importCSV} className="bg-blue-600">
                    Import Members
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setDeleteDialog({ isOpen: false, memberId: null, memberName: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.memberName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose how you want to remove this member:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDeleteAction("remove-from-team")}
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Remove from team only (keep as member)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteAction("delete-member")}
            >
              <UserX className="w-4 h-4 mr-2" />
              Delete member entirely (permanent)
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Member photo"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}