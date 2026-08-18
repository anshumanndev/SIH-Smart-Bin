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
  ShieldCheck
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Card */}
      <div className="glass-dropdown w-full max-w-2xl rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-900/60 border border-brand-500/40 text-brand-300">
                {b.id}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                b.fillLevel >= 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                b.fillLevel >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {b.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-medium">{b.zone}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1.5">{b.name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
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
              height={200}
              width={130}
            />
            <div className="mt-3 text-center text-xs text-slate-400">
              Tank Capacity: <strong className="text-white">{b.capacityLiters} Liters</strong>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Current Content: ~{Math.round(b.capacityLiters * (b.fillLevel / 100))} Liters
              </div>
            </div>
          </div>

          {/* Right Column: Sensor Diagnostics Grid */}
          <div className="md:col-span-7 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Real-Time IoT Sensor Telemetry
            </h4>

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
                <div className={`text-lg font-bold mt-1 ${b.temperature > 40 ? 'text-rose-400' : 'text-white'}`}>
                  {b.temperature}°C
                </div>
                <div className="text-[10px] text-slate-400">{b.temperature > 40 ? 'High Heat Risk' : 'Thermal Normal'}</div>
              </div>

              {/* Gas Sensor */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-amber-400" /> Methane / Gas
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
                <div className="text-[10px] text-slate-400">{b.tiltAngle > 30 ? 'Bin Fallen / Tampered' : 'Upright Position'}</div>
              </div>

              {/* Battery */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery Cell
                  </span>
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {b.batteryLevel}%
                </div>
                <div className="text-[10px] text-slate-400">LiFePO4 3.7V Solar</div>
              </div>

              {/* Lid State */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Lid Status
                  </span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {b.lidOpen ? 'Open / Ajar' : 'Closed Sealed'}
                </div>
                <div className="text-[10px] text-slate-400">Magnetic Hall Sensor</div>
              </div>

            </div>

            {/* 24h Historical Fill Trend */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>24h Fill Progression Trend</span>
                <span className="text-[10px] text-slate-500 font-mono">Hourly Samples</span>
              </div>
              <div className="flex items-end gap-1.5 h-12 pt-1">
                {b.history.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        val >= 70 ? 'bg-rose-500' : val >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ height: `${Math.max(10, val)}%` }}
                    />
                    <span className="text-[8px] font-mono text-slate-500">T-{6-idx}h</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Simulation Triggers */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Test Scenarios:</span>
            <button
              onClick={() => triggerHazard(b.id, 'OVERFLOW')}
              className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 hover:border-rose-400 text-rose-300 text-xs font-semibold transition-all"
            >
              Surge 98%
            </button>
            <button
              onClick={() => triggerHazard(b.id, 'HEAT_SPIKE')}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-semibold transition-all"
            >
              Heat 48°C
            </button>
            <button
              onClick={() => triggerHazard(b.id, 'TILT_ALARM')}
              className="px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-500/30 hover:border-orange-400 text-orange-300 text-xs font-semibold transition-all"
            >
              Tilt 45°
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              emptyBin(b.id);
              setSelectedBinId(null);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Mark Collected & Empty (0%)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
