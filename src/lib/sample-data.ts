// Sample data generator for Bali Bulldogs Club Manager

export const generateSampleMembers = () => {
  const currentYear = new Date().getFullYear();
  
  return [
    {
      id: "m1",
      membershipId: `BBFC-${currentYear}-0001`,
      firstName: "Gabriel",
      lastName: "Jaunay",
      dateOfBirth: "2023-01-12",
      nationality: "Ireland",
      address: "Canggu",
      email: "gabriel.j@example.com",
      shirtNumber: "1",
      type: "Junior" as const,
      role: "Player" as const,
      team: "Toddler",
      membershipCategory: "Member" as const,
      joiningDate: "2020-12-21",
      contactNumber: "+62812345001",
      primaryContact: "Sarah Jaunay",
      primaryContactNumber: "+62812345001",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      school: "Green School Bali"
    },
    {
      id: "m2",
      membershipId: `BBFC-${currentYear}-0002`,
      firstName: "Liam",
      lastName: "van Alebeek",
      dateOfBirth: "2021-04-02",
      nationality: "Ireland",
      address: "Seminyak",
      email: "liam.v@example.com",
      shirtNumber: "2",
      type: "Junior" as const,
      role: "Player" as const,
      team: "Toddler",
      membershipCategory: "Member" as const,
      joiningDate: "2021-04-02",
      contactNumber: "+62812345002",
      primaryContact: "Emma van Alebeek",
      primaryContactNumber: "+62812345002",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      school: "Bali Island School"
    },
    {
      id: "m3",
      membershipId: `BBFC-${currentYear}-0003`,
      firstName: "Max",
      lastName: "Harrison",
      dateOfBirth: "2018-12-08",
      nationality: "United Kingdom",
      address: "Ubud",
      email: "max.h@example.com",
      shirtNumber: "2",
      type: "Member" as const,
      role: "Player" as const,
      team: "",
      membershipCategory: "Member" as const,
      joiningDate: "2021-08-12",
      contactNumber: "+62812345003",
      primaryContact: "James Harrison",
      primaryContactNumber: "+62812345003",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      school: "Bali International School"
    },
    {
      id: "m4",
      membershipId: `BBFC-${currentYear}-0004`,
      firstName: "Justin",
      lastName: "Becker",
      dateOfBirth: "2019-08-21",
      nationality: "Kazakhstan",
      address: "Sanur",
      email: "justin.b@example.com",
      shirtNumber: "3",
      type: "Member" as const,
      role: "Player" as const,
      team: "",
      membershipCategory: "Member" as const,
      joiningDate: "2021-12-08",
      contactNumber: "+62812345004",
      primaryContact: "Anna Becker",
      primaryContactNumber: "+62812345004",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      school: "Bali International School"
    },
    {
      id: "m5",
      membershipId: `BBFC-${currentYear}-0005`,
      firstName: "Drigny",
      lastName: "Fred",
      dateOfBirth: "1985-03-15",
      nationality: "France",
      address: "Berawa",
      email: "drigny.f@example.com",
      shirtNumber: "1",
      type: "Adult" as const,
      role: "Player" as const,
      team: "Legends",
      position: "FWD" as const,
      membershipCategory: "Standard" as const,
      joiningDate: "2019-06-01",
      contactNumber: "+62812345005",
      primaryContact: "",
      primaryContactNumber: "",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      school: ""
    },
    {
      id: "m6",
      membershipId: `BBFC-${currentYear}-0006`,
      firstName: "Sophie",
      lastName: "Anderson",
      dateOfBirth: "2012-05-20",
      nationality: "Australia",
      address: "Canggu",
      email: "sophie.a@example.com",
      shirtNumber: "7",
      type: "Youth" as const,
      role: "Player" as const,
      team: "U14 Girls",
      position: "MID" as const,
      membershipCategory: "Standard" as const,
      joiningDate: "2020-01-15",
      contactNumber: "+62812345006",
      primaryContact: "Lisa Anderson",
      primaryContactNumber: "+62812345006",
      secondaryContact: "Mark Anderson",
      secondaryContactNumber: "+62812345007",
      medicalNotes: "Mild asthma - has inhaler",
      coachingCredits: 6,
      school: "Bali International School"
    },
    {
      id: "m7",
      membershipId: `BBFC-${currentYear}-0007`,
      firstName: "Lucas",
      lastName: "Silva",
      dateOfBirth: "2015-09-10",
      nationality: "Brazil",
      address: "Seminyak",
      email: "lucas.s@example.com",
      shirtNumber: "10",
      type: "Junior" as const,
      role: "Player" as const,
      team: "U10 Adv",
      position: "FWD" as const,
      membershipCategory: "Sponsored" as const,
      joiningDate: "2021-03-10",
      contactNumber: "+62812345008",
      primaryContact: "Maria Silva",
      primaryContactNumber: "+62812345008",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 3,
      school: "Green School Bali"
    },
    {
      id: "m8",
      membershipId: `BBFC-${currentYear}-0008`,
      firstName: "Emma",
      lastName: "Chen",
      dateOfBirth: "2014-07-22",
      nationality: "Singapore",
      address: "Sanur",
      email: "emma.c@example.com",
      shirtNumber: "5",
      type: "Youth" as const,
      role: "Player" as const,
      team: "U12 Adv",
      position: "DEF" as const,
      membershipCategory: "Standard" as const,
      joiningDate: "2020-08-05",
      contactNumber: "+62812345009",
      primaryContact: "Wei Chen",
      primaryContactNumber: "+62812345009",
      secondaryContact: "Lin Chen",
      secondaryContactNumber: "+62812345010",
      medicalNotes: "",
      coachingCredits: 0,
      school: "Bali Island School"
    },
    {
      id: "m9",
      membershipId: `BBFC-${currentYear}-0009`,
      firstName: "Mohammed",
      lastName: "Al-Rahman",
      dateOfBirth: "2016-11-30",
      nationality: "United Arab Emirates",
      address: "Ubud",
      email: "mohammed.a@example.com",
      shirtNumber: "9",
      type: "Junior" as const,
      role: "Player" as const,
      team: "U8 Dev",
      position: "FWD" as const,
      membershipCategory: "Scholarship" as const,
      joiningDate: "2022-01-20",
      contactNumber: "+62812345011",
      primaryContact: "Fatima Al-Rahman",
      primaryContactNumber: "+62812345011",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "Peanut allergy",
      coachingCredits: 0,
      school: "Taman Rama School"
    },
    {
      id: "m10",
      membershipId: `BBFC-${currentYear}-0010`,
      firstName: "Jake",
      lastName: "Thompson",
      dateOfBirth: "1992-04-15",
      nationality: "United States",
      address: "Berawa",
      email: "jake.t@example.com",
      shirtNumber: "",
      type: "Adult" as const,
      role: "Coach" as const,
      team: "U10 Adv",
      membershipCategory: "Standard" as const,
      joiningDate: "2019-09-01",
      contactNumber: "+62812345012",
      primaryContact: "",
      primaryContactNumber: "",
      secondaryContact: "",
      secondaryContactNumber: "",
      medicalNotes: "",
      coachingCredits: 0,
      school: ""
    }
  ];
};

export const generateSampleInvoices = () => {
  const currentYear = new Date().getFullYear();
  
  return [
    {
      id: "inv1",
      memberId: "m5",
      memberName: "Drigny Fred",
      billingPeriod: `${currentYear} Q1`,
      dueDate: `${currentYear}-03-31`,
      amount: 1500000,
      paymentLink: "",
      status: "Paid" as const
    },
    {
      id: "inv2",
      memberId: "m6",
      memberName: "Sophie Anderson",
      billingPeriod: `${currentYear} Q1`,
      dueDate: `${currentYear}-03-31`,
      amount: 1200000,
      paymentLink: "",
      status: "Paid" as const
    },
    {
      id: "inv3",
      memberId: "m7",
      memberName: "Lucas Silva",
      billingPeriod: `${currentYear} Q2`,
      dueDate: `${currentYear}-06-30`,
      amount: 1000000,
      paymentLink: "",
      status: "Overdue" as const
    },
    {
      id: "inv4",
      memberId: "m8",
      memberName: "Emma Chen",
      billingPeriod: `${currentYear} Q2`,
      dueDate: `${currentYear}-06-30`,
      amount: 1200000,
      paymentLink: "",
      status: "Sent" as const
    }
  ];
};

export const generateSampleCoaches = () => {
  return [
    {
      id: "coach1",
      name: "Jake Thompson",
      phone: "+62812345012",
      tier: "Head Coach" as const
    },
    {
      id: "coach2",
      name: "Maria Santos",
      phone: "+62812345013",
      tier: "Senior Coach" as const
    },
    {
      id: "coach3",
      name: "David Kim",
      phone: "+62812345014",
      tier: "Goalkeeper Coach" as const
    }
  ];
};

export const generateSampleSessions = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: "session1",
      memberId: "m6",
      memberName: "Sophie Anderson",
      coachId: "coach1",
      coachName: "Jake Thompson",
      date: today.toISOString().split("T")[0],
      time: "16:00",
      notes: "Focus on ball control"
    },
    {
      id: "session2",
      memberId: "m7",
      memberName: "Lucas Silva",
      coachId: "coach2",
      coachName: "Maria Santos",
      date: tomorrow.toISOString().split("T")[0],
      time: "15:00",
      notes: "Shooting practice"
    }
  ];
};