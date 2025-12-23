import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Receipt, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  shirtNumber?: number;
  type: "Junior" | "Youth" | "Adult";
  role: "Player" | "Coach" | "Admin";
  team: string;
  membershipCategory: "Standard" | "Sponsored" | "Scholarship";
  joiningDate: string;
  contactNumber: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact?: string;
  secondaryContactNumber?: string;
  medicalNotes?: string;
  privateCoachingCredits: number;
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

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const storedMembers = localStorage.getItem("members");
    const storedInvoices = localStorage.getItem("invoices");
    
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
  }, []);

  const totalMembers = members.length;
  const newMembersThisMonth = members.filter(m => {
    const joinDate = new Date(m.joiningDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  const outstandingInvoices = invoices.filter(inv => inv.status !== "Paid").length;

  const teamDistribution = members.reduce((acc, member) => {
    acc[member.team] = (acc[member.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const membershipDistribution = members.reduce((acc, member) => {
    acc[member.membershipCategory] = (acc[member.membershipCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <SEO 
        title="Bali Bulldogs Club Manager - Dashboard"
        description="Internal CRM and admin dashboard for Bali Bulldogs Football Club"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
        <header className="bg-bulldogs-blue text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚽</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">BALI BULLDOGS</h1>
                  <p className="text-yellow-300 text-sm font-semibold">Club Manager</p>
                </div>
              </div>
              <nav className="hidden md:flex gap-4">
                <Link href="/members">
                  <Button variant="ghost" className="text-white hover:bg-white/20">
                    <Users className="mr-2 h-4 w-4" />
                    Members
                  </Button>
                </Link>
                <Link href="/invoices">
                  <Button variant="ghost" className="text-white hover:bg-white/20">
                    <Receipt className="mr-2 h-4 w-4" />
                    Invoices
                  </Button>
                </Link>
                <Link href="/coaching">
                  <Button variant="ghost" className="text-white hover:bg-white/20">
                    <Calendar className="mr-2 h-4 w-4" />
                    Coaching
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-bulldogs-blue mb-2">Dashboard</h2>
            <p className="text-gray-600">Welcome to the Bali Bulldogs Club Management System</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-bulldogs-blue shadow-md hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-bulldogs-blue">{totalMembers}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-yellow-500 shadow-md hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  New This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-yellow-600">{newMembersThisMonth}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-500 shadow-md hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Outstanding Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-red-600">{outstandingInvoices}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500 shadow-md hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenue Tracked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-green-600">
                  {invoices.filter(i => i.status === "Paid").length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Paid invoices</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-black text-bulldogs-blue">Players per Team</CardTitle>
                <CardDescription>Distribution across all teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(teamDistribution).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([team, count]) => (
                    <div key={team} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-semibold text-sm w-24">{team}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div 
                            className="bg-bulldogs-blue h-full rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(count / Math.max(...Object.values(teamDistribution))) * 100}%` }}
                          >
                            <span className="text-xs font-bold text-white">{count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {Object.keys(teamDistribution).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No members yet. Add your first member to see statistics.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-black text-bulldogs-blue">Membership Categories</CardTitle>
                <CardDescription>Standard vs Sponsored vs Scholarship</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(membershipDistribution).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="font-semibold">{category}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-6">
                          <div 
                            className={`h-full rounded-full ${
                              category === "Standard" ? "bg-blue-500" : 
                              category === "Sponsored" ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${(count / totalMembers) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-lg w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {Object.keys(membershipDistribution).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No members yet. Add your first member to see statistics.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/members">
              <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Users className="h-8 w-8" />
                    Member Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100">View and manage all club members, contacts, and details</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/invoices">
              <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Receipt className="h-8 w-8" />
                    Invoicing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-100">Generate and track quarterly membership invoices</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/coaching">
              <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-green-500 to-green-700 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <Calendar className="h-8 w-8" />
                    Private Coaching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-100">Schedule 1-on-1 sessions and manage coach availability</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}