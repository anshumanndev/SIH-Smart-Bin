import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  ShieldCheck, 
  Navigation, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function Header() {
  const { 
    activeRole, 
    setActiveRole, 
    activeTab, 
    setActiveTab, 
    criticalBins, 
    alerts,
    bins,
    soundEnabled, 
    toggleSound,
    isSimulating,
    simulationSpeed
  } = useWasteData();

  const [timeStr, setTimeStr] = useState('');

  const hospitalCriticalCount = bins.filter(
    (b) => (b.binCategory === 'HOSPITAL' || b.hospitalName) && (b.fillLevel >= 70 || b.status === 'critical')
  ).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role === 'driver') {
      setActiveTab('driver-hud');
    } else if (role === 'supervisor') {
      setActiveTab('analytics');
    } else {
      setActiveTab('overview');
    }
  };

  return (
    <header className="glass-panel border-b border-slate-800/80 sticky top-0 z-50 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/20">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  EcoRoute™
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-900/60 border border-brand-500/30 text-brand-300">
                  SIH PS-14
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Multi-Stream IoT Waste Intelligence & Route Optimization
              </p>
            </div>
          </div>

          {/* Mobile Critical Badge */}
          <div className="md:hidden flex items-center gap-2">
            {criticalBins.length > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {criticalBins.length}
              </span>
            )}
          </div>
        </div>

        {/* Role Selector Tabs (Command Bar) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <button
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeRole === 'admin'
                ? 'bg-gradient-to-r from-brand-700 to-indigo-600 text-white shadow-md shadow-brand-500/25 border border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </button>

          <button
            onClick={() => handleRoleChange('driver')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeRole === 'driver'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 border border-emerald-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Driver HUD</span>
          </button>

          <button
            onClick={() => handleRoleChange('supervisor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeRole === 'supervisor'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 border border-amber-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Supervisor</span>
          </button>
        </div>

        {/* Live System Indicators & Audio Switch */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Critical Bins Pill */}
          {criticalBins.length > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{criticalBins.length} Critical ({hospitalCriticalCount} Bio)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All Bins Optimal</span>
            </div>
          )}

          {/* IoT Telemetry Engine Pulse */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
            <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>IoT {isSimulating ? `${simulationSpeed}x Live` : 'Paused'}</span>
          </div>

          {/* System Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{timeStr}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Audio Cues" : "Enable Audio Cues"}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
