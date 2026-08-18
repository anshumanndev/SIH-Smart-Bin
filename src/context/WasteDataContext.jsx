import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_BINS, INITIAL_ALERTS, MUNICIPAL_DEPOT } from '../data/mockBins';
import { INITIAL_HOSPITAL_BINS } from '../data/hospitalBins';
import { VEHICLES } from '../data/vehicles';
import { WASTE_TYPES, getWasteTypeConfig, normalizeWasteType } from '../data/wasteTypes';
import { optimizeRoute, optimizeMultiCategoryRoutes } from '../utils/routeOptimizer';
import { calculateBinPriority } from '../utils/priorityCalculator';
import { soundEngine } from '../utils/audioAlerts';

const WasteDataContext = createContext();

export function WasteDataProvider({ children }) {
  // Merge initial general bins with initial hospital bins
  const [bins, setBins] = useState(() => {
    const combined = [...INITIAL_BINS, ...INITIAL_HOSPITAL_BINS];
    return combined.map((bin) => ({
      ...bin,
      binCategory: bin.binCategory || (bin.hospitalName ? 'HOSPITAL' : 'GENERAL'),
      wasteType: normalizeWasteType(bin.wasteType)
    }));
  });

  const [depot, setDepot] = useState(MUNICIPAL_DEPOT);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [selectedBinId, setSelectedBinId] = useState(null);
  
  // Navigation & Role State
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' | 'driver' | 'supervisor'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'map' | 'bins' | 'hospital' | 'routes' | 'driver-hud' | 'analytics'
  
  // Filters & Search
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'GENERAL' | 'HOSPITAL'
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio
  const [soundEnabled, setSoundEnabled] = useState(true);

  // IoT Simulation State
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x, 2x, 5x
  
  // Active Selected Route & Vehicle for Navigation / Simulation
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [activeVehicleId, setActiveVehicleId] = useState('TRUCK-01');

  // Multi-route simulation tracking
  const [isDrivingRoute, setIsDrivingRoute] = useState(false);
  const [simulatingRouteId, setSimulatingRouteId] = useState(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [completedStops, setCompletedStops] = useState([]);

  // Map of vehicle positions: { [vehicleId]: [lat, lng] }
  const [vehiclePositions, setVehiclePositions] = useState(() => {
    const initialPos = {};
    VEHICLES.forEach((v) => {
      initialPos[v.id] = [MUNICIPAL_DEPOT.lat, MUNICIPAL_DEPOT.lng];
    });
    return initialPos;
  });

  // Map of vehicle loads in kg: { [vehicleId]: currentLoadKg }
  const [vehicleLoads, setVehicleLoads] = useState(() => {
    const loads = {};
    VEHICLES.forEach((v) => {
      loads[v.id] = 0;
    });
    return loads;
  });

  // Toggle sound setting
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      soundEngine.enabled = !prev;
      return !prev;
    });
  }, []);

  // Compute critical / priority bins (bins requiring collection)
  const criticalBins = useMemo(() => {
    return bins.filter((b) => {
      const priority = calculateBinPriority(b);
      return b.fillLevel >= 70 || b.status === 'critical' || priority.score >= 80;
    });
  }, [bins]);

  // Compute all optimized multi-category routes
  const allRoutes = useMemo(() => {
    return optimizeMultiCategoryRoutes(depot, criticalBins, vehicles);
  }, [depot, criticalBins, vehicles]);

  // Determine currently active route
  const activeRoute = useMemo(() => {
    if (allRoutes.length === 0) {
      return optimizeRoute(depot, [], vehicles[0]);
    }
    if (activeRouteId) {
      const found = allRoutes.find((r) => r.id === activeRouteId);
      if (found) return found;
    }
    return allRoutes[0];
  }, [allRoutes, activeRouteId, depot, vehicles]);

  // Keep activeVehicleId in sync with activeRoute
  useEffect(() => {
    if (activeRoute && activeRoute.vehicleId && activeRoute.vehicleId !== activeVehicleId) {
      setActiveVehicleId(activeRoute.vehicleId);
    }
  }, [activeRoute]);

  // Selected bin object
  const selectedBin = useMemo(() => {
    return bins.find((b) => b.id === selectedBinId) || null;
  }, [bins, selectedBinId]);

  // Empty a Bin Action
  const emptyBin = useCallback((binId) => {
    let collectedWeightKg = 0;
    let targetWasteType = 'DRY';

    setBins((prevBins) =>
      prevBins.map((b) => {
        if (b.id === binId) {
          const wConfig = getWasteTypeConfig(b.wasteType);
          collectedWeightKg = Math.round((b.capacityLiters || 660) * ((b.fillLevel || 0) / 100) * (wConfig.densityKgPerLiter || 0.4));
          targetWasteType = b.wasteType;

          return {
            ...b,
            fillLevel: 0,
            gasLevelPpm: Math.max(10, Math.round(b.gasLevelPpm * 0.15)),
            temperature: 23.5,
            tiltAngle: 0.1,
            lidOpen: false,
            status: 'optimal',
            lastEmptied: 'Just now',
            history: [...b.history.slice(1), 0]
          };
        }
        return b;
      })
    );

    // Update vehicle load if active
    if (activeVehicleId && collectedWeightKg > 0) {
      setVehicleLoads((prev) => ({
        ...prev,
        [activeVehicleId]: Math.min(
          5000,
          (prev[activeVehicleId] || 0) + collectedWeightKg
        )
      }));
    }

    // Remove any active alert for this bin
    setAlerts((prevAlerts) => prevAlerts.filter((a) => a.binId !== binId));

    // Play chime & confetti
    soundEngine.playBinEmptiedSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#22C55E', '#3B82F6', '#10B981', '#F59E0B']
    });
  }, [activeVehicleId]);

  // Trigger simulated hazard on a bin
  const triggerHazard = useCallback((binId, type) => {
    const target = bins.find((b) => b.id === binId);
    if (!target) return;

    let updatedFields = {};
    let alertMsg = '';
    let alertType = 'CRITICAL_OVERFLOW';

    if (type === 'OVERFLOW') {
      updatedFields = { fillLevel: 98, status: 'critical' };
      alertMsg = target.binCategory === 'HOSPITAL'
        ? `Bio-hazard overflow detected at ${target.name}! Fill reached 98%.`
        : `Rapid overflow detected at ${target.name}! Fill reached 98%.`;
      alertType = target.wasteType === 'SHARPS' ? 'SHARPS_BIN_CRITICAL' : (target.binCategory === 'HOSPITAL' ? 'MEDICAL_WASTE_CRITICAL' : 'CRITICAL_OVERFLOW');
    } else if (type === 'HEAT_SPIKE') {
      updatedFields = { temperature: 48.5, status: 'critical' };
      alertMsg = `Thermal hazard! High temperature (${48.5}°C) detected at ${target.name}.`;
      alertType = 'FIRE_HEAT_WARNING';
    } else if (type === 'TILT_ALARM') {
      updatedFields = { tiltAngle: 45.2, status: 'critical' };
      alertMsg = `Tamper/Fall alert: Bin tilted by 45.2° at ${target.name}.`;
      alertType = 'TAMPER_TILT_ALARM';
    } else if (type === 'GAS_LEAK') {
      updatedFields = { gasLevelPpm: 320, status: 'critical' };
      alertMsg = `Severe gas/bio-vapor threshold breach (${320} ppm) at ${target.name}.`;
      alertType = 'HIGH_GAS_LEVEL';
    }

    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, ...updatedFields } : b))
    );

    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      binId: target.id,
      binName: target.name,
      category: target.binCategory || 'GENERAL',
      type: alertType,
      severity: 'critical',
      message: alertMsg,
      timestamp: 'Just now',
      fillLevel: updatedFields.fillLevel || target.fillLevel
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 8)]);
    soundEngine.playAlertSiren();
  }, [bins]);

  // Add custom smart bin on map click
  const addNewBin = useCallback((lat, lng, name, wasteType = 'DRY', binCategory = 'GENERAL', hospitalName = '') => {
    const isHospital = binCategory === 'HOSPITAL' || Boolean(hospitalName);
    const newId = isHospital ? `BIN-H${Math.floor(10 + Math.random() * 89)}` : `BIN-${Math.floor(113 + Math.random() * 800)}`;
    const normalizedType = normalizeWasteType(wasteType);
    
    const newBin = {
      id: newId,
      name: name || (isHospital ? `Hospital Unit #${newId}` : `Smart Bin #${newId}`),
      hospitalName: isHospital ? (hospitalName || 'Metropolitan Care Hospital') : undefined,
      binCategory: isHospital ? 'HOSPITAL' : 'GENERAL',
      wasteType: normalizedType,
      lat,
      lng,
      fillLevel: Math.floor(20 + Math.random() * 40),
      capacityLiters: isHospital ? 240 : 660,
      batteryLevel: 98,
      temperature: isHospital ? 22.0 : 25.0,
      gasLevelPpm: isHospital ? 15 : 25,
      tiltAngle: 0.1,
      lidOpen: false,
      status: 'optimal',
      lastEmptied: 'Just deployed',
      assignedTruck: isHospital ? 'MED-01' : 'TRUCK-01',
      zone: 'Central Zone',
      department: isHospital ? 'General Ward' : undefined,
      history: [5, 10, 15, 20, 25, 30]
    };

    setBins((prev) => [...prev, newBin]);
    soundEngine.playDispatchSound();
    return newBin;
  }, []);

  // Dismiss an alert
  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  // IoT Background Simulation Timer
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setBins((prevBins) =>
        prevBins.map((b) => {
          // Fill up slowly based on simulation speed
          const fillIncrement = Math.random() < 0.4 ? (Math.random() * 0.8 * simulationSpeed) : 0;
          const newFill = Math.min(100, Math.round((b.fillLevel + fillIncrement) * 10) / 10);
          
          let newStatus = b.status;
          if (newFill >= 70) newStatus = 'critical';
          else if (newFill >= 50) newStatus = 'warning';
          else newStatus = 'optimal';

          // Battery drain
          const newBattery = Math.max(5, Math.round((b.batteryLevel - 0.005 * simulationSpeed) * 10) / 10);

          return {
            ...b,
            fillLevel: newFill,
            status: newStatus,
            batteryLevel: newBattery
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  // Route Simulation Player (Driving selected vehicle along the active route)
  useEffect(() => {
    if (!isDrivingRoute || !activeRoute || !activeRoute.steps || activeRoute.steps.length === 0) return;

    const pathCoords = activeRoute.coordinatesPath;
    if (pathCoords.length === 0) return;

    const currentVehicleId = activeRoute.vehicleId || 'TRUCK-01';

    const stepInterval = setInterval(() => {
      setCurrentWaypointIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= pathCoords.length) {
          // Completed route loop!
          setIsDrivingRoute(false);
          setSimulatingRouteId(null);
          soundEngine.playDispatchSound();
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
          
          // Reset vehicle position to depot
          setVehiclePositions((prev) => ({
            ...prev,
            [currentVehicleId]: [depot.lat, depot.lng]
          }));
          return 0;
        }

        const nextPoint = pathCoords[nextIdx];
        setVehiclePositions((prev) => ({
          ...prev,
          [currentVehicleId]: nextPoint
        }));

        // If this waypoint corresponds to a bin, automatically empty it!
        const step = activeRoute.steps[nextIdx];
        if (step && step.bin) {
          emptyBin(step.bin.id);
          setCompletedStops((prev) => [...prev, step.bin.id]);
        }

        return nextIdx;
      });
    }, 2800 / simulationSpeed);

    return () => clearInterval(stepInterval);
  }, [isDrivingRoute, activeRoute, simulationSpeed, emptyBin, depot]);

  // Start route simulation for a specific route
  const startRouteSimulation = useCallback((routeIdToStart = null) => {
    const targetRoute = routeIdToStart 
      ? allRoutes.find((r) => r.id === routeIdToStart) || activeRoute
      : activeRoute;

    if (!targetRoute || targetRoute.coordinatesPath.length <= 1) return;

    setActiveRouteId(targetRoute.id);
    setActiveVehicleId(targetRoute.vehicleId);
    setSimulatingRouteId(targetRoute.id);
    setIsDrivingRoute(true);
    setCurrentWaypointIndex(0);
    setCompletedStops([]);

    setVehiclePositions((prev) => ({
      ...prev,
      [targetRoute.vehicleId]: [depot.lat, depot.lng]
    }));

    soundEngine.playDispatchSound();
  }, [allRoutes, activeRoute, depot]);

  // Stop route simulation
  const stopRouteSimulation = useCallback(() => {
    setIsDrivingRoute(false);
    setSimulatingRouteId(null);
    setCurrentWaypointIndex(0);

    if (activeRoute) {
      setVehiclePositions((prev) => ({
        ...prev,
        [activeRoute.vehicleId]: [depot.lat, depot.lng]
      }));
    }
  }, [activeRoute, depot]);

  // Reset all bins and state
  const resetAllBins = useCallback(() => {
    const combined = [...INITIAL_BINS, ...INITIAL_HOSPITAL_BINS].map((bin) => ({
      ...bin,
      binCategory: bin.binCategory || (bin.hospitalName ? 'HOSPITAL' : 'GENERAL'),
      wasteType: normalizeWasteType(bin.wasteType)
    }));

    setBins(combined);
    setAlerts(INITIAL_ALERTS);
    setIsDrivingRoute(false);
    setSimulatingRouteId(null);
    setCurrentWaypointIndex(0);

    const initialPos = {};
    const initialLoads = {};
    VEHICLES.forEach((v) => {
      initialPos[v.id] = [depot.lat, depot.lng];
      initialLoads[v.id] = 0;
    });
    setVehiclePositions(initialPos);
    setVehicleLoads(initialLoads);

    soundEngine.playBinEmptiedSound();
  }, [depot]);

  const value = {
    bins,
    setBins,
    depot,
    setDepot,
    alerts,
    vehicles,
    setVehicles,
    selectedBin,
    selectedBinId,
    setSelectedBinId,
    activeRole,
    setActiveRole,
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    hospitalFilter,
    setHospitalFilter,
    searchQuery,
    setSearchQuery,
    soundEnabled,
    toggleSound,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    criticalBins,
    allRoutes,
    activeRoute,
    activeRouteId,
    setActiveRouteId,
    activeVehicleId,
    setActiveVehicleId,
    vehiclePositions,
    vehicleLoads,
    isDrivingRoute,
    simulatingRouteId,
    currentWaypointIndex,
    completedStops,
    emptyBin,
    triggerHazard,
    addNewBin,
    dismissAlert,
    startRouteSimulation,
    stopRouteSimulation,
    resetAllBins
  };

  return <WasteDataContext.Provider value={value}>{children}</WasteDataContext.Provider>;
}

export function useWasteData() {
  const context = useContext(WasteDataContext);
  if (!context) {
    throw new Error('useWasteData must be used within a WasteDataProvider');
  }
  return context;
}
