import React from 'react';
import { 
  Trash2, 
  AlertOctagon, 
  Leaf, 
  Truck, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldAlert, 
  Zap,
  Gauge
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function KpiCards() {
  const { bins, criticalBins, activeRoute, alerts } = useWasteData();

  // Calculations
  const totalBins = bins.length;
  const avgBattery = Math.round(bins.reduce((acc, b) => acc + b.batteryLevel, 0) / (totalBins || 1));
  const avgFill = Math.round(bins.reduce((acc, b) => acc + b.fillLevel, 0) / (totalBins || 1));
  const pendingVolumeLiters = Math.round(
    criticalBins.reduce((acc, b) => acc + (b.capacityLiters * (b.fillLevel / 100)), 0)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Total Smart Bins (Green) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group bg-gradient-to-br from-emerald-950/60 via-slate-900/85 to-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400/80 shadow-lg shadow-emerald-950/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-all" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Smart Bin Network
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-900/70 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-500/30">
            <Trash2 className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-black text-white tracking-tight">
            {totalBins}
          </span>
          <span className="text-xs font-bold text-emerald-400 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 100% Online
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-emerald-900/50 relative z-10">
          <span>Avg. Fill: <strong className="text-emerald-300">{avgFill}%</strong></span>
          <span>Sensor Battery: <strong className="text-emerald-400 font-bold">{avgBattery}%</strong></span>
        </div>
      </div>

      {/* Card 2: Critical Overflow Bins (Red) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group bg-gradient-to-br from-rose-950/70 via-slate-900/85 to-rose-950/50 border-2 border-rose-500/60 hover:border-rose-400/90 shadow-xl shadow-rose-950/60 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/25 rounded-full blur-2xl group-hover:bg-rose-400/40 transition-all" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Critical Overflow
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-900/80 border border-rose-400/60 flex items-center justify-center text-rose-300 shadow-md shadow-rose-500/40">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-black text-rose-400 tracking-tight drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]">
            {criticalBins.length}
          </span>
          <span className="text-xs font-bold text-rose-300">
            ≥ 70% threshold
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-rose-900/50 relative z-10">
          <span>Active Alerts: <strong className="text-rose-400 font-bold">{alerts.length}</strong></span>
          <span>Max Fill: <strong className="text-rose-400 font-bold">{Math.max(...bins.map(b => b.fillLevel))}%</strong></span>
        </div>
      </div>

      {/* Card 3: AI Fuel & Carbon Savings (Green) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group bg-gradient-to-br from-emerald-950/60 via-slate-900/85 to-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400/80 shadow-lg shadow-emerald-950/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-all" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Fuel & Carbon Saved
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-900/70 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-500/30">
            <Leaf className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-black text-white tracking-tight">
            {activeRoute.fuelSavedLiters} L
          </span>
          <span className="text-xs font-bold text-emerald-300">
            / {activeRoute.co2SavedKg} kg CO₂
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-emerald-900/50 relative z-10">
          <span>Efficiency Gain: <strong className="text-emerald-400 font-bold">+{activeRoute.efficiencyGainPercent}%</strong></span>
          <span>Time Saved: <strong className="text-emerald-400 font-bold">~{activeRoute.timeSavedMinutes}m</strong></span>
        </div>
      </div>

      {/* Card 4: Fleet Collection Manifest (Blue) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group bg-gradient-to-br from-blue-950/60 via-slate-900/85 to-blue-950/40 border border-blue-500/40 hover:border-blue-400/80 shadow-lg shadow-blue-950/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Optimized Dispatch Loop
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-900/70 border border-blue-500/50 flex items-center justify-center text-blue-300 shadow-md shadow-blue-500/30">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-black text-white tracking-tight">
            {activeRoute.totalDistanceKm} <span className="text-lg font-bold text-blue-400">km</span>
          </span>
          <span className="text-xs font-bold text-blue-300">
            ~{activeRoute.estimatedMinutes} mins
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-blue-900/50 relative z-10">
          <span>Target Stops: <strong className="text-blue-400 font-bold">{activeRoute.optimizedStops.length} bins</strong></span>
          <span>Pending Vol: <strong className="text-blue-300">~{pendingVolumeLiters}L</strong></span>
        </div>
      </div>

    </div>
  );
}

function Sparkles({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
