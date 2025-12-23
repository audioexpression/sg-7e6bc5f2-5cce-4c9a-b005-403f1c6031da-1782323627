import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Users, Search, Mail, Phone, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  shirtNumber: string;
  type: string;
  role: string;
  team: string;
  membershipCategory: string;
  joiningDate: string;
  contactNumber: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact: string;
  secondaryContactNumber: string;
  medicalNotes: string;
  coachingCredits: number;
}

interface TeamGroup {
  name: string;
  members: Member[];
}

export default function Teams() {
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const storedMembers = localStorage.getItem("members");
    const storedTeams = localStorage.getItem("teams");
    
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
    
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }
  }, []);

  useEffect(() => {
    let filtered = members;

    if (selectedType !== "all") {
      filtered = filtered.filter((m) => m.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const grouped = teams.map((team) => ({
      name: team,
      members: filtered.filter((m) => m.team === team),
    })).filter((group) => group.members.length > 0);

    setTeamGroups(grouped);
  }, [members, teams, searchQuery, selectedType]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <SEO
        title="Teams - Bali Bulldogs Club Manager"
        description="View all teams and their current members"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="mb-4">
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Team Roster
                </h1>
                <p className="text-gray-600">
                  View all teams and their current members
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search teams or members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Teams Grid */}
          <div className="space-y-8">
            {teamGroups.length === 0 ? (
              <Card className="border-blue-200">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No teams found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? "Try adjusting your search filters"
                      : "No members have been added to teams yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              teamGroups.map((group) => (
                <Card key={group.name} className="border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{group.name}</CardTitle>
                        <CardDescription className="text-blue-100">
                          {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.members.map((member) => (
                        <Card
                          key={member.id}
                          className="border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900">
                                  {member.firstName} {member.lastName}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {member.shirtNumber && (
                                    <Badge variant="outline" className="text-xs">
                                      #{member.shirtNumber}
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={
                                      member.membershipCategory === "Scholarship"
                                        ? "destructive"
                                        : member.membershipCategory === "Sponsored"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {member.membershipCategory}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {member.role}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {member.type}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                              {member.dateOfBirth && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>Age {calculateAge(member.dateOfBirth)}</span>
                                </div>
                              )}
                              {member.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="truncate">{member.email}</span>
                                </div>
                              )}
                              {member.contactNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{member.contactNumber}</span>
                                </div>
                              )}
                              {member.joiningDate && (
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-gray-400" />
                                  <span>Joined {formatDate(member.joiningDate)}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}