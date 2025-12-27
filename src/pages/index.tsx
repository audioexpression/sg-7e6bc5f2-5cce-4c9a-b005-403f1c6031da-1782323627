import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, AlertCircle, DollarSign, Calendar, ArrowRight, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRouter } from "next/router";
import Link from "next/link";

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

  const stats = {
    totalMembers,
    newThisMonth,
    leftThisMonth,
    outstandingInvoices,
    outstandingAmount
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    TOTAL MEMBERS
                  </p>
                  <span className="text-3xl">🏃</span>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.totalMembers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active players & staff
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    NEW THIS MONTH
                  </p>
                  <span className="text-3xl">📈</span>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.newThisMonth}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recent joiners
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    LEFT THIS MONTH
                  </p>
                  <span className="text-3xl">📉</span>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.leftThisMonth}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recent departures
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    OUTSTANDING INVOICES
                  </p>
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.outstandingInvoices}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending payments
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    OUTSTANDING AMOUNT
                  </p>
                  <span className="text-3xl">💵</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Rp {stats.outstandingAmount.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total due
                </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/members">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Quick Access
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-4xl">👥</span>
                        Manage Members
                      </h3>
                    </div>
                    <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/teams">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-yellow-500 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950 dark:to-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Quick Access
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-4xl">⚽</span>
                        View Teams
                      </h3>
                    </div>
                    <ArrowRight className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/invoices">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Quick Access
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-4xl">💰</span>
                        Manage Invoices
                      </h3>
                    </div>
                    <ArrowRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/coaching">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Quick Access
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-4xl">🎯</span>
                        Coaching Sessions
                      </h3>
                    </div>
                    <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}