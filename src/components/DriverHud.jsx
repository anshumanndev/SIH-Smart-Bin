import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import Bin3DVisualizer from './Bin3DVisualizer';

export default function DriverHud() {
  const { 
    activeRoute, 
    depot, 
    emptyBin, 
    isDrivingRoute, 
    startRouteSimulation, 
    stopRouteSimulation,
    currentWaypointIndex,
    completedStops
  } = useWasteData();

  const [activeDriverIndex, setActiveDriverIndex] = useState(1);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Cockpit Header */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-900/80 border border-emerald-500/40 text-emerald-300">
                Driver Navigation HUD
              </span>
              <span className="text-xs font-mono text-slate-400">Truck #01 • Rajiv Sharma</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Active Collection Loop Dispatch
            </h2>
          </div>
        </div>

        {/* Live Progress Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Stops Completed</span>
            <strong className="text-base text-emerald-400 font-extrabold">
              {completedStops.length} / {activeRoute.optimizedStops.length}
            </strong>
          </div>

          <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Loop Distance</span>
            <strong className="text-base text-white font-extrabold">
              {activeRoute.totalDistanceKm} km
            </strong>
          </div>

          <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Estimated Time</span>
            <strong className="text-base text-indigo-400 font-extrabold">
              ~{activeRoute.estimatedMinutes}m
            </strong>
          </div>
        </div>
      </div>

      {/* Main Cockpit Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Next Stop Action Target (Hero Card) */}
        <div className="lg:col-span-7 space-y-4">
          {currentStep ? (
            <div className="glass-card rounded-3xl p-6 border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl relative overflow-hidden">
              
              {/* Radar pulse background indicator */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

              {/* Waypoint Step Counter */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  WAYPOINT {activeDriverIndex} OF {totalSteps - 1}
                </span>
                <span className="font-mono text-slate-400">
                  ETA: +{currentStep.etaMinutes} mins
                </span>
              </div>

              {/* Destination Location Title */}
              <div className="my-4">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {currentStep.title}
                </h3>
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
                  {currentStep.type === 'depot_start' ? '🚚 Municipal Base Yard Departure' : '🏁 Return to Sorting Yard'}
                </div>
              )}

              {/* HUGE ACTION BUTTON FOR DRIVER */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={handleNextStop}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Mark Collected & Advance to Next Stop</span>
                </button>

                {/* Step Switchers */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={handlePrevStop}
                    disabled={activeDriverIndex <= 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous Waypoint
                  </button>
                  <button
                    onClick={() => setActiveDriverIndex((prev) => Math.min(totalSteps - 1, prev + 1))}
                    disabled={activeDriverIndex >= totalSteps - 1}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Skip to Next →
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-3xl p-8 text-center text-slate-400">
              No active route loaded.
            </div>
          )}

          {/* Environmental Savings Sparkle Card */}
          <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 to-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Driver Green Efficiency Score: 98/100</div>
                <div className="text-[11px] text-slate-400">
                  By adhering to the TSP route, you have saved <strong>{activeRoute.fuelSavedLiters} Liters</strong> of diesel today.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Route Queue & 3D Sensor Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Target Visualizer */}
          {currentStep && currentStep.bin && (
            <div className="glass-card rounded-3xl p-4 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2">
                Live Sensor Telemetry for Target
              </span>
              <Bin3DVisualizer 
                fillLevel={currentStep.bin.fillLevel} 
                wasteType={currentStep.bin.wasteType}
                height={160}
                width={110}
              />
            </div>
          )}

          {/* Turn-by-Turn Manifest List */}
          <div className="glass-card rounded-3xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Collection Waypoints Manifest</span>
              <span className="font-mono text-indigo-400">{activeRoute.optimizedStops.length} stops</span>
            </h4>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {activeRoute.steps && activeRoute.steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveDriverIndex(idx)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    activeDriverIndex === idx
                      ? 'bg-emerald-950/60 border-emerald-400 text-white font-bold shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">
                      {idx}. {step.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-2">
                      +{step.etaMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
