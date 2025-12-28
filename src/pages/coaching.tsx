import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Trash2,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Types
import { Coach, TIER_RATES, loadCoaches, saveCoaches } from "@/lib/coach-types";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  coachingCredits: number;
}

interface Session {
  id: string;
  memberId: string;
  memberName: string;
  coachId: string;
  coachName: string;
  date: string;
  time: string;
  hours: number;
  location: string;
  locationDetails?: string;
}

type ViewMode = "month" | "week" | "day" | "list";

const LOCATIONS = [
  "Bulldogs Arena",
  "Seminyak Field",
  "Other",
];

export default function Coaching() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Coach form
  const [coachName, setCoachName] = useState("");
  const [coachPhone, setCoachPhone] = useState("");
  const [coachTier, setCoachTier] = useState<Coach["tier"]>("Assistant Coach");

  // Session form
  const [sessionMemberId, setSessionMemberId] = useState("");
  const [sessionCoachId, setSessionCoachId] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionHours, setSessionHours] = useState("1");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionLocationDetails, setSessionLocationDetails] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  // Validation State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Session editing state
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Load data
  useEffect(() => {
    // Load coaches using shared helper
    const loadedCoaches = loadCoaches();
    console.log("🔵 Loading coaches from localStorage:", loadedCoaches);
    setCoaches(loadedCoaches);
    
    const savedMembers = localStorage.getItem("members");
    const savedSessions = localStorage.getItem("sessions");

    if (savedMembers) {
      const allMembers = JSON.parse(savedMembers);
      setMembers(allMembers);
    }
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    
    console.log("📊 Initial data loaded");
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Add coach
  const handleAddCoach = () => {
    console.log("🔵 handleAddCoach called");
    console.log("🔵 Current coaches state:", coaches);
    console.log("🔵 Form data:", { coachName, coachPhone, coachTier });
    
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!coachName.trim()) errors.coachName = "Name is required";
    if (!coachPhone.trim()) errors.coachPhone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      console.log("❌ Validation errors:", errors);
      setFormErrors(errors);
      return;
    }

    const newCoach: Coach = {
      id: Date.now().toString(),
      name: coachName,
      phone: coachPhone,
      tier: coachTier,
      hourlyRate: TIER_RATES[coachTier],
    };

    console.log("🔵 New coach created:", newCoach);

    // Create updated array
    const updatedCoaches = [...coaches, newCoach];
    console.log("🔵 Updated coaches array:", updatedCoaches);
    
    // Update state
    setCoaches(updatedCoaches);
    console.log("🔵 State updated with setCoaches");
    
    // Save to localStorage using shared helper
    saveCoaches(updatedCoaches);
    console.log("🔵 localStorage written:", localStorage.getItem("coaches"));

    // Close dialog and reset form
    setShowCoachDialog(false);
    setCoachName("");
    setCoachPhone("");
    setCoachTier("Assistant Coach");
    setFormErrors({});
    
    console.log("✅ handleAddCoach completed");
  };

  // Check for double booking
  const isCoachAvailable = (coachId: string, date: string, time: string, hours: number): boolean => {
    const [startHour, startMinute] = time.split(":").map(Number);
    const sessionStart = startHour * 60 + startMinute;
    const sessionEnd = sessionStart + hours * 60;

    return !sessions.some((s) => {
      if (s.coachId !== coachId || s.date !== date) return false;

      const [existingHour, existingMinute] = s.time.split(":").map(Number);
      const existingStart = existingHour * 60 + existingMinute;
      const existingEnd = existingStart + s.hours * 60;

      return (
        (sessionStart >= existingStart && sessionStart < existingEnd) ||
        (sessionEnd > existingStart && sessionEnd <= existingEnd) ||
        (sessionStart <= existingStart && sessionEnd >= existingEnd)
      );
    });
  };

  // Book session
  const handleBookSession = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!sessionMemberId) errors.sessionMemberId = "Please select a member";
    if (!sessionCoachId) errors.sessionCoachId = "Please select a coach";
    if (!sessionDate) errors.sessionDate = "Date is required";
    if (!sessionTime) errors.sessionTime = "Time is required";
    if (!sessionHours) errors.sessionHours = "Duration is required";
    if (!sessionLocation) errors.sessionLocation = "Location is required";
    
    if (sessionLocation === "Other" && !sessionLocationDetails.trim()) {
      errors.sessionLocationDetails = "Please provide location details";
    }

    const hours = parseFloat(sessionHours);
    if (isNaN(hours) || hours <= 0 || hours > 8) {
      errors.sessionHours = "Please enter valid hours (0.5 - 8)";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const member = members.find((m) => m.id === sessionMemberId);
    const coach = coaches.find((c) => c.id === sessionCoachId);

    if (!member || !coach) return;

    // Check coach availability for all repeat sessions
    for (let week = 0; week < repeatWeeks; week++) {
      const targetDate = new Date(sessionDate);
      targetDate.setDate(targetDate.getDate() + week * 7);
      const dateStr = targetDate.toISOString().split("T")[0];

      if (!isCoachAvailable(sessionCoachId, dateStr, sessionTime, hours)) {
        errors.availability = `${coach.name} is not available on ${dateStr} at ${sessionTime}`;
        setFormErrors(errors);
        return;
      }
    }

    // Create sessions
    const newSessions: Session[] = [];
    for (let week = 0; week < repeatWeeks; week++) {
      const targetDate = new Date(sessionDate);
      targetDate.setDate(targetDate.getDate() + week * 7);

      newSessions.push({
        id: Date.now().toString() + week,
        memberId: sessionMemberId,
        memberName: `${member.firstName} ${member.lastName}`,
        coachId: sessionCoachId,
        coachName: coach.name,
        date: targetDate.toISOString().split("T")[0],
        time: sessionTime,
        hours,
        location: sessionLocation,
        locationDetails: sessionLocation === "Other" ? sessionLocationDetails : undefined,
      });
    }

    setSessions([...sessions, ...newSessions]);

    // Deduct credits
    const updatedMembers = members.map((m) =>
      m.id === sessionMemberId
        ? { ...m, coachingCredits: Math.max(0, m.coachingCredits - repeatWeeks * hours) }
        : m
    );
    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));

    setShowSessionDialog(false);
    resetSessionForm();
  };

  const resetSessionForm = () => {
    setSessionMemberId("");
    setSessionCoachId("");
    setSessionDate("");
    setSessionTime("");
    setSessionHours("1");
    setSessionLocation("");
    setSessionLocationDetails("");
    setRepeatWeeks(1);
    setFormErrors({});
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      const session = sessions.find((s) => s.id === id);
      if (session) {
        // Refund credits
        const updatedMembers = members.map((m) =>
          m.id === session.memberId
            ? { ...m, coachingCredits: m.coachingCredits + session.hours }
            : m
        );
        setMembers(updatedMembers);
        localStorage.setItem("members", JSON.stringify(updatedMembers));
      }

      setSessions(sessions.filter((s) => s.id !== id));
    }
  };

  // Handle session click for editing
  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setShowEditDialog(true);
  };

  // Handle session update
  const handleUpdateSession = () => {
    if (!selectedSession) return;

    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!selectedSession.date) errors.sessionDate = "Date is required";
    if (!selectedSession.time) errors.sessionTime = "Time is required";

    const hours = parseFloat(selectedSession.hours.toString());
    if (isNaN(hours) || hours <= 0 || hours > 8) {
      errors.sessionHours = "Please enter valid hours (0.5 - 8)";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Check coach availability (excluding current session)
    if (!isCoachAvailable(selectedSession.coachId, selectedSession.date, selectedSession.time, hours)) {
      const otherSession = sessions.find((s) => 
        s.id !== selectedSession.id &&
        s.coachId === selectedSession.coachId && 
        s.date === selectedSession.date
      );
      if (otherSession) {
        errors.availability = `${selectedSession.coachName} is not available on ${selectedSession.date} at ${selectedSession.time}`;
        setFormErrors(errors);
        return;
      }
    }

    // Update session
    const updatedSessions = sessions.map((s) =>
      s.id === selectedSession.id ? selectedSession : s
    );
    setSessions(updatedSessions);
    setShowEditDialog(false);
    setSelectedSession(null);
  };

  // Handle session delete from edit dialog
  const handleDeleteFromDialog = () => {
    if (!selectedSession) return;
    setShowEditDialog(false);
    handleDeleteSession(selectedSession.id);
    setSelectedSession(null);
  };

  // Delete coach
  const handleDeleteCoach = (id: string) => {
    const updated = coaches.filter(c => c.id !== id);
    setCoaches(updated);
    saveCoaches(updated);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date);
    weekStart.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getSessionsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return sessions.filter((s) => s.date === dateStr);
  };

  const formatDateStr = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  // Get today's sessions
  const todaySessions = sessions.filter(
    (s) => s.date === new Date().toISOString().split("T")[0]
  );

  return (
    <>
      <SEO title="Private Coaching - Bali Bulldogs" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-4xl font-bold">Private Coaching</h1>
            </div>
            <p className="text-blue-100">Manage coaches, book sessions, and track schedules</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Coaches Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Coaches</CardTitle>
              <Button onClick={() => setShowCoachDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Coach
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {coaches.map((coach) => (
                  <Card key={coach.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{coach.name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {coach.tier}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCoach(coach.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {coach.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Rp {coach.hourlyRate.toLocaleString("id-ID")}/hour
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {coaches.length === 0 && (
                  <p className="text-gray-500 col-span-full text-center py-8">
                    No coaches yet. Add your first coach to start booking sessions.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendar View Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>Schedule Calendar</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                  >
                    Day
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    List
                  </Button>
                  <Button onClick={() => setShowSessionDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Month View */}
              {viewMode === "month" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-xl font-bold">
                      {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth(currentDate).map((date, index) => {
                      const daySessions = getSessionsForDate(date);
                      const isToday =
                        date?.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={index}
                          className={`min-h-24 p-2 border rounded-lg ${
                            date ? "bg-white" : "bg-gray-50"
                          } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                        >
                          {date && (
                            <>
                              <div className="text-sm font-semibold mb-1">{date.getDate()}</div>
                              <div className="space-y-1">
                                {daySessions.slice(0, 2).map((session) => (
                                  <div
                                    key={session.id}
                                    className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                                    title={`${session.time} - ${session.memberName} with ${session.coachName}`}
                                    onClick={() => handleSessionClick(session)}
                                  >
                                    {session.time} {session.memberName}
                                  </div>
                                ))}
                                {daySessions.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{daySessions.length - 2} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Week View */}
              {viewMode === "week" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-xl font-bold">
                      Week of {getWeekDays(currentDate)[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </h3>
                    <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {getWeekDays(currentDate).map((date) => {
                      const daySessions = getSessionsForDate(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div key={date.toISOString()}>
                          <div className={`text-center font-semibold text-sm mb-2 ${isToday ? "text-blue-600" : "text-gray-600"}`}>
                            <div>{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                            <div className={`text-lg ${isToday ? "bg-blue-600 text-white rounded-full w-8 h-8 mx-auto flex items-center justify-center" : ""}`}>
                              {date.getDate()}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {daySessions.map((session) => (
                              <div
                                key={session.id}
                                className="text-xs bg-white border rounded p-2 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleSessionClick(session)}
                              >
                                <div className="font-semibold">{session.time}</div>
                                <div className="text-gray-600">{session.memberName}</div>
                                <div className="text-gray-500">{session.coachName}</div>
                                <div className="text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {session.location === "Other" ? session.locationDetails : session.location}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day View */}
              {viewMode === "day" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" onClick={() => navigateDay(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-xl font-bold">
                      {currentDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                    <Button variant="outline" size="icon" onClick={() => navigateDay(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {getSessionsForDate(currentDate).sort((a, b) => a.time.localeCompare(b.time)).map((session) => (
                      <Card key={session.id} className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSessionClick(session)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span className="font-bold text-lg">{session.time}</span>
                                <Badge>{session.hours}h</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <span className="font-semibold">{session.memberName}</span>
                                <span className="text-gray-400">with</span>
                                <span className="font-semibold">{session.coachName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{session.location === "Other" ? session.locationDetails : session.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                <span>Rp {((TIER_RATES[coaches.find(c => c.id === session.coachId)?.tier as Coach["tier"]] || 0) * session.hours).toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSession(session.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {getSessionsForDate(currentDate).length === 0 && (
                      <p className="text-center text-gray-500 py-8">No sessions scheduled for this day</p>
                    )}
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">All Upcoming Sessions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Coach</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions
                        .filter((s) => new Date(s.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)))
                        .sort((a, b) => {
                          const dateCompare = a.date.localeCompare(b.date);
                          if (dateCompare !== 0) return dateCompare;
                          return a.time.localeCompare(b.time);
                        })
                        .map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>{formatDateStr(session.date)}</TableCell>
                            <TableCell className="font-semibold">{session.time}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{session.hours}h</Badge>
                            </TableCell>
                            <TableCell>{session.memberName}</TableCell>
                            <TableCell>{session.coachName}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {session.location === "Other" ? session.locationDetails : session.location}
                            </TableCell>
                            <TableCell>
                                Rp {((TIER_RATES[coaches.find(c => c.id === session.coachId)?.tier as Coach["tier"]] || 0) * session.hours).toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSession(session.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {sessions.filter((s) => new Date(s.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No upcoming sessions scheduled</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Coach Dialog */}
        <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Coach</DialogTitle>
              <DialogDescription>
                Add a coach to your team. Pricing is automatically set based on tier.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="coachName">Name *</Label>
                <Input
                  id="coachName"
                  value={coachName}
                  onChange={(e) => {
                    setCoachName(e.target.value);
                    if (formErrors.coachName) setFormErrors({ ...formErrors, coachName: "" });
                  }}
                  placeholder="Coach name"
                  className={formErrors.coachName ? "border-red-500" : ""}
                />
                {formErrors.coachName && <p className="text-red-500 text-sm mt-1">{formErrors.coachName}</p>}
              </div>
              <div>
                <Label htmlFor="coachPhone">Phone Number *</Label>
                <Input
                  id="coachPhone"
                  value={coachPhone}
                  onChange={(e) => {
                    setCoachPhone(e.target.value);
                    if (formErrors.coachPhone) setFormErrors({ ...formErrors, coachPhone: "" });
                  }}
                  placeholder="+62..."
                  className={formErrors.coachPhone ? "border-red-500" : ""}
                />
                {formErrors.coachPhone && <p className="text-red-500 text-sm mt-1">{formErrors.coachPhone}</p>}
              </div>
              <div>
                <Label htmlFor="coachTier">Tier</Label>
                <Select value={coachTier} onValueChange={(value: any) => setCoachTier(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Head Coach">
                      Head Coach (Rp 750.000/hr)
                    </SelectItem>
                    <SelectItem value="Goalkeeper Coach">
                      Goalkeeper Coach (Rp 600.000/hr)
                    </SelectItem>
                    <SelectItem value="Senior Coach">
                      Senior Coach (Rp 500.000/hr)
                    </SelectItem>
                    <SelectItem value="Assistant Coach">
                      Assistant Coach (Rp 400.000/hr)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCoachDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCoach}>Add Coach</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Book Session Dialog */}
        <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book Coaching Session</DialogTitle>
              <DialogDescription>
                Schedule a private coaching session. Session times cannot overlap for the same coach.
              </DialogDescription>
            </DialogHeader>
            {formErrors.availability && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
                {formErrors.availability}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionMember">Member *</Label>
                  <Select 
                    value={sessionMemberId} 
                    onValueChange={(val) => {
                      setSessionMemberId(val);
                      if (formErrors.sessionMemberId) setFormErrors({ ...formErrors, sessionMemberId: "" });
                    }}
                  >
                    <SelectTrigger className={formErrors.sessionMemberId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} ({m.coachingCredits} credits)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.sessionMemberId && <p className="text-red-500 text-sm mt-1">{formErrors.sessionMemberId}</p>}
                </div>
                <div>
                  <Label htmlFor="sessionCoach">Coach *</Label>
                  <Select 
                    value={sessionCoachId} 
                    onValueChange={(val) => {
                      setSessionCoachId(val);
                      if (formErrors.sessionCoachId) setFormErrors({ ...formErrors, sessionCoachId: "" });
                    }}
                  >
                    <SelectTrigger className={formErrors.sessionCoachId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent>
                      {coaches.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.tier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.sessionCoachId && <p className="text-red-500 text-sm mt-1">{formErrors.sessionCoachId}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sessionDate">Date *</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => {
                      setSessionDate(e.target.value);
                      if (formErrors.sessionDate) setFormErrors({ ...formErrors, sessionDate: "" });
                    }}
                    className={formErrors.sessionDate ? "border-red-500" : ""}
                  />
                  {formErrors.sessionDate && <p className="text-red-500 text-sm mt-1">{formErrors.sessionDate}</p>}
                </div>
                <div>
                  <Label htmlFor="sessionTime">Time *</Label>
                  <Input
                    id="sessionTime"
                    type="time"
                    value={sessionTime}
                    onChange={(e) => {
                      setSessionTime(e.target.value);
                      if (formErrors.sessionTime) setFormErrors({ ...formErrors, sessionTime: "" });
                    }}
                    className={formErrors.sessionTime ? "border-red-500" : ""}
                  />
                  {formErrors.sessionTime && <p className="text-red-500 text-sm mt-1">{formErrors.sessionTime}</p>}
                </div>
                <div>
                  <Label htmlFor="sessionHours">Hours *</Label>
                  <Input
                    id="sessionHours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    value={sessionHours}
                    onChange={(e) => {
                      setSessionHours(e.target.value);
                      if (formErrors.sessionHours) setFormErrors({ ...formErrors, sessionHours: "" });
                    }}
                    placeholder="1.5"
                    className={formErrors.sessionHours ? "border-red-500" : ""}
                  />
                  {formErrors.sessionHours && <p className="text-red-500 text-sm mt-1">{formErrors.sessionHours}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="sessionLocation">Location *</Label>
                <Select 
                  value={sessionLocation} 
                  onValueChange={(val) => {
                    setSessionLocation(val);
                    if (formErrors.sessionLocation) setFormErrors({ ...formErrors, sessionLocation: "" });
                  }}
                >
                  <SelectTrigger className={formErrors.sessionLocation ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.sessionLocation && <p className="text-red-500 text-sm mt-1">{formErrors.sessionLocation}</p>}
              </div>
              {sessionLocation === "Other" && (
                <div>
                  <Label htmlFor="locationDetails">Location Details *</Label>
                  <Input
                    id="locationDetails"
                    value={sessionLocationDetails}
                    onChange={(e) => {
                      setSessionLocationDetails(e.target.value);
                      if (formErrors.sessionLocationDetails) setFormErrors({ ...formErrors, sessionLocationDetails: "" });
                    }}
                    placeholder="Enter specific location details"
                    className={formErrors.sessionLocationDetails ? "border-red-500" : ""}
                  />
                  {formErrors.sessionLocationDetails && <p className="text-red-500 text-sm mt-1">{formErrors.sessionLocationDetails}</p>}
                </div>
              )}
              <div>
                <Label htmlFor="repeatWeeks">Repeat for # weeks</Label>
                <Input
                  id="repeatWeeks"
                  type="number"
                  min="1"
                  max="12"
                  value={repeatWeeks}
                  onChange={(e) => setRepeatWeeks(parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will create {repeatWeeks} session{repeatWeeks > 1 ? "s" : ""} on consecutive weeks
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookSession}>Book Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Session Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Coaching Session</DialogTitle>
              <DialogDescription>
                Update session details or delete the session.
              </DialogDescription>
            </DialogHeader>
            {selectedSession && (
              <>
                {formErrors.availability && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
                    {formErrors.availability}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Member</Label>
                      <Input value={selectedSession.memberName} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>Coach</Label>
                      <Input value={selectedSession.coachName} disabled className="bg-gray-50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="editDate">Date *</Label>
                      <Input
                        id="editDate"
                        type="date"
                        value={selectedSession.date}
                        onChange={(e) => setSelectedSession({ ...selectedSession, date: e.target.value })}
                        className={formErrors.sessionDate ? "border-red-500" : ""}
                      />
                      {formErrors.sessionDate && <p className="text-red-500 text-sm mt-1">{formErrors.sessionDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="editTime">Time *</Label>
                      <Input
                        id="editTime"
                        type="time"
                        value={selectedSession.time}
                        onChange={(e) => setSelectedSession({ ...selectedSession, time: e.target.value })}
                        className={formErrors.sessionTime ? "border-red-500" : ""}
                      />
                      {formErrors.sessionTime && <p className="text-red-500 text-sm mt-1">{formErrors.sessionTime}</p>}
                    </div>
                    <div>
                      <Label htmlFor="editHours">Hours *</Label>
                      <Input
                        id="editHours"
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="8"
                        value={selectedSession.hours}
                        onChange={(e) => setSelectedSession({ ...selectedSession, hours: parseFloat(e.target.value) || 1 })}
                        className={formErrors.sessionHours ? "border-red-500" : ""}
                      />
                      {formErrors.sessionHours && <p className="text-red-500 text-sm mt-1">{formErrors.sessionHours}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editLocation">Location *</Label>
                    <Select 
                      value={selectedSession.location} 
                      onValueChange={(val) => setSelectedSession({ ...selectedSession, location: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedSession.location === "Other" && (
                    <div>
                      <Label htmlFor="editLocationDetails">Location Details *</Label>
                      <Input
                        id="editLocationDetails"
                        value={selectedSession.locationDetails || ""}
                        onChange={(e) => setSelectedSession({ ...selectedSession, locationDetails: e.target.value })}
                        placeholder="Enter specific location details"
                      />
                    </div>
                  )}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Session Cost:</span>
                      <span>Rp {((TIER_RATES[coaches.find(c => c.id === selectedSession.coachId)?.tier as Coach["tier"]] || 0) * selectedSession.hours).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDeleteFromDialog}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Session
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSession}>Save Changes</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}