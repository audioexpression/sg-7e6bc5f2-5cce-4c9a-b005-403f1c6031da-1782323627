import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Users, Search, Mail, Phone, Calendar, Award, Plus, Settings } from "lucide-react";
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
  privateCoachingCredits: number;
}

interface TeamGroup {
  name: string;
  members: Member[];
}

interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  teamAssignment: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  paymentLink: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  createdAt: string;
}

export default function Teams() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const storedMembers = localStorage.getItem("members");
    const storedTeams = localStorage.getItem("teams");
    const storedInvoices = localStorage.getItem("invoices");
    
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
    
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }

    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
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

  const getMemberPaymentStatus = (memberId: string, quarter: string): Invoice | undefined => {
    return invoices.find(inv => inv.memberId === memberId && inv.billingPeriod === quarter);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
        <header className="bg-bulldogs-blue text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    ←
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">TEAM ROSTER</h1>
                  <p className="text-yellow-300 text-sm font-semibold">Bali Bulldogs Club Manager</p>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="outline" className="text-blue-900 border-white hover:bg-blue-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="mb-6 border-bulldogs-blue/30 shadow-lg">
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

          <div className="space-y-8">
            {teamGroups.length === 0 ? (
              <Card className="border-bulldogs-blue/30 shadow-lg">
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
                <Card key={group.name} className="border-bulldogs-blue/30 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-bulldogs-blue to-bulldogs-blue/90 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-black">{group.name}</CardTitle>
                        <CardDescription className="text-yellow-300 font-semibold">
                          {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <div className="bg-bulldogs-yellow/20 rounded-full p-3">
                        <Users className="w-6 h-6 text-bulldogs-yellow" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-black">{group.name}</h2>
                      <Button 
                        onClick={() => {
                          // Navigate to members page with team pre-selected
                          localStorage.setItem("preselected_team", group.name);
                          window.location.href = "/members";
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member to Team
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.members.map((member) => (
                        <Card
                          key={member.id}
                          className="border-gray-200 hover:border-bulldogs-yellow hover:shadow-md transition-all"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-bulldogs-blue">
                                  {member.firstName} {member.lastName}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {member.shirtNumber && (
                                    <Badge variant="outline" className="text-xs border-bulldogs-blue text-bulldogs-blue">
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
                                <Badge className="bg-bulldogs-yellow text-bulldogs-blue font-bold text-xs">
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
                                  <Calendar className="w-4 h-4 text-bulldogs-blue/60" />
                                  <span>Age {calculateAge(member.dateOfBirth)}</span>
                                </div>
                              )}
                              {member.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-bulldogs-blue/60" />
                                  <span className="truncate">{member.email}</span>
                                </div>
                              )}
                              {member.contactNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-bulldogs-blue/60" />
                                  <span>{member.contactNumber}</span>
                                </div>
                              )}
                              {member.joiningDate && (
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-bulldogs-blue/60" />
                                  <span>Joined {formatDate(member.joiningDate)}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">2026 Payment Status:</p>
                              <div className="flex flex-wrap gap-1">
                                {["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4"].map(quarter => {
                                  const invoice = getMemberPaymentStatus(member.id, quarter);
                                  const isPaid = invoice?.status === "Paid";
                                  return (
                                    <Badge
                                      key={quarter}
                                      variant={isPaid ? "default" : "outline"}
                                      className={`text-xs ${
                                        isPaid
                                          ? "bg-green-100 text-green-800 border-green-300"
                                          : "bg-gray-100 text-gray-600 border-gray-300"
                                      }`}
                                    >
                                      {quarter.split(" ")[1]}
                                    </Badge>
                                  );
                                })}
                              </div>
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
        </main>
      </div>
    </>
  );
}