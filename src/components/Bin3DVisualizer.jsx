import React from 'react';

export default function Bin3DVisualizer({ fillLevel = 75, height = 220, width = 140, wasteType = "General" }) {
  // Determine gradient color based on fill level
  let waveColor1 = "#22c55e";
  let waveColor2 = "#15803d";
  let glowColor = "rgba(34, 197, 94, 0.4)";

  if (fillLevel >= 70) {
    waveColor1 = "#ef4444";
    waveColor2 = "#b91c1c";
    glowColor = "rgba(239, 68, 68, 0.5)";
  } else if (fillLevel >= 50) {
    waveColor1 = "#f59e0b";
    waveColor2 = "#b45309";
    glowColor = "rgba(245, 158, 11, 0.4)";
  }

  // Calculate liquid height percentage
  const liquidHeight = Math.min(100, Math.max(0, fillLevel));

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width, height: height + 40 }}>
      {/* Top Bin Lid Structure */}
      <div 
        className="w-24 h-4 rounded-t-lg border border-slate-700 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-md relative z-20"
      >
        <div className="w-8 h-1.5 bg-slate-600 rounded-full mx-auto -mt-2.5 border border-slate-500 shadow-sm" />
      </div>

      {/* Glass Cylinder Body */}
      <div 
        className="relative rounded-b-2xl border-2 border-slate-600/70 overflow-hidden bg-slate-900/80 shadow-2xl backdrop-blur-md z-10"
        style={{ 
          width: width, 
          height: height,
          boxShadow: `inset 0 0 20px rgba(0,0,0,0.8), 0 10px 25px ${glowColor}`
        }}
      >
        {/* Fill level grid markers */}
        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-2 py-3 opacity-40">
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-dashed border-slate-600/60 pb-0.5">
            <span>100%</span>
            <span>CRITICAL</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-dashed border-slate-600/60 pb-0.5">
            <span>75%</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-dashed border-slate-600/60 pb-0.5">
            <span>50%</span>
            <span>WARNING</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-dashed border-slate-600/60 pb-0.5">
            <span>25%</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400">
            <span>0% EMPTY</span>
          </div>
        </div>

        {/* Ultrasonic Sensor Ray Simulation */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-400/80 rounded-full blur-[1px] z-30"></div>
        <div 
          className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-cyan-400/60 via-cyan-400/20 to-transparent pointer-events-none z-30 animate-pulse"
          style={{ height: `${Math.max(10, 100 - liquidHeight)}%` }}
        />

        {/* Liquid Container */}
        <div 
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out z-20"
          style={{ height: `${liquidHeight}%` }}
        >
          {/* Animated Wave Layer 1 */}
          <div 
            className="absolute -top-3 left-0 w-[200%] h-6 animate-fluid-wave opacity-90"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${waveColor1}, ${waveColor2})`,
              maskImage: 'radial-gradient(circle at 10px 0, transparent 0, transparent 8px, black 8.5px)',
              WebkitMaskImage: 'radial-gradient(circle at 10px 0, transparent 0, transparent 8px, black 8.5px)'
            }}
          />

          {/* Liquid Body */}
          <div 
            className="w-full h-full relative overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${waveColor1} 0%, ${waveColor2} 60%, #090d16 100%)`,
              opacity: 0.88
            }}
          >
            {/* Sparkle & Bubbles */}
            <div className="absolute bottom-2 left-3 w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
            <div className="absolute bottom-6 right-4 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
            <div className="absolute bottom-10 left-6 w-1 h-1 rounded-full bg-white/50 animate-bounce" />
          </div>
        </div>

        {/* Glass reflection highlight */}
        <div className="absolute inset-y-0 left-2 w-3 bg-gradient-to-r from-white/20 to-transparent rounded-full pointer-events-none z-40" />
      </div>

      {/* Base Pedestal */}
      <div className="w-28 h-2 rounded-b-lg border border-slate-700 bg-slate-800 shadow-lg relative z-20 mt-0.5 flex items-center justify-center">
        <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          {wasteType}
        </span>
      </div>

      {/* Numeric Percentage Badge */}
      <div className="mt-2 text-center">
        <span className={`text-xl font-bold font-mono tracking-tight ${
          fillLevel >= 70 ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
          fillLevel >= 50 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
          'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
        }`}>
          {fillLevel}%
        </span>
        <span className="text-[10px] text-slate-400 block -mt-0.5">Fill Level</span>
      </div>
    </div>
  );
}
