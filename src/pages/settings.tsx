import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DEFAULT_TEAMS_BY_CATEGORY = {
  Junior: [
    "Toddler",
    "Kindy/U6 1",
    "Kindy/U6 2",
    "U8 Dev",
    "U8 Adv",
    "U10 Dev",
    "U10 Adv",
    "U12 Girls",
    "U12 Dev",
    "U12 Adv"
  ],
  Youth: [
    "U14",
    "U14 Girls",
    "U16",
    "U18 Girls",
    "U18"
  ],
  Adult: [
    "1st Team",
    "Social Team",
    "Legends 35+",
    "Masters 45+"
  ]
};

interface MembershipPricing {
  junior: number;
  youth: number;
  adult: number;
}

interface Settings {
  teamsByCategory: {
    Junior: string[];
    Youth: string[];
    Adult: string[];
  };
  membershipPricing: MembershipPricing;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    teamsByCategory: DEFAULT_TEAMS_BY_CATEGORY,
    membershipPricing: {
      junior: 1500000,
      youth: 1800000,
      adult: 2000000
    }
  });

  const [newTeamName, setNewTeamName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Junior" | "Youth" | "Adult">("Junior");

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
    if (!newTeamName.trim()) return;

    const updated = {
      ...settings,
      teamsByCategory: {
        ...settings.teamsByCategory,
        [selectedCategory]: [...settings.teamsByCategory[selectedCategory], newTeamName.trim()]
      }
    };

    saveSettings(updated);
    setNewTeamName("");
  };

  const removeTeam = (category: "Junior" | "Youth" | "Adult", team: string) => {
    if (confirm(`Remove ${team} from ${category} teams?`)) {
      const updated = {
        ...settings,
        teamsByCategory: {
          ...settings.teamsByCategory,
          [category]: settings.teamsByCategory[category].filter(t => t !== team)
        }
      };
      saveSettings(updated);
    }
  };

  const updatePricing = (category: "junior" | "youth" | "adult", value: number) => {
    const updated = {
      ...settings,
      membershipPricing: {
        ...settings.membershipPricing,
        [category]: value
      }
    };
    saveSettings(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <SEO 
        title="Settings - Bali Bulldogs Club Manager"
        description="Configure club settings, teams, and pricing"
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
            <div>
              <h1 className="text-4xl font-black mb-2 tracking-tight">SETTINGS</h1>
              <p className="text-blue-100 text-lg">Configure Club Settings</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          <Card className="p-6 shadow-lg border-2 border-blue-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Membership Pricing</h2>
            <p className="text-sm text-gray-600 mb-6 bg-yellow-50 p-3 rounded border border-yellow-200">
              <strong>Note:</strong> Members with type "Sponsored" or "Scholarship" are exempt from membership fees.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="juniorPrice" className="font-semibold text-lg mb-2 block">
                  Junior Membership
                </Label>
                <Input
                  id="juniorPrice"
                  type="number"
                  value={settings.membershipPricing.junior}
                  onChange={(e) => updatePricing("junior", parseInt(e.target.value) || 0)}
                  className="border-2 border-blue-200 text-lg h-12 mb-2"
                />
                <p className="text-sm text-gray-600">
                  {formatCurrency(settings.membershipPricing.junior)} <span className="text-blue-600 font-semibold">per quarter (3 months)</span>
                </p>
              </div>

              <div>
                <Label htmlFor="youthPrice" className="font-semibold text-lg mb-2 block">
                  Youth Membership
                </Label>
                <Input
                  id="youthPrice"
                  type="number"
                  value={settings.membershipPricing.youth}
                  onChange={(e) => updatePricing("youth", parseInt(e.target.value) || 0)}
                  className="border-2 border-blue-200 text-lg h-12 mb-2"
                />
                <p className="text-sm text-gray-600">
                  {formatCurrency(settings.membershipPricing.youth)} <span className="text-blue-600 font-semibold">per quarter (3 months)</span>
                </p>
              </div>

              <div>
                <Label htmlFor="adultPrice" className="font-semibold text-lg mb-2 block">
                  Adult Membership
                </Label>
                <Input
                  id="adultPrice"
                  type="number"
                  value={settings.membershipPricing.adult}
                  onChange={(e) => updatePricing("adult", parseInt(e.target.value) || 0)}
                  className="border-2 border-blue-200 text-lg h-12 mb-2"
                />
                <p className="text-sm text-gray-600">
                  {formatCurrency(settings.membershipPricing.adult)} <span className="text-blue-600 font-semibold">per quarter (3 months)</span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg border-2 border-blue-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Team Management</h2>
            
            <div className="mb-6">
              <Label className="font-semibold text-lg mb-3 block">Add New Team</Label>
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as "Junior" | "Youth" | "Adult")}
                  className="px-4 py-2 border-2 border-blue-200 rounded-md bg-white"
                >
                  <option value="Junior">Junior</option>
                  <option value="Youth">Youth</option>
                  <option value="Adult">Adult</option>
                </select>
                
                <Input
                  placeholder="Team name..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTeam()}
                  className="flex-1 border-2 border-blue-200"
                />
                
                <Button 
                  onClick={addTeam}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {(Object.keys(settings.teamsByCategory) as Array<"Junior" | "Youth" | "Adult">).map((category) => (
                <div key={category} className="border-2 border-blue-100 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Badge className={
                      category === "Junior" ? "bg-green-600" :
                      category === "Youth" ? "bg-blue-600" :
                      "bg-purple-600"
                    }>
                      {category}
                    </Badge>
                    <span className="text-gray-600 text-sm font-normal">
                      ({settings.teamsByCategory[category].length} teams)
                    </span>
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {settings.teamsByCategory[category].map((team) => (
                      <div
                        key={team}
                        className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                      >
                        <span className="font-medium">{team}</span>
                        <button
                          onClick={() => removeTeam(category, team)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}