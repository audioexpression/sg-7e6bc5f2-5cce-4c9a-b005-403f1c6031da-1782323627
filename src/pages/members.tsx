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
import { Trash2, X, Upload, Search, Users, UserPlus, ChevronLeft, ChevronRight, Home, DollarSign, Calendar, Settings, Pencil, User, Phone, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ImageModal } from "@/components/ImageModal";
import { useRouter } from "next/router";

const TEAMS_BY_CATEGORY = {
  Junior: ["Toddler", "Kindy/U6 1", "Kindy/U6 2", "U8 Dev", "U8 Adv", "U10 Dev", "U10 Adv", "U12 Girls", "U12 Dev", "U12 Adv"],
  Youth: ["U14", "U14 Girls", "U16", "U18 Girls", "U18"],
  Adult: ["1st Team", "Women", "Social Team", "Legends 35+", "Masters 45+"],
};

const ROLES = ["Admin", "Coach", "Player-Coach", "Player"];

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Brazzaville)",
  "Congo (Kinshasa)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Mali",
  "Mauritania",
  "Mexico",
  "Moldova",
  "Mongolia",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "United States",
  "Uruguay",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

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
  feeTier?: string;
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
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    email: "",
    shirtNumber: "",
    joiningDate: "",
    contactNumber: "",
    profileImage: "",
    whatsappLink: "",
    primaryContact: "",
    primaryContactNumber: "",
    secondaryContact: "",
    secondaryContactNumber: "",
    medicalNotes: "",
    feeTier: "",
  });

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [bulkTeam, setBulkTeam] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkRole, setBulkRole] = useState("");
  const [bulkMembershipCategory, setBulkMembershipCategory] = useState("");

  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [teamsData, setTeamsData] = useState<any[]>([]);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Partial<Member>[]>([]);
  const [duplicates, setDuplicates] = useState<Array<{ imported: Partial<Member>; existing: Member; index: number }>>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState(0);
  const [duplicateResolutions, setDuplicateResolutions] = useState<Record<number, "skip" | "overwrite" | "create">>({});

  useEffect(() => {
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
      setTeamsData(JSON.parse(savedTeams));
    }
  }, []);

  useEffect(() => {
    const { memberId } = router.query;
    if (memberId && typeof memberId === "string") {
      const member = members.find(m => m.id === memberId);
      if (member) {
        setEditingMember(member);
        setIsDialogOpen(true);
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

  const parseCSV = (text: string): Partial<Member>[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const data: Partial<Member>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const member: Partial<Member> = {
        category: "Junior",
        type: "Member",
        role: "Player",
        coachingCredits: 0,
        teamAssignment: "",
        joiningDate: new Date().toISOString().split("T")[0],
      };

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        if (header.includes("first") || header === "firstname") member.firstName = value;
        else if (header.includes("last") || header === "lastname" || header === "surname") member.lastName = value;
        else if (header.includes("email")) member.email = value;
        else if (header.includes("phone") || header.includes("contact")) member.contactNumber = value;
        else if (header.includes("shirt") || header.includes("number")) member.shirtNumber = value;
        else if (header.includes("team")) member.teamAssignment = value;
        else if (header.includes("category")) member.category = value as any;
        else if (header.includes("role")) member.role = value;
        else if (header.includes("dob") || header.includes("birth")) member.dateOfBirth = value;
        else if (header.includes("nationality")) member.nationality = value;
        else if (header.includes("address")) member.address = value;
      });

      if (member.firstName && member.lastName) {
        data.push(member);
      }
    }

    return data;
  };

  const parseExcel = async (file: File): Promise<Partial<Member>[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = (window as any).XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = (window as any).XLSX.utils.sheet_to_json(firstSheet);

          const members: Partial<Member>[] = jsonData.map((row: any) => ({
            firstName: row["First Name"] || row["FirstName"] || row["first_name"] || "",
            lastName: row["Last Name"] || row["LastName"] || row["Surname"] || row["last_name"] || "",
            email: row["Email"] || row["email"] || "",
            contactNumber: row["Contact Number"] || row["Phone"] || row["contact_number"] || "",
            shirtNumber: row["Shirt Number"] || row["Number"] || row["shirt_number"] || "",
            teamAssignment: row["Team"] || row["team"] || "",
            category: (row["Category"] || row["category"] || "Junior") as any,
            role: row["Role"] || row["role"] || "Player",
            dateOfBirth: row["Date of Birth"] || row["DOB"] || row["date_of_birth"] || "",
            nationality: row["Nationality"] || row["nationality"] || "",
            address: row["Address"] || row["address"] || "",
            type: "Member",
            coachingCredits: 0,
            joiningDate: new Date().toISOString().split("T")[0],
          })).filter((m: any) => m.firstName && m.lastName);

          resolve(members);
        } catch (error) {
          console.error("Error parsing Excel:", error);
          alert("Error parsing Excel file. Please check the format.");
          resolve([]);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const findDuplicates = (imported: Partial<Member>[]): Array<{ imported: Partial<Member>; existing: Member; index: number }> => {
    const dupes: Array<{ imported: Partial<Member>; existing: Member; index: number }> = [];
    
    imported.forEach((imp, index) => {
      const existing = members.find(m => 
        m.firstName.toLowerCase() === imp.firstName?.toLowerCase() &&
        m.lastName.toLowerCase() === imp.lastName?.toLowerCase()
      );
      
      if (existing) {
        dupes.push({ imported: imp, existing, index });
      }
    });

    return dupes;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    let parsed: Partial<Member>[] = [];

    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      parsed = parseCSV(text);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      if (!(window as any).XLSX) {
        const script = document.createElement("script");
        script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
        script.onload = async () => {
          parsed = await parseExcel(file);
          processImport(parsed);
        };
        document.head.appendChild(script);
        return;
      } else {
        parsed = await parseExcel(file);
      }
    } else {
      alert("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    processImport(parsed);
  };

  const processImport = (parsed: Partial<Member>[]) => {
    if (parsed.length === 0) {
      alert("No valid data found in the file. Please check the format.");
      return;
    }

    setImportData(parsed);
    const dupes = findDuplicates(parsed);

    if (dupes.length > 0) {
      setDuplicates(dupes);
      setCurrentDuplicateIndex(0);
      setShowDuplicateDialog(true);
      setIsImportOpen(false);
    } else {
      finalizeImport(parsed, {});
    }
  };

  const handleDuplicateResolution = (resolution: "skip" | "overwrite" | "create") => {
    const newResolutions = { ...duplicateResolutions, [currentDuplicateIndex]: resolution };
    setDuplicateResolutions(newResolutions);

    if (currentDuplicateIndex < duplicates.length - 1) {
      setCurrentDuplicateIndex(currentDuplicateIndex + 1);
    } else {
      finalizeImport(importData, newResolutions);
      setShowDuplicateDialog(false);
    }
  };

  const finalizeImport = (data: Partial<Member>[], resolutions: Record<number, "skip" | "overwrite" | "create">) => {
    let updatedMembers = [...members];
    let imported = 0;
    let skipped = 0;
    let overwritten = 0;

    data.forEach((item, index) => {
      const duplicate = duplicates.find(d => d.index === index);
      
      if (duplicate) {
        const resolution = resolutions[duplicates.indexOf(duplicate)] || "skip";
        
        if (resolution === "skip") {
          skipped++;
          return;
        } else if (resolution === "overwrite") {
          updatedMembers = updatedMembers.map(m => 
            m.id === duplicate.existing.id 
              ? { ...m, ...item, id: m.id } as Member
              : m
          );
          overwritten++;
          return;
        }
      }

      const newMember = {
        ...item,
        id: crypto.randomUUID(),
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        shirtNumber: item.shirtNumber || "",
        category: item.category || "Junior",
        type: item.type || "Member",
        role: item.role || "Player",
        teamAssignment: item.teamAssignment || "",
        joiningDate: item.joiningDate || new Date().toISOString().split("T")[0],
        primaryContact: "",
        primaryContactNumber: "",
        secondaryContact: "",
        secondaryContactNumber: "",
        medicalNotes: "",
        coachingCredits: 0,
      } as Member;

      updatedMembers.push(newMember);
      imported++;
    });

    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));

    let message = `Import complete!\n\n`;
    if (imported > 0) message += `✅ Imported: ${imported} members\n`;
    if (overwritten > 0) message += `🔄 Updated: ${overwritten} members\n`;
    if (skipped > 0) message += `⏭️ Skipped: ${skipped} duplicates`;

    alert(message);
    
    setIsImportOpen(false);
    setImportData([]);
    setDuplicates([]);
    setDuplicateResolutions({});
    setCurrentDuplicateIndex(0);
    setImportFile(null);
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

  const currentDuplicate = duplicates[currentDuplicateIndex];

  const getMembershipBadgeColor = (type: string) => {
    switch (type) {
      case "Member":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Sponsored":
        return "bg-green-100 text-green-800 border-green-300";
      case "Scholarship":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <>
      <SEO title="Members - Bali Bulldogs" description="Club Member Management" />
      
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto w-full px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Member Database</h1>
              <p className="text-sm text-gray-500">Manage all club registrations</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsImportOpen(true)} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />Import Data
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
                  {filterCategory === "all" ? teamOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>) : (TEAMS_BY_CATEGORY[filterCategory as keyof typeof TEAMS_BY_CATEGORY] || []).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterMembershipCategory} onValueChange={setFilterMembershipCategory}>
                <SelectTrigger><SelectValue placeholder="Membership Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Sponsored">Sponsored</SelectItem>
                  <SelectItem value="Scholarship">Scholarship</SelectItem>
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
                    <TableHead>Membership</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
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
                          <button
                            onClick={() => {
                              if (member.profileImage) {
                                setSelectedImage({
                                  url: member.profileImage,
                                  name: `${member.firstName} ${member.lastName}`
                                });
                              }
                            }}
                            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full cursor-pointer"
                          >
                            <Avatar>
                              <AvatarImage src={member.profileImage} alt={`${member.firstName} ${member.lastName}`} />
                              <AvatarFallback>
                                {member.firstName[0]}{member.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                        <TableCell>{member.teamAssignment || "-"}</TableCell>
                        <TableCell><Badge variant="outline">{member.category}</Badge></TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getMembershipBadgeColor(member.type)}>
                            {member.type}
                          </Badge>
                        </TableCell>
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
                    <option value="Player-Coach">Player-Coach</option>
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
            
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={formData.firstName || ""} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={formData.lastName || ""} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={formData.dateOfBirth || ""} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Select value={formData.nationality || ""} onValueChange={(v: string) => setFormData({...formData, nationality: v})}>
                    <SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address (Area of Bali)</Label>
                <Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g., Canggu, Seminyak, Ubud" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input value={formData.contactNumber || ""} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="+62..." />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Shirt Number</Label>
                  <Input type="number" value={formData.shirtNumber || ""} onChange={e => setFormData({...formData, shirtNumber: e.target.value})} placeholder="e.g., 10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Membership Category</Label>
                  <Select value={formData.type} onValueChange={(v: "Member" | "Sponsored" | "Scholarship") => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Sponsored">Sponsored</SelectItem>
                      <SelectItem value="Scholarship">Scholarship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input type="date" value={formData.joiningDate || ""} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Emergency Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Contact Name</Label>
                    <Input value={formData.primaryContact || ""} onChange={e => setFormData({...formData, primaryContact: e.target.value})} placeholder="Parent/Guardian name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Contact Number</Label>
                    <Input value={formData.primaryContactNumber || ""} onChange={e => setFormData({...formData, primaryContactNumber: e.target.value})} placeholder="+62..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Contact Name</Label>
                    <Input value={formData.secondaryContact || ""} onChange={e => setFormData({...formData, secondaryContact: e.target.value})} placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Contact Number</Label>
                    <Input value={formData.secondaryContactNumber || ""} onChange={e => setFormData({...formData, secondaryContactNumber: e.target.value})} placeholder="Optional" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medical Notes</Label>
                <Textarea 
                  value={formData.medicalNotes || ""} 
                  onChange={e => setFormData({...formData, medicalNotes: e.target.value})} 
                  placeholder="Known allergies, medical conditions, medications..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Important medical information for coaches and staff
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Member</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Member Data</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file (.csv, .xlsx, .xls) with member information
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileSelect}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Expected columns: First Name, Last Name, Email, Contact Number, Team, Category, Role, etc.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Duplicate Member Found
              </DialogTitle>
              <DialogDescription>
                Member {currentDuplicateIndex + 1} of {duplicates.length} duplicates
              </DialogDescription>
            </DialogHeader>
            
            {currentDuplicate && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-sm mb-2">Importing:</p>
                  <p className="text-sm">
                    <strong>{currentDuplicate.imported.firstName} {currentDuplicate.imported.lastName}</strong>
                    {currentDuplicate.imported.email && <span className="block text-gray-600">{currentDuplicate.imported.email}</span>}
                    {currentDuplicate.imported.teamAssignment && <span className="block text-gray-600">Team: {currentDuplicate.imported.teamAssignment}</span>}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-sm mb-2">Already exists in database:</p>
                  <p className="text-sm">
                    <strong>{currentDuplicate.existing.firstName} {currentDuplicate.existing.lastName}</strong>
                    {currentDuplicate.existing.email && <span className="block text-gray-600">{currentDuplicate.existing.email}</span>}
                    {currentDuplicate.existing.teamAssignment && <span className="block text-gray-600">Team: {currentDuplicate.existing.teamAssignment}</span>}
                  </p>
                </div>

                <p className="text-sm text-gray-600">How would you like to handle this duplicate?</p>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleDuplicateResolution("skip")}
                className="w-full sm:w-auto"
              >
                Skip Import
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDuplicateResolution("overwrite")}
                className="w-full sm:w-auto"
              >
                Update Existing
              </Button>
              <Button 
                onClick={() => handleDuplicateResolution("create")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Create Duplicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ImageModal
        imageUrl={selectedImage?.url || ""}
        name={selectedImage?.name || ""}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}