import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, ArrowLeft } from "lucide-react";

interface Settings {
  teams: string[];
  membershipPrices: {
    junior: number;
    youth: number;
    adult: number;
  };
}

const defaultTeams = [
  "Toddler", "Kindy 1", "Kindy 2", "U6", "U8 Dev", "U8 Adv",
  "U10 Dev", "U10 Adv", "U12 Dev", "U12 Adv", "U12 Girls",
  "U14", "U14 Girls", "U16", "U18 Girls", "U18",
  "Women", "Masters", "Legends", "Social", "1st Team"
];

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    teams: defaultTeams,
    membershipPrices: {
      junior: 1500000,
      youth: 1800000,
      adult: 2000000
    }
  });
  const [newTeam, setNewTeam] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const saveSettings = (updatedSettings: Settings) => {
    setSettings(updatedSettings);
    localStorage.setItem("settings", JSON.stringify(updatedSettings));
  };

  const addTeam = () => {
    if (newTeam.trim() && !settings.teams.includes(newTeam.trim())) {
      const updated = {
        ...settings,
        teams: [...settings.teams, newTeam.trim()]
      };
      saveSettings(updated);
      setNewTeam("");
    }
  };

  const deleteTeam = (team: string) => {
    if (confirm(`Are you sure you want to delete team "${team}"?`)) {
      const updated = {
        ...settings,
        teams: settings.teams.filter(t => t !== team)
      };
      saveSettings(updated);
    }
  };

  const updatePrice = (category: keyof typeof settings.membershipPrices, value: number) => {
    const updated = {
      ...settings,
      membershipPrices: {
        ...settings.membershipPrices,
        [category]: value
      }
    };
    saveSettings(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <SEO 
        title="Settings - Bali Bulldogs Club Manager"
        description="Configure teams and membership pricing"
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
            <h1 className="text-4xl font-black tracking-tight">SETTINGS</h1>
            <p className="text-blue-100 text-lg">Bali Bulldogs Club Manager</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Membership Pricing Section */}
          <Card className="p-6 shadow-lg border-2 border-blue-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Membership Pricing</h2>
            <p className="text-gray-600 mb-6">Set quarterly membership fees by age category. Only "Member" type members will be charged these amounts.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="juniorPrice" className="text-lg font-semibold text-blue-700">
                  Junior Membership
                </Label>
                <p className="text-sm text-gray-500">Per quarter (3 months)</p>
                <Input
                  id="juniorPrice"
                  type="number"
                  min="0"
                  step="50000"
                  value={settings.membershipPrices.junior}
                  onChange={(e) => updatePrice("junior", parseInt(e.target.value) || 0)}
                  className="text-lg font-semibold border-2 border-blue-200"
                />
                <div className="text-sm text-gray-600">
                  = {formatCurrency(settings.membershipPrices.junior)}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="youthPrice" className="text-lg font-semibold text-blue-700">
                  Youth Membership
                </Label>
                <p className="text-sm text-gray-500">Per quarter (3 months)</p>
                <Input
                  id="youthPrice"
                  type="number"
                  min="0"
                  step="50000"
                  value={settings.membershipPrices.youth}
                  onChange={(e) => updatePrice("youth", parseInt(e.target.value) || 0)}
                  className="text-lg font-semibold border-2 border-blue-200"
                />
                <div className="text-sm text-gray-600">
                  = {formatCurrency(settings.membershipPrices.youth)}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="adultPrice" className="text-lg font-semibold text-blue-700">
                  Adult Membership
                </Label>
                <p className="text-sm text-gray-500">Per quarter (3 months)</p>
                <Input
                  id="adultPrice"
                  type="number"
                  min="0"
                  step="50000"
                  value={settings.membershipPrices.adult}
                  onChange={(e) => updatePrice("adult", parseInt(e.target.value) || 0)}
                  className="text-lg font-semibold border-2 border-blue-200"
                />
                <div className="text-sm text-gray-600">
                  = {formatCurrency(settings.membershipPrices.adult)}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> Members with type "Sponsored" or "Scholarship" are exempt from membership fees.
              </p>
            </div>
          </Card>

          {/* Team Management Section */}
          <Card className="p-6 shadow-lg border-2 border-blue-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Team Management</h2>
            
            <div className="flex gap-3 mb-6">
              <Input
                placeholder="Enter new team name..."
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTeam()}
                className="border-2 border-blue-200"
              />
              <Button 
                onClick={addTeam}
                className="bg-blue-700 hover:bg-blue-800 font-bold whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {settings.teams.map((team) => (
                <div 
                  key={team}
                  className="flex items-center justify-between p-3 bg-white border-2 border-blue-100 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{team}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTeam(team)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {settings.teams.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No teams configured. Add your first team above!
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}