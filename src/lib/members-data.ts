export const TEAMS = [
  "Toddler",
  "Kindy 1",
  "Kindy 2",
  "U6",
  "U8 Dev",
  "U8 Adv",
  "U10 Dev",
  "U10 Adv",
  "U12 Dev",
  "U12 Adv",
  "U12 Girls",
  "U14",
  "U14 Girls",
  "U16",
  "U18 Girls",
  "U18",
  "Women",
  "Masters 45+",
  "Legends",
  "Social",
  "1st Team",
];

export const TYPES = ["Member", "Sponsored", "Scholarship"];

export const ROLES = ["Admin", "Coach", "Player Coach", "Player"];

export const MEMBERSHIP_CATEGORIES = ["Standard", "Sponsored", "Scholarship"];

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
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
  coachingCredits: number;
  feeStructure?: "Regular" | "Reduced";
}

export const SAMPLE_MEMBERS: Member[] = [
  {
    id: "1",
    firstName: "Yadi",
    lastName: "Wiharjo",
    photo: undefined,
    dateOfBirth: "2018-03-15",
    nationality: "Indonesian",
    address: "Ubud, Bali",
    email: "yadi@example.com",
    shirtNumber: 10,
    type: "Junior",
    role: "Player",
    team: "U6",
    membershipCategory: "Standard",
    joiningDate: "2023-01-15",
    contactNumber: "081234567890",
    primaryContact: "Mom",
    primaryContactNumber: "081234567891",
    secondaryContact: "Dad",
    secondaryContactNumber: "081234567892",
    medicalNotes: "None",
    coachingCredits: 0,
  },
  {
    id: "2",
    firstName: "Lina",
    lastName: "Putri",
    photo: undefined,
    dateOfBirth: "2019-07-22",
    nationality: "Indonesian",
    address: "Denpasar, Bali",
    email: "lina@example.com",
    shirtNumber: 22,
    type: "Junior",
    role: "Player",
    team: "U8 Dev",
    membershipCategory: "Sponsored",
    joiningDate: "2023-02-20",
    contactNumber: "081234567893",
    primaryContact: "Mom",
    primaryContactNumber: "081234567894",
    secondaryContact: "Dad",
    secondaryContactNumber: "081234567895",
    medicalNotes: "None",
    coachingCredits: 0,
  }
];

const TEAMS_BY_CATEGORY = {
  Junior: ["Toddler", "Kindy 1", "Kindy 2", "U6", "U8 Dev", "U8 Adv", "U10 Dev", "U10 Adv", "U12 Dev", "U12 Adv", "U12 Girls"],
  Youth: ["U14", "U14 Girls", "U16", "U18 Girls", "U18"],
  Adult: ["Women", "Masters 45+", "Legends", "Social", "1st Team"]
};