import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Save, X, Users, UserCog, ShieldCheck, Search, Home, DollarSign, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/router";

interface Team {
  id: string;
  name: string;
  category: "Junior" | "Youth" | "Adult";
  monthlyFee: number;
}

interface Coach {
  id: string;
  name: string;
  phone: string;
  tier: "Head Coach" | "Goalkeeper Coach" | "Senior Coach" | "Assistant Coach";
  rate: number;
}

interface AdminStaff {
  id: string;
  name: string;
  phone: string;
  role: string;
  email: string;
}

const COACH_RATES = {
  "Head Coach": 750000,
  "Goalkeeper Coach": 600000,
  "Senior Coach": 500000,
  "Assistant Coach": 400000,
};

const DEFAULT_TEAMS: Team[] = [
  // Junior Teams
  { id: "toddler", name: "Toddler", category: "Junior", monthlyFee: 0 },
  { id: "kindy-1", name: "Kindy 1", category: "Junior", monthlyFee: 0 },
  { id: "kindy-2", name: "Kindy 2", category: "Junior", monthlyFee: 0 },
  { id: "u6", name: "U6", category: "Junior", monthlyFee: 0 },
  { id: "u8-dev", name: "U8 Dev", category: "Junior", monthlyFee: 0 },
  { id: "u8-adv", name: "U8 Adv", category: "Junior", monthlyFee: 0 },
  { id: "u10-dev", name: "U10 Dev", category: "Junior", monthlyFee: 0 },
  { id: "u10-adv", name: "U10 Adv", category: "Junior", monthlyFee: 0 },
  { id: "u12-dev", name: "U12 Dev", category: "Junior", monthlyFee: 0 },
  { id: "u12-adv", name: "U12 Adv", category: "Junior", monthlyFee: 0 },
  { id: "u12-girls", name: "U12 Girls", category: "Junior", monthlyFee: 0 },
  
  // Youth Teams
  { id: "u14", name: "U14", category: "Youth", monthlyFee: 0 },
  { id: "u14-girls", name: "U14 Girls", category: "Youth", monthlyFee: 0 },
  { id: "u16", name: "U16", category: "Youth", monthlyFee: 0 },
  { id: "u18-girls", name: "U18 Girls", category: "Youth", monthlyFee: 0 },
  { id: "u18", name: "U18", category: "Youth", monthlyFee: 0 },
  
  // Adult Teams
  { id: "women", name: "Women", category: "Adult", monthlyFee: 0 },
  { id: "masters-45", name: "Masters 45+", category: "Adult", monthlyFee: 0 },
  { id: "legends", name: "Legends", category: "Adult", monthlyFee: 0 },
  { id: "social", name: "Social", category: "Adult", monthlyFee: 0 },
  { id: "first-team", name: "1st Team", category: "Adult", monthlyFee: 0 },
];

export default function Settings() {
  const router = useRouter();

  // Initialize state with empty arrays - will be populated from localStorage
  const [teams, setTeams] = useState<Team[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>([]);
  
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({ name: "", category: "Junior" as Team["category"], monthlyFee: 0 });
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<string>("All");

  const [isAddCoachOpen, setIsAddCoachOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [newCoach, setNewCoach] = useState({ name: "", phone: "", tier: "Assistant Coach" as Coach["tier"] });
  const [coachSearchTerm, setCoachSearchTerm] = useState("");
  const [coachTierFilter, setCoachTierFilter] = useState<string>("All");

  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminStaff | null>(null);
  const [newAdmin, setNewAdmin] = useState({ name: "", phone: "", role: "", email: "" });
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTeams = localStorage.getItem("teams");
    const savedCoaches = localStorage.getItem("coaches");
    const savedAdmins = localStorage.getItem("adminStaff");

    if (savedTeams) {
      try {
        setTeams(JSON.parse(savedTeams));
      } catch (error) {
        console.error("Error loading teams:", error);
        setTeams(DEFAULT_TEAMS);
        localStorage.setItem("teams", JSON.stringify(DEFAULT_TEAMS));
      }
    } else {
      setTeams(DEFAULT_TEAMS);
      localStorage.setItem("teams", JSON.stringify(DEFAULT_TEAMS));
    }

    if (savedCoaches) {
      try {
        setCoaches(JSON.parse(savedCoaches));
      } catch (error) {
        console.error("Error loading coaches:", error);
        setCoaches([]);
      }
    }

    if (savedAdmins) {
      try {
        setAdminStaff(JSON.parse(savedAdmins));
      } catch (error) {
        console.error("Error loading admin staff:", error);
        setAdminStaff([]);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save functions that persist immediately
  const saveTeamsToStorage = (updatedTeams: Team[]) => {
    try {
      localStorage.setItem("teams", JSON.stringify(updatedTeams));
      setTeams(updatedTeams);
    } catch (error) {
      console.error("Error saving teams:", error);
      alert("Failed to save teams. Please try again.");
    }
  };

  const saveCoachesToStorage = (updatedCoaches: Coach[]) => {
    try {
      localStorage.setItem("coaches", JSON.stringify(updatedCoaches));
      setCoaches(updatedCoaches);
    } catch (error) {
      console.error("Error saving coaches:", error);
      alert("Failed to save coaches. Please try again.");
    }
  };

  const saveAdminToStorage = (updatedAdmin: AdminStaff[]) => {
    try {
      localStorage.setItem("adminStaff", JSON.stringify(updatedAdmin));
      setAdminStaff(updatedAdmin);
    } catch (error) {
      console.error("Error saving admin staff:", error);
      alert("Failed to save admin staff. Please try again.");
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Teams Functions
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
    };

    const updatedTeams = [...teams, team];
    saveTeamsToStorage(updatedTeams);
    setNewTeam({ name: "", category: "Junior", monthlyFee: 0 });
    setIsAddTeamOpen(false);
    showSuccess("Team added and saved successfully!");
  };

  const handleUpdateTeam = () => {
    if (!editingTeam) return;

    const updatedTeams = teams.map(t => t.id === editingTeam.id ? editingTeam : t);
    saveTeamsToStorage(updatedTeams);
    setEditingTeam(null);
    showSuccess("Team updated and saved successfully!");
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      const updatedTeams = teams.filter(t => t.id !== id);
      saveTeamsToStorage(updatedTeams);
      showSuccess("Team deleted and saved successfully!");
    }
  };

  // Coaches Functions
  const handleAddCoach = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!newCoach.name.trim()) errors.coachName = "Name is required";
    if (!newCoach.phone.trim()) errors.coachPhone = "Phone is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const coach: Coach = {
      id: Date.now().toString(),
      name: newCoach.name.trim(),
      phone: newCoach.phone.trim(),
      tier: newCoach.tier,
      rate: COACH_RATES[newCoach.tier],
    };

    const updatedCoaches = [...coaches, coach];
    saveCoachesToStorage(updatedCoaches);
    setNewCoach({ name: "", phone: "", tier: "Assistant Coach" });
    setIsAddCoachOpen(false);
    showSuccess("Coach added and saved successfully!");
  };

  const handleUpdateCoach = () => {
    if (!editingCoach) return;

    const updatedCoaches = coaches.map(c => c.id === editingCoach.id ? editingCoach : c);
    saveCoachesToStorage(updatedCoaches);
    setEditingCoach(null);
    showSuccess("Coach updated and saved successfully!");
  };

  const handleDeleteCoach = (id: string) => {
    if (confirm("Are you sure you want to delete this coach?")) {
      const updatedCoaches = coaches.filter(c => c.id !== id);
      saveCoachesToStorage(updatedCoaches);
      showSuccess("Coach deleted and saved successfully!");
    }
  };

  // Admin Staff Functions
  const handleAddAdmin = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!newAdmin.name.trim()) errors.adminName = "Name is required";
    if (!newAdmin.phone.trim()) errors.adminPhone = "Phone is required";
    if (!newAdmin.email.trim()) errors.adminEmail = "Email is required";
    if (!newAdmin.role.trim()) errors.adminRole = "Role is required";

    if (newAdmin.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email)) {
      errors.adminEmail = "Invalid email format";
    }

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
    showSuccess("Admin staff added and saved successfully!");
  };

  const handleUpdateAdmin = () => {
    if (!editingAdmin) return;

    const updatedAdmin = adminStaff.map(a => a.id === editingAdmin.id ? editingAdmin : a);
    saveAdminToStorage(updatedAdmin);
    setEditingAdmin(null);
    showSuccess("Admin staff updated and saved successfully!");
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      const updatedAdmin = adminStaff.filter(a => a.id !== id);
      saveAdminToStorage(updatedAdmin);
      showSuccess("Admin staff deleted and saved successfully!");
    }
  };

  // Filter functions
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(teamSearchTerm.toLowerCase());
    const matchesCategory = teamCategoryFilter === "All" || team.category === teamCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = 
      coach.name.toLowerCase().includes(coachSearchTerm.toLowerCase()) ||
      coach.phone.includes(coachSearchTerm);
    const matchesTier = coachTierFilter === "All" || coach.tier === coachTierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredAdminStaff = adminStaff.filter(admin => 
    admin.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Junior": return "bg-green-100 text-green-800";
      case "Youth": return "bg-blue-100 text-blue-800";
      case "Adult": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Head Coach": return "bg-yellow-100 text-yellow-800";
      case "Goalkeeper Coach": return "bg-orange-100 text-orange-800";
      case "Senior Coach": return "bg-blue-100 text-blue-800";
      case "Assistant Coach": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const teamsByCategory = {
    Junior: filteredTeams.filter(t => t.category === "Junior"),
    Youth: filteredTeams.filter(t => t.category === "Youth"),
    Adult: filteredTeams.filter(t => t.category === "Adult"),
  };

  // Don't render until data is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Settings - Bali Bulldogs Club Manager"
        description="Manage teams, coaches, and admin staff"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your club configuration</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/")} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button onClick={() => router.push("/members")} variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Members
              </Button>
              <Button onClick={() => router.push("/teams")} variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </Button>
              <Button onClick={() => router.push("/invoices")} variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Invoices
              </Button>
              <Button onClick={() => router.push("/coaching")} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Coaching
              </Button>
            </div>
          </div>

          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Teams Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Teams Management</CardTitle>
                    <CardDescription>Add, edit, or remove teams and set monthly fees</CardDescription>
                  </div>
                </div>
                <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Team
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
                        <Label htmlFor="monthlyFee">Monthly Fee (IDR) *</Label>
                        <Input
                          id="monthlyFee"
                          type="number"
                          value={newTeam.monthlyFee}
                          onChange={(e) => {
                            setNewTeam({ ...newTeam, monthlyFee: parseInt(e.target.value) || 0 });
                            if (formErrors.monthlyFee) setFormErrors({ ...formErrors, monthlyFee: "" });
                          }}
                          placeholder="e.g., 500000"
                          className={formErrors.monthlyFee ? "border-red-500" : ""}
                        />
                        {formErrors.monthlyFee && <p className="text-red-500 text-sm mt-1">{formErrors.monthlyFee}</p>}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddTeamOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddTeam} className="bg-blue-600 hover:bg-blue-700">Add Team</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search teams by name..."
                    value={teamSearchTerm}
                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={teamCategoryFilter} onValueChange={setTeamCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {Object.entries(teamsByCategory).map(([category, categoryTeams]) => {
                if (categoryTeams.length === 0 && teamCategoryFilter !== "All" && teamCategoryFilter !== category) {
                  return null;
                }
                
                return (
                  <div key={category} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(category)}>{category}</Badge>
                      <span className="text-sm text-gray-500">({categoryTeams.length} teams)</span>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Monthly Fee</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryTeams.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-gray-500">
                                {teamSearchTerm ? "No teams match your search" : "No teams in this category"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            categoryTeams.map((team) => (
                              <TableRow key={team.id}>
                                <TableCell>
                                  {editingTeam?.id === team.id ? (
                                    <Input
                                      value={editingTeam.name}
                                      onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                                    />
                                  ) : (
                                    team.name
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editingTeam?.id === team.id ? (
                                    <Input
                                      type="number"
                                      value={editingTeam.monthlyFee}
                                      onChange={(e) => setEditingTeam({ ...editingTeam, monthlyFee: parseInt(e.target.value) || 0 })}
                                    />
                                  ) : (
                                    formatCurrency(team.monthlyFee)
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {editingTeam?.id === team.id ? (
                                    <div className="flex justify-end gap-2">
                                      <Button size="sm" onClick={handleUpdateTeam} className="bg-green-600 hover:bg-green-700">
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingTeam(null)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end gap-2">
                                      <Button size="sm" variant="outline" onClick={() => setEditingTeam(team)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleDeleteTeam(team.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
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
                );
              })}
            </CardContent>
          </Card>

          {/* Coaches Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCog className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Coaches Management</CardTitle>
                    <CardDescription>Manage coaching staff and rates</CardDescription>
                  </div>
                </div>
                <Dialog open={isAddCoachOpen} onOpenChange={setIsAddCoachOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Coach
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Coach</DialogTitle>
                      <DialogDescription>Add a coach to your staff</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="coachName">Name *</Label>
                        <Input
                          id="coachName"
                          value={newCoach.name}
                          onChange={(e) => {
                            setNewCoach({ ...newCoach, name: e.target.value });
                            if (formErrors.coachName) setFormErrors({ ...formErrors, coachName: "" });
                          }}
                          placeholder="Coach name"
                          className={formErrors.coachName ? "border-red-500" : ""}
                        />
                        {formErrors.coachName && <p className="text-red-500 text-sm mt-1">{formErrors.coachName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="coachPhone">Phone Number *</Label>
                        <Input
                          id="coachPhone"
                          value={newCoach.phone}
                          onChange={(e) => {
                            setNewCoach({ ...newCoach, phone: e.target.value });
                            if (formErrors.coachPhone) setFormErrors({ ...formErrors, coachPhone: "" });
                          }}
                          placeholder="+62..."
                          className={formErrors.coachPhone ? "border-red-500" : ""}
                        />
                        {formErrors.coachPhone && <p className="text-red-500 text-sm mt-1">{formErrors.coachPhone}</p>}
                      </div>
                      <div>
                        <Label htmlFor="coachTier">Tier *</Label>
                        <Select
                          value={newCoach.tier}
                          onValueChange={(value) => setNewCoach({ ...newCoach, tier: value as Coach["tier"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Head Coach">Head Coach (Rp 750,000)</SelectItem>
                            <SelectItem value="Goalkeeper Coach">Goalkeeper Coach (Rp 600,000)</SelectItem>
                            <SelectItem value="Senior Coach">Senior Coach (Rp 500,000)</SelectItem>
                            <SelectItem value="Assistant Coach">Assistant Coach (Rp 400,000)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCoachOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddCoach} className="bg-blue-600 hover:bg-blue-700">Add Coach</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search coaches by name or phone..."
                    value={coachSearchTerm}
                    onChange={(e) => setCoachSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={coachTierFilter} onValueChange={setCoachTierFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Tiers</SelectItem>
                    <SelectItem value="Head Coach">Head Coach</SelectItem>
                    <SelectItem value="Goalkeeper Coach">Goalkeeper Coach</SelectItem>
                    <SelectItem value="Senior Coach">Senior Coach</SelectItem>
                    <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoaches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          {coachSearchTerm || coachTierFilter !== "All" ? "No coaches match your filters" : "No coaches added yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCoaches.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell>
                            {editingCoach?.id === coach.id ? (
                              <Input
                                value={editingCoach.name}
                                onChange={(e) => setEditingCoach({ ...editingCoach, name: e.target.value })}
                              />
                            ) : (
                              coach.name
                            )}
                          </TableCell>
                          <TableCell>
                            {editingCoach?.id === coach.id ? (
                              <Input
                                value={editingCoach.phone}
                                onChange={(e) => setEditingCoach({ ...editingCoach, phone: e.target.value })}
                              />
                            ) : (
                              coach.phone
                            )}
                          </TableCell>
                          <TableCell>
                            {editingCoach?.id === coach.id ? (
                              <Select
                                value={editingCoach.tier}
                                onValueChange={(value) => setEditingCoach({ 
                                  ...editingCoach, 
                                  tier: value as Coach["tier"],
                                  rate: COACH_RATES[value as Coach["tier"]]
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Head Coach">Head Coach</SelectItem>
                                  <SelectItem value="Goalkeeper Coach">Goalkeeper Coach</SelectItem>
                                  <SelectItem value="Senior Coach">Senior Coach</SelectItem>
                                  <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge className={getTierColor(coach.tier)}>{coach.tier}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(coach.rate)}</TableCell>
                          <TableCell className="text-right">
                            {editingCoach?.id === coach.id ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={handleUpdateCoach} className="bg-green-600 hover:bg-green-700">
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingCoach(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingCoach(coach)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteCoach(coach.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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

          {/* Admin Staff Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Admin Staff Management</CardTitle>
                    <CardDescription>Manage administrative staff members</CardDescription>
                  </div>
                </div>
                <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Admin Staff</DialogTitle>
                      <DialogDescription>Add a new administrative staff member</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="adminName">Name *</Label>
                        <Input
                          id="adminName"
                          value={newAdmin.name}
                          onChange={(e) => {
                            setNewAdmin({ ...newAdmin, name: e.target.value });
                            if (formErrors.adminName) setFormErrors({ ...formErrors, adminName: "" });
                          }}
                          placeholder="Staff name"
                          className={formErrors.adminName ? "border-red-500" : ""}
                        />
                        {formErrors.adminName && <p className="text-red-500 text-sm mt-1">{formErrors.adminName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="adminPhone">Phone Number *</Label>
                        <Input
                          id="adminPhone"
                          value={newAdmin.phone}
                          onChange={(e) => {
                            setNewAdmin({ ...newAdmin, phone: e.target.value });
                            if (formErrors.adminPhone) setFormErrors({ ...formErrors, adminPhone: "" });
                          }}
                          placeholder="+62..."
                          className={formErrors.adminPhone ? "border-red-500" : ""}
                        />
                        {formErrors.adminPhone && <p className="text-red-500 text-sm mt-1">{formErrors.adminPhone}</p>}
                      </div>
                      <div>
                        <Label htmlFor="adminEmail">Email *</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => {
                            setNewAdmin({ ...newAdmin, email: e.target.value });
                            if (formErrors.adminEmail) setFormErrors({ ...formErrors, adminEmail: "" });
                          }}
                          placeholder="email@example.com"
                          className={formErrors.adminEmail ? "border-red-500" : ""}
                        />
                        {formErrors.adminEmail && <p className="text-red-500 text-sm mt-1">{formErrors.adminEmail}</p>}
                      </div>
                      <div>
                        <Label htmlFor="adminRole">Role *</Label>
                        <Input
                          id="adminRole"
                          value={newAdmin.role}
                          onChange={(e) => {
                            setNewAdmin({ ...newAdmin, role: e.target.value });
                            if (formErrors.adminRole) setFormErrors({ ...formErrors, adminRole: "" });
                          }}
                          placeholder="e.g., Club Manager, Secretary"
                          className={formErrors.adminRole ? "border-red-500" : ""}
                        />
                        {formErrors.adminRole && <p className="text-red-500 text-sm mt-1">{formErrors.adminRole}</p>}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddAdmin} className="bg-blue-600 hover:bg-blue-700">Add Staff</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search staff by name, email, or role..."
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdminStaff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          {adminSearchTerm ? "No staff members match your search" : "No admin staff added yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAdminStaff.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            {editingAdmin?.id === admin.id ? (
                              <Input
                                value={editingAdmin.name}
                                onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                              />
                            ) : (
                              admin.name
                            )}
                          </TableCell>
                          <TableCell>
                            {editingAdmin?.id === admin.id ? (
                              <Input
                                value={editingAdmin.role}
                                onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                              />
                            ) : (
                              <Badge variant="outline">{admin.role}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingAdmin?.id === admin.id ? (
                              <Input
                                value={editingAdmin.phone}
                                onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value })}
                              />
                            ) : (
                              admin.phone
                            )}
                          </TableCell>
                          <TableCell>
                            {editingAdmin?.id === admin.id ? (
                              <Input
                                type="email"
                                value={editingAdmin.email}
                                onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                              />
                            ) : (
                              admin.email
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingAdmin?.id === admin.id ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={handleUpdateAdmin} className="bg-green-600 hover:bg-green-700">
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingAdmin(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingAdmin(admin)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteAdmin(admin.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
        </div>
      </div>
    </>
  );
}