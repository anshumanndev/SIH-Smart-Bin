import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_BINS, INITIAL_ALERTS, MUNICIPAL_DEPOT } from '../data/mockBins';
import { optimizeRoute } from '../utils/routeOptimizer';
import { soundEngine } from '../utils/audioAlerts';

const WasteDataContext = createContext();

export function WasteDataProvider({ children }) {
  const [bins, setBins] = useState(INITIAL_BINS);
  const [depot, setDepot] = useState(MUNICIPAL_DEPOT);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [selectedBinId, setSelectedBinId] = useState(null);
  
  // Navigation & Role State
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' | 'driver' | 'supervisor'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'map' | 'bins' | 'optimizer' | 'driver-hud' | 'analytics'
  
  // Filters & Search
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio
  const [soundEnabled, setSoundEnabled] = useState(true);

  // IoT Simulation State
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x, 2x, 5x
  
  // Route Simulation (Truck moving)
  const [isDrivingRoute, setIsDrivingRoute] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [truckPosition, setTruckPosition] = useState([MUNICIPAL_DEPOT.lat, MUNICIPAL_DEPOT.lng]);
  const [completedStops, setCompletedStops] = useState([]);

  // Toggle sound setting
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      soundEngine.enabled = !prev;
      return !prev;
    });
  }, []);

  // Compute active route based on bins >= 70% fill (or manual selection)
  const criticalBins = useMemo(() => {
    return bins.filter((b) => b.fillLevel >= 70 || b.status === 'critical');
  }, [bins]);

  const activeRoute = useMemo(() => {
    return optimizeRoute(depot, criticalBins);
  }, [depot, criticalBins]);

  // Selected bin object
  const selectedBin = useMemo(() => {
    return bins.find((b) => b.id === selectedBinId) || null;
  }, [bins, selectedBinId]);

  // Empty a Bin Action
  const emptyBin = useCallback((binId) => {
    setBins((prevBins) =>
      prevBins.map((b) => {
        if (b.id === binId) {
          return {
            ...b,
            fillLevel: 0,
            gasLevelPpm: Math.max(10, Math.round(b.gasLevelPpm * 0.15)),
            temperature: 24.5,
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

    // Remove any critical alert for this bin
    setAlerts((prevAlerts) => prevAlerts.filter((a) => a.binId !== binId));

    // Play chime & confetti
    soundEngine.playBinEmptiedSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#22C55E', '#3B82F6', '#10B981']
    });
  }, []);

  // Trigger simulated hazard on a bin
  const triggerHazard = useCallback((binId, type) => {
    const target = bins.find((b) => b.id === binId);
    if (!target) return;

    let updatedFields = {};
    let alertMsg = '';
    let alertType = 'CRITICAL_OVERFLOW';

    if (type === 'OVERFLOW') {
      updatedFields = { fillLevel: 98, status: 'critical' };
      alertMsg = `Rapid overflow detected at ${target.name}! Fill reached 98%.`;
      alertType = 'CRITICAL_OVERFLOW';
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
      alertMsg = `Severe gas/methane threshold breach (${320} ppm) at ${target.name}.`;
      alertType = 'HIGH_GAS_LEVEL';
    }

    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, ...updatedFields } : b))
    );

    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      binId: target.id,
      binName: target.name,
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
  const addNewBin = useCallback((lat, lng, name, wasteType = 'General') => {
    const newId = `BIN-${Math.floor(113 + Math.random() * 800)}`;
    const newBin = {
      id: newId,
      name: name || `Smart Bin #${newId}`,
      lat,
      lng,
      fillLevel: Math.floor(20 + Math.random() * 40),
      capacityLiters: 660,
      wasteType: wasteType,
      batteryLevel: 98,
      temperature: 25.0,
      gasLevelPpm: 25,
      tiltAngle: 0.1,
      lidOpen: false,
      status: 'optimal',
      lastEmptied: 'Just deployed',
      assignedTruck: 'Unassigned',
      zone: 'Central Zone',
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

  // IoT Background Simulation Timer (Ticking fill levels realistically)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setBins((prevBins) =>
        prevBins.map((b) => {
          // Slowly fill up based on simulation speed
          const fillIncrement = Math.random() < 0.4 ? (Math.random() * 0.8 * simulationSpeed) : 0;
          const newFill = Math.min(100, Math.round((b.fillLevel + fillIncrement) * 10) / 10);
          
          let newStatus = b.status;
          if (newFill >= 70) newStatus = 'critical';
          else if (newFill >= 50) newStatus = 'warning';
          else newStatus = 'optimal';

          // Random battery drain
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

  // Route Simulation Player (Moving truck along the polyline path)
  useEffect(() => {
    if (!isDrivingRoute || !activeRoute.steps || activeRoute.steps.length === 0) return;

    const pathCoords = activeRoute.coordinatesPath;
    if (pathCoords.length === 0) return;

    const stepInterval = setInterval(() => {
      setCurrentWaypointIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= pathCoords.length) {
          // Completed route loop!
          setIsDrivingRoute(false);
          soundEngine.playDispatchSound();
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
          return 0;
        }

        const nextPoint = pathCoords[nextIdx];
        setTruckPosition(nextPoint);

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
  }, [isDrivingRoute, activeRoute, simulationSpeed, emptyBin]);

  const startRouteSimulation = useCallback(() => {
    if (activeRoute.coordinatesPath.length <= 1) return;
    setIsDrivingRoute(true);
    setCurrentWaypointIndex(0);
    setCompletedStops([]);
    setTruckPosition([depot.lat, depot.lng]);
    soundEngine.playDispatchSound();
  }, [activeRoute, depot]);

  const stopRouteSimulation = useCallback(() => {
    setIsDrivingRoute(false);
    setCurrentWaypointIndex(0);
    setTruckPosition([depot.lat, depot.lng]);
  }, [depot]);

  const resetAllBins = useCallback(() => {
    setBins(INITIAL_BINS);
    setAlerts(INITIAL_ALERTS);
    setIsDrivingRoute(false);
    setCurrentWaypointIndex(0);
    setTruckPosition([depot.lat, depot.lng]);
    soundEngine.playBinEmptiedSound();
  }, [depot]);

  const value = {
    bins,
    setBins,
    depot,
    setDepot,
    alerts,
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
    searchQuery,
    setSearchQuery,
    soundEnabled,
    toggleSound,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    criticalBins,
    activeRoute,
    isDrivingRoute,
    currentWaypointIndex,
    truckPosition,
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
