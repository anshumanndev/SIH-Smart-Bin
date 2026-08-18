import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  Pause, 
  Zap, 
  Flame, 
  RotateCw, 
  Wind, 
  RefreshCw, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Activity,
  AlertOctagon
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function IoTSimulator() {
  const { 
    isSimulating, 
    setIsSimulating, 
    simulationSpeed, 
    setSimulationSpeed, 
    triggerHazard,
    resetAllBins,
    bins,
    setBins
  } = useWasteData();

  const [isOpen, setIsOpen] = useState(false);

  // Trigger rapid weekend surge across 4 random bins
  const handleWeekendSurge = () => {
    setBins((prev) =>
      prev.map((b, idx) => {
        if (idx % 2 === 0 || idx === 1) {
          const newFill = Math.min(96, Math.floor(75 + Math.random() * 22));
          return {
            ...b,
            fillLevel: newFill,
            status: newFill >= 70 ? 'critical' : 'warning',
            history: [...b.history.slice(1), newFill]
          };
        }
        return b;
      })
    );
  };

  // Trigger heatwave anomaly
  const handleHeatwave = () => {
    const target = bins[Math.floor(Math.random() * bins.length)];
    if (target) {
      triggerHazard(target.id, 'HEAT_SPIKE');
    }
  };

  // Trigger tilt alarm
  const handleTilt = () => {
    const target = bins[Math.floor(Math.random() * bins.length)];
    if (target) {
      triggerHazard(target.id, 'TILT_ALARM');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      
      {/* Expanded Control Box */}
      {isOpen && (
        <div className="glass-dropdown mb-2 w-80 sm:w-96 rounded-2xl p-4 border border-cyan-500/40 shadow-2xl animate-fadeIn">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">IoT Telemetry Sandbox</h4>
                <p className="text-[10px] text-slate-400">ESP32 & Ultrasonic Telemetry Simulator</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Speed & Running Controls */}
          <div className="my-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Simulation Engine:</span>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSimulating
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3 h-3" /> Running
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Paused
                  </>
                )}
              </button>
            </div>

            {/* Speed Multiplier Buttons */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">Clock Speed:</span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                {[1, 2, 5, 10].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimulationSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                      simulationSpeed === spd
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stress Test Action Grid */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Inject Anomaly Events:
            </span>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={handleWeekendSurge}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-rose-500/40 transition-all text-left flex items-center gap-1.5 font-semibold"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Fill Surge (95%)</span>
              </button>

              <button
                onClick={handleHeatwave}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 transition-all text-left flex items-center gap-1.5 font-semibold"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Heatwave (48°C)</span>
              </button>

              <button
                onClick={handleTilt}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-orange-500/40 transition-all text-left flex items-center gap-1.5 font-semibold"
              >
                <RotateCw className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Tamper Tilt (45°)</span>
              </button>

              <button
                onClick={resetAllBins}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-emerald-500/40 transition-all text-left flex items-center gap-1.5 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Reset All Bins</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel px-4 py-2.5 rounded-2xl border border-cyan-500/50 shadow-2xl flex items-center gap-2.5 text-cyan-300 hover:text-white hover:bg-cyan-950/60 transition-all group active:scale-95"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping group-hover:bg-white" />
        <Sliders className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wide">
          IoT Simulator {isSimulating ? `(${simulationSpeed}x)` : '(Paused)'}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

    </div>
  );
}
