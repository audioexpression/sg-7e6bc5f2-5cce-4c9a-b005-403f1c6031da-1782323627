import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  team: string;
  coachingCredits: number;
}

interface Coach {
  id: string;
  name: string;
  phone: string;
  tier: "Head Coach" | "Goalkeeper Coach" | "Senior Coach" | "Assistant Coach";
}

interface Session {
  id: string;
  memberId?: string;
  memberName?: string;
  nonMemberName?: string;
  nonMemberPhone?: string;
  nonMemberEmail?: string;
  coachId: string;
  coachName: string;
  date: string;
  time: string;
  price: number;
  status: "scheduled" | "completed" | "cancelled";
  isNonMember: boolean;
}

const COACH_PRICING = {
  "Head Coach": 750000,
  "Goalkeeper Coach": 600000,
  "Senior Coach": 500000,
  "Assistant Coach": 400000,
};

export default function CoachingPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [bookingType, setBookingType] = useState<"member" | "non-member">("member");

  const [bookingForm, setBookingForm] = useState({
    memberId: "",
    memberName: "",
    nonMemberName: "",
    nonMemberPhone: "",
    nonMemberEmail: "",
    coachId: "",
    date: "",
    time: "",
    repeatWeeks: 1,
  });

  const [coachForm, setCoachForm] = useState({
    name: "",
    phone: "",
    tier: "Assistant Coach" as Coach["tier"],
  });

  useEffect(() => {
    const storedMembers = localStorage.getItem("members");
    const storedCoaches = localStorage.getItem("coaches");
    const storedSessions = localStorage.getItem("coachingSessions");

    if (storedMembers) setMembers(JSON.parse(storedMembers));
    if (storedCoaches) setCoaches(JSON.parse(storedCoaches));
    if (storedSessions) setSessions(JSON.parse(storedSessions));
  }, []);

  const saveCoaches = (data: Coach[]) => {
    localStorage.setItem("coaches", JSON.stringify(data));
    setCoaches(data);
  };

  const saveSessions = (data: Session[]) => {
    localStorage.setItem("coachingSessions", JSON.stringify(data));
    setSessions(data);
  };

  const handleAddCoach = () => {
    if (!coachForm.name || !coachForm.phone) {
      alert("Please fill in all coach fields");
      return;
    }

    if (editingCoach) {
      const updated = coaches.map((c) =>
        c.id === editingCoach.id ? { ...editingCoach, ...coachForm } : c
      );
      saveCoaches(updated);
    } else {
      const newCoach: Coach = {
        id: Date.now().toString(),
        ...coachForm,
      };
      saveCoaches([...coaches, newCoach]);
    }

    setShowCoachModal(false);
    setEditingCoach(null);
    setCoachForm({ name: "", phone: "", tier: "Assistant Coach" });
  };

  const handleDeleteCoach = (id: string) => {
    if (confirm("Delete this coach?")) {
      saveCoaches(coaches.filter((c) => c.id !== id));
    }
  };

  const isCoachAvailable = (coachId: string, date: string, time: string): boolean => {
    return !sessions.some(
      (s) =>
        s.coachId === coachId &&
        s.date === date &&
        s.time === time &&
        s.status !== "cancelled"
    );
  };

  const handleBookSession = () => {
    if (bookingType === "member") {
      if (!bookingForm.memberId || !bookingForm.coachId || !bookingForm.date || !bookingForm.time) {
        alert("Please fill in all required fields");
        return;
      }
    } else {
      if (!bookingForm.nonMemberName || !bookingForm.nonMemberPhone || !bookingForm.coachId || !bookingForm.date || !bookingForm.time) {
        alert("Please fill in all required fields for non-member booking");
        return;
      }
    }

    const coach = coaches.find((c) => c.id === bookingForm.coachId);
    if (!coach) return;

    const baseDate = new Date(bookingForm.date);
    const newSessions: Session[] = [];

    for (let i = 0; i < bookingForm.repeatWeeks; i++) {
      const sessionDate = new Date(baseDate);
      sessionDate.setDate(baseDate.getDate() + i * 7);
      const dateString = sessionDate.toISOString().split("T")[0];

      if (!isCoachAvailable(bookingForm.coachId, dateString, bookingForm.time)) {
        alert(`Coach is not available on ${dateString} at ${bookingForm.time}`);
        return;
      }

      const session: Session = {
        id: `${Date.now()}-${i}`,
        coachId: bookingForm.coachId,
        coachName: coach.name,
        date: dateString,
        time: bookingForm.time,
        price: COACH_PRICING[coach.tier],
        status: "scheduled",
        isNonMember: bookingType === "non-member",
        ...(bookingType === "member"
          ? {
              memberId: bookingForm.memberId,
              memberName: bookingForm.memberName,
            }
          : {
              nonMemberName: bookingForm.nonMemberName,
              nonMemberPhone: bookingForm.nonMemberPhone,
              nonMemberEmail: bookingForm.nonMemberEmail,
            }),
      };

      newSessions.push(session);
    }

    saveSessions([...sessions, ...newSessions]);

    if (bookingType === "member" && bookingForm.memberId) {
      const member = members.find((m) => m.id === bookingForm.memberId);
      if (member && member.coachingCredits >= bookingForm.repeatWeeks) {
        const updatedMembers = members.map((m) =>
          m.id === bookingForm.memberId
            ? { ...m, coachingCredits: m.coachingCredits - bookingForm.repeatWeeks }
            : m
        );
        localStorage.setItem("members", JSON.stringify(updatedMembers));
        setMembers(updatedMembers);
      }
    }

    setShowBookingModal(false);
    setBookingForm({
      memberId: "",
      memberName: "",
      nonMemberName: "",
      nonMemberPhone: "",
      nonMemberEmail: "",
      coachId: "",
      date: "",
      time: "",
      repeatWeeks: 1,
    });
    setMemberSearchQuery("");
    setBookingType("member");
  };

  const handleDeleteSession = (id: string) => {
    if (confirm("Delete this session?")) {
      saveSessions(sessions.filter((s) => s.id !== id));
    }
  };

  const handleUpdateSessionStatus = (id: string, status: Session["status"]) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, status } : s));
    saveSessions(updated);
  };

  const filteredSessions = sessions.filter((s) => {
    const searchLower = searchQuery.toLowerCase();
    const memberMatch = s.memberName?.toLowerCase().includes(searchLower);
    const nonMemberMatch = s.nonMemberName?.toLowerCase().includes(searchLower);
    const coachMatch = s.coachName.toLowerCase().includes(searchLower);
    return memberMatch || nonMemberMatch || coachMatch;
  });

  const todaySessions = sessions.filter((s) => {
    const today = new Date().toISOString().split("T")[0];
    return s.date === today && s.status === "scheduled";
  });

  const filteredMembers = members.filter((m) => {
    const search = memberSearchQuery.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(search) ||
      m.lastName.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search) ||
      m.team.toLowerCase().includes(search)
    );
  });

  const handleSelectMember = (member: Member) => {
    setBookingForm({
      ...bookingForm,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
    });
    setMemberSearchQuery(`${member.firstName} ${member.lastName}`);
    setShowMemberDropdown(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <SEO
        title="Private Coaching - Bali Bulldogs"
        description="Manage private coaching sessions and bookings"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Private Coaching
            </h1>
            <p className="text-blue-100">
              Manage 1-on-1 coaching sessions and schedules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-yellow-400/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Coaches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">
                  {coaches.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-400/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Today's Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">
                  {todaySessions.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-400/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">
                  {sessions.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Coaches</CardTitle>
                    <CardDescription>Manage coaching staff and rates</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingCoach(null);
                      setCoachForm({ name: "", phone: "", tier: "Assistant Coach" });
                      setShowCoachModal(true);
                    }}
                    className="bg-blue-900 hover:bg-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Coach
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coaches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No coaches added yet</p>
                    </div>
                  ) : (
                    coaches.map((coach) => (
                      <div
                        key={coach.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {coach.name}
                          </div>
                          <div className="text-sm text-gray-600">{coach.phone}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {coach.tier}
                            </Badge>
                            <Badge className="text-xs bg-yellow-400 text-gray-900 hover:bg-yellow-500">
                              {formatCurrency(COACH_PRICING[coach.tier])}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCoach(coach);
                              setCoachForm({
                                name: coach.name,
                                phone: coach.phone,
                                tier: coach.tier,
                              });
                              setShowCoachModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCoach(coach.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Book Session</CardTitle>
                    <CardDescription>Schedule coaching sessions</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {todaySessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sessions scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaySessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-blue-900">
                              {session.isNonMember ? session.nonMemberName : session.memberName}
                              {session.isNonMember && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Non-Member
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Coach: {session.coachName}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {session.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {formatCurrency(session.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Sessions</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No sessions found</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">
                            {session.isNonMember ? session.nonMemberName : session.memberName}
                          </div>
                          {session.isNonMember && (
                            <Badge variant="outline" className="text-xs">
                              Non-Member
                            </Badge>
                          )}
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : session.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {session.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Coach: {session.coachName} • {formatDate(session.date)} at{" "}
                          {session.time}
                        </div>
                        {session.isNonMember && (
                          <div className="text-xs text-gray-500 mt-1">
                            Phone: {session.nonMemberPhone}
                            {session.nonMemberEmail && ` • Email: ${session.nonMemberEmail}`}
                          </div>
                        )}
                        <div className="text-sm font-semibold text-blue-900 mt-1">
                          {formatCurrency(session.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === "scheduled" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateSessionStatus(session.id, "completed")
                              }
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateSessionStatus(session.id, "cancelled")
                              }
                              title="Cancel session"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showCoachModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingCoach ? "Edit Coach" : "Add New Coach"}
              </CardTitle>
              <CardDescription>
                Configure coach details and pricing tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coachName">Name *</Label>
                <Input
                  id="coachName"
                  value={coachForm.name}
                  onChange={(e) =>
                    setCoachForm({ ...coachForm, name: e.target.value })
                  }
                  placeholder="Jon Tarifa"
                />
              </div>
              <div>
                <Label htmlFor="coachPhone">Phone *</Label>
                <Input
                  id="coachPhone"
                  value={coachForm.phone}
                  onChange={(e) =>
                    setCoachForm({ ...coachForm, phone: e.target.value })
                  }
                  placeholder="+62 812 3456 7890"
                />
              </div>
              <div>
                <Label htmlFor="coachTier">Tier *</Label>
                <select
                  id="coachTier"
                  value={coachForm.tier}
                  onChange={(e) =>
                    setCoachForm({
                      ...coachForm,
                      tier: e.target.value as Coach["tier"],
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Head Coach">
                    Head Coach - {formatCurrency(COACH_PRICING["Head Coach"])}
                  </option>
                  <option value="Goalkeeper Coach">
                    Goalkeeper Coach -{" "}
                    {formatCurrency(COACH_PRICING["Goalkeeper Coach"])}
                  </option>
                  <option value="Senior Coach">
                    Senior Coach - {formatCurrency(COACH_PRICING["Senior Coach"])}
                  </option>
                  <option value="Assistant Coach">
                    Assistant Coach -{" "}
                    {formatCurrency(COACH_PRICING["Assistant Coach"])}
                  </option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCoachModal(false);
                    setEditingCoach(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCoach}
                  className="flex-1 bg-blue-900 hover:bg-blue-800"
                >
                  {editingCoach ? "Update" : "Add"} Coach
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-md my-8">
            <CardHeader>
              <CardTitle>Book Coaching Session</CardTitle>
              <CardDescription>
                Schedule a 1-on-1 session with a coach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={bookingType === "member" ? "default" : "outline"}
                  onClick={() => setBookingType("member")}
                  className={bookingType === "member" ? "bg-blue-900" : ""}
                  size="sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Member
                </Button>
                <Button
                  variant={bookingType === "non-member" ? "default" : "outline"}
                  onClick={() => setBookingType("non-member")}
                  className={bookingType === "non-member" ? "bg-blue-900" : ""}
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Non-Member
                </Button>
              </div>

              {bookingType === "member" ? (
                <div>
                  <Label htmlFor="member">Member *</Label>
                  <div className="relative">
                    <Input
                      id="member"
                      value={memberSearchQuery}
                      onChange={(e) => {
                        setMemberSearchQuery(e.target.value);
                        setShowMemberDropdown(true);
                      }}
                      onFocus={() => setShowMemberDropdown(true)}
                      placeholder="Search member by name, email or team..."
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    
                    {showMemberDropdown && filteredMembers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredMembers.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {member.team} • Credits: {member.coachingCredits}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.email}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {bookingForm.memberId && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-900">
                            {bookingForm.memberName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Credits: {members.find(m => m.id === bookingForm.memberId)?.coachingCredits || 0}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBookingForm({
                              ...bookingForm,
                              memberId: "",
                              memberName: "",
                            });
                            setMemberSearchQuery("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="nonMemberName">Name *</Label>
                    <Input
                      id="nonMemberName"
                      value={bookingForm.nonMemberName}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          nonMemberName: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nonMemberPhone">Phone *</Label>
                    <Input
                      id="nonMemberPhone"
                      value={bookingForm.nonMemberPhone}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          nonMemberPhone: e.target.value,
                        })
                      }
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nonMemberEmail">Email (Optional)</Label>
                    <Input
                      id="nonMemberEmail"
                      type="email"
                      value={bookingForm.nonMemberEmail}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          nonMemberEmail: e.target.value,
                        })
                      }
                      placeholder="john@example.com"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="coach">Coach *</Label>
                <select
                  id="coach"
                  value={bookingForm.coachId}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, coachId: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select coach</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name} ({coach.tier}) -{" "}
                      {formatCurrency(COACH_PRICING[coach.tier])}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="repeatWeeks">Repeat for weeks</Label>
                <Input
                  id="repeatWeeks"
                  type="number"
                  min="1"
                  max="12"
                  value={bookingForm.repeatWeeks}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      repeatWeeks: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Creates {bookingForm.repeatWeeks} session(s) starting from selected
                  date
                </p>
              </div>

              {bookingForm.coachId && bookingForm.date && bookingForm.time && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      {isCoachAvailable(
                        bookingForm.coachId,
                        bookingForm.date,
                        bookingForm.time
                      ) ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium">
                            Coach is available
                          </span>
                        </div>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Coach is not available at this time
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingForm({
                      memberId: "",
                      memberName: "",
                      nonMemberName: "",
                      nonMemberPhone: "",
                      nonMemberEmail: "",
                      coachId: "",
                      date: "",
                      time: "",
                      repeatWeeks: 1,
                    });
                    setMemberSearchQuery("");
                    setBookingType("member");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookSession}
                  className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                >
                  Book Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}