import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, AlertCircle, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRouter } from "next/router";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  shirtNumber?: number;
  type: "Member" | "Sponsored" | "Scholarship";
  role: "Admin" | "Coach" | "Player Coach" | "Player";
  teamAssignment?: string;
  membershipCategory: string;
  joiningDate: string;
  contactNumber: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact?: string;
  secondaryContactNumber?: string;
  medicalNotes?: string;
  coachingCredits: number;
  photo?: string;
}

interface Invoice {
  id: string;
  memberId: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  paymentLink?: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
}

interface CoachingSession {
  id: string;
  memberId: string;
  coachId: string;
  date: string;
  time: string;
  hours: number;
  location: string;
  locationDetails?: string;
  cost: number;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export default function Dashboard() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);

  useEffect(() => {
    const storedMembers = localStorage.getItem("members");
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }

    const storedInvoices = localStorage.getItem("invoices");
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }

    const storedSessions = localStorage.getItem("coachingSessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  // Calculate KPIs
  const totalMembers = members.length;
  
  const newThisMonth = members.filter((member) => {
    const joiningDate = new Date(member.joiningDate);
    const now = new Date();
    return (
      joiningDate.getMonth() === now.getMonth() &&
      joiningDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const leftThisMonth = 0; // TODO: Implement when we add leaving/exit date tracking

  // Only count invoices for "Member" type (exclude Sponsored and Scholarship)
  // Any invoice that is not "Paid" counts as outstanding
  const payingMembers = members.filter(m => m.type === "Member");
  const outstandingInvoices = invoices.filter((inv) => {
    const member = members.find(m => m.id === inv.memberId);
    return member && member.type === "Member" && inv.status !== "Paid";
  }).length;

  const outstandingAmount = invoices
    .filter((inv) => {
      const member = members.find(m => m.id === inv.memberId);
      return member && member.type === "Member" && inv.status !== "Paid";
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Team distribution data
  const teamDistribution = members.reduce((acc: any, member) => {
    if (member.teamAssignment) {
      acc[member.teamAssignment] = (acc[member.teamAssignment] || 0) + 1;
    }
    return acc;
  }, {});

  const teamChartData = Object.entries(teamDistribution)
    .map(([team, count]) => ({ team, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  // Membership category distribution
  const categoryDistribution = members.reduce((acc: any, member) => {
    acc[member.type] = (acc[member.type] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryDistribution).map(([category, count]) => ({
    name: category,
    value: count,
  }));

  const COLORS = ["#1E40AF", "#FBBF24", "#10B981"];

  // Today's coaching sessions
  const today = new Date().toISOString().split("T")[0];
  const todaysSessions = sessions.filter(
    (session) => session.date === today && session.status === "Scheduled"
  );

  return (
    <>
      <SEO
        title="Dashboard - Bali Bulldogs Club Manager"
        description="Club management dashboard for Bali Bulldogs Football Club"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        {/* Hero Section with Logo */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">Bali Bulldogs</h1>
                <p className="text-xl text-blue-100">Club Manager Dashboard</p>
                <p className="text-blue-200 mt-2">Centralized member, team & financial management</p>
              </div>
              <div className="hidden md:block">
                <img 
                  src="/uploads/image_593fedce-c53e-4167-a6fc-886836fbbf61.png" 
                  alt="Bali Bulldogs FC" 
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Users className="h-4 w-4" />
                  TOTAL MEMBERS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{totalMembers}</div>
                <p className="text-sm text-gray-500 mt-1">Active players & staff</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  NEW THIS MONTH
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">{newThisMonth}</div>
                <p className="text-sm text-gray-500 mt-1">Recent joiners</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <TrendingUp className="h-4 w-4 rotate-180" />
                  LEFT THIS MONTH
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">{leftThisMonth}</div>
                <p className="text-sm text-gray-500 mt-1">Recent departures</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  OUTSTANDING INVOICES
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-700">{outstandingInvoices}</div>
                <p className="text-sm text-gray-500 mt-1">Pending payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  OUTSTANDING AMOUNT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">
                  Rp {outstandingAmount.toLocaleString("id-ID")}
                </div>
                <p className="text-sm text-gray-500 mt-1">Total due</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Team Distribution</CardTitle>
                <CardDescription>Top 5 teams by member count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1E40AF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Breakdown</CardTitle>
                <CardDescription>Member, Sponsored & Scholarship distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Today's Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Private Coaching Sessions
              </CardTitle>
              <CardDescription>
                {todaysSessions.length === 0
                  ? "No sessions scheduled for today"
                  : `${todaysSessions.length} session${todaysSessions.length > 1 ? "s" : ""} scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysSessions.length > 0 ? (
                <div className="space-y-4">
                  {todaysSessions.map((session) => {
                    const member = members.find((m) => m.id === session.memberId);
                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">
                            {member ? `${member.firstName} ${member.lastName}` : "Unknown Member"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {session.time} • {session.hours}h • {session.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-900">
                            Rp {session.cost.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No coaching sessions scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Button
              onClick={() => router.push("/members")}
              className="h-20 text-lg bg-blue-600 hover:bg-blue-700"
            >
              <Users className="mr-2 h-5 w-5" />
              Manage Members
              <ArrowRight className="ml-auto h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/teams")}
              className="h-20 text-lg bg-yellow-600 hover:bg-yellow-700"
            >
              <Users className="mr-2 h-5 w-5" />
              View Teams
              <ArrowRight className="ml-auto h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/invoices")}
              className="h-20 text-lg bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Manage Invoices
              <ArrowRight className="ml-auto h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/coaching")}
              className="h-20 text-lg bg-purple-600 hover:bg-purple-700"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Coaching Sessions
              <ArrowRight className="ml-auto h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}