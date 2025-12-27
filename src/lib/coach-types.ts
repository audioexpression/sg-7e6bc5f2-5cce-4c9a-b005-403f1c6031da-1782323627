// Shared Coach type used across the application
// This ensures consistent data structure in localStorage and all pages

export interface Coach {
  id: string;
  name: string;
  phone: string;
  tier: "Head Coach" | "Goalkeeper Coach" | "Senior Coach" | "Assistant Coach";
  hourlyRate: number;
}

export const TIER_RATES: Record<Coach["tier"], number> = {
  "Head Coach": 750000,
  "Goalkeeper Coach": 600000,
  "Senior Coach": 500000,
  "Assistant Coach": 400000,
};

export const COACH_TIERS: Coach["tier"][] = [
  "Head Coach",
  "Goalkeeper Coach", 
  "Senior Coach",
  "Assistant Coach"
];

// localStorage key for coaches (used across all pages)
export const COACHES_STORAGE_KEY = "coaches";

// Helper functions for coach data management
export const loadCoaches = (): Coach[] => {
  const saved = localStorage.getItem(COACHES_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing coaches from localStorage:", e);
      return [];
    }
  }
  return [];
};

export const saveCoaches = (coaches: Coach[]): void => {
  localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(coaches));
  console.log("💾 Coaches saved to localStorage:", coaches);
};

export const addCoach = (coach: Omit<Coach, "id">): Coach => {
  const newCoach: Coach = {
    id: Date.now().toString(),
    ...coach,
  };
  
  const coaches = loadCoaches();
  const updatedCoaches = [...coaches, newCoach];
  saveCoaches(updatedCoaches);
  
  return newCoach;
};

export const updateCoach = (id: string, updates: Partial<Coach>): Coach | null => {
  const coaches = loadCoaches();
  const index = coaches.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updatedCoach = { ...coaches[index], ...updates };
  coaches[index] = updatedCoach;
  saveCoaches(coaches);
  
  return updatedCoach;
};

export const deleteCoach = (id: string): boolean => {
  const coaches = loadCoaches();
  const filtered = coaches.filter(c => c.id !== id);
  
  if (filtered.length === coaches.length) return false;
  
  saveCoaches(filtered);
  return true;
};