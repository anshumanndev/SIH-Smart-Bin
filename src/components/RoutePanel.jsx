import React from 'react';
import { 
  Navigation, 
  MapPin, 
  Fuel, 
  Leaf, 
  Clock, 
  FileText, 
  Download, 
  Play, 
  Square, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { printRouteManifest, exportBinsToCSV } from '../utils/exportUtils';

export default function RoutePanel() {
  const { 
    activeRoute, 
    depot, 
    isDrivingRoute, 
    startRouteSimulation, 
    stopRouteSimulation,
    currentWaypointIndex,
    setSelectedBinId,
    criticalBins
  } = useWasteData();

  const handlePrintManifest = () => {
    printRouteManifest(activeRoute, depot);
  };

  const handleExportCSV = () => {
    exportBinsToCSV(activeRoute.optimizedStops);
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col h-full">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Optimized Route Engine
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TSP 2-Opt
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Targeting {activeRoute.optimizedStops.length} critical bins (≥70%)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrintManifest}
            title="Print Collection Manifest"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Optimization Efficiency Card */}
      <div className="my-3 p-3 rounded-xl bg-gradient-to-br from-brand-950/40 via-slate-900/80 to-slate-900/80 border border-indigo-500/30 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-2">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Optimization Gain
          </span>
          <span className="text-emerald-400 font-bold">+{activeRoute.efficiencyGainPercent}% Route Efficiency</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Fuel className="w-3 h-3 text-amber-400" /> Diesel Saved
            </div>
            <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
              {activeRoute.fuelSavedLiters} L
            </div>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-400" /> CO₂ Offset
            </div>
            <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
              {activeRoute.co2SavedKg} kg
            </div>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Time Saved
            </div>
            <div className="text-sm font-extrabold text-cyan-400 mt-0.5">
              ~{activeRoute.timeSavedMinutes}m
            </div>
          </div>
        </div>

        {/* Distance Comparison Progress */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Unoptimized: <strong className="text-slate-300">{activeRoute.unoptimizedDistanceKm} km</strong></span>
          <ChevronRight className="w-3 h-3 text-indigo-400" />
          <span>Optimized: <strong className="text-emerald-400">{activeRoute.totalDistanceKm} km</strong></span>
        </div>
      </div>

      {/* Waypoint Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
        {activeRoute.steps && activeRoute.steps.length > 0 ? (
          activeRoute.steps.map((step, idx) => {
            const isCurrent = isDrivingRoute && currentWaypointIndex === idx;
            const isPassed = isDrivingRoute && currentWaypointIndex > idx;

            return (
              <div
                key={idx}
                onClick={() => step.bin && setSelectedBinId(step.bin.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/60 border-indigo-400 shadow-md shadow-indigo-500/20'
                    : isPassed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Step Order Circle */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    step.type === 'depot_start' || step.type === 'depot_end'
                      ? 'bg-brand-900 text-brand-300 border border-brand-500/40'
                      : isPassed
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.order}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {step.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        +{step.etaMinutes}m
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {step.description}
                    </p>

                    {step.bin && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          step.bin.fillLevel >= 70 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {step.bin.fillLevel}% Fill
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {step.distanceFromPrevKm} km from prev
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No critical bins requiring immediate routing.
          </div>
        )}
      </div>

      {/* Simulation Trigger / Footer Bar */}
      <div className="pt-3 border-t border-slate-800/80 mt-auto">
        {!isDrivingRoute ? (
          <button
            onClick={startRouteSimulation}
            disabled={criticalBins.length === 0}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-700 via-indigo-600 to-emerald-600 hover:from-brand-600 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Automated Dispatch Run</span>
          </button>
        ) : (
          <button
            onClick={stopRouteSimulation}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Halt Driver Simulation</span>
          </button>
        )}
      </div>

    </div>
  );
}
