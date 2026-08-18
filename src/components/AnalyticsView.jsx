import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  Fuel, 
  Recycle, 
  ShieldCheck, 
  Award, 
  PieChart,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function AnalyticsView() {
  const { bins, activeRoute } = useWasteData();

  // Aggregate statistics
  const totalVolumeCapacity = bins.reduce((acc, b) => acc + b.capacityLiters, 0);
  const currentVolumeStored = Math.round(bins.reduce((acc, b) => acc + (b.capacityLiters * b.fillLevel / 100), 0));
  const fillRateAvg = Math.round((currentVolumeStored / (totalVolumeCapacity || 1)) * 100);

  // Waste breakdown calculation
  const wasteCounts = bins.reduce((acc, b) => {
    acc[b.wasteType] = (acc[b.wasteType] || 0) + 1;
    return acc;
  }, {});

  const hourlyTrends = [
    { hour: "06:00", fillRate: 15, trips: 0 },
    { hour: "09:00", fillRate: 35, trips: 1 },
    { hour: "12:00", fillRate: 68, trips: 2 },
    { hour: "15:00", fillRate: 52, trips: 1 },
    { hour: "18:00", fillRate: 84, trips: 3 },
    { hour: "21:00", fillRate: 91, trips: 4 },
    { hour: "00:00", fillRate: 40, trips: 1 },
  ];

  const zonePerformance = [
    { zone: "Central Zone", bins: 3, critical: 1, efficiency: "98%", status: "Good" },
    { zone: "North Zone", bins: 2, critical: 1, efficiency: "95%", status: "Good" },
    { zone: "South Zone", bins: 3, critical: 1, efficiency: "92%", status: "Moderate" },
    { zone: "East Zone", bins: 2, critical: 1, efficiency: "96%", status: "Good" },
    { zone: "West Zone", bins: 2, critical: 1, efficiency: "89%", status: "Action Req" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900/80 to-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-indigo-900/80 border border-indigo-500/40 text-indigo-300">
              City Supervisor Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">SIH PS-14 Analytics Core</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5">
            Municipal Environmental & Waste Efficiency Scorecard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-2xl text-center border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Sustainability Index</span>
            <strong className="text-lg text-emerald-400 font-extrabold flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" /> 94.8 / 100
            </strong>
          </div>
        </div>
      </div>

      {/* 4 Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Cumulative Fuel Saved</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {activeRoute.fuelSavedLiters * 14.5} <span className="text-sm font-normal text-slate-400">Liters</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +32% vs Fixed Schedule
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Carbon Emission Offset</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">
            {activeRoute.co2SavedKg * 14.5} <span className="text-sm font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Equivalent to planting <strong>48 trees</strong>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Live Waste Fill Pressure</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {fillRateAvg}% <span className="text-sm font-normal text-slate-400">({currentVolumeStored}L / {totalVolumeCapacity}L)</span>
          </div>
          <div className="text-xs text-indigo-400 mt-1">
            Across {bins.length} monitored nodes
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Dispatched Collections</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-400">
            18 <span className="text-sm font-normal text-slate-400">Runs this week</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Avg Turnaround: <strong>42 mins</strong>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Hourly Waste Accumulation Chart */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Hourly Waste Accumulation & Dispatch Peaks
              </h3>
              <p className="text-xs text-slate-400">
                Identifies peak overflow hours to proactively schedule collection shifts
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Past 24 Hours
            </span>
          </div>

          <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {hourlyTrends.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.fillRate}%
                </div>
                <div 
                  className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125 ${
                    t.fillRate >= 70 ? 'bg-gradient-to-t from-rose-600 to-rose-400' :
                    t.fillRate >= 50 ? 'bg-gradient-to-t from-amber-600 to-amber-400' :
                    'bg-gradient-to-t from-indigo-600 to-indigo-400'
                  }`}
                  style={{ height: `${t.fillRate}%` }}
                />
                <span className="text-[11px] font-mono text-slate-400 font-semibold mt-1">
                  {t.hour}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2">
            <span>Peak overflow window: <strong className="text-rose-400">18:00 - 21:00 (Evening Market Surge)</strong></span>
            <span>Recommended fleet standby: <strong className="text-indigo-400">3 Vehicles</strong></span>
          </div>
        </div>

        {/* Right: Waste Stream Segregation Breakdown */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-5 border border-slate-800 flex flex-col">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Waste Stream Mix
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Source segregation breakdown
          </p>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {Object.entries(wasteCounts).map(([type, count]) => {
              const pct = Math.round((count / (bins.length || 1)) * 100);
              let barColor = "bg-indigo-500";
              if (type === "Organic") barColor = "bg-emerald-500";
              if (type === "Recyclable") barColor = "bg-cyan-500";
              if (type === "Hazardous") barColor = "bg-rose-500";
              if (type === "E-Waste") barColor = "bg-purple-500";

              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{type} Waste</span>
                    <span className="text-slate-400">{count} bins ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mt-4 text-[11px] text-emerald-300">
            🌱 <strong>High Recyclability:</strong> 64% of collected waste is diverted from landfills to recycling and biomethanation plants.
          </div>
        </div>

      </div>

      {/* Zone Performance Table */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-3">
          Zone-Wise Collection Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 rounded-l-xl">Municipal Zone</th>
                <th className="p-3">Total Deployed Bins</th>
                <th className="p-3">Critical Anomaly Bins</th>
                <th className="p-3">Route Optimization Adherence</th>
                <th className="p-3 text-right rounded-r-xl">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {zonePerformance.map((z, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-bold text-white">{z.zone}</td>
                  <td className="p-3">{z.bins} Units</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${z.critical > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {z.critical} Critical
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{z.efficiency}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                      {z.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
