// Vehicle Fleet Configuration and Compatibility Matrix for EcoRoute (SIH PS-14)

export const VEHICLES = [
  {
    id: "TRUCK-01",
    name: "Eco Collector 01 (Dry & Recyclables)",
    shortName: "Truck 01",
    type: "DRY_WASTE",
    category: "GENERAL",
    driverName: "Rajiv Sharma",
    capacityKg: 4500,
    currentLoadKg: 0,
    status: "AVAILABLE",
    compatibleWasteTypes: ["DRY", "General", "Recyclable", "E-Waste"],
    iconType: "TRUCK_GENERAL",
    color: "#38bdf8", // Sky blue
    plateNumber: "DL-1C-9821",
    fuelLevelPercent: 88,
    efficiencyKmPerLiter: 2.6
  },
  {
    id: "TRUCK-02",
    name: "Bio-Collector 02 (Wet & Organic)",
    shortName: "Truck 02",
    type: "WET_WASTE",
    category: "GENERAL",
    driverName: "Amit Kumar",
    capacityKg: 5000,
    currentLoadKg: 0,
    status: "AVAILABLE",
    compatibleWasteTypes: ["WET", "ORGANIC", "Organic"],
    iconType: "TRUCK_BIO",
    color: "#10b981", // Emerald
    plateNumber: "DL-1C-4412",
    fuelLevelPercent: 92,
    efficiencyKmPerLiter: 2.4
  },
  {
    id: "MED-01",
    name: "Biohazard Medical Express (Clinical & Infectious)",
    shortName: "Med Van 01",
    type: "MEDICAL_WASTE",
    category: "HOSPITAL",
    driverName: "Dr. Suresh Verma (Certified)",
    capacityKg: 2000,
    currentLoadKg: 0,
    status: "AVAILABLE",
    compatibleWasteTypes: ["MEDICAL", "INFECTIOUS", "Hazardous"],
    iconType: "VAN_MEDICAL",
    color: "#f59e0b", // Amber
    plateNumber: "DL-2C-MED1",
    fuelLevelPercent: 95,
    efficiencyKmPerLiter: 3.8
  },
  {
    id: "MED-02",
    name: "Sharps Secure Vault Unit",
    shortName: "Sharps Van 02",
    type: "SHARPS_WASTE",
    category: "HOSPITAL",
    driverName: "Vikram Singh (HazMat Certified)",
    capacityKg: 1000,
    currentLoadKg: 0,
    status: "AVAILABLE",
    compatibleWasteTypes: ["SHARPS"],
    iconType: "VAN_SHARPS",
    color: "#ef4444", // Red
    plateNumber: "DL-2C-SHRP",
    fuelLevelPercent: 84,
    efficiencyKmPerLiter: 4.2
  },
  {
    id: "PHARMA-01",
    name: "Pharma Vault & Chemical Van",
    shortName: "Pharma 01",
    type: "PHARMACEUTICAL_WASTE",
    category: "HOSPITAL",
    driverName: "Pooja Malhotra",
    capacityKg: 1500,
    currentLoadKg: 0,
    status: "AVAILABLE",
    compatibleWasteTypes: ["PHARMACEUTICAL"],
    iconType: "VAN_PHARMA",
    color: "#a855f7", // Purple
    plateNumber: "DL-2C-PHRM",
    fuelLevelPercent: 90,
    efficiencyKmPerLiter: 4.0
  }
];

/**
 * Returns all vehicles capable of collecting a specific waste type
 */
export function getCompatibleVehicles(wasteType) {
  const normalized = (wasteType || "DRY").toString().toUpperCase();
  return VEHICLES.filter((vehicle) =>
    vehicle.compatibleWasteTypes.some((t) => t.toUpperCase() === normalized)
  );
}

/**
 * Finds the best single vehicle match for a waste type
 */
export function getPrimaryVehicleForWasteType(wasteType) {
  const compatible = getCompatibleVehicles(wasteType);
  return compatible.length > 0 ? compatible[0] : VEHICLES[0];
}

/**
 * Check if a vehicle can collect a specific waste type
 */
export function isVehicleCompatible(vehicleId, wasteType) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId);
  if (!vehicle) return false;
  const normalized = (wasteType || "DRY").toString().toUpperCase();
  return vehicle.compatibleWasteTypes.some((t) => t.toUpperCase() === normalized);
}
