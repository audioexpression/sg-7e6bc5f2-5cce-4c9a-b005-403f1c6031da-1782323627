import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TEAM_ORDER, getCountryFlag } from "@/lib/constants";

type MemberType = "Junior" | "Youth" | "Adult";
type MemberRole = "Player" | "Coach" | "Admin";
type MembershipCategory = "Standard" | "Sponsored" | "Scholarship";
type Position = "GK" | "DEF" | "MID" | "FWD";

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
  secondaryContact: string;
  secondaryContactNumber: string;
  medicalNotes: string;
  coachingCredits: number;
  photoUrl?: string;
  school?: string;
  archived?: boolean;
}

interface TeamData {
  name: string;
  type: MemberType;
  members: Member[];
  totalPlayers: number;
  sponsored: number;
  scholarships: number;
}

const getPositionBadgeColor = (position?: Position) => {
  if (!position) return "bg-gray-100 text-gray-800";
  switch (position) {
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

export default function Teams() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  // Group members by team
  const teams: TeamData[] = TEAM_ORDER.map((teamName) => {
    const teamMembers = members.filter(
      (m) => m.team === teamName && m.role === "Player" && !m.archived
    );
    const type: MemberType = teamName.includes("U6") ||
      teamName.includes("U8") ||
      teamName.includes("U10") ||
      teamName.includes("U12") ||
      teamName.includes("Toddler") ||
      teamName.includes("Kindy")
      ? "Junior"
      : teamName.includes("U14") ||
        teamName.includes("U16") ||
        teamName.includes("U18")
      ? "Youth"
      : "Adult";

    return {
      name: teamName,
      type,
      members: teamMembers,
      totalPlayers: teamMembers.length,
      sponsored: teamMembers.filter((m) => m.membershipCategory === "Sponsored")
        .length,
      scholarships: teamMembers.filter(
        (m) => m.membershipCategory === "Scholarship"
      ).length,
    };
  }).filter((team) => team.totalPlayers > 0); // Only show teams with members

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members.some(
        (m) =>
          m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      categoryFilter === "all" || team.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalTeams = filteredTeams.length;
  const totalAssignedMembers = filteredTeams.reduce(
    (sum, team) => sum + team.totalPlayers,
    0
  );

  return (
    <>
      <SEO
        title="Teams | Bali Bulldogs FC"
        description="View all team rosters and assignments"
      />
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Team Roster</h1>
                <p className="text-muted-foreground">
                  {totalTeams} teams • {totalAssignedMembers} assigned members
                </p>
              </div>
              <Link href="/members">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Members
                </Button>
              </Link>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search teams or players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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
          </div>

          {/* Teams Grid */}
          {filteredTeams.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No teams found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredTeams.map((team) => (
                <Card key={team.name} className="overflow-hidden">
                  {/* Team Header */}
                  <div className="bg-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{team.name}</h2>
                        <div className="flex items-center gap-4 text-blue-100">
                          <span className="flex items-center gap-1">
                            🟢 {team.members.length} Members
                          </span>
                          {team.sponsored > 0 && (
                            <span className="flex items-center gap-1">
                              🟡 {team.sponsored} Sponsored
                            </span>
                          )}
                          {team.scholarships > 0 && (
                            <span className="flex items-center gap-1">
                              🟣 {team.scholarships} Scholarships
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-500 text-white text-sm px-3 py-1"
                        >
                          {team.totalPlayers} Players
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500 text-blue-900 font-semibold"
                        >
                          {team.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {team.members.map((member) => (
                        <Card
                          key={member.id}
                          className="p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {member.firstName[0]}
                                {member.lastName[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">
                                  {getCountryFlag(member.nationality)}
                                </span>
                                <h3 className="font-semibold truncate">
                                  {member.firstName} {member.lastName}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {member.role}
                                </Badge>
                                {member.position && (
                                  <Badge
                                    className={`text-xs ${getPositionBadgeColor(
                                      member.position
                                    )}`}
                                  >
                                    {member.position}
                                  </Badge>
                                )}
                                {member.membershipCategory === "Sponsored" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                                  >
                                    Sponsored
                                  </Badge>
                                )}
                                {member.membershipCategory === "Scholarship" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                  >
                                    Scholarship
                                  </Badge>
                                )}
                              </div>
                              {member.shirtNumber && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  #{member.shirtNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}