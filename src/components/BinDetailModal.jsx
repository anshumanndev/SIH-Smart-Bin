import React from 'react';
import { 
  X, 
  Trash2, 
  Battery, 
  Thermometer, 
  Wind, 
  RotateCw, 
  Activity, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Truck, 
  Flame, 
  Zap,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ShieldAlert,
  Layers,
  Scale
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { getWasteTypeConfig } from '../data/wasteTypes';
import { calculateBinPriority } from '../utils/priorityCalculator';
import Bin3DVisualizer from './Bin3DVisualizer';

export default function BinDetailModal() {
  const { 
    selectedBin, 
    setSelectedBinId, 
    emptyBin, 
    triggerHazard 
  } = useWasteData();

  if (!selectedBin) return null;

  const b = selectedBin;
  const isHospital = b.binCategory === 'HOSPITAL' || Boolean(b.hospitalName);
  const wConfig = getWasteTypeConfig(b.wasteType);
  const priority = calculateBinPriority(b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Card */}
      <div className="glass-dropdown w-full max-w-2xl rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-900/60 border border-brand-500/40 text-brand-300">
                {b.id}
              </span>

              {isHospital ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  HOSPITAL BIO-WASTE
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  MUNICIPAL GENERAL
                </span>
              )}

              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                b.fillLevel >= 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                b.fillLevel >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {b.status.toUpperCase()}
              </span>

              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${priority.badgeBg} ${priority.badgeText} ${priority.badgeBorder}`}>
                Priority: {priority.score} ({priority.level})
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white mt-2">{b.name}</h2>
            
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              {b.hospitalName && (
                <span className="flex items-center gap-1 text-rose-300 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-rose-400" />
                  {b.hospitalName} ({b.department || 'Main Facility'})
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {b.lat.toFixed(4)}, {b.lng.toFixed(4)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Last Emptied: {b.lastEmptied}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedBinId(null)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6">
          
          {/* Left Column: 3D Wave Visualizer */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <Bin3DVisualizer 
              fillLevel={b.fillLevel} 
              wasteType={b.wasteType}
              height={190}
              width={130}
            />
            <div className="mt-3 text-center text-xs text-slate-400">
              Tank Capacity: <strong className="text-white">{b.capacityLiters} Liters</strong>
              <div className="text-[11px] text-slate-300 mt-0.5 font-semibold" style={{ color: wConfig.color }}>
                {wConfig.label}
              </div>
            </div>
          </div>

          {/* Right Column: Sensor Diagnostics Grid */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Real-Time IoT Sensor Telemetry
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Assigned: <strong className="text-indigo-300">{b.assignedTruck || 'Unassigned'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Ultrasonic Fill */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5 text-indigo-400" /> Fill Level
                  </span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {b.fillLevel}%
                </div>
                <div className="text-[10px] text-slate-400">Ultrasonic HC-SR04</div>
              </div>

              {/* Temperature */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperature
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${b.temperature > 38 ? 'text-rose-400' : 'text-white'}`}>
                  {b.temperature}°C
                </div>
                <div className="text-[10px] text-slate-400">{b.temperature > 38 ? 'High Heat Risk' : 'Thermal Normal'}</div>
              </div>

              {/* Gas Sensor */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-amber-400" /> Gas Concentration
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${b.gasLevelPpm > 100 ? 'text-amber-400' : 'text-white'}`}>
                  {b.gasLevelPpm} <span className="text-xs text-slate-400 font-normal">ppm</span>
                </div>
                <div className="text-[10px] text-slate-400">MQ-4 / MQ-135 Sensor</div>
              </div>

              {/* Tilt / Tamper */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> Tilt Angle
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${b.tiltAngle > 30 ? 'text-rose-400' : 'text-white'}`}>
                  {b.tiltAngle}°
                </div>
                <div className="text-[10px] text-slate-400">{b.tiltAngle > 30 ? 'Fallen / Tampered' : 'Upright Position'}</div>
              </div>

              {/* Battery */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery
                  </span>
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {b.batteryLevel}%
                </div>
                <div className="text-[10px] text-slate-400">Solar + Li-ion 3.7V</div>
              </div>

              {/* Lid Status */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Lid Seal
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${b.lidOpen ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {b.lidOpen ? 'Unsealed / Ajar' : 'Airtight Sealed'}
                </div>
                <div className="text-[10px] text-slate-400">Magnetic Proximity</div>
              </div>

            </div>

            {/* Priority Contributing Factors */}
            {priority.factors.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                <span className="font-bold text-slate-400 block mb-1">Priority Analysis Factors:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {priority.factors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerHazard(b.id, 'HEAT_SPIKE')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
            >
              Simulate Heat Spike
            </button>
            <button
              onClick={() => triggerHazard(b.id, 'OVERFLOW')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
            >
              Simulate Overflow
            </button>
          </div>

          <button
            onClick={() => {
              emptyBin(b.id);
              setSelectedBinId(null);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Mark Collected & Reset</span>
          </button>
        </div>

      </div>

    </div>
  );
}
