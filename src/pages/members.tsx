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
import { Trash2, X, Upload, Search, Users, UserPlus, ChevronLeft, ChevronRight, Home, DollarSign, Calendar, Settings, Pencil, User, Phone, AlertTriangle, Mail, AlertCircle, CheckCircle, XCircle } from "lucide-react";
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
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Germany", "Ghana", "Greece", "Guatemala", "Haiti", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Latvia", "Lebanon", "Madagascar", "Malawi", "Malaysia", "Mali",
  "Mauritania", "Mexico", "Moldova", "Mongolia", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands",
  "New Zealand", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Philippines", "Poland", "Portugal",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sudan", "Sweden", "Switzerland",
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tunisia", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "England", "Scotland", "Wales", "Northern Ireland", "United States", "Uruguay", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const teamOptions = [...TEAMS_BY_CATEGORY.Junior, ...TEAMS_BY_CATEGORY.Youth, ...TEAMS_BY_CATEGORY.Adult];

const TEAM_NAME_MAPPINGS: Record<string, string> = {
  "toddler": "Toddler",
  "kindy/u6 1": "Kindy/U6 1",
  "kindy 1": "Kindy/U6 1",
  "kindy/u6 2": "Kindy/U6 2",
  "kindy 2": "Kindy/U6 2",
  "u6": "Kindy/U6 1",
  "u8 dev": "U8 Dev",
  "u8 development": "U8 Dev",
  "u8dev": "U8 Dev",
  "under 8 dev": "U8 Dev",
  "under 8 development": "U8 Dev",
  "u8 adv": "U8 Adv",
  "u8 advanced": "U8 Adv",
  "u8adv": "U8 Adv",
  "under 8 adv": "U8 Adv",
  "under 8 advanced": "U8 Adv",
  "u10 dev": "U10 Dev",
  "u10 development": "U10 Dev",
  "u10dev": "U10 Dev",
  "under 10 dev": "U10 Dev",
  "under 10 development": "U10 Dev",
  "u10 adv": "U10 Adv",
  "u10 advanced": "U10 Adv",
  "u10adv": "U10 Adv",
  "under 10 adv": "U10 Adv",
  "under 10 advanced": "U10 Adv",
  "u12 dev": "U12 Dev",
  "u12 development": "U12 Dev",
  "u12dev": "U12 Dev",
  "under 12 dev": "U12 Dev",
  "under 12 development": "U12 Dev",
  "u12 adv": "U12 Adv",
  "u12 advanced": "U12 Adv",
  "u12adv": "U12 Adv",
  "under 12 adv": "U12 Adv",
  "under 12 advanced": "U12 Adv",
  "u12 girls": "U12 Girls",
  "u12girls": "U12 Girls",
  "under 12 girls": "U12 Girls",
  "u14": "U14",
  "under 14": "U14",
  "u14 girls": "U14 Girls",
  "u14girls": "U14 Girls",
  "under 14 girls": "U14 Girls",
  "u16": "U16",
  "under 16": "U16",
  "u18": "U18",
  "under 18": "U18",
  "u18 girls": "U18 Girls",
  "u18girls": "U18 Girls",
  "under 18 girls": "U18 Girls",
  "1st team": "1st Team",
  "first team": "1st Team",
  "1st": "1st Team",
  "women": "Women",
  "womens": "Women",
  "women's": "Women",
  "social team": "Social Team",
  "social": "Social Team",
  "legends 35+": "Legends 35+",
  "legends": "Legends 35+",
  "legends 35": "Legends 35+",
  "masters 45+": "Masters 45+",
  "masters": "Masters 45+",
  "masters 45": "Masters 45+",
};

const normalizeTeamName = (teamName: string): string => {
  if (!teamName) return "";
  const normalized = teamName.toLowerCase().trim();
  if (TEAM_NAME_MAPPINGS[normalized]) {
    return TEAM_NAME_MAPPINGS[normalized];
  }
  if (teamOptions.includes(teamName)) {
    return teamName;
  }
  const match = teamOptions.find(t => t.toLowerCase() === normalized);
  if (match) {
    return match;
  }
  return teamName;
};

const formatDateDisplay = (dateString?: string): string => {
  if (!dateString) return "—";
  let date: Date;
  if (dateString.includes("/")) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      date = new Date(dateString);
    }
  } else {
    date = new Date(dateString);
  }
  if (isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const convertToInputDate = (dateString?: string): string => {
  if (!dateString) return "";
  if (dateString.includes("/")) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return dateString;
};

const convertFromInputDate = (dateString: string): string => {
  if (!dateString) return "";
  if (dateString.includes("-")) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return dateString;
};

interface Member {
  id: string;
  membershipId: string;
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

interface ImportMessage {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

interface ImportResult {
  successes: Array<{ row: number; name: string; team: string }>;
  errors: Array<{ row: number; field?: string; message: string; data?: any }>;
  warnings: Array<{ row: number; message: string }>;
}

const generateMembershipId = (members: Member[], joiningYear?: string): string => {
  const year = joiningYear ? new Date(joiningYear).getFullYear() : new Date().getFullYear();
  const yearPrefix = `BBFC-${year}-`;
  const yearMembers = members.filter(m => m.membershipId?.startsWith(yearPrefix));
  if (yearMembers.length === 0) {
    return `${yearPrefix}0001`;
  }
  const numbers = yearMembers
    .map(m => {
      const match = m.membershipId.match(/BBFC-\d{4}-(\d{4})/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(n => !isNaN(n));
  const maxNumber = Math.max(...numbers, 0);
  const nextNumber = (maxNumber + 1).toString().padStart(4, "0");
  return `${yearPrefix}${nextNumber}`;
};

const batchAssignMembershipIds = (members: Member[]): Member[] => {
  const membersWithoutIds = members.filter(m => !m.membershipId);
  if (membersWithoutIds.length === 0) return members;
  membersWithoutIds.sort((a, b) => {
    const dateA = a.joiningDate ? new Date(a.joiningDate).getTime() : 0;
    const dateB = b.joiningDate ? new Date(b.joiningDate).getTime() : 0;
    return dateA - dateB;
  });
  const updatedMembers = [...members];
  membersWithoutIds.forEach(member => {
    const index = updatedMembers.findIndex(m => m.id === member.id);
    if (index !== -1) {
      const newId = generateMembershipId(updatedMembers, member.joiningDate);
      updatedMembers[index] = { ...updatedMembers[index], membershipId: newId };
    }
  });
  return updatedMembers;
};

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
  const [filterMembershipCategory, setFilterMembershipCategory] = useState("all");
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
  const [bulkNationality, setBulkNationality] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [teamsData, setTeamsData] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Partial<Member>[]>([]);
  const [duplicates, setDuplicates] = useState<Array<{ imported: Partial<Member>; existing: Member; index: number }>>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState(0);
  const [duplicateResolutions, setDuplicateResolutions] = useState<Record<number, "skip" | "overwrite" | "create">>({});
  const [importResultsOpen, setImportResultsOpen] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [batchAssignDialogOpen, setBatchAssignDialogOpen] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

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
        membershipId: generateMembershipId(members, formData.joiningDate),
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
    const warnings: string[] = [];
    const errors: Array<{ row: number; field?: string; message: string; data?: any }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const member: Partial<Member> = {
        category: "Junior",
        type: "Member",
        role: "Player",
        coachingCredits: 0,
        teamAssignment: "",
        joiningDate: new Date().toISOString().split("T")[0],
        membershipId: "",
      };

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        if (header.includes("membership") && header.includes("id")) member.membershipId = value;
        else if (header.includes("first") || header === "firstname") member.firstName = value;
        else if (header.includes("last") || header === "lastname" || header === "surname") member.lastName = value;
        else if (header.includes("email")) {
          if (value.includes("@")) {
            member.email = value;
          } else {
            errors.push({ row: i + 1, field: "email", message: `Invalid email format: "${value}"` });
          }
        }
        else if (header.includes("phone") || header.includes("contact")) member.contactNumber = value;
        else if (header.includes("shirt") || header.includes("number")) member.shirtNumber = value;
        else if (header.includes("team")) {
          const normalizedTeam = normalizeTeamName(value);
          if (normalizedTeam && teamOptions.includes(normalizedTeam)) {
            member.teamAssignment = normalizedTeam;
          } else {
            warnings.push(`Row ${i + 1}: Team "${value}" not recognized, mapped to "${normalizedTeam || 'None'}"`);
          }
        }
        else if (header.includes("category")) {
          const cat = value.toLowerCase();
          if (cat.includes("junior")) member.category = "Junior";
          else if (cat.includes("youth")) member.category = "Youth";
          else if (cat.includes("adult")) member.category = "Adult";
          else {
            errors.push({ row: i + 1, field: "category", message: `Invalid category: "${value}"` });
          }
        }
        else if (header.includes("role")) {
          if (ROLES.includes(value)) {
            member.role = value;
          } else {
            warnings.push(`Row ${i + 1}: Role "${value}" not recognized, defaulted to "Player"`);
          }
        }
        else if (header.includes("dob") || header.includes("birth")) {
          const converted = convertFromInputDate(value);
          member.dateOfBirth = converted;
        }
        else if (header.includes("nationality")) {
          if (COUNTRIES.includes(value)) {
            member.nationality = value;
          } else {
            warnings.push(`Row ${i + 1}: Nationality "${value}" not in standard list`);
            member.nationality = value;
          }
        }
        else if (header.includes("address")) member.address = value;
      });

      if (!member.firstName || !member.lastName) {
        errors.push({ 
          row: i + 1, 
          field: "name", 
          message: "Missing first name or last name", 
          data: { firstName: member.firstName, lastName: member.lastName } 
        });
      } else {
        data.push(member);
      }
    }

    (data as any).importWarnings = warnings;
    (data as any).importErrors = errors;

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
          const warnings: string[] = [];
          const errors: Array<{ row: number; field?: string; message: string; data?: any }> = [];

          const members: Partial<Member>[] = jsonData.map((row: any, index: number) => {
            const teamValue = row["Team"] || row["team"] || "";
            const normalizedTeam = normalizeTeamName(teamValue);
            const dobValue = row["Date of Birth"] || row["DOB"] || row["dob"] || "";
            const convertedDob = convertFromInputDate(dobValue);

            const member: Partial<Member> = {
              id: Date.now().toString() + index,
              membershipId: row["Membership ID"] || row["MembershipID"] || row["membership id"] || "",
              firstName: row["First Name"] || row["FirstName"] || row["first name"] || "",
              lastName: row["Last Name"] || row["LastName"] || row["last name"] || row["surname"] || "",
              email: row["Email"] || row["email"] || "",
              contactNumber: row["Contact Number"] || row["Phone"] || row["contact number"] || "",
              shirtNumber: row["Shirt Number"] || row["Number"] || row["shirt number"] || "",
              teamAssignment: teamOptions.includes(normalizedTeam) ? normalizedTeam : "",
              category: (row["Category"] || row["category"] || "Junior") as any,
              role: row["Role"] || row["role"] || "Player",
              dateOfBirth: convertedDob,
              nationality: row["Nationality"] || row["nationality"] || "",
              address: row["Address"] || row["address"] || "",
              type: "Member",
              coachingCredits: 0,
              joiningDate: new Date().toISOString().split("T")[0],
            };

            if (!member.firstName || !member.lastName) {
              errors.push({ 
                row: index + 2, 
                field: "name", 
                message: "Missing first name or last name",
                data: { firstName: member.firstName, lastName: member.lastName }
              });
            }

            return member;
          }).filter((m: any) => m.firstName && m.lastName);

          (members as any).importWarnings = warnings;
          (members as any).importErrors = errors;

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
    
    const successes: Array<{ row: number; name: string; team: string }> = [];
    const errors: Array<{ row: number; field?: string; message: string; data?: any }> = (data as any).importErrors || [];
    const warnings: Array<{ row: number; message: string }> = ((data as any).importWarnings || []).map((w: string) => {
      const match = w.match(/Row (\d+): (.+)/);
      return match ? { row: parseInt(match[1]), message: match[2] } : { row: 0, message: w };
    });
    const duplicateActions: Array<{ row: number; name: string; action: string }> = [];

    data.forEach((item, index) => {
      const duplicate = duplicates.find(d => d.index === index);
      
      if (duplicate) {
        const resolution = resolutions[duplicates.indexOf(duplicate)] || "skip";
        
        if (resolution === "skip") {
          skipped++;
          duplicateActions.push({ 
            row: index + 2, 
            name: `${item.firstName} ${item.lastName}`, 
            action: "Skipped" 
          });
          return;
        } else if (resolution === "overwrite") {
          updatedMembers = updatedMembers.map(m => 
            m.id === duplicate.existing.id 
              ? { ...m, ...item, id: m.id } as Member
              : m
          );
          overwritten++;
          duplicateActions.push({ 
            row: index + 2, 
            name: `${item.firstName} ${item.lastName}`, 
            action: "Updated existing record" 
          });
          successes.push({ 
            row: index + 2, 
            name: `${item.firstName} ${item.lastName}`, 
            team: item.teamAssignment || "No team" 
          });
          return;
        }
      }

      const newMember = {
        ...item,
        id: crypto.randomUUID(),
        membershipId: item.membershipId || generateMembershipId(updatedMembers, item.joiningDate),
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
      successes.push({ 
        row: index + 2, 
        name: `${newMember.firstName} ${newMember.lastName}`, 
        team: newMember.teamAssignment || "No team" 
      });
    });

    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));

    const importLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      fileName: importFile?.name || "unknown",
      totalRows: data.length,
      successCount: imported + overwritten,
      errorCount: errors.length,
      warningCount: warnings.length,
      duplicatesResolved: duplicateActions.length,
      details: {
        successes,
        errors,
        warnings,
        duplicates: duplicateActions,
      },
    };

    const existingLogs = JSON.parse(localStorage.getItem("importLogs") || "[]");
    existingLogs.unshift(importLog);
    localStorage.setItem("importLogs", JSON.stringify(existingLogs.slice(0, 50)));

    setImportResults({
      successes,
      errors,
      warnings,
    });
    setShowResultsDialog(true);
    
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
          ...(bulkTeam && bulkTeam !== "keep_current" && { teamAssignment: bulkTeam }),
          ...(bulkCategory && bulkCategory !== "keep_current" && { category: bulkCategory as "Junior" | "Youth" | "Adult" }),
          ...(bulkRole && bulkRole !== "keep_current" && { role: bulkRole }),
          ...(bulkMembershipCategory && bulkMembershipCategory !== "keep_current" && { type: bulkMembershipCategory as "Member" | "Sponsored" | "Scholarship" }),
          ...(bulkNationality && bulkNationality !== "keep_current" && { nationality: bulkNationality })
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
    setBulkNationality("");
  };

  const handleDeleteMembers = () => {
    const updated = members.filter(m => !selectedMembers.includes(m.id));
    setMembers(updated);
    localStorage.setItem("members", JSON.stringify(updated));
    setSelectedMembers([]);
  };

  const handleBatchAssignIds = () => {
    const updatedMembers = batchAssignMembershipIds(members);
    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
    setBatchAssignDialogOpen(false);
  };

  const filteredAndSortedMembers = members.filter((member) => {
    const matchesSearch = searchTerm === "" || 
      member.membershipId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.contactNumber?.includes(searchTerm);
    const matchesCategory = filterCategory === "all" || member.category === filterCategory;
    const matchesTeam = filterTeam === "all" || member.teamAssignment === filterTeam;
    const matchesRole = filterRole === "" || member.role === filterRole;
    const matchesMembershipStatus = filterMembershipCategory === "all" || member.type === filterMembershipCategory;
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return formatDateDisplay(dateString);
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
            <div className="flex gap-3">
              {members.some(m => !m.membershipId) && (
                <Button
                  onClick={() => setBatchAssignDialogOpen(true)}
                  variant="outline"
                  className="border-yellow-500/30 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Assign IDs ({members.filter(m => !m.membershipId).length})
                </Button>
              )}
              <Button
                onClick={() => setIsImportOpen(true)}
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsBulkActionsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Bulk Update
                  </Button>
                  <Button
                    onClick={handleDeleteMembers}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search name, email, membership ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
            </div>

            {(searchTerm || filterTeam !== "all" || filterCategory !== "all" || filterMembershipCategory) && (
              <Button variant="ghost" onClick={handleClearFilters} className="text-red-600 mb-3">
                <X className="w-4 h-4 mr-1" />Clear Filters
              </Button>
            )}

            <div className="w-full overflow-x-auto border rounded-lg">
              <div style={{ minWidth: "1200px" }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky left-0 bg-white z-10">
                        <Checkbox
                          checked={selectedMembers.length === currentMembers.length && currentMembers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-left font-bold">Photo</TableHead>
                      <TableHead className="text-left font-bold">Membership ID</TableHead>
                      <TableHead className="text-left font-bold">Name</TableHead>
                      <TableHead className="min-w-[120px]">Team</TableHead>
                      <TableHead className="min-w-[80px]">Category</TableHead>
                      <TableHead className="min-w-[100px]">Role</TableHead>
                      <TableHead className="min-w-[110px]">Membership</TableHead>
                      <TableHead className="min-w-[80px]">Shirt #</TableHead>
                      <TableHead className="min-w-[100px]">DOB</TableHead>
                      <TableHead className="min-w-[130px]">Nationality</TableHead>
                      <TableHead className="min-w-[150px]">Address</TableHead>
                      <TableHead className="min-w-[180px]">Email</TableHead>
                      <TableHead className="min-w-[140px]">Contact</TableHead>
                      <TableHead className="min-w-[100px]">Joined</TableHead>
                      <TableHead className="min-w-[180px]">Primary Contact</TableHead>
                      <TableHead className="min-w-[180px]">Secondary Contact</TableHead>
                      <TableHead className="min-w-[200px]">Medical Notes</TableHead>
                      <TableHead className="text-right sticky right-0 bg-white z-10 min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={19} className="text-center py-8 text-gray-500">
                          No members found. Try adjusting filters or adding a new member.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentMembers.map((member) => (
                        <TableRow key={member.id} className="hover:bg-muted/50">
                          <TableCell className="sticky left-0 bg-white z-10">
                            <Checkbox
                              checked={selectedMembers.includes(member.id)}
                              onCheckedChange={() => handleSelectMember(member.id)}
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
                          <TableCell className="text-sm font-mono text-muted-foreground">
                            {member.membershipId || "—"}
                          </TableCell>
                          <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                          <TableCell>{member.teamAssignment || "—"}</TableCell>
                          <TableCell><Badge variant="outline">{member.category}</Badge></TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getMembershipBadgeColor(member.type)}>
                              {member.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.shirtNumber || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateDisplay(member.dateOfBirth)}
                          </TableCell>
                          <TableCell>{member.nationality || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {member.address || "—"}
                          </TableCell>
                          <TableCell>
                            {member.email ? (
                              <a
                                href={`mailto:${member.email}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline text-sm"
                              >
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
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
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(member.joiningDate)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {member.primaryContact ? (
                              <div>
                                <div className="font-medium">{member.primaryContact}</div>
                                {member.primaryContactNumber && (
                                  <a
                                    href={`tel:${member.primaryContactNumber}`}
                                    className="text-blue-600 hover:underline text-xs"
                                  >
                                    {member.primaryContactNumber}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {member.secondaryContact ? (
                              <div>
                                <div className="font-medium">{member.secondaryContact}</div>
                                {member.secondaryContactNumber && (
                                  <a
                                    href={`tel:${member.secondaryContactNumber}`}
                                    className="text-blue-600 hover:underline text-xs"
                                  >
                                    {member.secondaryContactNumber}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {member.medicalNotes ? (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-muted-foreground" title={member.medicalNotes}>
                                  {member.medicalNotes.length > 50 
                                    ? `${member.medicalNotes.substring(0, 50)}...` 
                                    : member.medicalNotes}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right sticky right-0 bg-white z-10">
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
                <Select value={bulkTeam} onValueChange={setBulkTeam}>
                  <SelectTrigger><SelectValue placeholder="Keep Current" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep_current">Keep Current</SelectItem>
                    {teamOptions.map((team) => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Change Category</label>
                <Select value={bulkCategory} onValueChange={setBulkCategory}>
                  <SelectTrigger><SelectValue placeholder="Keep Current" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep_current">Keep Current</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Change Role</label>
                <Select value={bulkRole} onValueChange={setBulkRole}>
                  <SelectTrigger><SelectValue placeholder="Keep Current" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep_current">Keep Current</SelectItem>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Change Membership</label>
                <Select value={bulkMembershipCategory} onValueChange={setBulkMembershipCategory}>
                  <SelectTrigger><SelectValue placeholder="Keep Current" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep_current">Keep Current</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Sponsored">Sponsored</SelectItem>
                    <SelectItem value="Scholarship">Scholarship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Change Nationality</label>
                <Select value={bulkNationality} onValueChange={setBulkNationality}>
                  <SelectTrigger><SelectValue placeholder="Keep Current" /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="keep_current">Keep Current</SelectItem>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {editingMember ? "Edit Member" : "Add New Member"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {editingMember && editingMember.membershipId && (
                <div className="rounded-lg border-2 border-blue-500/30 bg-blue-500/5 p-4">
                  <Label className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Membership ID (Permanent)
                  </Label>
                  <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">
                    {editingMember.membershipId}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This ID is unique and permanent. It will never change.
                  </p>
                </div>
              )}
              {!editingMember && (
                <div className="rounded-lg border-2 border-green-500/30 bg-green-500/5 p-4">
                  <Label className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Membership ID
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A unique membership ID will be automatically assigned when you create this member.
                  </p>
                  <p className="mt-2 font-mono text-sm font-semibold text-green-700 dark:text-green-300">
                    Format: BBFC-{new Date(formData.joiningDate || Date.now()).getFullYear()}-####
                  </p>
                </div>
              )}

              <div className="space-y-4">
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
                    <Input 
                      type="date" 
                      value={convertToInputDate(formData.dateOfBirth)} 
                      onChange={e => setFormData({...formData, dateOfBirth: convertFromInputDate(e.target.value)})} 
                    />
                    {formData.dateOfBirth && (
                      <p className="text-xs text-muted-foreground">
                        Format: {formatDateDisplay(formData.dateOfBirth)}
                      </p>
                    )}
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
                  <Label>Address</Label>
                  <Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="member@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input value={formData.contactNumber || ""} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="+62..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Youth">Youth</SelectItem>
                        <SelectItem value="Adult">Adult</SelectItem>
                      </SelectContent>
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
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
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
                  <Input 
                    type="date" 
                    value={convertToInputDate(formData.joiningDate)} 
                    onChange={e => setFormData({...formData, joiningDate: convertFromInputDate(e.target.value)})} 
                  />
                  {formData.joiningDate && (
                    <p className="text-xs text-muted-foreground">
                      Format: {formatDateDisplay(formData.joiningDate)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact</Label>
                  <Input value={formData.primaryContact || ""} onChange={e => setFormData({...formData, primaryContact: e.target.value})} placeholder="Parent/Guardian name" />
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact Number</Label>
                  <Input value={formData.primaryContactNumber || ""} onChange={e => setFormData({...formData, primaryContactNumber: e.target.value})} placeholder="+62..." />
                </div>

                <div className="space-y-2">
                  <Label>Secondary Contact</Label>
                  <Input value={formData.secondaryContact || ""} onChange={e => setFormData({...formData, secondaryContact: e.target.value})} placeholder="Emergency contact name" />
                </div>

                <div className="space-y-2">
                  <Label>Secondary Contact Number</Label>
                  <Input value={formData.secondaryContactNumber || ""} onChange={e => setFormData({...formData, secondaryContactNumber: e.target.value})} placeholder="+62..." />
                </div>

                <div className="space-y-2">
                  <Label>Medical Notes</Label>
                  <Textarea 
                    value={formData.medicalNotes || ""} 
                    onChange={e => setFormData({...formData, medicalNotes: e.target.value})} 
                    placeholder="Any medical conditions, allergies, or special needs"
                    rows={3}
                  />
                </div>
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
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                Duplicate Member Found
              </DialogTitle>
              <DialogDescription>
                Member {currentDuplicateIndex + 1} of {duplicates.length} duplicates
              </DialogDescription>
            </DialogHeader>

            {currentDuplicate && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-lg mb-3">Importing:</p>
                  <p className="text-sm">
                    <strong>{currentDuplicate.imported.firstName} {currentDuplicate.imported.lastName}</strong>
                    {currentDuplicate.imported.email && <span className="block text-gray-600">{currentDuplicate.imported.email}</span>}
                    {currentDuplicate.imported.teamAssignment && <span className="block text-gray-600">Team: {currentDuplicate.imported.teamAssignment}</span>}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-lg mb-3">Already exists in database:</p>
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

        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {importResults && importResults.errors.length === 0 ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Import Successful!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                    Import Completed with Issues
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Review the import results below
              </DialogDescription>
            </DialogHeader>

            {importResults && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                    <div className="text-3xl font-bold text-green-700">{importResults.successes.length}</div>
                    <div className="text-sm text-green-600 mt-1">Successfully Imported</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
                    <div className="text-3xl font-bold text-red-700">{importResults.errors.length}</div>
                    <div className="text-sm text-red-600 mt-1">Errors</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-700">{importResults.warnings.length}</div>
                    <div className="text-sm text-yellow-600 mt-1">Warnings</div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-red-700 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Errors ({importResults.errors.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {importResults.errors.map((error, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded border border-red-200">
                          <div className="font-medium text-red-900">
                            <span className="font-mono text-sm">Row {error.row}:</span> {error.message}
                          </div>
                          {error.field && (
                            <div className="text-sm text-red-700 mt-1">
                              Field: <span className="font-mono">{error.field}</span>
                            </div>
                          )}
                          {error.data && (
                            <div className="text-xs text-red-600 mt-1 font-mono bg-red-100 p-2 rounded">
                              {JSON.stringify(error.data)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.warnings.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-yellow-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Warnings ({importResults.warnings.length})
                    </h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {importResults.warnings.map((warning, idx) => (
                        <div key={idx} className="bg-yellow-50 p-2 rounded border border-yellow-200 text-sm">
                          <span className="font-mono text-yellow-700">Row {warning.row}:</span>{" "}
                          <span className="text-yellow-900">{warning.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.successes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Successfully Imported ({importResults.successes.length})
                    </h3>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {importResults.successes.map((item, idx) => (
                          <div key={idx} className="bg-green-50 p-2 rounded border border-green-200 text-sm">
                            <span className="font-mono text-xs text-green-700">Row {item.row}:</span>{" "}
                            <span className="font-medium">{item.name}</span>
                            {item.team && <span className="text-green-700"> → {item.team}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    📋 A detailed log of this import has been saved. View all import history in{" "}
                    <button
                      onClick={() => {
                        setShowResultsDialog(false);
                        window.location.href = "/import-logs";
                      }}
                      className="font-semibold underline hover:text-blue-700"
                    >
                      Import Logs
                    </button>
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setShowResultsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={batchAssignDialogOpen} onOpenChange={setBatchAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Assign Membership IDs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                      {members.filter(m => !m.membershipId).length} members need IDs
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This will assign unique membership IDs to all existing members who don't have one.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">ID Format</Label>
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="font-mono text-sm font-semibold">BBFC-YYYY-####</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    BBFC = Bali Bulldogs FC<br/>
                    YYYY = Year joined<br/>
                    #### = Sequential number (0001, 0002, etc.)
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  These IDs are permanent
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Once assigned, membership IDs never change, even if the member moves teams or changes details.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBatchAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBatchAssignIds}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Assign IDs
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