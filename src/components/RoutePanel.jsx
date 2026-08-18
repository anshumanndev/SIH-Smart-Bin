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
  TrendingDown,
  Truck,
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { printRouteManifest, exportBinsToCSV } from '../utils/exportUtils';
import { getWasteTypeConfig } from '../data/wasteTypes';

export default function RoutePanel() {
  const { 
    allRoutes,
    activeRoute, 
    activeRouteId,
    setActiveRouteId,
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
    <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col h-full overflow-hidden">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Multi-Stream Route Engine
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TSP 2-Opt
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {allRoutes.length} Dispatched Fleet Routes ({criticalBins.length} priority bins)
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

      {/* Multi-Route Tabs / Switcher Pills */}
      {allRoutes.length > 1 && (
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800/60">
          {allRoutes.map((route) => {
            const isSelected = activeRoute && activeRoute.id === route.id;
            const wConfig = getWasteTypeConfig(route.wasteStream);
            const isHospital = route.category === 'HOSPITAL';

            return (
              <button
                key={route.id}
                onClick={() => setActiveRouteId(route.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                style={{
                  borderColor: isSelected ? route.routeColor : undefined
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: route.routeColor }} />
                <span>{route.vehicleShortName || route.vehicleId}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 font-mono">
                  {route.optimizedStops.length} stops
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Route Summary Card */}
      {activeRoute && (
        <div className="my-2.5 p-3 rounded-xl bg-gradient-to-br from-brand-950/40 via-slate-900/80 to-slate-900/80 border border-slate-800 relative overflow-hidden shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" style={{ color: activeRoute.routeColor }} />
              <span>{activeRoute.vehicleName}</span>
            </div>
            <span className="text-emerald-400 text-[11px]">+{activeRoute.efficiencyGainPercent}% Efficiency</span>
          </div>

          {/* Vehicle Load Capacity Progress */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>Vehicle Load Capacity:</span>
              <strong className="text-slate-200">{activeRoute.totalLoadKg} / {activeRoute.maxCapacityKg} kg ({activeRoute.capacityUtilizationPercent}%)</strong>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${activeRoute.capacityUtilizationPercent}%`,
                  backgroundColor: activeRoute.capacityUtilizationPercent > 80 ? '#ef4444' : activeRoute.routeColor
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400">Total Distance</div>
              <div className="text-xs font-black text-white mt-0.5">{activeRoute.totalDistanceKm} km</div>
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400">Est. Time</div>
              <div className="text-xs font-black text-indigo-400 mt-0.5">~{activeRoute.estimatedMinutes}m</div>
            </div>
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400">CO₂ Saved</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">{activeRoute.co2SavedKg} kg</div>
            </div>
          </div>
        </div>
      )}

      {/* Waypoint Steps List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 my-1">
        {activeRoute && activeRoute.steps && activeRoute.steps.length > 0 ? (
          activeRoute.steps.map((step, idx) => {
            const isCurrent = isDrivingRoute && currentWaypointIndex === idx;
            const isPassed = isDrivingRoute && currentWaypointIndex > idx;

            return (
              <div
                key={idx}
                onClick={() => step.bin && setSelectedBinId(step.bin.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/60 border-indigo-400 shadow-md shadow-indigo-500/20'
                    : isPassed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Step Order Circle */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    step.type === 'depot_start' || step.type === 'depot_end'
                      ? 'bg-brand-900 text-brand-300 border border-brand-500/40'
                      : isPassed
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-3 h-3" /> : step.order}
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

                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {step.description}
                    </p>

                    {step.bin && (
                      <div className="flex items-center gap-2 mt-1">
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
          <div className="text-center py-6 text-slate-500 text-xs">
            No critical bins in this waste category.
          </div>
        )}
      </div>

      {/* Simulation Trigger / Footer Bar */}
      <div className="pt-2.5 border-t border-slate-800/80 mt-auto shrink-0">
        {!isDrivingRoute ? (
          <button
            onClick={() => startRouteSimulation(activeRoute?.id)}
            disabled={!activeRoute || activeRoute.optimizedStops.length === 0}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-brand-700 via-indigo-600 to-emerald-600 hover:from-brand-600 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch {activeRoute?.vehicleShortName || 'Vehicle'} Dispatch</span>
          </button>
        ) : (
          <button
            onClick={stopRouteSimulation}
            className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Halt Active Simulation</span>
          </button>
        )}
      </div>

    </div>
  );
}
