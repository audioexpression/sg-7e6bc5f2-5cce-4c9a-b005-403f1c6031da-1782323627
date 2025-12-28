import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, TrendingUp, AlertCircle, DollarSign, Calendar, ArrowRight, 
  Settings, Activity, CreditCard, Award, UserPlus, Clock, ArrowUpRight,
  TrendingDown, Percent, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Gift, Cake, CheckCircle2
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { useRouter } from "next/router";
import Link from "next/link";
import { loadCoaches } from "@/lib/coach-types";

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

  // Filter states
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year" | "all" | "custom">("quarter");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Load Data
  useEffect(() => {
    setMounted(true);
    const loadedMembers = JSON.parse(localStorage.getItem("members") || "[]");
    const loadedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const loadedSessions = JSON.parse(localStorage.getItem("privateCoachingSessions") || "[]");
    const loadedCoaches = JSON.parse(localStorage.getItem("coaches") || "[]");
    setMembers(loadedMembers);
    setInvoices(loadedInvoices);
    setSessions(loadedSessions);
    setCoaches(loadedCoaches);
  }, []);

  // --- Calculations ---

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11
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

  // Filter Logic
  const filteredMembers = members.filter(member => {
    // Team Filter
    if (selectedTeam !== "all" && member.teamAssignment !== selectedTeam) return false;
    // Category Filter
    if (selectedCategory !== "all" && member.category !== selectedCategory) return false;
    // Type Filter
    if (selectedType !== "all" && member.type !== selectedType) return false;
    
    // Date Range Filter (based on Joining Date for members)
    if (!member.joiningDate) return false;
    const joinDate = new Date(member.joiningDate);
    
    if (dateRange === "month") {
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }
    if (dateRange === "quarter") {
      return getQuarter(joinDate) === getQuarter(currentDate) && joinDate.getFullYear() === currentYear;
    }
    if (dateRange === "year") {
      return joinDate.getFullYear() === currentYear;
    }
    // "all" and "custom" (simplified for now) include all for date check on members list
    // usually dashboard overview shows snapshot of current active members, 
    // but for "New Members" stats we need time constraints.
    // For the main list, we usually want ALL active members that match criteria, 
    // but the KPIs (New, Revenue) will respect the date range.
    
    // For the purpose of "Filtered Members" list generally showing "Active Members matching criteria":
    // If date range is "This Month", do we only show members JOINED this month? 
    // Or members ACTIVE this month?
    // Usually dashboards filter *Activity* by date.
    // Let's assume filteredMembers implies "Members matching static criteria (Team/Cat/Type)".
    // And SPECIFIC KPIs will use dateRange.
    
    // HOWEVER, to support the requested "Filter Dashboard Data" broadly:
    // If user selects "This Month", they expect to see data relevant to this month.
    // For a member list, that's ambiguous.
    // Let's stick to: FilteredMembers respects Team, Category, Type.
    // Date logic is applied per-metric where appropriate.
    
    return true;
  });

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

  // Paid Members (Revenue Generating)
  const paidMembersCount = members.filter(m => 
    m.type === "Member" && 
    invoices.some(inv => inv.memberId === m.id && inv.status === "Paid")
  ).length;

  // 2. Financial Metrics
  const paidInvoices = invoices.filter(inv => inv.status === "Paid");
  
  // Total Revenue (All Time)
  const totalRevenueAllTime = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  
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
  const avgRevenuePerMember = paidMembersCount > 0 ? totalRevenueAllTime / paidMembersCount : 0;

  // Renewals Logic
  const membersNeedingRenewal = filteredMembers.filter(m => {
    if (!m.joiningDate) return false;
    const joinDate = new Date(m.joiningDate);
    const renewalMonth = joinDate.getMonth();
    const currentMonth = new Date().getMonth();
    // Simple check: renewal due this quarter?
    const renewalQuarter = Math.floor(renewalMonth / 3);
    const currentQuarter = Math.floor(currentMonth / 3);
    return renewalQuarter === currentQuarter;
  });

  // Coaching Stats Calculations
  // Note: Using 'sessions' (all sessions) instead of filtered to show global coaching status, 
  // or we could use filteredSessions if we had that logic. For now, using global 'sessions'.
  const completedSessions = sessions.filter(s => s.status === "Completed").length;
  const upcomingSessions = sessions.filter(s => s.status === "Scheduled").length;
  const membersWithCredits = members.filter(m => m.coachingCredits > 0);

  // Revenue Trends (Mock simulation based on existing invoices if periods matched, or simplified grouping)
  // Grouping paid invoices by billing period for trend
  const revenueTrendMap: Record<string, number> = {};
  paidInvoices.forEach(inv => {
    revenueTrendMap[inv.billingPeriod] = (revenueTrendMap[inv.billingPeriod] || 0) + inv.amount;
  });
  // If not enough data, we might need dummy data for visual, but let's try to use what we have
  const revenueTrendData = Object.entries(revenueTrendMap).map(([period, amount]) => ({
    name: period,
    amount
  })).sort((a, b) => a.name.localeCompare(b.name));


  // 3. Analytics
  
  // Age Group Distribution (Category: Junior, Youth, Adult)
  const ageDistribution = [
    { name: "Junior", value: members.filter(m => m.category === "Junior").length, fill: "#FBBF24" }, // Yellow
    { name: "Youth", value: members.filter(m => m.category === "Youth").length, fill: "#3B82F6" },   // Blue
    { name: "Adult", value: members.filter(m => m.category === "Adult").length, fill: "#1E40AF" },   // Dark Blue
  ];

  // Team Size Changes
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

  // Member Growth Over Time (Cumulative)
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
  
  // Reduce points for chart clarity
  const growthData = growthDataRaw.reduce((acc: any[], curr) => {
    const last = acc[acc.length - 1];
    if (!last || last.date !== curr.date) {
      acc.push(curr);
    } else {
      last.count = curr.count;
    }
    return acc;
  }, []);

  // 4. Coaching
  const coachingRevenue = sessions
    .filter(s => s.status === "Completed" || s.status === "Scheduled") 
    .reduce((sum, s) => sum + s.cost, 0);

  // Sessions by Month (Utilization)
  const sessionsByMonth: Record<string, number> = {};
  sessions.forEach(s => {
    const d = new Date(s.date);
    const key = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    sessionsByMonth[key] = (sessionsByMonth[key] || 0) + 1;
  });
  const sessionsTrendData = Object.entries(sessionsByMonth).map(([name, sessions]) => ({ name, sessions }));

  // 5. Activity Feeds
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
    .slice(0, 5);

  // Upcoming Birthdays (This Month)
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

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
                      <Link href="/invoices" className="text-sm text-green-600 hover:underline">View All</Link>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentInvoices.length > 0 ? recentInvoices.map((inv, i) => {
                          const m = members.find(mem => mem.id === inv.memberId);
                          return (
                            <div key={i} className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg border border-green-100">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <DollarSign className="h-4 w-4 text-green-700" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{m ? `${m.firstName} ${m.lastName}` : "Unknown Member"}</p>
                                  <p className="text-xs text-gray-500">{inv.billingPeriod}</p>
                                </div>
                              </div>
                              <span className="font-bold text-green-700 text-sm">+{formatCurrency(inv.amount)}</span>
                            </div>
                          );
                        }) : <p className="text-sm text-gray-500 py-4 text-center">No recent payments recorded.</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Alerts & Action Items */}
                <div className="space-y-6">
                  {/* Overdue Alerts */}
                  <Card className="border-t-4 border-t-red-500 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Overdue Invoices
                      </CardTitle>
                      <CardDescription>Action required immediately</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {outstandingInvoicesList.length > 0 ? (
                        <div className="space-y-4">
                          {outstandingInvoicesList.slice(0, 5).map((inv, i) => {
                             const m = members.find(mem => mem.id === inv.memberId);
                             return (
                               <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                                 <div>
                                   <p className="font-medium text-gray-800">{m ? `${m.firstName} ${m.lastName}` : "Unknown"}</p>
                                   <p className="text-gray-500 text-xs">{inv.billingPeriod}</p>
                                 </div>
                                 <span className="font-bold text-red-600">{formatCurrency(inv.amount)}</span>
                               </div>
                             );
                          })}
                          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 border-red-200" onClick={() => router.push('/invoices')}>
                            View All Outstanding
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                           <div className="bg-green-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2">
                              <Award className="h-6 w-6 text-green-600" />
                           </div>
                           <p className="text-sm font-medium text-gray-900">All Clear!</p>
                           <p className="text-xs text-gray-500">No overdue invoices found.</p>
                        </div>
                      )}
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

                      {/* Membership Renewals Due */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Renewals This Quarter
                        </h4>
                        {membersNeedingRenewal.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No renewals due this quarter</p>
                        ) : (
                          <div className="space-y-2">
                            {membersNeedingRenewal.slice(0, 5).map((member, idx) => {
                              const joinDate = new Date(member.joiningDate);
                              const nextRenewal = new Date(joinDate);
                              nextRenewal.setFullYear(new Date().getFullYear());
                              if (nextRenewal < new Date()) {
                                nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
                              }
                              
                              return (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                  <div>
                                    <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{member.teamAssignment}</p>
                                  </div>
                                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    {nextRenewal.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Collection Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold text-gray-900">{paymentRate.toFixed(1)}%</span>
                      <div className={`p-2 rounded-full ${paymentRate > 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <Percent className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div className={`h-2 rounded-full transition-all duration-1000 ${paymentRate > 80 ? 'bg-green-600' : 'bg-yellow-500'}`} style={{ width: `${paymentRate}%` }}></div>
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
                         <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Lifetime value per paid member</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Projected Annual Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(revenueThisQuarter * 4)}</span>
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                         <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Based on current quarter run rate</p>
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

                <Card>
                   <CardHeader>
                      <CardTitle>Financial Health</CardTitle>
                      <CardDescription>Key ratios</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <div className="space-y-6">
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                               <span>Paid Memberships</span>
                               <span className="font-bold">{((paidMembersCount / members.length) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                               <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(paidMembersCount / members.length) * 100}%`}}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{paidMembersCount} paying / {members.length} total</p>
                         </div>
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                               <span>Scholarship Ratio</span>
                               <span className="font-bold">{((members.filter(m => m.type === "Scholarship").length / members.length) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                               <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(members.filter(m => m.type === "Scholarship").length / members.length) * 100}%`}}></div>
                            </div>
                         </div>
                      </div>
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
                      Rp {coachingRevenue.toLocaleString()}
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
    </>
  );
}