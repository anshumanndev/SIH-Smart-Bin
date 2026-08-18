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
  Gauge,
  Building2,
  Sparkles
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function KpiCards() {
  const { bins, criticalBins, allRoutes, activeRoute, alerts } = useWasteData();

  // Calculations
  const totalBins = bins.length;
  const hospitalBins = bins.filter((b) => b.binCategory === 'HOSPITAL' || b.hospitalName);
  const criticalHospitalBins = hospitalBins.filter((b) => b.fillLevel >= 70 || b.status === 'critical');
  const avgBattery = Math.round(bins.reduce((acc, b) => acc + b.batteryLevel, 0) / (totalBins || 1));
  const avgFill = Math.round(bins.reduce((acc, b) => acc + b.fillLevel, 0) / (totalBins || 1));
  
  const totalFuelSaved = parseFloat(allRoutes.reduce((sum, r) => sum + r.fuelSavedLiters, 0).toFixed(2));
  const totalCo2Saved = parseFloat(allRoutes.reduce((sum, r) => sum + r.co2SavedKg, 0).toFixed(2));
  const totalDistance = parseFloat(allRoutes.reduce((sum, r) => sum + r.totalDistanceKm, 0).toFixed(2));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Total Smart Bins & Healthcare Network (Green/Cyan) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group bg-gradient-to-br from-emerald-950/60 via-slate-900/85 to-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400/80 shadow-lg shadow-emerald-950/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-all" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            IoT Sensor Grid
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
            <Building2 className="w-3.5 h-3.5 mr-1" /> {hospitalBins.length} Hospital
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-emerald-900/50 relative z-10">
          <span>Avg. Fill: <strong className="text-emerald-300">{avgFill}%</strong></span>
          <span>Sensor Battery: <strong className="text-emerald-400 font-bold">{avgBattery}%</strong></span>
        </div>
      </div>

      {/* Card 2: Critical Overflow & Biohazard Alerts (Red) */}
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
            ({criticalHospitalBins.length} Med HazMat)
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-rose-900/50 relative z-10">
          <span>Active Alerts: <strong className="text-rose-400 font-bold">{alerts.length}</strong></span>
          <span>Max Fill: <strong className="text-rose-400 font-bold">{Math.max(...bins.map(b => b.fillLevel))}%</strong></span>
        </div>
      </div>

      {/* Card 3: AI Multi-Vehicle Routes Dispatched (Blue/Indigo) */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group bg-gradient-to-br from-indigo-950/60 via-slate-900/85 to-indigo-950/40 border border-indigo-500/40 hover:border-indigo-400/80 shadow-lg shadow-indigo-950/50 transition-all duration-300">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-400/30 transition-all" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Multi-Stream Routes
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-900/70 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shadow-md shadow-indigo-500/30">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-black text-white tracking-tight">
            {allRoutes.length} <span className="text-lg font-bold text-indigo-400">Loops</span>
          </span>
          <span className="text-xs font-bold text-indigo-300">
            {totalDistance} km
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-indigo-900/50 relative z-10">
          <span>Target Bins: <strong className="text-indigo-400 font-bold">{criticalBins.length}</strong></span>
          <span>Active Fleet: <strong className="text-indigo-300 font-bold">{allRoutes.length} Vans/Trucks</strong></span>
        </div>
      </div>

      {/* Card 4: AI Fuel & Carbon Savings (Green) */}
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
            {totalFuelSaved} L
          </span>
          <span className="text-xs font-bold text-emerald-300">
            / {totalCo2Saved} kg CO₂
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2.5 border-t border-emerald-900/50 relative z-10">
          <span>Efficiency Gain: <strong className="text-emerald-400 font-bold">+{activeRoute.efficiencyGainPercent}%</strong></span>
          <span>Time Saved: <strong className="text-emerald-400 font-bold">~{activeRoute.timeSavedMinutes}m</strong></span>
        </div>
      </div>

    </div>
  );
}
