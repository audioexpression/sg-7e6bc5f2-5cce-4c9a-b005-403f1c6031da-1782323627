import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Upload,
  X,
  ExternalLink,
  Check,
  ChevronsUpDown,
  Archive,
  Users,
  Shield,
  Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "@/components/ImageModal";
import { COUNTRIES, DEFAULT_SCHOOLS, TEAM_ORDER, POSITIONS, getCountryFlag } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MemberType = "Junior" | "Youth" | "Adult";
type MemberRole = "Player" | "Coach" | "Admin";
type MembershipCategory = "Standard" | "Sponsored" | "Scholarship";
type Position = typeof POSITIONS[number];

interface Member {
  id: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  shirtNumber: string;
  type: MemberType;
  role: MemberRole;
  team: string;
  position?: Position;
  membershipCategory: MembershipCategory;
  joiningDate: string;
  contactNumber: string;
  primaryContact: string;
  primaryContactNumber: string;
  primaryContactMemberId?: string;
  secondaryContact: string;
  secondaryContactNumber: string;
  secondaryContactMemberId?: string;
  medicalNotes: string;
  coachingCredits: number;
  photoUrl?: string;
  school?: string;
  archived?: boolean;
}

interface CSVMapping {
  [key: string]: string;
}

const generateMembershipId = (existingIds: string[]): string => {
  const year = new Date().getFullYear();
  let counter = 1;
  let newId = `BBFC-${year}-${String(counter).padStart(4, "0")}`;

  while (existingIds.includes(newId)) {
    counter++;
    newId = `BBFC-${year}-${String(counter).padStart(4, "0")}`;
  }

  return newId;
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
  const [bulkUpdateField, setBulkUpdateField] = useState<string | null>(null);
  const [bulkUpdateValue, setBulkUpdateValue] = useState("");

  // Member lookup state
  const [primaryContactOpen, setPrimaryContactOpen] = useState(false);
  const [secondaryContactOpen, setSecondaryContactOpen] = useState(false);
  const [primaryContactSearch, setPrimaryContactSearch] = useState("");
  const [secondaryContactSearch, setSecondaryContactSearch] = useState("");

  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<CSVMapping>({});
  const [importStep, setImportStep] = useState<"upload" | "map" | "preview">(
    "upload"
  );
  const [previewData, setPreviewData] = useState<Partial<Member>[]>([]);

  const [formData, setFormData] = useState<Omit<Member, "id" | "membershipId">>(
    {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      email: "",
      shirtNumber: "",
      type: "Junior",
      role: "Player",
      team: "",
      position: undefined,
      membershipCategory: "Standard",
      joiningDate: new Date().toISOString().split("T")[0],
      contactNumber: "",
      primaryContact: "",
      primaryContactNumber: "",
      primaryContactMemberId: undefined,
      secondaryContact: "",
      secondaryContactNumber: "",
      secondaryContactMemberId: undefined,
      medicalNotes: "",
      coachingCredits: 0,
      school: "",
    }
  );

  useEffect(() => {
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  const saveMembers = (updatedMembers: Member[]) => {
    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
  };

  const handlePrimaryContactSelect = (memberId: string) => {
    const selectedMember = members.find((m) => m.id === memberId);
    if (selectedMember) {
      setFormData({
        ...formData,
        primaryContact: `${selectedMember.firstName} ${selectedMember.lastName}`,
        primaryContactNumber: selectedMember.contactNumber,
        primaryContactMemberId: memberId,
      });
    }
    setPrimaryContactOpen(false);
  };

  const handleSecondaryContactSelect = (memberId: string) => {
    const selectedMember = members.find((m) => m.id === memberId);
    if (selectedMember) {
      setFormData({
        ...formData,
        secondaryContact: `${selectedMember.firstName} ${selectedMember.lastName}`,
        secondaryContactNumber: selectedMember.contactNumber,
        secondaryContactMemberId: memberId,
      });
    }
    setSecondaryContactOpen(false);
  };

  const clearPrimaryContactLink = () => {
    setFormData({
      ...formData,
      primaryContactMemberId: undefined,
    });
  };

  const clearSecondaryContactLink = () => {
    setFormData({
      ...formData,
      secondaryContactMemberId: undefined,
    });
  };

  const handleAddMember = () => {
    const existingIds = members.map((m) => m.membershipId);
    const newMember: Member = {
      ...formData,
      id: Date.now().toString(),
      membershipId: generateMembershipId(existingIds),
    };
    saveMembers([...members, newMember]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditMember = () => {
    if (!selectedMember) return;
    const updatedMembers = members.map((m) =>
      m.id === selectedMember.id ? { ...selectedMember, ...formData } : m
    );
    saveMembers(updatedMembers);
    setIsEditDialogOpen(false);
    setSelectedMember(null);
    resetForm();
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      saveMembers(members.filter((m) => m.id !== id));
      if (selectedMemberIds.includes(id)) {
        setSelectedMemberIds(selectedMemberIds.filter((mid) => mid !== id));
      }
    }
  };

  const handleArchiveMember = (id: string) => {
    const updatedMembers = members.map((m) =>
      m.id === id ? { ...m, archived: !m.archived } : m
    );
    saveMembers(updatedMembers);
  };

  // Bulk Actions
  const toggleSelectMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((mid) => mid !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMemberIds.length === filteredMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map((m) => m.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedMemberIds.length} members?`)) {
      saveMembers(members.filter((m) => !selectedMemberIds.includes(m.id)));
      setSelectedMemberIds([]);
    }
  };

  const handleBulkArchive = (archive: boolean) => {
    const updatedMembers = members.map((m) =>
      selectedMemberIds.includes(m.id) ? { ...m, archived: archive } : m
    );
    saveMembers(updatedMembers);
    setSelectedMemberIds([]);
  };

  const handleBulkUpdate = () => {
    if (!bulkUpdateField || !bulkUpdateValue) return;

    const updatedMembers = members.map((m) => {
      if (selectedMemberIds.includes(m.id)) {
        // Map the field name to the actual member property
        const fieldMap: Record<string, string> = {
          "team": "team",
          "category": "membershipCategory",
          "type": "type",
          "role": "role",
          "position": "position",
          "school": "school"
        };
        
        const actualField = fieldMap[bulkUpdateField] || bulkUpdateField;
        
        return {
          ...m,
          [actualField]: bulkUpdateValue
        };
      }
      return m;
    });

    saveMembers(updatedMembers);
    setIsBulkUpdateDialogOpen(false);
    setSelectedMemberIds([]);
    setBulkUpdateField(null);
    setBulkUpdateValue("");
  };

  const openBulkUpdateDialog = (field: string) => {
    setBulkUpdateField(field);
    setBulkUpdateValue("");
    setIsBulkUpdateDialogOpen(true);
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      dateOfBirth: member.dateOfBirth,
      nationality: member.nationality,
      address: member.address,
      email: member.email,
      shirtNumber: member.shirtNumber,
      type: member.type,
      role: member.role,
      team: member.team,
      position: member.position,
      membershipCategory: member.membershipCategory,
      joiningDate: member.joiningDate,
      contactNumber: member.contactNumber,
      primaryContact: member.primaryContact,
      primaryContactNumber: member.primaryContactNumber,
      primaryContactMemberId: member.primaryContactMemberId,
      secondaryContact: member.secondaryContact,
      secondaryContactNumber: member.secondaryContactNumber,
      secondaryContactMemberId: member.secondaryContactMemberId,
      medicalNotes: member.medicalNotes,
      coachingCredits: member.coachingCredits,
      photoUrl: member.photoUrl,
      school: member.school,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
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
      type: "Junior",
      role: "Player",
      team: "",
      position: undefined,
      membershipCategory: "Standard",
      joiningDate: new Date().toISOString().split("T")[0],
      contactNumber: "",
      primaryContact: "",
      primaryContactNumber: "",
      primaryContactMemberId: undefined,
      secondaryContact: "",
      secondaryContactNumber: "",
      secondaryContactMemberId: undefined,
      medicalNotes: "",
      coachingCredits: 0,
      school: "",
    });
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const photoUrl = reader.result as string;
      if (isEdit && selectedMember) {
        setSelectedMember({ ...selectedMember, photoUrl });
      }
      setFormData({ ...formData, photoUrl });
    };
    reader.readAsDataURL(file);
  };

  // CSV Import Functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map((row) => row.split(","));
      const headers = rows[0].map((h) => h.trim());
      const data = rows.slice(1).filter((row) => row.some((cell) => cell.trim()));

      setCsvHeaders(headers);
      setCsvData(data);
      setImportStep("map");

      // Auto-map common field names
      const autoMapping: CSVMapping = {};
      headers.forEach((header) => {
        const lower = header.toLowerCase().trim();
        if (lower.includes("first") && lower.includes("name"))
          autoMapping[header] = "firstName";
        else if (lower.includes("last") && lower.includes("name"))
          autoMapping[header] = "lastName";
        else if (lower.includes("email")) autoMapping[header] = "email";
        else if (lower.includes("phone") || lower.includes("contact"))
          autoMapping[header] = "contactNumber";
        else if (lower.includes("dob") || lower.includes("birth"))
          autoMapping[header] = "dateOfBirth";
        else if (lower.includes("national")) autoMapping[header] = "nationality";
        else if (lower.includes("address")) autoMapping[header] = "address";
        else if (lower.includes("team")) autoMapping[header] = "team";
        else if (lower.includes("type")) autoMapping[header] = "type";
        else if (lower.includes("role")) autoMapping[header] = "role";
        else if (lower.includes("shirt") || lower.includes("number"))
          autoMapping[header] = "shirtNumber";
        else if (lower.includes("position")) autoMapping[header] = "position";
        else if (lower.includes("school")) autoMapping[header] = "school";
      });
      setCsvMapping(autoMapping);
    };
    reader.readAsText(file);
  };

  const handlePreviewImport = () => {
    const mappedData: Partial<Member>[] = csvData.map((row) => {
      const member: Partial<Member> = {};
      csvHeaders.forEach((header, index) => {
        const mappedField = csvMapping[header];
        if (mappedField && row[index]) {
          const value = row[index].trim();
          if (mappedField === "coachingCredits") {
            member[mappedField] = parseInt(value) || 0;
          } else if (mappedField === "position") {
            const pos = value.toUpperCase();
            if (["N/A", "GK", "DEF", "MID", "FWD"].includes(pos)) {
              member[mappedField] = pos as Position;
            }
          } else {
            (member as Record<string, string>)[mappedField] = value;
          }
        }
      });
      return member;
    });
    setPreviewData(mappedData);
    setImportStep("preview");
  };

  const handleConfirmImport = () => {
    const existingIds = members.map((m) => m.membershipId);
    const newMembers: Member[] = previewData.map((data) => ({
      id: Date.now().toString() + Math.random(),
      membershipId: generateMembershipId(existingIds),
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      dateOfBirth: data.dateOfBirth || "",
      nationality: data.nationality || "",
      address: data.address || "",
      email: data.email || "",
      shirtNumber: data.shirtNumber || "",
      type: (data.type as MemberType) || "Junior",
      role: (data.role as MemberRole) || "Player",
      team: data.team || "",
      position: data.position,
      membershipCategory:
        (data.membershipCategory as MembershipCategory) || "Standard",
      joiningDate: data.joiningDate || new Date().toISOString().split("T")[0],
      contactNumber: data.contactNumber || "",
      primaryContact: data.primaryContact || "",
      primaryContactNumber: data.primaryContactNumber || "",
      secondaryContact: data.secondaryContact || "",
      secondaryContactNumber: data.secondaryContactNumber || "",
      medicalNotes: data.medicalNotes || "",
      coachingCredits: data.coachingCredits || 0,
      school: data.school || "",
    }));

    saveMembers([...members, ...newMembers]);
    setIsImportDialogOpen(false);
    resetImportState();
  };

  const resetImportState = () => {
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setCsvMapping({});
    setImportStep("upload");
    setPreviewData([]);
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.membershipId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || member.type === categoryFilter;
    const matchesTeam = 
      teamFilter === "all" 
        ? true 
        : teamFilter === "unassigned" 
          ? !member.team 
          : member.team === teamFilter;
    const matchesMembership =
      membershipFilter === "all" ||
      member.membershipCategory === membershipFilter;
    const matchesArchived = showArchived ? true : !member.archived;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesTeam &&
      matchesMembership &&
      matchesArchived
    );
  });

  const getPositionBadgeColor = (position?: Position) => {
    if (!position) return "bg-gray-100 text-gray-800";
    switch (position) {
      case "N/A":
        return "bg-gray-100 text-gray-600";
      case "GK":
        return "bg-yellow-100 text-yellow-800";
      case "DEF":
        return "bg-blue-100 text-blue-800";
      case "MID":
        return "bg-green-100 text-green-800";
      case "FWD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ContactLookupSection = ({
    label,
    contactType,
  }: {
    label: string;
    contactType: "primary" | "secondary";
  }) => {
    const isPrimary = contactType === "primary";
    const isOpen = isPrimary ? primaryContactOpen : secondaryContactOpen;
    const setOpen = isPrimary ? setPrimaryContactOpen : setSecondaryContactOpen;
    const searchValue = isPrimary ? primaryContactSearch : secondaryContactSearch;
    const setSearchValue = isPrimary ? setPrimaryContactSearch : setSecondaryContactSearch;
    const linkedMemberId = isPrimary ? formData.primaryContactMemberId : formData.secondaryContactMemberId;
    const contactName = isPrimary ? formData.primaryContact : formData.secondaryContact;
    const contactNumber = isPrimary ? formData.primaryContactNumber : formData.secondaryContactNumber;
    const handleSelect = isPrimary ? handlePrimaryContactSelect : handleSecondaryContactSelect;
    const clearLink = isPrimary ? clearPrimaryContactLink : clearSecondaryContactLink;

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Popover open={isOpen} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className="flex-1 justify-between"
              >
                {linkedMemberId
                  ? `🔗 ${contactName}`
                  : contactName || "Select or type name..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search members..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No member found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {members
                      .filter((m) => !m.archived)
                      .map((member) => (
                        <CommandItem
                          key={member.id}
                          value={`${member.firstName} ${member.lastName}`}
                          onSelect={() => handleSelect(member.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              linkedMemberId === member.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                                {member.firstName[0]}
                                {member.lastName[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.team || "No team"} • {member.contactNumber || "No phone"}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {linkedMemberId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearLink}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!linkedMemberId && (
          <Input
            placeholder="Or type name manually"
            value={contactName}
            onChange={(e) =>
              isPrimary
                ? setFormData({ ...formData, primaryContact: e.target.value })
                : setFormData({ ...formData, secondaryContact: e.target.value })
            }
          />
        )}
        <div>
          <Label htmlFor={`${contactType}-number`}>
            {label} Number {linkedMemberId && "(Auto-filled from member)"}
          </Label>
          <Input
            id={`${contactType}-number`}
            value={contactNumber}
            onChange={(e) =>
              isPrimary
                ? setFormData({
                    ...formData,
                    primaryContactNumber: e.target.value,
                  })
                : setFormData({
                    ...formData,
                    secondaryContactNumber: e.target.value,
                  })
            }
            placeholder="+62..."
            disabled={!!linkedMemberId}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO
        title="Members | Bali Bulldogs FC"
        description="Manage club members, players, coaches, and staff"
      />
      <Layout>
        <div className="container mx-auto px-4 py-8 pb-32">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Member Database</h1>
            <p className="text-muted-foreground">
              Manage all club members, players, and staff
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search name, email, membership ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Youth">Youth</SelectItem>
                <SelectItem value="Adult">Adult</SelectItem>
              </SelectContent>
            </Select>

            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="unassigned">No Team Assigned</SelectItem>
                {TEAM_ORDER.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={membershipFilter}
              onValueChange={setMembershipFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Sponsored">Sponsored</SelectItem>
                <SelectItem value="Scholarship">Scholarship</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Checkbox
                id="show-archived"
                checked={showArchived}
                onCheckedChange={(checked) =>
                  setShowArchived(checked as boolean)
                }
              />
              <label
                htmlFor="show-archived"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show Archived Members
              </label>
            </div>

            {(searchQuery ||
              categoryFilter !== "all" ||
              teamFilter !== "all" ||
              membershipFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setTeamFilter("all");
                  setMembershipFilter("all");
                }}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Members Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: "1200px" }}>
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold w-12">
                      <Checkbox
                        checked={
                          filteredMembers.length > 0 &&
                          selectedMemberIds.length === filteredMembers.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 font-semibold">Photo</th>
                    <th className="text-left p-4 font-semibold">
                      Membership ID
                    </th>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Team</th>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Membership</th>
                    <th className="text-left p-4 font-semibold">Shirt #</th>
                    <th className="text-left p-4 font-semibold">Position</th>
                    <th className="text-left p-4 font-semibold">DOB</th>
                    <th className="text-left p-4 font-semibold">Nationality</th>
                    <th className="text-left p-4 font-semibold">Address</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center py-12">
                        <p className="text-muted-foreground">
                          No members found. Add your first member to get
                          started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className={`border-b hover:bg-muted/30 cursor-pointer ${
                          member.archived ? "opacity-50" : ""
                        } ${selectedMemberIds.includes(member.id) ? "bg-blue-50/50" : ""}`}
                        onClick={() => openViewDialog(member)}
                      >
                        <td
                          className="p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedMemberIds.includes(member.id)}
                            onCheckedChange={() => toggleSelectMember(member.id)}
                          />
                        </td>
                        <td className="p-4">
                          {member.photoUrl ? (
                            <ImageModal
                              src={member.photoUrl}
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-mono text-sm">
                          {member.membershipId}
                        </td>
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getCountryFlag(member.nationality)}
                            </span>
                            <span>
                              {member.firstName} {member.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">{member.team || "—"}</td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              member.type === "Junior"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : member.type === "Youth"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }
                          >
                            {member.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{member.role}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              member.membershipCategory === "Scholarship"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : member.membershipCategory === "Sponsored"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {member.membershipCategory}
                          </Badge>
                        </td>
                        <td className="p-4">{member.shirtNumber || "—"}</td>
                        <td className="p-4">
                          {member.position ? (
                            <Badge
                              className={getPositionBadgeColor(member.position)}
                            >
                              {member.position}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {member.dateOfBirth || "—"}
                        </td>
                        <td className="p-4">{member.nationality || "—"}</td>
                        <td className="p-4">{member.address || "—"}</td>
                        <td
                          className="p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredMembers.length} of {members.filter(m => !m.archived).length} members
            {showArchived && ` (${members.filter(m => m.archived).length} archived)`}
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedMemberIds.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-50 animate-in slide-in-from-bottom-5">
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-lg">
                  {selectedMemberIds.length} Selected
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMemberIds([])}>
                  Clear Selection
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkUpdateDialog("team")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Update Team
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkUpdateDialog("category")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Update Membership
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkUpdateDialog("type")}
                >
                  Update Type
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkUpdateDialog("role")}
                >
                  Update Role
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkUpdateDialog("position")}
                >
                  Update Position
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkUpdateDialog("school")}
                >
                  Update School
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkArchive(!showArchived)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {showArchived ? "Unarchive" : "Archive"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Update Dialog */}
        <Dialog open={isBulkUpdateDialogOpen} onOpenChange={setIsBulkUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Bulk Update {
                  bulkUpdateField === "team" ? "Team" :
                  bulkUpdateField === "category" ? "Membership Category" :
                  bulkUpdateField === "type" ? "Type" :
                  bulkUpdateField === "role" ? "Role" :
                  bulkUpdateField === "position" ? "Position" :
                  bulkUpdateField === "school" ? "School" : ""
                }
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label>
                Select New Value
              </Label>
              <Select value={bulkUpdateValue} onValueChange={setBulkUpdateValue}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {bulkUpdateField === "team" && TEAM_ORDER.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                  {bulkUpdateField === "category" && (
                    <>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Sponsored">Sponsored</SelectItem>
                      <SelectItem value="Scholarship">Scholarship</SelectItem>
                    </>
                  )}
                  {bulkUpdateField === "type" && (
                    <>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Youth">Youth</SelectItem>
                      <SelectItem value="Adult">Adult</SelectItem>
                    </>
                  )}
                  {bulkUpdateField === "role" && (
                    <>
                      <SelectItem value="Player">Player</SelectItem>
                      <SelectItem value="Coach">Coach</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </>
                  )}
                  {bulkUpdateField === "position" && POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                  {bulkUpdateField === "school" && DEFAULT_SCHOOLS.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBulkUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkUpdate} className="bg-blue-600 hover:bg-blue-700">
                Update {selectedMemberIds.length} Members
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select
                    value={formData.nationality}
                    onValueChange={(value) =>
                      setFormData({ ...formData, nationality: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <Command>
                        <CommandInput placeholder="Search country..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country} value={country}>
                                {getCountryFlag(country)} {country}
                              </SelectItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Address (Area of Bali)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="e.g., Canggu, Seminyak, Ubud"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="school">School</Label>
                  <Select
                    value={formData.school}
                    onValueChange={(value) =>
                      setFormData({ ...formData, school: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_SCHOOLS.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="photo">Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e)}
                  />
                  {formData.photoUrl && (
                    <ImageModal
                      src={formData.photoUrl}
                      alt="Member photo"
                      className="mt-2 w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Club Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Club Details</h3>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: MemberType) =>
                      setFormData({ ...formData, type: value })
                    }
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
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: MemberRole) =>
                      setFormData({ ...formData, role: value })
                    }
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
                <div>
                  <Label htmlFor="team">Team Assignment</Label>
                  <Select
                    value={formData.team}
                    onValueChange={(value) =>
                      setFormData({ ...formData, team: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_ORDER.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: Position) =>
                      setFormData({ ...formData, position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shirtNumber">Shirt Number</Label>
                  <Input
                    id="shirtNumber"
                    type="number"
                    value={formData.shirtNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, shirtNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="membershipCategory">
                    Membership Category
                  </Label>
                  <Select
                    value={formData.membershipCategory}
                    onValueChange={(value: MembershipCategory) =>
                      setFormData({ ...formData, membershipCategory: value })
                    }
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
                <div>
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({ ...formData, joiningDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="coachingCredits">Coaching Credits</Label>
                  <Input
                    id="coachingCredits"
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

                {/* Contact & Safety */}
                <h3 className="font-semibold text-lg mt-6">
                  Contact & Safety
                </h3>
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="+62..."
                  />
                </div>
                <ContactLookupSection
                  label="Primary Contact (Parent/Guardian)"
                  contactType="primary"
                />
                <ContactLookupSection
                  label="Secondary Contact"
                  contactType="secondary"
                />
                <div>
                  <Label htmlFor="medicalNotes">
                    Medical Notes (Allergies, Conditions)
                  </Label>
                  <Textarea
                    id="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, medicalNotes: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div>
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-nationality">Nationality</Label>
                  <Select
                    value={formData.nationality}
                    onValueChange={(value) =>
                      setFormData({ ...formData, nationality: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <Command>
                        <CommandInput placeholder="Search country..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country} value={country}>
                                {getCountryFlag(country)} {country}
                              </SelectItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-address">Address (Area of Bali)</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="e.g., Canggu, Seminyak, Ubud"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-school">School</Label>
                  <Select
                    value={formData.school}
                    onValueChange={(value) =>
                      setFormData({ ...formData, school: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_SCHOOLS.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-photo">Photo</Label>
                  <Input
                    id="edit-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, true)}
                  />
                  {formData.photoUrl && (
                    <ImageModal
                      src={formData.photoUrl}
                      alt="Member photo"
                      className="mt-2 w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Club Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Club Details</h3>
                <div>
                  <Label htmlFor="edit-type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: MemberType) =>
                      setFormData({ ...formData, type: value })
                    }
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
                <div>
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: MemberRole) =>
                      setFormData({ ...formData, role: value })
                    }
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
                <div>
                  <Label htmlFor="edit-team">Team Assignment</Label>
                  <Select
                    value={formData.team}
                    onValueChange={(value) =>
                      setFormData({ ...formData, team: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_ORDER.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: Position) =>
                      setFormData({ ...formData, position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-shirtNumber">Shirt Number</Label>
                  <Input
                    id="edit-shirtNumber"
                    type="number"
                    value={formData.shirtNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, shirtNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-membershipCategory">
                    Membership Category
                  </Label>
                  <Select
                    value={formData.membershipCategory}
                    onValueChange={(value: MembershipCategory) =>
                      setFormData({ ...formData, membershipCategory: value })
                    }
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
                <div>
                  <Label htmlFor="edit-joiningDate">Joining Date</Label>
                  <Input
                    id="edit-joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({ ...formData, joiningDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-coachingCredits">Coaching Credits</Label>
                  <Input
                    id="edit-coachingCredits"
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

                {/* Contact & Safety */}
                <h3 className="font-semibold text-lg mt-6">
                  Contact & Safety
                </h3>
                <div>
                  <Label htmlFor="edit-contactNumber">Contact Number</Label>
                  <Input
                    id="edit-contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="+62..."
                  />
                </div>
                <ContactLookupSection
                  label="Primary Contact (Parent/Guardian)"
                  contactType="primary"
                />
                <ContactLookupSection
                  label="Secondary Contact"
                  contactType="secondary"
                />
                <div>
                  <Label htmlFor="edit-medicalNotes">
                    Medical Notes (Allergies, Conditions)
                  </Label>
                  <Textarea
                    id="edit-medicalNotes"
                    value={formData.medicalNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, medicalNotes: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedMember) {
                    handleArchiveMember(selectedMember.id);
                    setIsEditDialogOpen(false);
                  }
                }}
                className={
                  selectedMember?.archived
                    ? "text-green-600 hover:text-green-700"
                    : "text-orange-600 hover:text-orange-700"
                }
              >
                {selectedMember?.archived ? "Unarchive" : "Archive"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedMember(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditMember}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Member Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Member Profile</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-6">
                {/* Header with Photo */}
                <div className="flex items-start gap-6">
                  {selectedMember.photoUrl ? (
                    <ImageModal
                      src={selectedMember.photoUrl}
                      alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl">
                      {selectedMember.firstName[0]}
                      {selectedMember.lastName[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </h2>
                      <span className="text-3xl">
                        {getCountryFlag(selectedMember.nationality)}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm mb-3">
                      {selectedMember.membershipId}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={
                          selectedMember.type === "Junior"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : selectedMember.type === "Youth"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                      >
                        {selectedMember.type}
                      </Badge>
                      <Badge variant="secondary">{selectedMember.role}</Badge>
                      <Badge
                        variant="outline"
                        className={
                          selectedMember.membershipCategory === "Scholarship"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : selectedMember.membershipCategory === "Sponsored"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {selectedMember.membershipCategory}
                      </Badge>
                      {selectedMember.position && (
                        <Badge
                          className={getPositionBadgeColor(
                            selectedMember.position
                          )}
                        >
                          {selectedMember.position}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          openEditDialog(selectedMember);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {selectedMember.contactNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://wa.me/${selectedMember.contactNumber.replace(
                                /[^0-9]/g,
                                ""
                              )}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Personal Information</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Date of Birth</dt>
                        <dd className="font-medium">
                          {selectedMember.dateOfBirth || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Nationality</dt>
                        <dd className="font-medium flex items-center gap-2">
                          <span>
                            {getCountryFlag(selectedMember.nationality)}
                          </span>
                          {selectedMember.nationality || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="font-medium">
                          {selectedMember.address || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium">
                          {selectedMember.email || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">School</dt>
                        <dd className="font-medium">
                          {selectedMember.school || "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Club Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Team</dt>
                        <dd className="font-medium">
                          {selectedMember.team || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Position</dt>
                        <dd className="font-medium">
                          {selectedMember.position || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Shirt Number</dt>
                        <dd className="font-medium">
                          {selectedMember.shirtNumber || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Joining Date</dt>
                        <dd className="font-medium">
                          {selectedMember.joiningDate || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Coaching Credits
                        </dt>
                        <dd className="font-medium">
                          {selectedMember.coachingCredits}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Contact Number</dt>
                      <dd className="font-medium">
                        {selectedMember.contactNumber || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Primary Contact {selectedMember.primaryContactMemberId && "🔗"}</dt>
                      <dd className="font-medium">
                        {selectedMember.primaryContact || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Primary Contact Number
                      </dt>
                      <dd className="font-medium">
                        {selectedMember.primaryContactNumber || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Secondary Contact {selectedMember.secondaryContactMemberId && "🔗"}
                      </dt>
                      <dd className="font-medium">
                        {selectedMember.secondaryContact || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Secondary Contact Number
                      </dt>
                      <dd className="font-medium">
                        {selectedMember.secondaryContactNumber || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Medical Notes */}
                {selectedMember.medicalNotes && (
                  <div>
                    <h3 className="font-semibold mb-3">Medical Notes</h3>
                    <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      {selectedMember.medicalNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Import CSV Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Members from CSV</DialogTitle>
            </DialogHeader>

            {importStep === "upload" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label
                    htmlFor="csv-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Click to upload CSV file
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload your Excel/CSV file with member data
                  </p>
                </div>
              </div>
            )}

            {importStep === "map" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Map your CSV columns to member fields. Common fields have been
                  auto-mapped.
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {csvHeaders.map((header) => (
                    <div
                      key={header}
                      className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{header}</Label>
                      </div>
                      <div className="flex-1">
                        <Select
                          value={csvMapping[header] || ""}
                          onValueChange={(value) =>
                            setCsvMapping({ ...csvMapping, [header]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Skip</SelectItem>
                            <SelectItem value="firstName">First Name</SelectItem>
                            <SelectItem value="lastName">Last Name</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="contactNumber">
                              Contact Number
                            </SelectItem>
                            <SelectItem value="dateOfBirth">
                              Date of Birth
                            </SelectItem>
                            <SelectItem value="nationality">
                              Nationality
                            </SelectItem>
                            <SelectItem value="address">Address</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                            <SelectItem value="role">Role</SelectItem>
                            <SelectItem value="position">Position</SelectItem>
                            <SelectItem value="shirtNumber">
                              Shirt Number
                            </SelectItem>
                            <SelectItem value="membershipCategory">
                              Membership Category
                            </SelectItem>
                            <SelectItem value="school">School</SelectItem>
                            <SelectItem value="primaryContact">
                              Primary Contact
                            </SelectItem>
                            <SelectItem value="primaryContactNumber">
                              Primary Contact Number
                            </SelectItem>
                            <SelectItem value="medicalNotes">
                              Medical Notes
                            </SelectItem>
                            <SelectItem value="coachingCredits">
                              Coaching Credits
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetImportState}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePreviewImport}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Preview Import
                  </Button>
                </DialogFooter>
              </div>
            )}

            {importStep === "preview" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Preview: {previewData.length} members will be imported
                </p>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">First Name</th>
                        <th className="text-left p-2">Last Name</th>
                        <th className="text-left p-2">Team</th>
                        <th className="text-left p-2">Position</th>
                        <th className="text-left p-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((member, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{member.firstName || "—"}</td>
                          <td className="p-2">{member.lastName || "—"}</td>
                          <td className="p-2">{member.team || "—"}</td>
                          <td className="p-2">{member.position || "—"}</td>
                          <td className="p-2">{member.email || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetImportState}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirm Import
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
}