import React, { useMemo } from 'react';
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
  Sparkles,
  Building2,
  Truck,
  ShieldAlert,
  Scale
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { WASTE_TYPES, getWasteTypeConfig } from '../data/wasteTypes';
import { VEHICLES } from '../data/vehicles';

export default function AnalyticsView() {
  const { bins, allRoutes, activeRoute, vehicles } = useWasteData();

  // Aggregate statistics
  const totalVolumeCapacity = bins.reduce((acc, b) => acc + (b.capacityLiters || 660), 0);
  const currentVolumeStored = Math.round(bins.reduce((acc, b) => acc + ((b.capacityLiters || 660) * b.fillLevel / 100), 0));
  const fillRateAvg = Math.round((currentVolumeStored / (totalVolumeCapacity || 1)) * 100);

  // Waste category statistics breakdown
  const wasteStreamStats = useMemo(() => {
    return Object.keys(WASTE_TYPES).map((key) => {
      const wConfig = WASTE_TYPES[key];
      const matchingBins = bins.filter((b) => b.wasteType === key);
      const critBins = matchingBins.filter((b) => b.fillLevel >= 70 || b.status === 'critical');
      const totalStored = Math.round(
        matchingBins.reduce((sum, b) => sum + ((b.capacityLiters || 660) * (b.fillLevel / 100)), 0)
      );
      const estWeightKg = Math.round(totalStored * (wConfig.densityKgPerLiter || 0.4));
      const avgFill = matchingBins.length > 0 
        ? Math.round(matchingBins.reduce((sum, b) => sum + b.fillLevel, 0) / matchingBins.length)
        : 0;

      return {
        key,
        label: wConfig.label,
        category: wConfig.category,
        color: wConfig.color,
        count: matchingBins.length,
        criticalCount: critBins.length,
        totalStoredLiters: totalStored,
        estWeightKg,
        avgFill
      };
    });
  }, [bins]);

  // Hospital Facility Breakdown
  const hospitalStats = useMemo(() => {
    const map = {};
    bins.filter((b) => b.hospitalName).forEach((b) => {
      if (!map[b.hospitalName]) {
        map[b.hospitalName] = {
          name: b.hospitalName,
          totalBins: 0,
          criticalBins: 0,
          medical: 0,
          sharps: 0,
          infectious: 0,
          pharma: 0,
          totalFill: 0
        };
      }
      const item = map[b.hospitalName];
      item.totalBins++;
      item.totalFill += b.fillLevel;
      if (b.fillLevel >= 70 || b.status === 'critical') item.criticalBins++;
      if (b.wasteType === 'MEDICAL') item.medical++;
      if (b.wasteType === 'SHARPS') item.sharps++;
      if (b.wasteType === 'INFECTIOUS') item.infectious++;
      if (b.wasteType === 'PHARMACEUTICAL') item.pharma++;
    });

    return Object.values(map).map((h) => ({
      ...h,
      avgFill: Math.round(h.totalFill / (h.totalBins || 1))
    }));
  }, [bins]);

  // Fleet operational cumulative metrics
  const totalFleetDistanceKm = allRoutes.reduce((sum, r) => sum + r.totalDistanceKm, 0);
  const totalFuelSaved = parseFloat(allRoutes.reduce((sum, r) => sum + r.fuelSavedLiters, 0).toFixed(2));
  const totalCo2Saved = parseFloat(allRoutes.reduce((sum, r) => sum + r.co2SavedKg, 0).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900/80 to-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-indigo-900/80 border border-indigo-500/40 text-indigo-300">
              City Supervisor & Environmental Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono">Multi-Category Intelligence</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5">
            Municipal & Healthcare Environmental Scorecard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-2xl text-center border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Sustainability Index</span>
            <strong className="text-lg text-emerald-400 font-extrabold flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" /> 96.2 / 100
            </strong>
          </div>
        </div>
      </div>

      {/* 4 Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Fleet Fuel Saved</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {totalFuelSaved * 12} <span className="text-sm font-normal text-slate-400">Liters / wk</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +34% Route Efficiency Gain
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Carbon Emission Offset</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">
            {totalCo2Saved * 12} <span className="text-sm font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Equivalent to planting <strong>54 trees</strong>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Waste Pressure</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {fillRateAvg}% <span className="text-sm font-normal text-slate-400">({currentVolumeStored}L / {totalVolumeCapacity}L)</span>
          </div>
          <div className="text-xs text-indigo-400 mt-1">
            Across {bins.length} monitored node points
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Fleet Routes</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-400">
            {allRoutes.length} <span className="text-sm font-normal text-slate-400">Loops Generated</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {totalFleetDistanceKm.toFixed(1)} km total loop distance
          </div>
        </div>

      </div>

      {/* Waste Category Breakdown Table */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Waste Stream Classification & Inventory Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Live capacity breakdown across general municipal and healthcare bio-waste categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {wasteStreamStats.map((item) => (
            <div key={item.key} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                  style={{
                    borderColor: `${item.color}50`,
                    backgroundColor: `${item.color}15`,
                    color: item.color
                  }}
                >
                  {item.label}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">{item.count} Bins</span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <div className="text-lg font-black text-white">
                  ~{item.estWeightKg} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <span className={`text-xs font-bold ${item.avgFill >= 70 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {item.avgFill}% Avg Fill
                </span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-2 border border-slate-800">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${item.avgFill}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Critical: <strong className={item.criticalCount > 0 ? 'text-rose-400' : 'text-slate-300'}>{item.criticalCount}</strong></span>
                <span>Category: <strong className="text-slate-300">{item.category}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital Facilities Metrics Table */}
      {hospitalStats.length > 0 && (
        <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              Healthcare Facility Bio-Waste Compliance Metrics
            </h3>
            <p className="text-xs text-slate-400">
              Departmental waste segregation and critical overflow status per medical center
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 rounded-l-xl">Hospital Facility</th>
                  <th className="p-3">Total Monitored Nodes</th>
                  <th className="p-3">Medical Bins</th>
                  <th className="p-3">Sharps Vaults</th>
                  <th className="p-3">Infectious / Pharma</th>
                  <th className="p-3">Avg Fill Pressure</th>
                  <th className="p-3 text-right rounded-r-xl">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {hospitalStats.map((h) => (
                  <tr key={h.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white text-xs">{h.name}</td>
                    <td className="p-3 font-mono">{h.totalBins} Units</td>
                    <td className="p-3 text-amber-400 font-semibold">{h.medical} Units</td>
                    <td className="p-3 text-rose-400 font-semibold">{h.sharps} Units</td>
                    <td className="p-3 text-purple-400 font-semibold">{h.infectious + h.pharma} Units</td>
                    <td className="p-3">
                      <span className={`font-mono font-bold ${h.avgFill >= 70 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {h.avgFill}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        h.criticalBins > 0
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {h.criticalBins > 0 ? `${h.criticalBins} Dispatch Required` : 'Optimal Compliance'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fleet Vehicles Table */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Collection Vehicle Fleet Operational Roster
          </h3>
          <p className="text-xs text-slate-400">
            Dedicated vehicle assignment, payload limits, and fuel efficiency metrics
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 rounded-l-xl">Vehicle ID</th>
                <th className="p-3">Vehicle Name & Driver</th>
                <th className="p-3">Stream Category</th>
                <th className="p-3">Payload Capacity</th>
                <th className="p-3">Assigned Route</th>
                <th className="p-3 text-right rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vehicles.map((v) => {
                const assignedRoute = allRoutes.find((r) => r.vehicleId === v.id);

                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-white">{v.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{v.name}</div>
                      <div className="text-[11px] text-slate-400">{v.driverName} • {v.plateNumber}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        v.category === 'HOSPITAL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      }`}>
                        {v.type.replace('_WASTE', '')}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-white">
                      {v.capacityKg} kg
                    </td>
                    <td className="p-3">
                      {assignedRoute ? (
                        <span className="text-emerald-400 font-mono font-semibold">
                          {assignedRoute.optimizedStops.length} Stops ({assignedRoute.totalDistanceKm} km)
                        </span>
                      ) : (
                        <span className="text-slate-500">Standby in Yard</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {v.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
