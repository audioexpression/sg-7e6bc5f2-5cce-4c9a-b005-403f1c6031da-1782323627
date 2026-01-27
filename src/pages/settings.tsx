import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/SEO";
import {
  Users,
  UserCog,
  ShieldCheck,
  Search,
  Home,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  School,
  GraduationCap
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Coach, 
  TIER_RATES 
} from "@/lib/coach-types";
import { DEFAULT_SCHOOLS } from "@/lib/constants";

interface Team {
  id: string;
  name: string;
  category: "Junior" | "Youth" | "Adult";
  monthlyFee: number;
  taxRate?: number;
  reducedMonthlyFee?: number;
  whatsappLink?: string;
}

interface AdminStaff {
  id: string;
  name: string;
  phone: string;
  role: string;
  email: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  category: "Junior" | "Youth" | "Adult";
  teamAssignment: string;
  feeStructure?: "Standard" | "Reduced";
  membershipId?: string;
}

const DEFAULT_TEAMS: Team[] = [
  { id: "toddler", name: "Toddler", category: "Junior", monthlyFee: 500000 },
  { id: "kindy-1", name: "Kindy 1", category: "Junior", monthlyFee: 850000 },
  { id: "kindy-2", name: "Kindy 2", category: "Junior", monthlyFee: 850000 },
  { id: "u6", name: "U6", category: "Junior", monthlyFee: 850000 },
  { id: "u8-dev", name: "U8 Dev", category: "Junior", monthlyFee: 950000 },
  { id: "u8-adv", name: "U8 Adv", category: "Junior", monthlyFee: 950000 },
  { id: "u10-dev", name: "U10 Dev", category: "Junior", monthlyFee: 950000 },
  { id: "u10-adv", name: "U10 Adv", category: "Junior", monthlyFee: 950000 },
  { id: "u12-dev", name: "U12 Dev", category: "Junior", monthlyFee: 950000 },
  { id: "u12-adv", name: "U12 Adv", category: "Junior", monthlyFee: 950000 },
  { id: "u12-girls", name: "U12 Girls", category: "Junior", monthlyFee: 500000 },
  { id: "u14", name: "U14", category: "Youth", monthlyFee: 950000 },
  { id: "u14-girls", name: "U14 Girls", category: "Youth", monthlyFee: 950000 },
  { id: "u16", name: "U16", category: "Youth", monthlyFee: 950000 },
  { id: "u18-girls", name: "U18 Girls", category: "Youth", monthlyFee: 500000 },
  { id: "u18", name: "U18", category: "Youth", monthlyFee: 500000 },
  { id: "u20", name: "U20", category: "Youth", monthlyFee: 0 },
  { id: "women", name: "Women", category: "Adult", monthlyFee: 0, taxRate: 10 },
  { id: "masters-45", name: "Masters 45+", category: "Adult", monthlyFee: 0 },
  { id: "legends", name: "Legends", category: "Adult", monthlyFee: 0 },
  { id: "social", name: "Social", category: "Adult", monthlyFee: 0, taxRate: 10 },
  { id: "first-team", name: "1st Team", category: "Adult", monthlyFee: 0 },
];

const calculateQuarterlyFee = (monthlyFee: number): number => {
  return monthlyFee * 3;
};

export default function Settings() {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  
  // Teams State
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<{
    name: string;
    category: "Junior" | "Youth" | "Adult";
    monthlyFee: number;
    taxRate: number;
    reducedMonthlyFee?: number;
    whatsappLink?: string;
  }>({ 
    name: "", 
    category: "Junior", 
    monthlyFee: 0,
    taxRate: 11,
    reducedMonthlyFee: undefined,
    whatsappLink: ""
  });
  const [teamSearchTerm, setTeamSearchTerm] = useState("");

  // Coaches State
  const [isAddCoachOpen, setIsAddCoachOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [newCoach, setNewCoach] = useState({ name: "", phone: "", tier: "Assistant Coach" as Coach["tier"] });
  const [coachSearchTerm, setCoachSearchTerm] = useState("");
  const [coachTierFilter, setCoachTierFilter] = useState<string>("All");

  // Admin Staff State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminStaff | null>(null);
  const [newAdmin, setNewAdmin] = useState({ name: "", phone: "", role: "", email: "" });
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

  // Schools State
  const [newSchool, setNewSchool] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
      try {
        setTeams(JSON.parse(savedTeams));
      } catch (error) {
        setTeams(DEFAULT_TEAMS);
        localStorage.setItem("teams", JSON.stringify(DEFAULT_TEAMS));
      }
    } else {
      setTeams(DEFAULT_TEAMS);
      localStorage.setItem("teams", JSON.stringify(DEFAULT_TEAMS));
    }

    const savedCoaches = localStorage.getItem("coaches");
    if (savedCoaches) setCoaches(JSON.parse(savedCoaches));
    
    const savedAdminStaff = localStorage.getItem("adminStaff");
    if (savedAdminStaff) setAdminStaff(JSON.parse(savedAdminStaff));
    
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      try {
        setMembers(JSON.parse(savedMembers));
      } catch (error) {
        console.error("Error loading members:", error);
      }
    }

    const savedSchools = localStorage.getItem("schools");
    if (savedSchools) {
      setSchools(JSON.parse(savedSchools));
    } else {
      setSchools(DEFAULT_SCHOOLS);
      localStorage.setItem("schools", JSON.stringify(DEFAULT_SCHOOLS));
    }

    setIsLoaded(true);
  }, []);

  const saveTeamsToStorage = (updatedTeams: Team[]) => {
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
  };

  const saveCoachesToStorage = (updatedCoaches: Coach[]) => {
    localStorage.setItem("coaches", JSON.stringify(updatedCoaches));
    setCoaches(updatedCoaches);
  };

  const saveAdminToStorage = (updatedAdmin: AdminStaff[]) => {
    localStorage.setItem("adminStaff", JSON.stringify(updatedAdmin));
    setAdminStaff(updatedAdmin);
  };

  const saveSchoolsToStorage = (updatedSchools: string[]) => {
    localStorage.setItem("schools", JSON.stringify(updatedSchools));
    setSchools(updatedSchools);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Team Handlers
  const handleAddTeam = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!newTeam.name.trim()) errors.teamName = "Team name is required";
    if (newTeam.monthlyFee < 0) errors.monthlyFee = "Fee cannot be negative";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name.trim(),
      category: newTeam.category,
      monthlyFee: newTeam.monthlyFee,
      taxRate: newTeam.taxRate || 11,
      reducedMonthlyFee: newTeam.reducedMonthlyFee,
      whatsappLink: newTeam.whatsappLink?.trim()
    };
    const updatedTeams = [...teams, team];
    saveTeamsToStorage(updatedTeams);
    setNewTeam({ name: "", category: "Junior", monthlyFee: 0, taxRate: 11, reducedMonthlyFee: undefined, whatsappLink: "" });
    setIsAddTeamOpen(false);
    showSuccess("Team added successfully!");
  };

  const handleUpdateTeam = () => {
    if (!editingTeam) return;
    const updatedTeams = teams.map(t => t.id === editingTeam.id ? editingTeam : t);
    saveTeamsToStorage(updatedTeams);
    setEditingTeam(null);
    showSuccess("Team updated successfully!");
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      const updatedTeams = teams.filter(t => t.id !== id);
      saveTeamsToStorage(updatedTeams);
      showSuccess("Team deleted successfully!");
    }
  };

  // Coach Handlers
  const handleAddCoach = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!newCoach.name.trim()) errors.name = "Coach name is required";
    if (!newCoach.phone.trim()) errors.phone = "Phone number is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const coach: Coach = {
      id: Date.now().toString(),
      name: newCoach.name,
      phone: newCoach.phone,
      tier: newCoach.tier,
      hourlyRate: TIER_RATES[newCoach.tier],
    };
    const updatedCoaches = [...coaches, coach];
    saveCoachesToStorage(updatedCoaches);
    setIsAddCoachOpen(false);
    setNewCoach({ name: "", phone: "", tier: "Assistant Coach" });
    showSuccess("Coach added successfully!");
  };

  const handleEditCoach = () => {
    if (!editingCoach) return;
    const updatedCoaches = coaches.map((c) =>
      c.id === editingCoach.id
        ? { ...c, ...editingCoach, hourlyRate: TIER_RATES[editingCoach.tier] }
        : c
    );
    saveCoachesToStorage(updatedCoaches);
    setEditingCoach(null);
    showSuccess("Coach updated successfully!");
  };

  const handleDeleteCoach = (id: string) => {
    if (confirm("Are you sure you want to delete this coach?")) {
      const updatedCoaches = coaches.filter((c) => c.id !== id);
      saveCoachesToStorage(updatedCoaches);
      showSuccess("Coach deleted successfully!");
    }
  };

  // Admin Handlers
  const handleAddAdmin = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!newAdmin.name.trim()) errors.adminName = "Name is required";
    if (!newAdmin.phone.trim()) errors.adminPhone = "Phone is required";
    if (!newAdmin.email.trim()) errors.adminEmail = "Email is required";
    if (!newAdmin.role.trim()) errors.adminRole = "Role is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const admin: AdminStaff = {
      id: Date.now().toString(),
      name: newAdmin.name.trim(),
      phone: newAdmin.phone.trim(),
      role: newAdmin.role.trim(),
      email: newAdmin.email.trim(),
    };
    const updatedAdmin = [...adminStaff, admin];
    saveAdminToStorage(updatedAdmin);
    setNewAdmin({ name: "", phone: "", role: "", email: "" });
    setIsAddAdminOpen(false);
    showSuccess("Admin staff added successfully!");
  };

  const handleUpdateAdmin = () => {
    if (!editingAdmin) return;
    const updatedAdmin = adminStaff.map(a => a.id === editingAdmin.id ? editingAdmin : a);
    saveAdminToStorage(updatedAdmin);
    setEditingAdmin(null);
    showSuccess("Admin staff updated successfully!");
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      const updatedAdmin = adminStaff.filter(a => a.id !== id);
      saveAdminToStorage(updatedAdmin);
      showSuccess("Admin staff deleted successfully!");
    }
  };

  // School Handlers
  const handleAddSchool = () => {
    if (!newSchool.trim()) return;
    if (schools.includes(newSchool.trim())) {
      alert("School already exists");
      return;
    }
    const updatedSchools = [...schools, newSchool.trim()].sort();
    saveSchoolsToStorage(updatedSchools);
    setNewSchool("");
    showSuccess("School added successfully!");
  };

  const handleDeleteSchool = (schoolName: string) => {
    if (confirm(`Remove "${schoolName}" from the list?`)) {
      const updatedSchools = schools.filter(s => s !== schoolName);
      saveSchoolsToStorage(updatedSchools);
      showSuccess("School removed successfully!");
    }
  };

  const handleUpdateMemberFee = (memberId: string, structure: "Standard" | "Reduced") => {
    const updatedMembers = members.map(m => 
      m.id === memberId ? { ...m, feeStructure: structure } : m
    );
    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
    showSuccess(`Fee structure updated to ${structure}`);
  };

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const teamsByCategory = {
    Junior: teams.filter(t => t.category === "Junior").filter(t => t.name.toLowerCase().includes(teamSearchTerm.toLowerCase())),
    Youth: teams.filter(t => t.category === "Youth").filter(t => t.name.toLowerCase().includes(teamSearchTerm.toLowerCase())),
    Adult: teams.filter(t => t.category === "Adult").filter(t => t.name.toLowerCase().includes(teamSearchTerm.toLowerCase())),
  };

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(coachSearchTerm.toLowerCase()) || coach.phone.includes(coachSearchTerm);
    const matchesTier = coachTierFilter === "All" || coach.tier === coachTierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredAdminStaff = adminStaff.filter(admin => 
    admin.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;

  return (
    <>
      <SEO title="Settings - Bali Bulldogs Club Manager" description="Manage teams, coaches, and admin staff" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your club configuration</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => router.push("/")} variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" /> Dashboard
              </Button>
              <Button onClick={() => router.push("/members")} variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" /> Members
              </Button>
            </div>
          </div>

          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Teams & Fee Structures */}
            <div className="space-y-8">
              {/* Teams Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>Teams</CardTitle>
                        <CardDescription>Manage teams and fees</CardDescription>
                      </div>
                    </div>
                    <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" /> Add Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Team</DialogTitle>
                          <DialogDescription>Create a new team with monthly membership fee</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="teamName">Team Name *</Label>
                            <Input
                              id="teamName"
                              value={newTeam.name}
                              onChange={(e) => {
                                setNewTeam({ ...newTeam, name: e.target.value });
                                if (formErrors.teamName) setFormErrors({ ...formErrors, teamName: "" });
                              }}
                              placeholder="e.g., U12 Dev"
                              className={formErrors.teamName ? "border-red-500" : ""}
                            />
                            {formErrors.teamName && <p className="text-red-500 text-sm mt-1">{formErrors.teamName}</p>}
                          </div>
                          <div>
                            <Label htmlFor="teamCategory">Category *</Label>
                            <Select
                              value={newTeam.category}
                              onValueChange={(value) => setNewTeam({ ...newTeam, category: value as Team["category"] })}
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
                            <Label htmlFor="monthlyFee">Monthly Fee (Rp)</Label>
                            <Input
                              id="monthlyFee"
                              type="number"
                              value={newTeam.monthlyFee}
                              onChange={(e) => {
                                setNewTeam({ ...newTeam, monthlyFee: parseInt(e.target.value) || 0 });
                                if (formErrors.monthlyFee) setFormErrors({ ...formErrors, monthlyFee: "" });
                              }}
                              placeholder="850000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="taxRate">Tax Rate (%)</Label>
                            <Input
                              id="taxRate"
                              type="number"
                              value={newTeam.taxRate || 11}
                              onChange={(e) => setNewTeam({ ...newTeam, taxRate: parseInt(e.target.value) || 11 })}
                              placeholder="11"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reducedMonthlyFee">Reduced Fee (Optional)</Label>
                            <Input
                              id="reducedMonthlyFee"
                              type="number"
                              value={newTeam.reducedMonthlyFee || ""}
                              onChange={(e) => setNewTeam({ ...newTeam, reducedMonthlyFee: parseInt(e.target.value) || undefined })}
                              placeholder="500000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="whatsappLink">WhatsApp Link</Label>
                            <Input
                              id="whatsappLink"
                              value={newTeam.whatsappLink || ""}
                              onChange={(e) => setNewTeam({ ...newTeam, whatsappLink: e.target.value })}
                              placeholder="https://chat.whatsapp..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddTeamOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddTeam} className="bg-blue-600">Add Team</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search teams..."
                        value={teamSearchTerm}
                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                        className="pl-8 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(teamsByCategory).map(([category, categoryTeams]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-gray-50">{category}</Badge>
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[30%]">Name</TableHead>
                                <TableHead className="w-[20%]">Fee (M)</TableHead>
                                <TableHead className="w-[20%]">Fee (Q)</TableHead>
                                <TableHead className="w-[20%]">Reduced (M)</TableHead>
                                <TableHead className="text-right w-[10%]">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {categoryTeams.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center text-xs text-gray-400 py-4">No teams</TableCell>
                                </TableRow>
                              ) : (
                                categoryTeams.map((team) => (
                                  <TableRow key={team.id}>
                                    <TableCell className="font-medium">
                                      {editingTeam?.id === team.id ? (
                                        <Input
                                          value={editingTeam.name}
                                          onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                                          className="h-7"
                                        />
                                      ) : (
                                        <div>
                                          {team.name}
                                          {team.whatsappLink && <a href={team.whatsappLink} target="_blank" className="block text-[10px] text-green-600 hover:underline">WhatsApp</a>}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {editingTeam?.id === team.id ? (
                                        <Input
                                          type="number"
                                          value={editingTeam.monthlyFee}
                                          onChange={(e) => setEditingTeam({ ...editingTeam, monthlyFee: parseInt(e.target.value) || 0 })}
                                          className="h-7"
                                        />
                                      ) : (
                                        formatCurrency(team.monthlyFee)
                                      )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {formatCurrency(calculateQuarterlyFee(team.monthlyFee))}
                                    </TableCell>
                                    <TableCell>
                                       {editingTeam?.id === team.id ? (
                                        <Input
                                          type="number"
                                          value={editingTeam.reducedMonthlyFee || ""}
                                          onChange={(e) => setEditingTeam({ ...editingTeam, reducedMonthlyFee: parseInt(e.target.value) || undefined })}
                                          className="h-7"
                                          placeholder="Optional"
                                        />
                                      ) : (
                                        team.reducedMonthlyFee ? formatCurrency(team.reducedMonthlyFee) : "-"
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {editingTeam?.id === team.id ? (
                                        <div className="flex justify-end gap-1">
                                          <Button size="icon" className="h-6 w-6" onClick={handleUpdateTeam}><Save className="h-3 w-3" /></Button>
                                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingTeam(null)}><X className="h-3 w-3" /></Button>
                                        </div>
                                      ) : (
                                        <div className="flex justify-end gap-1">
                                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingTeam(team)}><Edit className="h-3 w-3" /></Button>
                                          <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => handleDeleteTeam(team.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Member Fee Assignments (Reduced/Standard) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle>Fee Assignments</CardTitle>
                      <CardDescription>Adult member rates</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                   <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.filter(m => m.category === "Adult").slice(0, 10).map(member => {
                          const isReduced = member.feeStructure === "Reduced";
                          return (
                            <TableRow key={member.id}>
                              <TableCell className="text-sm font-medium">{member.firstName} {member.lastName}</TableCell>
                              <TableCell>
                                <Badge variant={isReduced ? "secondary" : "outline"} className={isReduced ? "bg-orange-100 text-orange-800" : ""}>
                                  {isReduced ? "Reduced" : "Std"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" variant="ghost" className="h-6 text-xs"
                                  onClick={() => handleUpdateMemberFee(member.id, isReduced ? "Standard" : "Reduced")}
                                >
                                  Switch
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                         {members.filter(m => m.category === "Adult").length === 0 && (
                          <TableRow><TableCell colSpan={3} className="text-center text-xs py-4 text-muted-foreground">No adult members</TableCell></TableRow>
                         )}
                      </TableBody>
                    </Table>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Staff & Schools */}
            <div className="space-y-8">
              {/* Coaches */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>Coaches</CardTitle>
                        <CardDescription>Manage coaching staff</CardDescription>
                      </div>
                    </div>
                    <Dialog open={isAddCoachOpen} onOpenChange={setIsAddCoachOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" /> Add Coach
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Coach</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Name *</Label>
                            <Input value={newCoach.name} onChange={(e) => setNewCoach({ ...newCoach, name: e.target.value })} />
                          </div>
                          <div>
                            <Label>Phone *</Label>
                            <Input value={newCoach.phone} onChange={(e) => setNewCoach({ ...newCoach, phone: e.target.value })} />
                          </div>
                          <div>
                            <Label>Tier *</Label>
                            <Select
                              value={newCoach.tier}
                              onValueChange={(value) => setNewCoach({ ...newCoach, tier: value as Coach["tier"] })}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Head Coach">Head Coach</SelectItem>
                                <SelectItem value="Goalkeeper Coach">Goalkeeper Coach</SelectItem>
                                <SelectItem value="Senior Coach">Senior Coach</SelectItem>
                                <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddCoachOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddCoach} className="bg-blue-600">Add Coach</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCoaches.length === 0 ? (
                          <TableRow><TableCell colSpan={3} className="text-center text-xs py-4 text-muted-foreground">No coaches</TableCell></TableRow>
                        ) : (
                          filteredCoaches.map((coach) => (
                            <TableRow key={coach.id}>
                              <TableCell className="font-medium">
                                {editingCoach?.id === coach.id ? (
                                  <Input value={editingCoach.name} onChange={(e) => setEditingCoach({...editingCoach, name: e.target.value})} className="h-7" />
                                ) : coach.name}
                              </TableCell>
                              <TableCell>
                                {editingCoach?.id === coach.id ? (
                                   <Select value={editingCoach.tier} onValueChange={(v) => setEditingCoach({...editingCoach, tier: v as any})}>
                                     <SelectTrigger className="h-7"><SelectValue/></SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="Head Coach">Head</SelectItem>
                                       <SelectItem value="Goalkeeper Coach">GK</SelectItem>
                                       <SelectItem value="Senior Coach">Senior</SelectItem>
                                       <SelectItem value="Assistant Coach">Asst</SelectItem>
                                     </SelectContent>
                                   </Select>
                                ) : (
                                  <Badge variant="outline" className="text-[10px]">{coach.tier.split(' ')[0]}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {editingCoach?.id === coach.id ? (
                                  <div className="flex justify-end gap-1">
                                    <Button size="icon" className="h-6 w-6" onClick={handleEditCoach}><Save className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingCoach(null)}><X className="h-3 w-3" /></Button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingCoach(coach)}><Edit className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleDeleteCoach(coach.id)}><Trash2 className="h-3 w-3" /></Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Staff */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>Staff</CardTitle>
                        <CardDescription>Club administration</CardDescription>
                      </div>
                    </div>
                    <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" /> Add Staff
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Admin Staff</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Name *</Label>
                            <Input value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                          </div>
                           <div>
                            <Label>Phone *</Label>
                            <Input value={newAdmin.phone} onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })} />
                          </div>
                          <div>
                            <Label>Role *</Label>
                            <Input value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddAdmin} className="bg-blue-600">Add Staff</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {filteredAdminStaff.length === 0 ? (
                          <TableRow><TableCell colSpan={3} className="text-center text-xs py-4 text-muted-foreground">No admin staff</TableCell></TableRow>
                        ) : (
                          filteredAdminStaff.map((admin) => (
                            <TableRow key={admin.id}>
                              <TableCell className="font-medium">
                                {editingAdmin?.id === admin.id ? (
                                  <Input value={editingAdmin.name} onChange={(e) => setEditingAdmin({...editingAdmin, name: e.target.value})} className="h-7" />
                                ) : admin.name}
                              </TableCell>
                              <TableCell>
                                {editingAdmin?.id === admin.id ? (
                                  <Input value={editingAdmin.role} onChange={(e) => setEditingAdmin({...editingAdmin, role: e.target.value})} className="h-7" />
                                ) : admin.role}
                              </TableCell>
                              <TableCell className="text-right">
                                {editingAdmin?.id === admin.id ? (
                                  <div className="flex justify-end gap-1">
                                    <Button size="icon" className="h-6 w-6" onClick={handleUpdateAdmin}><Save className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingAdmin(null)}><X className="h-3 w-3" /></Button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingAdmin(admin)}><Edit className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleDeleteAdmin(admin.id)}><Trash2 className="h-3 w-3" /></Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Schools Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>Schools</CardTitle>
                        <CardDescription>Manage school list for dropdowns</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder="Add new school..." 
                      value={newSchool} 
                      onChange={(e) => setNewSchool(e.target.value)} 
                    />
                    <Button onClick={handleAddSchool} className="bg-blue-600 hover:bg-blue-700">Add</Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <Table>
                      <TableBody>
                        {schools.length === 0 ? (
                           <TableRow><TableCell className="text-center text-muted-foreground">No schools added</TableCell></TableRow>
                        ) : (
                          schools.map((school) => (
                            <TableRow key={school}>
                              <TableCell>{school}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6 text-red-500 hover:text-red-600"
                                  onClick={() => handleDeleteSchool(school)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
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
        </div>
      </div>
    </>
  );
}