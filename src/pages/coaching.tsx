import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, Edit, Trash2, ArrowLeft, UserPlus, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface Coach {
  id: string;
  name: string;
  phone: string;
  tier: "Head Coach" | "Goalkeeper Coach" | "Senior Coach" | "Assistant Coach";
  rate: number;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  privateCoachingCredits: number;
}

interface Session {
  id: string;
  memberId: string;
  memberName: string;
  coachId: string;
  coachName: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  creditsUsed: number;
}

const tierRates = {
  "Head Coach": 750000,
  "Goalkeeper Coach": 600000,
  "Senior Coach": 500000,
  "Assistant Coach": 400000,
};

export default function Coaching() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState("sessions");
  
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [doubleBookingWarning, setDoubleBookingWarning] = useState("");

  const [coachForm, setCoachForm] = useState<Omit<Coach, "id">>({
    name: "",
    phone: "",
    tier: "Assistant Coach",
    rate: 400000,
  });

  const [sessionForm, setSessionForm] = useState({
    memberId: "",
    coachId: "",
    date: "",
    time: "",
    repeatWeeks: 1,
  });

  useEffect(() => {
    const storedCoaches = localStorage.getItem("coaches");
    const storedSessions = localStorage.getItem("sessions");
    const storedMembers = localStorage.getItem("members");
    
    if (storedCoaches) setCoaches(JSON.parse(storedCoaches));
    if (storedSessions) setSessions(JSON.parse(storedSessions));
    if (storedMembers) setMembers(JSON.parse(storedMembers));
  }, []);

  const checkDoubleBooking = (coachId: string, date: string, time: string): boolean => {
    return sessions.some(
      session => 
        session.coachId === coachId && 
        session.date === date && 
        session.time === time &&
        session.status === "Scheduled" &&
        (!editingSession || session.id !== editingSession.id)
    );
  };

  const saveCoach = () => {
    let updatedCoaches: Coach[];
    
    if (editingCoach) {
      updatedCoaches = coaches.map(c => c.id === editingCoach.id ? { ...coachForm, id: editingCoach.id } : c);
    } else {
      const newCoach = { ...coachForm, id: Date.now().toString() };
      updatedCoaches = [...coaches, newCoach];
    }
    
    setCoaches(updatedCoaches);
    localStorage.setItem("coaches", JSON.stringify(updatedCoaches));
    resetCoachForm();
  };

  const saveSession = () => {
    if (checkDoubleBooking(sessionForm.coachId, sessionForm.date, sessionForm.time)) {
      setDoubleBookingWarning("⚠️ This coach is already booked at this time!");
      return;
    }

    const member = members.find(m => m.id === sessionForm.memberId);
    const coach = coaches.find(c => c.id === sessionForm.coachId);
    if (!member || !coach) return;

    const newSessions: Session[] = [];
    
    for (let week = 0; week < sessionForm.repeatWeeks; week++) {
      const sessionDate = new Date(sessionForm.date);
      sessionDate.setDate(sessionDate.getDate() + (week * 7));
      const formattedDate = sessionDate.toISOString().split("T")[0];

      if (week > 0 && checkDoubleBooking(sessionForm.coachId, formattedDate, sessionForm.time)) {
        alert(`Skipped week ${week + 1} due to existing booking`);
        continue;
      }

      const session: Session = {
        id: `${Date.now()}-${week}`,
        memberId: sessionForm.memberId,
        memberName: `${member.firstName} ${member.lastName}`,
        coachId: sessionForm.coachId,
        coachName: coach.name,
        date: formattedDate,
        time: sessionForm.time,
        status: "Scheduled",
        creditsUsed: 1,
      };
      newSessions.push(session);
    }

    const updatedSessions = [...sessions, ...newSessions];
    setSessions(updatedSessions);
    localStorage.setItem("sessions", JSON.stringify(updatedSessions));

    const updatedMembers = members.map(m => 
      m.id === sessionForm.memberId 
        ? { ...m, privateCoachingCredits: m.privateCoachingCredits - newSessions.length }
        : m
    );
    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));

    resetSessionForm();
  };

  const deleteCoach = (id: string) => {
    if (confirm("Delete this coach? All their sessions will remain but show as 'Unknown Coach'.")) {
      const updated = coaches.filter(c => c.id !== id);
      setCoaches(updated);
      localStorage.setItem("coaches", JSON.stringify(updated));
    }
  };

  const deleteSession = (id: string) => {
    if (confirm("Delete this session?")) {
      const session = sessions.find(s => s.id === id);
      if (session && session.status === "Scheduled") {
        const updatedMembers = members.map(m => 
          m.id === session.memberId 
            ? { ...m, privateCoachingCredits: m.privateCoachingCredits + session.creditsUsed }
            : m
        );
        setMembers(updatedMembers);
        localStorage.setItem("members", JSON.stringify(updatedMembers));
      }

      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      localStorage.setItem("sessions", JSON.stringify(updated));
    }
  };

  const updateSessionStatus = (id: string, status: "Scheduled" | "Completed" | "Cancelled") => {
    const updated = sessions.map(s => s.id === id ? { ...s, status } : s);
    setSessions(updated);
    localStorage.setItem("sessions", JSON.stringify(updated));
  };

  const resetCoachForm = () => {
    setCoachForm({
      name: "",
      phone: "",
      tier: "Assistant Coach",
      rate: 400000,
    });
    setEditingCoach(null);
    setIsCoachDialogOpen(false);
  };

  const resetSessionForm = () => {
    setSessionForm({
      memberId: "",
      coachId: "",
      date: "",
      time: "",
      repeatWeeks: 1,
    });
    setEditingSession(null);
    setIsSessionDialogOpen(false);
    setDoubleBookingWarning("");
  };

  const openEditCoach = (coach: Coach) => {
    setCoachForm(coach);
    setEditingCoach(coach);
    setIsCoachDialogOpen(true);
  };

  const filteredSessions = sessions.filter(session =>
    session.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.coachName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaySessions = sessions.filter(s => {
    const today = new Date().toISOString().split("T")[0];
    return s.date === today && s.status === "Scheduled";
  });

  const upcomingSessions = sessions.filter(s => {
    const today = new Date().toISOString().split("T")[0];
    return s.date >= today && s.status === "Scheduled";
  }).sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
  });

  return (
    <>
      <SEO 
        title="Private Coaching - Bali Bulldogs Club Manager"
        description="Schedule and manage 1-on-1 coaching sessions"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100">
        <header className="bg-bulldogs-blue text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">PRIVATE COACHING</h1>
                  <p className="text-yellow-300 text-sm font-semibold">Bali Bulldogs Club Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {todaySessions.length > 0 && (
            <Alert className="mb-6 border-bulldogs-blue bg-blue-50">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Today's Sessions:</strong> {todaySessions.length} session(s) scheduled
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="coaches">Coaches</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black text-bulldogs-blue">Coaching Sessions</CardTitle>
                      <CardDescription>Upcoming: {upcomingSessions.length} sessions</CardDescription>
                    </div>
                    <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                          <Calendar className="h-4 w-4" />
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black text-bulldogs-blue">
                            Book Coaching Session
                          </DialogTitle>
                          <DialogDescription>
                            Schedule a 1-on-1 session with a coach
                          </DialogDescription>
                        </DialogHeader>

                        {doubleBookingWarning && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{doubleBookingWarning}</AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="member">Member *</Label>
                            <Select
                              value={sessionForm.memberId}
                              onValueChange={(value) => {
                                setSessionForm({...sessionForm, memberId: value});
                                setDoubleBookingWarning("");
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.filter(m => m.privateCoachingCredits > 0).map(member => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName} ({member.privateCoachingCredits} credits)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="coach">Coach *</Label>
                            <Select
                              value={sessionForm.coachId}
                              onValueChange={(value) => {
                                setSessionForm({...sessionForm, coachId: value});
                                setDoubleBookingWarning("");
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select coach" />
                              </SelectTrigger>
                              <SelectContent>
                                {coaches.map(coach => (
                                  <SelectItem key={coach.id} value={coach.id}>
                                    {coach.name} ({coach.tier}) - Rp {coach.rate.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="date">Date *</Label>
                              <Input
                                id="date"
                                type="date"
                                value={sessionForm.date}
                                onChange={e => {
                                  setSessionForm({...sessionForm, date: e.target.value});
                                  setDoubleBookingWarning("");
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="time">Time *</Label>
                              <Input
                                id="time"
                                type="time"
                                value={sessionForm.time}
                                onChange={e => {
                                  setSessionForm({...sessionForm, time: e.target.value});
                                  setDoubleBookingWarning("");
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="repeat">Repeat for weeks</Label>
                            <Input
                              id="repeat"
                              type="number"
                              min="1"
                              max="12"
                              value={sessionForm.repeatWeeks}
                              onChange={e => setSessionForm({...sessionForm, repeatWeeks: parseInt(e.target.value) || 1})}
                            />
                            <p className="text-xs text-gray-500">
                              Creates {sessionForm.repeatWeeks} session(s) starting from selected date
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={resetSessionForm}>Cancel</Button>
                          <Button onClick={saveSession} className="bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                            Book Session(s)
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by member or coach..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Coach</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No sessions found. Book your first session to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSessions.map(session => (
                            <TableRow key={session.id}>
                              <TableCell className="font-medium">{session.memberName}</TableCell>
                              <TableCell>{session.coachName}</TableCell>
                              <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                              <TableCell>{session.time}</TableCell>
                              <TableCell>
                                <Select
                                  value={session.status}
                                  onValueChange={(value: "Scheduled" | "Completed" | "Cancelled") => 
                                    updateSessionStatus(session.id, value)}
                                >
                                  <SelectTrigger className={`w-36 ${
                                    session.status === "Completed" ? "bg-green-100 text-green-800 border-green-300" :
                                    session.status === "Cancelled" ? "bg-red-100 text-red-800 border-red-300" :
                                    "bg-blue-100 text-blue-800 border-blue-300"
                                  }`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteSession(session.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coaches">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black text-bulldogs-blue">Coaches</CardTitle>
                      <CardDescription>Total: {coaches.length} coaches</CardDescription>
                    </div>
                    <Dialog open={isCoachDialogOpen} onOpenChange={setIsCoachDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                          <UserPlus className="h-4 w-4" />
                          Add Coach
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black text-bulldogs-blue">
                            {editingCoach ? "Edit Coach" : "Add New Coach"}
                          </DialogTitle>
                          <DialogDescription>
                            Coach details and pricing tier
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="coach-name">Name *</Label>
                            <Input
                              id="coach-name"
                              value={coachForm.name}
                              onChange={e => setCoachForm({...coachForm, name: e.target.value})}
                              placeholder="Coach full name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="coach-phone">Phone Number *</Label>
                            <Input
                              id="coach-phone"
                              value={coachForm.phone}
                              onChange={e => setCoachForm({...coachForm, phone: e.target.value})}
                              placeholder="+62 xxx xxx xxxx"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tier">Tier *</Label>
                            <Select
                              value={coachForm.tier}
                              onValueChange={(value: "Head Coach" | "Goalkeeper Coach" | "Senior Coach" | "Assistant Coach") => 
                                setCoachForm({
                                  ...coachForm, 
                                  tier: value,
                                  rate: tierRates[value]
                                })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Head Coach">Head Coach (Rp 750,000)</SelectItem>
                                <SelectItem value="Goalkeeper Coach">Goalkeeper Coach (Rp 600,000)</SelectItem>
                                <SelectItem value="Senior Coach">Senior Coach (Rp 500,000)</SelectItem>
                                <SelectItem value="Assistant Coach">Assistant Coach (Rp 400,000)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="rate">Rate per Session (Rp)</Label>
                            <Input
                              id="rate"
                              type="number"
                              value={coachForm.rate}
                              onChange={e => setCoachForm({...coachForm, rate: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={resetCoachForm}>Cancel</Button>
                          <Button onClick={saveCoach} className="bg-bulldogs-blue hover:bg-bulldogs-blue/90">
                            {editingCoach ? "Update Coach" : "Add Coach"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coaches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No coaches added yet. Add your first coach to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          coaches.map(coach => (
                            <TableRow key={coach.id}>
                              <TableCell className="font-medium">{coach.name}</TableCell>
                              <TableCell>
                                <a 
                                  href={`https://wa.me/${coach.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {coach.phone}
                                </a>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  coach.tier === "Head Coach" ? "bg-purple-100 text-purple-800" :
                                  coach.tier === "Goalkeeper Coach" ? "bg-blue-100 text-blue-800" :
                                  coach.tier === "Senior Coach" ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {coach.tier}
                                </span>
                              </TableCell>
                              <TableCell className="font-semibold">Rp {coach.rate.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditCoach(coach)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteCoach(coach.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}