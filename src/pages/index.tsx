import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Receipt, Calendar, TrendingUp, Award, DollarSign, Settings, AlertCircle, UserPlus } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  team: string;
  membershipCategory: string;
  joiningDate: string;
  type: string;
}

interface Invoice {
  id: string;
  memberId: string;
  status: string;
  amount: number;
}

interface CoachingSession {
  id: string;
  memberId: string;
  coachId: string;
  date: string;
  time: string;
}

interface Coach {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedMembers = localStorage.getItem("members");
    const storedInvoices = localStorage.getItem("invoices");
    const storedSessions = localStorage.getItem("coachingSessions");
    const storedCoaches = localStorage.getItem("coaches");

    if (storedMembers) setMembers(JSON.parse(storedMembers));
    if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
    if (storedSessions) setSessions(JSON.parse(storedSessions));
    if (storedCoaches) setCoaches(JSON.parse(storedCoaches));
  }, []);

  const totalMembers = members.length;
  
  const newMembersThisMonth = members.filter(m => {
    const joinDate = new Date(m.joiningDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  const outstandingInvoices = invoices.filter(inv => 
    inv.status === "Sent" || inv.status === "Overdue"
  ).length;

  const outstandingAmount = invoices
    .filter(inv => inv.status === "Sent" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const todaysSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const teamCounts = members.reduce((acc, member) => {
    acc[member.team] = (acc[member.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTeams = Object.entries(teamCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const membershipBreakdown = members.reduce((acc, member) => {
    acc[member.membershipCategory] = (acc[member.membershipCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : "Unknown";
  };

  const getCoachName = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId);
    return coach ? coach.name : "Unknown";
  };

  return (
    <>
      <SEO 
        title="Dashboard - Bali Bulldogs Club Manager"
        description="Manage members, teams, invoicing, and private coaching for Bali Bulldogs FC"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
        <header className="bg-bulldogs-blue text-white shadow-xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">BALI BULLDOGS</h1>
                <p className="text-yellow-300 text-lg font-bold">Club Management Dashboard</p>
              </div>
              <div className="flex gap-3">
                <Link href="/members">
                  <Button className="bg-yellow-400 text-bulldogs-blue hover:bg-yellow-500 font-bold shadow-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Members
                  </Button>
                </Link>
                <Link href="/invoices">
                  <Button className="bg-yellow-400 text-bulldogs-blue hover:bg-yellow-500 font-bold shadow-lg">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Invoices
                  </Button>
                </Link>
                <Link href="/coaching">
                  <Button className="bg-yellow-400 text-bulldogs-blue hover:bg-yellow-500 font-bold shadow-lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    Coaching
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button className="bg-yellow-400 text-bulldogs-blue hover:bg-yellow-500 font-bold shadow-lg">
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-bulldogs-blue/20 hover:border-bulldogs-blue/40 transition-all">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-semibold text-gray-600">TOTAL MEMBERS</CardDescription>
                <CardTitle className="text-4xl font-black text-bulldogs-blue">{totalMembers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Active players & staff</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-400 transition-all">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-semibold text-gray-600">NEW THIS MONTH</CardDescription>
                <CardTitle className="text-4xl font-black text-green-600">{newMembersThisMonth}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Recent joiners</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-semibold text-gray-600">OUTSTANDING INVOICES</CardDescription>
                <CardTitle className="text-4xl font-black text-orange-600">{outstandingInvoices}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Pending payments</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-semibold text-gray-600">OUTSTANDING AMOUNT</CardDescription>
                <CardTitle className="text-3xl font-black text-purple-600">
                  {outstandingAmount.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Total due</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black text-bulldogs-blue">Top 5 Teams by Size</CardTitle>
                <CardDescription>Players per team</CardDescription>
              </CardHeader>
              <CardContent>
                {topTeams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No team data yet</p>
                    <Link href="/members">
                      <Button className="mt-4 bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Members
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topTeams.map(([team, count], index) => (
                      <div key={team} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-bulldogs-blue text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-800">{team}</span>
                            <span className="text-sm font-semibold text-gray-600">{count} players</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-bulldogs-blue h-2 rounded-full transition-all"
                              style={{ width: `${(count / Math.max(...topTeams.map(([, c]) => c))) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black text-bulldogs-blue">Membership Breakdown</CardTitle>
                <CardDescription>Category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(membershipBreakdown).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No membership data yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(membershipBreakdown).map(([category, count]) => {
                      const percentage = ((count / totalMembers) * 100).toFixed(1);
                      const colorMap = {
                        "Standard": "bg-blue-500",
                        "Sponsored": "bg-yellow-500",
                        "Scholarship": "bg-green-500"
                      };
                      return (
                        <div key={category} className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${colorMap[category as keyof typeof colorMap] || "bg-gray-500"}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-gray-800">{category}</span>
                              <span className="text-sm font-semibold text-gray-600">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${colorMap[category as keyof typeof colorMap] || "bg-gray-500"}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-black text-bulldogs-blue">Today's Private Coaching Sessions</CardTitle>
              <CardDescription>
                {mounted ? new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Loading..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="mb-4">No sessions scheduled for today</p>
                  <Link href="/coaching">
                    <Button className="bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                      <Calendar className="mr-2 h-4 w-4" />
                      View All Sessions
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-bulldogs-blue text-white px-3 py-2 rounded-lg font-bold text-sm">
                          {session.time}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{getMemberName(session.memberId)}</div>
                          <div className="text-sm text-gray-600">with {getCoachName(session.coachId)}</div>
                        </div>
                      </div>
                      <Link href="/coaching">
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-r from-bulldogs-blue to-blue-700 text-white border-none">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Quick Actions</CardTitle>
                <CardDescription className="text-blue-100">Jump to key management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/members">
                    <Button className="bg-yellow-400 text-bulldogs-blue hover:bg-yellow-500 font-bold">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Add New Member
                    </Button>
                  </Link>
                  <Link href="/invoices">
                    <Button className="bg-white text-bulldogs-blue hover:bg-gray-100 font-bold">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Generate Invoices
                    </Button>
                  </Link>
                  <Link href="/coaching">
                    <Button className="bg-white text-bulldogs-blue hover:bg-gray-100 font-bold">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Session
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-bulldogs-blue text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-yellow-300 font-bold">Bali Bulldogs Football Club</p>
            <p className="text-sm mt-1 opacity-80">Internal Club Management System</p>
          </div>
        </footer>
      </div>
    </>
  );
}