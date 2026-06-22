import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, TrendingUp, AlertCircle, DollarSign, Calendar,
  Activity, CreditCard, Award, UserPlus, Clock, Percent, BarChart3, 
  Gift, Cake, CheckCircle2
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";

// --- Interfaces ---

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  category: "Junior" | "Youth" | "Adult"; // Age Group
  type: "Member" | "Sponsored" | "Scholarship"; // Funding Status
  role: string;
  teamAssignment?: string;
  joiningDate: string;
  dateOfBirth: string;
  contactNumber: string;
  coachingCredits: number;
  photoUrl?: string;
}

interface Invoice {
  id: string;
  memberId: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
}

interface CoachingSession {
  id: string;
  memberId: string;
  coachId: string;
  date: string;
  time: string;
  hours: number;
  cost: number;
  status: "Scheduled" | "Completed" | "Cancelled";
}

interface Team {
  id: string;
  name: string;
  category: string;
  monthlyFee: number;
}

interface Coach {
  id: string;
  name: string;
  role: string;
  rate: number;
  email?: string;
  phone?: string;
}

// --- Helper Functions ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getInitials = (first: string, last: string) => {
  return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
};

export default function Dashboard() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  
  // Add mounted state to prevent hydration issues
  const [mounted, setMounted] = useState(false);

  // Load Data
  useEffect(() => {
    setMounted(true);
    const loadedMembers = JSON.parse(localStorage.getItem("members") || "[]");
    const loadedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const loadedSessions = JSON.parse(localStorage.getItem("privateCoachingSessions") || "[]");
    const loadedCoaches = JSON.parse(localStorage.getItem("coaches") || "[]");
    const loadedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    setMembers(loadedMembers);
    setInvoices(loadedInvoices);
    setSessions(loadedSessions);
    setCoaches(loadedCoaches);
    setTeams(loadedTeams);
  }, []);

  // --- Calculations ---

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Determine Quarter
  const getQuarter = (date: Date) => {
    const month = date.getMonth() + 1;
    if (month <= 3) return "Q1";
    if (month <= 6) return "Q2";
    if (month <= 9) return "Q3";
    return "Q4";
  };
  const currentQuarterLabel = `${currentYear} ${getQuarter(currentDate)}`;

  // 1. Overview KPIs
  const totalMembers = members.length;
  
  // New This Quarter
  const newThisQuarter = members.filter((member) => {
    if (!member.joiningDate) return false;
    const joinDate = new Date(member.joiningDate);
    return (
      joinDate.getFullYear() === currentYear &&
      getQuarter(joinDate) === getQuarter(currentDate)
    );
  }).length;

  // Paid Members (Revenue Generating) - For revenue calculation
  const payingMembersCount = members.filter(m => m.type === "Member").length;
  const sponsoredMembersCount = members.filter(m => m.type === "Sponsored").length;
  const scholarshipMembersCount = members.filter(m => m.type === "Scholarship").length;

  // 2. Financial Metrics
  const paidInvoices = invoices.filter(inv => inv.status === "Paid");
  
  // Revenue This Quarter
  const revenueThisQuarter = paidInvoices
    .filter(inv => inv.billingPeriod === currentQuarterLabel)
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Outstanding
  const outstandingInvoicesList = invoices.filter(inv => inv.status !== "Paid" && inv.status !== "Draft");
  const outstandingAmount = outstandingInvoicesList.reduce((sum, inv) => sum + inv.amount, 0);
  const outstandingCount = outstandingInvoicesList.length;

  // Payment Rate
  const totalSentInvoices = invoices.filter(inv => inv.status !== "Draft").length;
  const paymentRate = totalSentInvoices > 0 ? (paidInvoices.length / totalSentInvoices) * 100 : 0;

  // Revenue by Team
  const revenueByTeam: Record<string, number> = {};
  paidInvoices.forEach(inv => {
    const member = members.find(m => m.id === inv.memberId);
    if (member && member.teamAssignment) {
      revenueByTeam[member.teamAssignment] = (revenueByTeam[member.teamAssignment] || 0) + inv.amount;
    }
  });
  const revenueByTeamData = Object.entries(revenueByTeam)
    .map(([team, amount]) => ({ team, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  // Average Revenue Per Member
  const totalRevenueAllTime = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const avgRevenuePerMember = payingMembersCount > 0 ? totalRevenueAllTime / payingMembersCount : 0;

  // Renewals Logic
  const membersNeedingRenewal = members.filter(m => {
    if (!m.joiningDate) return false;
    const joinDate = new Date(m.joiningDate);
    const renewalMonth = joinDate.getMonth();
    const currentMonth = new Date().getMonth();
    const renewalQuarter = Math.floor(renewalMonth / 3);
    const currentQuarter = Math.floor(currentMonth / 3);
    return renewalQuarter === currentQuarter;
  });

  // Coaching Stats
  const completedSessions = sessions.filter(s => s.status === "Completed").length;
  const upcomingSessions = sessions.filter(s => s.status === "Scheduled").length;
  const membersWithCredits = members.filter(m => m.coachingCredits > 0);
  const totalCoachingRevenue = sessions
    .filter(s => s.status === "Completed" || s.status === "Scheduled") 
    .reduce((sum, s) => sum + s.cost, 0);

  // Scholarship & Sponsorship Value
  const scholarshipValueQuarterly = members
    .filter(m => m.type === "Scholarship" || m.type === "Sponsored")
    .reduce((sum, m) => {
      const team = teams.find(t => t.name === m.teamAssignment);
      return sum + ((team?.monthlyFee || 0) * 3);
    }, 0);

  // Revenue Trends
  const revenueTrendMap: Record<string, number> = {};
  paidInvoices.forEach(inv => {
    revenueTrendMap[inv.billingPeriod] = (revenueTrendMap[inv.billingPeriod] || 0) + inv.amount;
  });
  const revenueTrendData = Object.entries(revenueTrendMap).map(([period, amount]) => ({
    name: period,
    amount
  })).sort((a, b) => a.name.localeCompare(b.name));

  // Analytics
  const ageDistribution = [
    { name: "Junior", value: members.filter(m => m.category === "Junior").length, fill: "#FBBF24" },
    { name: "Youth", value: members.filter(m => m.category === "Youth").length, fill: "#3B82F6" },
    { name: "Adult", value: members.filter(m => m.category === "Adult").length, fill: "#1E40AF" },
  ];

  const teamSizes: Record<string, number> = {};
  members.forEach(m => {
    if (m.teamAssignment) {
      teamSizes[m.teamAssignment] = (teamSizes[m.teamAssignment] || 0) + 1;
    }
  });
  const teamSizeData = Object.entries(teamSizes)
    .map(([name, size]) => ({ name, size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  // Member Growth
  const sortedJoinDates = [...members]
    .filter(m => m.joiningDate)
    .sort((a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime());

  let cumulativeCount = 0;
  const growthDataRaw = sortedJoinDates.map(m => {
    cumulativeCount++;
    return {
      date: new Date(m.joiningDate).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      count: cumulativeCount
    };
  });
  
  const growthData = growthDataRaw.reduce((acc: any[], curr) => {
    const last = acc[acc.length - 1];
    if (!last || last.date !== curr.date) {
      acc.push(curr);
    } else {
      last.count = curr.count;
    }
    return acc;
  }, []);

  const coachingRevenueGraph = sessions
    .filter(s => s.status === "Completed" || s.status === "Scheduled") 
    .reduce((sum, s) => sum + s.cost, 0);

  const recentMembers = [...members]
    .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
    .slice(0, 5);

  const upcomingBirthdays = members
    .filter(m => {
      if (!m.dateOfBirth) return false;
      const dob = new Date(m.dateOfBirth);
      const today = new Date();
      return dob.getMonth() === today.getMonth();
    })
    .sort((a, b) => {
      const dobA = new Date(a.dateOfBirth!);
      const dobB = new Date(b.dateOfBirth!);
      return dobA.getDate() - dobB.getDate();
    })
    .slice(0, 5);

  const recentInvoices = [...invoices]
    .filter(i => i.status === "Paid")
    .slice(0, 5);

  return (
    <>
      <SEO title="Dashboard - Bali Bulldogs Club Manager" />
      <Layout>
      <div className="min-h-screen bg-gray-50/50 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back! Here's what's happening with Bali Bulldogs FC
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              {mounted ? (
                <span suppressHydrationWarning>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              ) : (
                <span>Loading...</span>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white p-1 border shadow-sm rounded-lg h-auto grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="overview" className="py-2.5 gap-2"><Activity className="w-4 h-4"/> Overview</TabsTrigger>
              <TabsTrigger value="financials" className="py-2.5 gap-2"><DollarSign className="w-4 h-4"/> Financials</TabsTrigger>
              <TabsTrigger value="analytics" className="py-2.5 gap-2"><BarChart3 className="w-4 h-4"/> Analytics</TabsTrigger>
              <TabsTrigger value="coaching" className="py-2.5 gap-2"><Clock className="w-4 h-4"/> Coaching</TabsTrigger>
            </TabsList>

            {/* --- OVERVIEW TAB --- */}
            <TabsContent value="overview" className="space-y-6">
              {/* Top KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Members</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalMembers}</h3>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{newThisQuarter} this quarter
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Revenue ({currentQuarterLabel})</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">
                          {formatCurrency(revenueThisQuarter).replace(",00", "").replace("Rp", "")}
                          <span className="text-sm font-normal text-gray-500 ml-1">M</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Confirmed payments</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Outstanding</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{outstandingCount}</h3>
                        <p className="text-sm text-red-600 mt-1">
                          {formatCurrency(outstandingAmount)} overdue
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Coaches</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">
                          {coaches.length}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {sessions.filter(s => s.status === "Scheduled").length} sessions booked
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Recent Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                   {/* Quick Actions */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/members?action=add" className="block">
                      <Card className="hover:border-blue-500 cursor-pointer transition-all hover:shadow-md bg-white">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <UserPlus className="h-6 w-6 text-blue-600 mb-2" />
                          <span className="font-medium text-xs">Add Member</span>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/invoices" className="block">
                      <Card className="hover:border-green-500 cursor-pointer transition-all hover:shadow-md bg-white">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <CreditCard className="h-6 w-6 text-green-600 mb-2" />
                          <span className="font-medium text-xs">Create Invoice</span>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/coaching" className="block">
                      <Card className="hover:border-purple-500 cursor-pointer transition-all hover:shadow-md bg-white">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                          <span className="font-medium text-xs">Book Coach</span>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/teams" className="block">
                      <Card className="hover:border-yellow-500 cursor-pointer transition-all hover:shadow-md bg-white">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <Users className="h-6 w-6 text-yellow-500 mb-2" />
                          <span className="font-medium text-xs">View Teams</span>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-semibold">Latest Member Additions</CardTitle>
                      <Link href="/members" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentMembers.map((member, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border bg-gray-100">
                                {member.photoUrl ? (
                                  <AvatarImage src={member.photoUrl} alt={member.firstName} />
                                ) : (
                                  <AvatarFallback className="text-blue-700 font-bold">
                                    {getInitials(member.firstName, member.lastName)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {member.teamAssignment || "No Team"} • {member.category}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="text-xs">{member.type}</Badge>
                              <p className="text-xs text-gray-400 mt-1">Joined {new Date(member.joiningDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Alerts & Action Items */}
                <div className="space-y-6">
                  {/* Financial Health Stats (Updated) */}
                   <Card>
                   <CardHeader>
                      <CardTitle>Member Breakdown</CardTitle>
                      <CardDescription>Membership type distribution</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <div className="space-y-6">
                         {/* Paid */}
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Paid / Standard</span>
                               <span className="font-bold">{members.length > 0 ? ((payingMembersCount / members.length) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                               <div className="bg-blue-600 h-2 rounded-full" style={{width: `${members.length > 0 ? (payingMembersCount / members.length) * 100 : 0}%`}}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{payingMembersCount} members</p>
                         </div>
                         
                         {/* Sponsored */}
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Sponsored</span>
                               <span className="font-bold">{members.length > 0 ? ((sponsoredMembersCount / members.length) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                               <div className="bg-green-500 h-2 rounded-full" style={{width: `${members.length > 0 ? (sponsoredMembersCount / members.length) * 100 : 0}%`}}></div>
                            </div>
                             <p className="text-xs text-gray-500 mt-1">{sponsoredMembersCount} members</p>
                         </div>

                         {/* Scholarship */}
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Scholarship</span>
                               <span className="font-bold">{members.length > 0 ? ((scholarshipMembersCount / members.length) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                               <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${members.length > 0 ? (scholarshipMembersCount / members.length) * 100 : 0}%`}}></div>
                            </div>
                             <p className="text-xs text-gray-500 mt-1">{scholarshipMembersCount} members</p>
                         </div>
                      </div>
                   </CardContent>
                </Card>

                  {/* Birthdays & Renewals */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-500" />
                        Birthdays & Renewals
                      </CardTitle>
                      <CardDescription>Upcoming dates to remember</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Birthdays This Month */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Cake className="h-4 w-4" />
                          Birthdays This Month
                        </h4>
                        {upcomingBirthdays.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No birthdays this month</p>
                        ) : (
                          <div className="space-y-2">
                            {upcomingBirthdays.map((member, idx) => {
                              const dob = new Date(member.dateOfBirth!);
                              const birthdayDate = dob.toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric' 
                              });
                              return (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-sm font-medium">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {member.category} • {member.teamAssignment}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                      {birthdayDate}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Turns {new Date().getFullYear() - dob.getFullYear()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* --- FINANCIALS TAB --- */}
            <TabsContent value="financials" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Collection Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{paymentRate.toFixed(1)}%</span>
                      <div className={`p-2 rounded-full ${paymentRate > 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <Percent className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                      <div className={`h-1.5 rounded-full transition-all duration-1000 ${paymentRate > 80 ? 'bg-green-600' : 'bg-yellow-500'}`} style={{ width: `${paymentRate}%` }}></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Avg. Revenue / Member</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(avgRevenuePerMember)}</span>
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                         <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Lifetime value</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Coaching Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalCoachingRevenue)}</span>
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                         <Activity className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total session value</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Sponsorship Value (Qtr)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(scholarshipValueQuarterly)}</span>
                      <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                         <Award className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Subsidized fees</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Income over billing periods</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueTrendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#6b7280'}} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value/1000000}M`} tick={{fill: '#6b7280'}} />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value as number)}
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                        />
                        <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Team</CardTitle>
                    <CardDescription>Top revenue generating squads</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByTeamData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="team" type="category" width={100} tick={{fontSize: 12, fill: '#374151'}} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="amount" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* --- ANALYTICS TAB --- */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Growth Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Membership Growth Trajectory</CardTitle>
                    <CardDescription>Cumulative members joined over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis tick={{fontSize: 12, fill: '#6b7280'}} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Age Group Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Age Group Distribution</CardTitle>
                    <CardDescription>Breakdown by player category (Junior vs Youth vs Adult)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ageDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {ageDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Team Sizes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Size Distribution</CardTitle>
                    <CardDescription>Number of players per squad</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] overflow-y-auto">
                     <div className="space-y-4">
                        {teamSizeData.map((team, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{team.name}</span>
                              <div className="flex items-center gap-3 w-1/2">
                                 <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-slate-600 h-2 rounded-full" style={{width: `${(team.size / Math.max(...teamSizeData.map(t => t.size))) * 100}%`}}></div>
                                 </div>
                                 <span className="text-xs font-bold w-6">{team.size}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Coaching Tab */}
            <TabsContent value="coaching" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Coaching Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Rp {coachingRevenueGraph.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      From private sessions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedSessions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions Scheduled</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{upcomingSessions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upcoming bookings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{membersWithCredits.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Members using coaching
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Simple note about coaching */}
              <Card>
                <CardHeader>
                  <CardTitle>Private Coaching Overview</CardTitle>
                  <CardDescription>
                    Private coaching is available for select members. View the Coaching page for full session management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/coaching')}
                    className="w-full md:w-auto"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Coaching Sessions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </Layout>
    </>
  );
}