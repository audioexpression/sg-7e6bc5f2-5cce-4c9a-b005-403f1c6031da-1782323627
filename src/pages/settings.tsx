import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, Edit, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface Settings {
  teams: string[];
  membershipPricing: {
    junior: number;
    youth: number;
    adult: number;
  };
}

const DEFAULT_TEAMS = [
  "Toddler", "Kindy 1", "Kindy 2", "U6", "U8 Dev", "U8 Adv", 
  "U10 Dev", "U10 Adv", "U12 Dev", "U12 Adv", "U12 Girls",
  "U14", "U14 Girls", "U16", "U18 Girls", "U18",
  "Women", "Masters", "Legends", "Social", "1st Team"
];

export default function SettingsPage() {
  const [teams, setTeams] = useState<string[]>(DEFAULT_TEAMS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [settings, setSettings] = useState<Settings>({
    teams: DEFAULT_TEAMS,
    membershipPricing: {
      junior: 0,
      youth: 0,
      adult: 0
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem("teams");
    if (stored) {
      setTeams(JSON.parse(stored));
    } else {
      localStorage.setItem("teams", JSON.stringify(DEFAULT_TEAMS));
    }
  }, []);

  const saveTeam = () => {
    if (!teamName.trim()) {
      setAlertMessage("Team name cannot be empty");
      return;
    }

    let updatedTeams: string[];

    if (editingTeam) {
      // Check if renaming would create a duplicate
      if (teams.some(t => t !== editingTeam && t.toLowerCase() === teamName.trim().toLowerCase())) {
        setAlertMessage("A team with this name already exists");
        return;
      }

      // Update team name everywhere
      updatedTeams = teams.map(t => t === editingTeam ? teamName.trim() : t);

      // Update members with this team
      const members = JSON.parse(localStorage.getItem("members") || "[]");
      const updatedMembers = members.map((m: any) => 
        m.team === editingTeam ? { ...m, team: teamName.trim() } : m
      );
      localStorage.setItem("members", JSON.stringify(updatedMembers));

      // Update invoices with this team
      const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
      const updatedInvoices = invoices.map((inv: any) => 
        inv.team === editingTeam ? { ...inv, team: teamName.trim() } : inv
      );
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices));

    } else {
      // Check for duplicates
      if (teams.some(t => t.toLowerCase() === teamName.trim().toLowerCase())) {
        setAlertMessage("A team with this name already exists");
        return;
      }
      updatedTeams = [...teams, teamName.trim()];
    }

    setTeams(updatedTeams);
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    resetForm();
  };

  const deleteTeam = (team: string) => {
    // Check if team is in use
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    const hasMembers = members.some((m: any) => m.team === team);

    if (hasMembers) {
      setAlertMessage(`Cannot delete "${team}" - it has active members. Reassign members first.`);
      setTimeout(() => setAlertMessage(""), 5000);
      return;
    }

    if (confirm(`Are you sure you want to delete team "${team}"?`)) {
      const updated = teams.filter(t => t !== team);
      setTeams(updated);
      localStorage.setItem("teams", JSON.stringify(updated));
    }
  };

  const resetForm = () => {
    setTeamName("");
    setEditingTeam(null);
    setIsDialogOpen(false);
    setAlertMessage("");
  };

  const openEditDialog = (team: string) => {
    setTeamName(team);
    setEditingTeam(team);
    setIsDialogOpen(true);
  };

  const resetToDefaults = () => {
    if (confirm("Reset all teams to default list? This will NOT affect existing members/invoices.")) {
      setTeams(DEFAULT_TEAMS);
      localStorage.setItem("teams", JSON.stringify(DEFAULT_TEAMS));
      setAlertMessage("Teams reset to defaults successfully");
      setTimeout(() => setAlertMessage(""), 3000);
    }
  };

  return (
    <>
      <SEO 
        title="Settings - Bali Bulldogs Club Manager"
        description="Manage team names and system settings"
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
                  <h1 className="text-3xl font-black tracking-tight">SETTINGS</h1>
                  <p className="text-yellow-300 text-sm font-semibold">Bali Bulldogs Club Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {alertMessage && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50">
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-black text-bulldogs-blue">Team Management</CardTitle>
                  <CardDescription>Add, edit, or remove team names used throughout the system</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetToDefaults}
                  >
                    Reset to Defaults
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                        <Plus className="h-4 w-4" />
                        Add Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-bulldogs-blue">
                          {editingTeam ? "Edit Team" : "Add New Team"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingTeam ? "Rename this team (updates all members and invoices)" : "Create a new team name"}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="teamName">Team Name *</Label>
                          <Input
                            id="teamName"
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            placeholder="e.g., U20 Elite"
                            onKeyDown={e => e.key === "Enter" && saveTeam()}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={saveTeam} className="bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                          {editingTeam ? "Update Team" : "Add Team"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                          No teams configured. Add your first team to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      teams.map((team, index) => (
                        <TableRow key={team}>
                          <TableCell className="text-gray-500">{index + 1}</TableCell>
                          <TableCell className="font-medium">{team}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(team)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTeam(team)}
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

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-bulldogs-blue mb-2">💡 Team Management Tips</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Edit teams</strong> to rename them - all members and invoices will update automatically</li>
                  <li>• <strong>Delete teams</strong> only if they have no members assigned</li>
                  <li>• <strong>Reset to defaults</strong> restores the original 21 team names</li>
                  <li>• Team names appear in Member Database, Invoicing, and dashboard charts</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Membership Pricing</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Set quarterly membership fees for each age category (in Rp)
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Junior Membership (per quarter)
                    </label>
                    <input
                      type="number"
                      value={settings.membershipPricing.junior}
                      onChange={(e) => setSettings({
                        ...settings,
                        membershipPricing: {
                          ...settings.membershipPricing,
                          junior: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 1500000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Youth Membership (per quarter)
                    </label>
                    <input
                      type="number"
                      value={settings.membershipPricing.youth}
                      onChange={(e) => setSettings({
                        ...settings,
                        membershipPricing: {
                          ...settings.membershipPricing,
                          youth: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 2000000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Adult Membership (per quarter)
                    </label>
                    <input
                      type="number"
                      value={settings.membershipPricing.adult}
                      onChange={(e) => setSettings({
                        ...settings,
                        membershipPricing: {
                          ...settings.membershipPricing,
                          adult: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 2500000"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-900">
                  💡 These prices will be used when generating invoices. Sponsored and Scholarship members are automatically excluded from billing.
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}