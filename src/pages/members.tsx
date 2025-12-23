import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Edit, Save, X, Upload, Download, Search, Filter, Home, Users, DollarSign, Calendar, Eye, Settings, ArrowLeft, User, Pencil } from "lucide-react";
import { useRouter } from "next/router";

const TEAMS_BY_CATEGORY = {
  Junior: [
    "Toddler",
    "Kindy/U6 1",
    "Kindy/U6 2",
    "U8 Dev",
    "U8 Adv",
    "U10 Dev",
    "U10 Adv",
    "U12 Girls",
    "U12 Dev",
    "U12 Adv",
  ],
  Youth: [
    "U14",
    "U14 Girls",
    "U16",
    "U18 Girls",
    "U18",
  ],
  Adult: [
    "1st Team",
    "Social Team",
    "Legends 35+",
    "Masters 45+",
  ],
};

const ROLES = ["Admin", "Coach", "Player-Coach", "Player"];

const teamOptions = [
  ...TEAMS_BY_CATEGORY.Junior,
  ...TEAMS_BY_CATEGORY.Youth,
  ...TEAMS_BY_CATEGORY.Adult,
];

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  shirtNumber: string;
  category: "Junior" | "Youth" | "Adult";
  type: "Member" | "Sponsored" | "Scholarship";
  role: string;
  teamAssignment: string;
  joiningDate: string;
  contactNumber: string;
  whatsappLink: string;
  primaryContact: string;
  primaryContactNumber: string;
  secondaryContact: string;
  secondaryContactNumber: string;
  medicalNotes: string;
  coachingCredits: number;
  photoUrl?: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState("");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [formData, setFormData] = useState<Partial<Member>>({
    category: "Junior",
    type: "Member",
    role: "Player",
    coachingCredits: 0,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const resetForm = () => {
    setFormData({
      category: "Junior",
      type: "Member",
      role: "Player",
      coachingCredits: 0,
      teamAssignment: "",
    });
    setValidationErrors({});
    setEditingMember(null);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.firstName || !formData.lastName) return;

    let updatedMembers;
    if (editingMember) {
      updatedMembers = members.map((m) =>
        m.id === editingMember.id ? { ...m, ...formData } as Member : m
      );
    } else {
      const newMember = {
        ...formData,
        id: crypto.randomUUID(),
        joiningDate: formData.joiningDate || new Date().toISOString().split("T")[0],
      } as Member;
      updatedMembers = [...members, newMember];
    }

    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
    setIsDialogOpen(false);
    resetForm();
  };

  useEffect(() => {
    const saved = localStorage.getItem("members");
    if (saved) {
      setMembers(JSON.parse(saved));
    } else {
      // Initialize with Legends team members
      const legendsMembers: Member[] = [
        {
          id: crypto.randomUUID(),
          firstName: "Pradana",
          lastName: "Ardhabanu",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "1",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "628777",
          whatsappLink: "https://wa.me/628777",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Markez",
          lastName: "Laws",
          dateOfBirth: "1985-01-01",
          nationality: "Bermuda",
          address: "",
          email: "",
          shirtNumber: "2",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "144159",
          whatsappLink: "https://wa.me/144159",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Justin",
          lastName: "Becker",
          dateOfBirth: "1985-01-01",
          nationality: "USA",
          address: "",
          email: "",
          shirtNumber: "3",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "168280",
          whatsappLink: "https://wa.me/168280",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "James",
          lastName: "Demeester",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "4",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "336283",
          whatsappLink: "https://wa.me/336283",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "John",
          lastName: "Mcclelland",
          dateOfBirth: "1985-01-01",
          nationality: "Australia",
          address: "",
          email: "",
          shirtNumber: "5",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "628123",
          whatsappLink: "https://wa.me/628123",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Jon",
          lastName: "Tarita",
          dateOfBirth: "1985-01-01",
          nationality: "Netherlands",
          address: "",
          email: "",
          shirtNumber: "6",
          category: "Adult",
          type: "Sponsored",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "316147",
          whatsappLink: "https://wa.me/316147",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Fudge",
          lastName: "Jarcheh",
          dateOfBirth: "1985-01-01",
          nationality: "UK",
          address: "",
          email: "",
          shirtNumber: "7",
          category: "Adult",
          type: "Sponsored",
          role: "Coach",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "447940",
          whatsappLink: "https://wa.me/447940",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Drigny",
          lastName: "Fred",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "8",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "841203",
          whatsappLink: "https://wa.me/841203",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Steffen",
          lastName: "Hessel",
          dateOfBirth: "1985-01-01",
          nationality: "Germany",
          address: "",
          email: "",
          shirtNumber: "9",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "659779",
          whatsappLink: "https://wa.me/659779",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Rofiq",
          lastName: "Ainur",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "10",
          category: "Adult",
          type: "Scholarship",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "628779",
          whatsappLink: "https://wa.me/628779",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Antonius",
          lastName: "Norman",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "11",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Antoine",
          lastName: "Guerin",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "12",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Richard",
          lastName: "Muijono",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "13",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Izhary",
          lastName: "Zac",
          dateOfBirth: "1985-01-01",
          nationality: "Singapore",
          address: "",
          email: "",
          shirtNumber: "14",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "John",
          lastName: "Stansbie",
          dateOfBirth: "1985-01-01",
          nationality: "UK",
          address: "",
          email: "",
          shirtNumber: "15",
          category: "Adult",
          type: "Sponsored",
          role: "Coach",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Max",
          lastName: "Harrison",
          dateOfBirth: "1985-01-01",
          nationality: "UK",
          address: "",
          email: "",
          shirtNumber: "16",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Karan",
          lastName: "Bajaj",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "17",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Mickael",
          lastName: "Neto",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "18",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Awal",
          lastName: "Rameh",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "19",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Jordan",
          lastName: "Godley",
          dateOfBirth: "1985-01-01",
          nationality: "Australia",
          address: "",
          email: "",
          shirtNumber: "20",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Nicolas",
          lastName: "Lapalus",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "21",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Thomas",
          lastName: "Teressi",
          dateOfBirth: "1985-01-01",
          nationality: "Austria",
          address: "",
          email: "",
          shirtNumber: "22",
          category: "Adult",
          type: "Sponsored",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Joe",
          lastName: "Degood",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "23",
          category: "Adult",
          type: "Scholarship",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Lad",
          lastName: "Durina",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "24",
          category: "Adult",
          type: "Sponsored",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Nathan",
          lastName: "Coe",
          dateOfBirth: "1985-01-01",
          nationality: "Australia",
          address: "",
          email: "",
          shirtNumber: "25",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Maxence",
          lastName: "Leurent",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "26",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Michael",
          lastName: "Johansen",
          dateOfBirth: "1985-01-01",
          nationality: "Denmark",
          address: "",
          email: "",
          shirtNumber: "27",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        }
      ];

      setMembers(legendsMembers);
      localStorage.setItem("members", JSON.stringify(legendsMembers));
    }
  }, []);

  const handleLoadLegends = () => {
    if (!confirm("This will add 27 Legends players to your database. Continue?")) return;

    const legendsMembers: Member[] = [
        {
          id: crypto.randomUUID(),
          firstName: "Pradana",
          lastName: "Ardhabanu",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "1",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "628777",
          whatsappLink: "https://wa.me/628777",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Markez",
          lastName: "Laws",
          dateOfBirth: "1985-01-01",
          nationality: "Bermuda",
          address: "",
          email: "",
          shirtNumber: "2",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "144159",
          whatsappLink: "https://wa.me/144159",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Justin",
          lastName: "Becker",
          dateOfBirth: "1985-01-01",
          nationality: "USA",
          address: "",
          email: "",
          shirtNumber: "3",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "168280",
          whatsappLink: "https://wa.me/168280",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "James",
          lastName: "Demeester",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "4",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "336283",
          whatsappLink: "https://wa.me/336283",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "John",
          lastName: "Mcclelland",
          dateOfBirth: "1985-01-01",
          nationality: "Australia",
          address: "",
          email: "",
          shirtNumber: "5",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "628123",
          whatsappLink: "https://wa.me/628123",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Jon",
          lastName: "Tarita",
          dateOfBirth: "1985-01-01",
          nationality: "Netherlands",
          address: "",
          email: "",
          shirtNumber: "6",
          category: "Adult",
          type: "Sponsored",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "316147",
          whatsappLink: "https://wa.me/316147",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Fudge",
          lastName: "Jarcheh",
          dateOfBirth: "1985-01-01",
          nationality: "UK",
          address: "",
          email: "",
          shirtNumber: "7",
          category: "Adult",
          type: "Sponsored",
          role: "Coach",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "447940",
          whatsappLink: "https://wa.me/447940",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Drigny",
          lastName: "Fred",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "8",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "841203",
          whatsappLink: "https://wa.me/841203",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Steffen",
          lastName: "Hessel",
          dateOfBirth: "1985-01-01",
          nationality: "Germany",
          address: "",
          email: "",
          shirtNumber: "9",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "659779",
          whatsappLink: "https://wa.me/659779",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Rofiq",
          lastName: "Ainur",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "10",
          category: "Adult",
          type: "Scholarship",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "628779",
          whatsappLink: "https://wa.me/628779",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Antonius",
          lastName: "Norman",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "11",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Antoine",
          lastName: "Guerin",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "12",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Richard",
          lastName: "Muijono",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "13",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Izhary",
          lastName: "Zac",
          dateOfBirth: "1985-01-01",
          nationality: "Singapore",
          address: "",
          email: "",
          shirtNumber: "14",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "John",
          lastName: "Stansbie",
          dateOfBirth: "1985-01-01",
          nationality: "UK",
          address: "",
          email: "",
          shirtNumber: "15",
          category: "Adult",
          type: "Sponsored",
          role: "Coach",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Max",
          lastName: "Harrison",
          dateOfBirth: "1985-01-01",
          nationality: "UK",
          address: "",
          email: "",
          shirtNumber: "16",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Karan",
          lastName: "Bajaj",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "17",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Mickael",
          lastName: "Neto",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "18",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Awal",
          lastName: "Rameh",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "19",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Jordan",
          lastName: "Godley",
          dateOfBirth: "1985-01-01",
          nationality: "Australia",
          address: "",
          email: "",
          shirtNumber: "20",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Nicolas",
          lastName: "Lapalus",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "21",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Thomas",
          lastName: "Teressi",
          dateOfBirth: "1985-01-01",
          nationality: "Austria",
          address: "",
          email: "",
          shirtNumber: "22",
          category: "Adult",
          type: "Sponsored",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Joe",
          lastName: "Degood",
          dateOfBirth: "1985-01-01",
          nationality: "Indonesia",
          address: "",
          email: "",
          shirtNumber: "23",
          category: "Adult",
          type: "Scholarship",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Lad",
          lastName: "Durina",
          dateOfBirth: "1985-01-01",
          nationality: "",
          address: "",
          email: "",
          shirtNumber: "24",
          category: "Adult",
          type: "Sponsored",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Nathan",
          lastName: "Coe",
          dateOfBirth: "1985-01-01",
          nationality: "Australia",
          address: "",
          email: "",
          shirtNumber: "25",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Maxence",
          lastName: "Leurent",
          dateOfBirth: "1985-01-01",
          nationality: "France",
          address: "",
          email: "",
          shirtNumber: "26",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        },
        {
          id: crypto.randomUUID(),
          firstName: "Michael",
          lastName: "Johansen",
          dateOfBirth: "1985-01-01",
          nationality: "Denmark",
          address: "",
          email: "",
          shirtNumber: "27",
          category: "Adult",
          type: "Member",
          role: "Player",
          teamAssignment: "Legends",
          joiningDate: new Date().toISOString().split("T")[0],
          contactNumber: "",
          whatsappLink: "",
          primaryContact: "",
          primaryContactNumber: "",
          secondaryContact: "",
          secondaryContactNumber: "",
          medicalNotes: "",
          coachingCredits: 0,
          photoUrl: ""
        }
    ];

    const updated = [...members, ...legendsMembers];
    setMembers(updated);
    localStorage.setItem("members", JSON.stringify(updated));
    alert("27 Legends players added successfully!");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").filter(row => row.trim());
      const headers = rows[0].split(",").map(h => h.trim());
      
      const imported = rows.slice(1).map(row => {
        const values = row.split(",").map(v => v.trim());
        const member: any = { id: Date.now().toString() + Math.random() };
        
        headers.forEach((header, index) => {
          const value = values[index] || "";
          switch(header.toLowerCase()) {
            case "first name": member.firstName = value; break;
            case "last name": member.lastName = value; break;
            case "date of birth": member.dateOfBirth = value; break;
            case "nationality": member.nationality = value; break;
            case "address": member.address = value; break;
            case "email": member.email = value; break;
            case "shirt number": member.shirtNumber = value; break;
            case "category": member.category = value; break;
            case "type": member.type = value; break;
            case "role": member.role = value; break;
            case "team": member.teamAssignment = value; break;
            case "joining date": member.joiningDate = value; break;
            case "contact number": member.contactNumber = value; break;
            case "primary contact": member.primaryContact = value; break;
            case "primary contact number": member.primaryContactNumber = value; break;
            case "secondary contact": member.secondaryContact = value; break;
            case "secondary contact number": member.secondaryContactNumber = value; break;
            case "medical notes": member.medicalNotes = value; break;
            case "coaching credits": member.coachingCredits = parseInt(value) || 0; break;
            case "photo url": member.photoUrl = value; break;
          }
        });
        
        return member as Member;
      });

      const updated = [...members, ...imported];
      setMembers(updated);
      localStorage.setItem("members", JSON.stringify(updated));
      setIsImportOpen(false);
    };
    
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const headers = [
      "First Name", "Last Name", "Date of Birth", "Nationality", "Address", "Email",
      "Shirt Number", "Category", "Type", "Role", "Team", "Joining Date",
      "Contact Number", "Primary Contact", "Primary Contact Number",
      "Secondary Contact", "Secondary Contact Number", "Medical Notes", "Coaching Credits", "Photo URL"
    ];
    
    const csv = [
      headers.join(","),
      ...members.map(m => [
        m.firstName, m.lastName, m.dateOfBirth, m.nationality, m.address, m.email,
        m.shirtNumber, m.category, m.type, m.role, m.teamAssignment, m.joiningDate,
        m.contactNumber, m.primaryContact, m.primaryContactNumber,
        m.secondaryContact, m.secondaryContactNumber, m.medicalNotes, m.coachingCredits, m.photoUrl || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulldogs_members.csv";
    a.click();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.teamAssignment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || member.category === filterCategory;
    const matchesTeam = filterTeam === "all" || member.teamAssignment === filterTeam;
    
    return matchesSearch && matchesCategory && matchesTeam;
  });

  return (
    <>
      <SEO 
        title="Members - Bali Bulldogs Club Manager"
        description="Manage club members, registrations, and player information"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Members</h1>
              <p className="text-gray-600">Manage your club members and registrations</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/")} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button onClick={() => router.push("/teams")} variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </Button>
              <Button onClick={() => router.push("/invoices")} variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Invoices
              </Button>
              <Button onClick={() => router.push("/coaching")} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Coaching
              </Button>
              <Button onClick={() => router.push("/settings")} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-blue-800"
                onClick={() => window.location.href = "/"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight">MEMBER DATABASE</h1>
                <p className="text-blue-100 text-lg">Bali Bulldogs Club Manager</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-yellow-400">{members.length}</div>
                <div className="text-sm text-blue-200 uppercase tracking-wide">Total Members</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 shadow-lg border-2 border-blue-100">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-blue-200">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Youth">Youth</SelectItem>
                  <SelectItem value="Adult">Adult</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-blue-200">
                  <SelectValue placeholder="Filter by Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamOptions.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-blue-700 hover:bg-blue-800 h-12 px-6 font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Member
              </Button>
              <Button 
                onClick={handleLoadLegends}
                className="bg-yellow-500 hover:bg-yellow-600 font-bold"
              >
                <Download className="mr-2 h-4 w-4" /> Load Legends Data
              </Button>
              <Button variant="outline" onClick={() => document.getElementById("csv-upload")?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 h-12 px-6 font-bold"
              />
              <Button 
                onClick={handleExportCSV}
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 h-12 px-6 font-bold"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-blue-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-700 hover:bg-blue-700">
                    <TableHead className="text-white font-bold">Photo</TableHead>
                    <TableHead className="text-white font-bold">Name</TableHead>
                    <TableHead className="text-white font-bold">Shirt #</TableHead>
                    <TableHead className="text-white font-bold">Team</TableHead>
                    <TableHead className="text-white font-bold">Category</TableHead>
                    <TableHead className="text-white font-bold">Type</TableHead>
                    <TableHead className="text-white font-bold">Role</TableHead>
                    <TableHead className="text-white font-bold">Contact</TableHead>
                    <TableHead className="text-white font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            onClick={() => {
                              setPreviewPhotoUrl(member.photoUrl || "");
                              setIsPhotoPreviewOpen(true);
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell>{member.shirtNumber || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={member.category === "Junior" ? "default" : member.category === "Youth" ? "secondary" : "outline"}>
                          {member.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.teamAssignment}</TableCell>
                      <TableCell>
                        <Badge variant={member.type === "Member" ? "default" : "secondary"}>
                          {member.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <a
                          href={member.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {member.contactNumber}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-700">
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    setValidationErrors({ ...validationErrors, firstName: "" });
                  }}
                  required
                  className={validationErrors.firstName ? "border-red-500" : ""}
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    setValidationErrors({ ...validationErrors, lastName: "" });
                  }}
                  required
                  className={validationErrors.lastName ? "border-red-500" : ""}
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="photo">Photo Upload</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor="category">Category (Age Group) *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value as "Junior" | "Youth" | "Adult", teamAssignment: "" });
                    setValidationErrors({ ...validationErrors, category: "" });
                  }}
                >
                  <SelectTrigger className={validationErrors.category ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.category && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, dateOfBirth: e.target.value });
                    setValidationErrors({ ...validationErrors, dateOfBirth: "" });
                  }}
                  required
                  className={validationErrors.dateOfBirth ? "border-red-500" : ""}
                />
                {validationErrors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, nationality: e.target.value });
                    setValidationErrors({ ...validationErrors, nationality: "" });
                  }}
                  required
                  className={validationErrors.nationality ? "border-red-500" : ""}
                />
                {validationErrors.nationality && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.nationality}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address (Area of Bali) *</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setValidationErrors({ ...validationErrors, address: "" });
                  }}
                  required
                  className={validationErrors.address ? "border-red-500" : ""}
                />
                {validationErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setValidationErrors({ ...validationErrors, email: "" });
                  }}
                  required
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shirtNumber">Shirt Number</Label>
                <Input
                  id="shirtNumber"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.shirtNumber || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, shirtNumber: e.target.value });
                    setValidationErrors({ ...validationErrors, shirtNumber: "" });
                  }}
                  className={validationErrors.shirtNumber ? "border-red-500" : ""}
                />
                {validationErrors.shirtNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.shirtNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Type (Payment Status) *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    setFormData({ ...formData, type: value as "Member" | "Sponsored" | "Scholarship" });
                    setValidationErrors({ ...validationErrors, type: "" });
                  }}
                >
                  <SelectTrigger className={validationErrors.type ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member">Member (Pays Fees)</SelectItem>
                    <SelectItem value="Sponsored">Sponsored (Free)</SelectItem>
                    <SelectItem value="Scholarship">Scholarship (Free)</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.type && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => {
                    setFormData({ ...formData, role: value });
                    setValidationErrors({ ...validationErrors, role: "" });
                  }}
                >
                  <SelectTrigger className={validationErrors.role ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.role && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.role}</p>
                )}
              </div>

              <div>
                <Label htmlFor="teamAssignment">Team Assignment *</Label>
                <Select
                  value={formData.teamAssignment}
                  onValueChange={(value) => {
                    setFormData({ ...formData, teamAssignment: value });
                    setValidationErrors({ ...validationErrors, teamAssignment: "" });
                  }}
                >
                  <SelectTrigger className={validationErrors.teamAssignment ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && TEAMS_BY_CATEGORY[formData.category].map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.teamAssignment && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.teamAssignment}</p>
                )}
              </div>

              <div>
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, joiningDate: e.target.value });
                    setValidationErrors({ ...validationErrors, joiningDate: "" });
                  }}
                  required
                  className={validationErrors.joiningDate ? "border-red-500" : ""}
                />
                {validationErrors.joiningDate && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.joiningDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactNumber" className="font-semibold">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => {
                    setFormData({...formData, contactNumber: e.target.value});
                    setValidationErrors({ ...validationErrors, contactNumber: "" });
                  }}
                  className={validationErrors.contactNumber ? "border-2 border-red-500" : "border-2 border-blue-200"}
                />
                {validationErrors.contactNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.contactNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="primaryContact" className="font-semibold">Primary Contact Name</Label>
                <Input
                  id="primaryContact"
                  value={formData.primaryContact}
                  onChange={(e) => setFormData({...formData, primaryContact: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="primaryContactNumber" className="font-semibold">Primary Contact Number</Label>
                <Input
                  id="primaryContactNumber"
                  value={formData.primaryContactNumber}
                  onChange={(e) => {
                    setFormData({...formData, primaryContactNumber: e.target.value});
                    setValidationErrors({ ...validationErrors, primaryContactNumber: "" });
                  }}
                  className={validationErrors.primaryContactNumber ? "border-2 border-red-500" : "border-2 border-blue-200"}
                />
                {validationErrors.primaryContactNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.primaryContactNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="secondaryContact" className="font-semibold">Secondary Contact Name</Label>
                <Input
                  id="secondaryContact"
                  value={formData.secondaryContact}
                  onChange={(e) => setFormData({...formData, secondaryContact: e.target.value})}
                  className="border-2 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="secondaryContactNumber" className="font-semibold">Secondary Contact Number</Label>
                <Input
                  id="secondaryContactNumber"
                  value={formData.secondaryContactNumber}
                  onChange={(e) => {
                    setFormData({...formData, secondaryContactNumber: e.target.value});
                    setValidationErrors({ ...validationErrors, secondaryContactNumber: "" });
                  }}
                  className={validationErrors.secondaryContactNumber ? "border-2 border-red-500" : "border-2 border-blue-200"}
                />
                {validationErrors.secondaryContactNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.secondaryContactNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="coachingCredits" className="font-semibold">Coaching Credits</Label>
                <Input
                  id="coachingCredits"
                  type="number"
                  min="0"
                  value={formData.coachingCredits}
                  onChange={(e) => {
                    setFormData({...formData, coachingCredits: parseInt(e.target.value) || 0});
                    setValidationErrors({ ...validationErrors, coachingCredits: "" });
                  }}
                  className={validationErrors.coachingCredits ? "border-2 border-red-500" : "border-2 border-blue-200"}
                />
                {validationErrors.coachingCredits && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.coachingCredits}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="medicalNotes" className="font-semibold">Medical Notes</Label>
              <Textarea
                id="medicalNotes"
                placeholder="Known allergies, pre-existing conditions..."
                value={formData.medicalNotes}
                onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                className="border-2 border-blue-200 min-h-24"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 font-bold"
              >
                {editingMember ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-700">Import Members from CSV</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-900 font-semibold mb-2">CSV Format:</p>
              <p className="text-xs text-blue-700">
                First Name, Last Name, Date of Birth, Nationality, Address, Email, Shirt Number, 
                Category, Type, Role, Team, Joining Date, Contact Number, 
                Primary Contact, Primary Contact Number, Secondary Contact, Secondary Contact Number, 
                Medical Notes, Coaching Credits, Photo URL
              </p>
            </div>

            <Input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="border-2 border-blue-200"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
        <DialogContent className="max-w-2xl bg-black/95 p-0 border-0 overflow-hidden">
          <div className="relative flex items-center justify-center p-4">
            <img
              src={previewPhotoUrl}
              alt="Member preview"
              className="max-w-full max-h-[85vh] object-contain rounded-sm cursor-pointer"
              onClick={() => setIsPhotoPreviewOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}