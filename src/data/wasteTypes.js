// Centralized Waste Type and Category Configuration for EcoRoute (SIH PS-14)

export const WASTE_CATEGORIES = {
  GENERAL: {
    id: "GENERAL",
    label: "General Municipal Waste",
    description: "Standard urban, commercial and residential waste streams",
    color: "#38bdf8", // Sky blue
    badgeBg: "bg-sky-500/20",
    badgeText: "text-sky-300",
    badgeBorder: "border-sky-500/30",
  },
  HOSPITAL: {
    id: "HOSPITAL",
    label: "Bio-Medical & Healthcare Waste",
    description: "Clinical, pharmaceutical, and healthcare facility waste streams",
    color: "#f43f5e", // Rose red
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-300",
    badgeBorder: "border-rose-500/30",
  }
};

export const WASTE_TYPES = {
  DRY: {
    id: "DRY",
    label: "Dry Recyclables",
    shortLabel: "Dry",
    category: "GENERAL",
    color: "#38bdf8", // Cyan / Sky
    routeColor: "#0284c7",
    glowColor: "rgba(56, 189, 248, 0.6)",
    icon: "Package",
    priorityWeight: 15,
    vehicleType: "DRY_WASTE",
    densityKgPerLiter: 0.25,
    description: "Paper, plastics, metals, clean dry packaging"
  },
  WET: {
    id: "WET",
    label: "Wet Organic Waste",
    shortLabel: "Wet",
    category: "GENERAL",
    color: "#10b981", // Emerald
    routeColor: "#059669",
    glowColor: "rgba(16, 185, 129, 0.6)",
    icon: "Apple",
    priorityWeight: 20,
    vehicleType: "WET_WASTE",
    densityKgPerLiter: 0.65,
    description: "Food scraps, kitchen waste, degradable wet matter"
  },
  ORGANIC: {
    id: "ORGANIC",
    label: "Compostable Organic",
    shortLabel: "Organic",
    category: "GENERAL",
    color: "#84cc16", // Lime
    routeColor: "#65a30d",
    glowColor: "rgba(132, 204, 22, 0.6)",
    icon: "Leaf",
    priorityWeight: 20,
    vehicleType: "WET_WASTE",
    densityKgPerLiter: 0.60,
    description: "Horticulture waste, market food waste, bulk compostable"
  },
  MEDICAL: {
    id: "MEDICAL",
    label: "General Medical Waste",
    shortLabel: "Medical",
    category: "HOSPITAL",
    color: "#f59e0b", // Amber
    routeColor: "#d97706",
    glowColor: "rgba(245, 158, 11, 0.7)",
    icon: "Cross",
    priorityWeight: 35,
    vehicleType: "MEDICAL_WASTE",
    densityKgPerLiter: 0.40,
    description: "Used medical supplies, bandages, sterile packaging, gloves"
  },
  SHARPS: {
    id: "SHARPS",
    label: "Sharps & Syringes",
    shortLabel: "Sharps",
    category: "HOSPITAL",
    color: "#ef4444", // Red
    routeColor: "#dc2626",
    glowColor: "rgba(239, 68, 68, 0.8)",
    icon: "ShieldAlert",
    priorityWeight: 45,
    vehicleType: "SHARPS_WASTE",
    densityKgPerLiter: 0.35,
    description: "Puncture-proof containers for needles, scalpels, glass ampoules"
  },
  INFECTIOUS: {
    id: "INFECTIOUS",
    label: "Infectious Biohazard",
    shortLabel: "Infectious",
    category: "HOSPITAL",
    color: "#ec4899", // Pink
    routeColor: "#db2777",
    glowColor: "rgba(236, 72, 153, 0.8)",
    icon: "Biohazard",
    priorityWeight: 40,
    vehicleType: "MEDICAL_WASTE",
    densityKgPerLiter: 0.45,
    description: "Contaminated clinical waste, pathology samples, swabs"
  },
  PHARMACEUTICAL: {
    id: "PHARMACEUTICAL",
    label: "Pharmaceutical Waste",
    shortLabel: "Pharma",
    category: "HOSPITAL",
    color: "#a855f7", // Purple
    routeColor: "#9333ea",
    glowColor: "rgba(168, 85, 247, 0.7)",
    icon: "Pill",
    priorityWeight: 30,
    vehicleType: "PHARMACEUTICAL_WASTE",
    densityKgPerLiter: 0.30,
    description: "Expired medicines, chemical vials, discarded drugs"
  }
};

/**
 * Normalizes legacy strings to standardized waste type key
 */
export function normalizeWasteType(rawType) {
  if (!rawType) return "DRY";
  const upper = rawType.toString().toUpperCase().trim();
  if (WASTE_TYPES[upper]) return upper;
  if (upper.includes("DRY") || upper.includes("GENERAL") || upper.includes("RECYCLABLE") || upper.includes("E-WASTE")) return "DRY";
  if (upper.includes("WET")) return "WET";
  if (upper.includes("ORGANIC")) return "ORGANIC";
  if (upper.includes("SHARP") || upper.includes("SYRINGE")) return "SHARPS";
  if (upper.includes("INFECTIOUS") || upper.includes("BIOHAZARD")) return "INFECTIOUS";
  if (upper.includes("PHARMA") || upper.includes("DRUG") || upper.includes("MEDICINE")) return "PHARMACEUTICAL";
  if (upper.includes("MED") || upper.includes("HAZARDOUS") || upper.includes("HOSPITAL")) return "MEDICAL";
  return "DRY";
}

/**
 * Retrieve configuration object for any waste type
 */
export function getWasteTypeConfig(wasteTypeKey) {
  const normalized = normalizeWasteType(wasteTypeKey);
  return WASTE_TYPES[normalized] || WASTE_TYPES.DRY;
}
