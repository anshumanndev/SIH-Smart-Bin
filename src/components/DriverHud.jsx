import React, { useState, useMemo } from 'react';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Fuel, 
  Volume2, 
  AlertTriangle, 
  Compass, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Scale
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { VEHICLES } from '../data/vehicles';
import { getWasteTypeConfig } from '../data/wasteTypes';
import Bin3DVisualizer from './Bin3DVisualizer';

export default function DriverHud() {
  const { 
    allRoutes,
    activeRoute,
    activeRouteId,
    setActiveRouteId,
    vehicles,
    vehicleLoads,
    depot, 
    emptyBin, 
    isDrivingRoute, 
    startRouteSimulation, 
    stopRouteSimulation,
    completedStops
  } = useWasteData();

  const [activeDriverIndex, setActiveDriverIndex] = useState(1);

  // Active vehicle configuration
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === activeRoute.vehicleId) || vehicles[0];
  }, [vehicles, activeRoute]);

  const totalSteps = activeRoute.steps ? activeRoute.steps.length : 0;
  const currentStep = activeRoute.steps && activeRoute.steps[activeDriverIndex] 
    ? activeRoute.steps[activeDriverIndex] 
    : (activeRoute.steps ? activeRoute.steps[0] : null);

  const handleNextStop = () => {
    if (currentStep && currentStep.bin) {
      emptyBin(currentStep.bin.id);
    }
    if (activeDriverIndex < totalSteps - 1) {
      setActiveDriverIndex((prev) => prev + 1);
    }
  };

  const handlePrevStop = () => {
    if (activeDriverIndex > 0) {
      setActiveDriverIndex((prev) => prev - 1);
    }
  };

  const isMedicalVehicle = currentVehicle.category === 'HOSPITAL' || currentVehicle.type.includes('MEDICAL') || currentVehicle.type.includes('SHARPS');

  // Load calculations
  const maxCap = currentVehicle.capacityKg || 4000;
  const currentLoad = vehicleLoads[currentVehicle.id] || activeRoute.totalLoadKg || 0;
  const remainingCap = Math.max(0, maxCap - currentLoad);
  const loadPercentage = Math.min(100, Math.round((currentLoad / maxCap) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Vehicle Fleet Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {allRoutes.map((route) => {
          const isSelected = activeRoute.id === route.id;
          const v = vehicles.find((veh) => veh.id === route.vehicleId) || vehicles[0];
          const isMed = route.category === 'HOSPITAL';

          return (
            <button
              key={route.id}
              onClick={() => {
                setActiveRouteId(route.id);
                setActiveDriverIndex(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                isSelected
                  ? isMed
                    ? 'bg-rose-950/80 border-rose-400 text-white shadow-lg shadow-rose-900/40'
                    : 'bg-slate-800 border-indigo-400 text-white shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: route.routeColor }}
              />
              <span>{v.shortName}</span>
              <span className="text-[10px] text-slate-400 font-mono">({route.optimizedStops.length} stops)</span>
            </button>
          );
        })}
      </div>

      {/* Top Cockpit Header */}
      <div className={`glass-card rounded-3xl p-5 border-2 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isMedicalVehicle
          ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-slate-900/90'
          : 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-900/90'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-white shadow-lg ${
            isMedicalVehicle
              ? 'bg-rose-700 border-rose-400 shadow-rose-600/30'
              : 'bg-emerald-600 border-emerald-400 shadow-emerald-500/30'
          }`}>
            {isMedicalVehicle ? <ShieldAlert className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                isMedicalVehicle
                  ? 'bg-rose-900/80 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-900/80 border-emerald-500/40 text-emerald-300'
              }`}>
                {isMedicalVehicle ? 'Bio-Medical Van HUD' : 'Municipal Driver HUD'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentVehicle.id} • {currentVehicle.driverName}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              {activeRoute.vehicleName}
            </h2>
          </div>
        </div>

        {/* Live Progress Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Stops Badge */}
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Completed</span>
            <strong className="text-sm text-emerald-400 font-extrabold">
              {completedStops.length} / {activeRoute.optimizedStops.length} Stops
            </strong>
          </div>

          {/* Load Capacity Badge */}
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Load Capacity</span>
            <strong className="text-sm text-white font-extrabold">
              {currentLoad} / {maxCap} kg
            </strong>
          </div>

          {/* Loop Distance */}
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Loop</span>
            <strong className="text-sm text-indigo-400 font-extrabold">
              {activeRoute.totalDistanceKm} km (~{activeRoute.estimatedMinutes}m)
            </strong>
          </div>
        </div>
      </div>

      {/* Main Cockpit Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Next Stop Action Target (Hero Card) */}
        <div className="lg:col-span-7 space-y-4">
          {currentStep ? (
            <div className="glass-card rounded-3xl p-6 border-2 border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl relative overflow-hidden">
              
              {/* Top Waypoint Index & ETA */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  WAYPOINT {activeDriverIndex} OF {Math.max(1, totalSteps - 1)}
                </span>
                <span className="font-mono text-slate-400">
                  ETA: +{currentStep.etaMinutes} mins
                </span>
              </div>

              {/* Destination Location Title */}
              <div className="my-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {currentStep.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-300 mt-1">
                  {currentStep.description}
                </p>
              </div>

              {/* Bin Telemetry Summary if it is a bin stop */}
              {currentStep.bin ? (
                <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Fill Status</span>
                    <span className="text-lg font-black text-rose-400">
                      {currentStep.bin.fillLevel}% Full
                    </span>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Waste Stream</span>
                    <span className="text-sm font-bold text-white uppercase">
                      {currentStep.bin.wasteType}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Leg Distance</span>
                    <span className="text-lg font-black text-emerald-400">
                      {currentStep.distanceFromPrevKm} km
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-slate-400 my-4 text-xs">
                  {currentStep.type === 'depot_start' ? '🚚 Municipal Sorting Yard Departure' : '🏁 Return to Base & Discharge Collected Load'}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handlePrevStop}
                  disabled={activeDriverIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
                >
                  Previous
                </button>

                <button
                  onClick={handleNextStop}
                  disabled={activeDriverIndex >= totalSteps - 1}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Collected & Advance to Next Stop</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-3xl p-8 text-center text-slate-500">
              No active waypoint assigned for this vehicle.
            </div>
          )}

          {/* Vehicle Load Gauge Card */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-400" />
                Vehicle PayLoad Status
              </span>
              <span className={loadPercentage > 80 ? 'text-rose-400' : 'text-emerald-400'}>
                {currentLoad} / {maxCap} kg ({loadPercentage}%)
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${loadPercentage}%`,
                  backgroundColor: loadPercentage > 80 ? '#ef4444' : (isMedicalVehicle ? '#f59e0b' : '#10b981')
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Remaining Payload: <strong className="text-white">{remainingCap} kg</strong></span>
              <span>Plate: <strong className="text-slate-300 font-mono">{currentVehicle.plateNumber}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: 3D Visualization of Current Target Bin */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Next Stop Sensor Chamber Preview
            </div>

            {currentStep && currentStep.bin ? (
              <Bin3DVisualizer 
                fillLevel={currentStep.bin.fillLevel}
                wasteType={currentStep.bin.wasteType}
                height={180}
                width={130}
              />
            ) : (
              <div className="py-12 text-slate-500 text-xs">
                Depot Location (No bin sensor active)
              </div>
            )}

            {currentStep && currentStep.bin && (
              <div className="mt-3 text-xs text-slate-400">
                Tank: <strong className="text-white">{currentStep.bin.capacityLiters}L</strong> • Waste: <strong className="text-indigo-300">{currentStep.bin.wasteType}</strong>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
