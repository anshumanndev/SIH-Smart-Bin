import React from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink, 
  Battery, 
  Thermometer, 
  Wind, 
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { exportBinsToCSV } from '../utils/exportUtils';

export default function BinTable() {
  const { 
    bins, 
    filterStatus, 
    setFilterStatus, 
    filterType, 
    setFilterType, 
    searchQuery, 
    setSearchQuery,
    setSelectedBinId,
    emptyBin 
  } = useWasteData();

  // Filtered List
  const filteredBins = bins.filter((b) => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.zone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'critical' && b.fillLevel >= 70) ||
      (filterStatus === 'warning' && b.fillLevel >= 50 && b.fillLevel < 70) ||
      (filterStatus === 'optimal' && b.fillLevel < 50);

    const matchesType = 
      filterType === 'all' || b.wasteType.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col">
      
      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search smart bins by name, ID, or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'all' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({bins.length})
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'warning' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => setFilterStatus('optimal')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'optimal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Optimal
            </button>
          </div>

          {/* Waste Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 font-semibold focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Waste Streams</option>
            <option value="General">General</option>
            <option value="Organic">Organic</option>
            <option value="Recyclable">Recyclable</option>
            <option value="Hazardous">Hazardous</option>
            <option value="E-Waste">E-Waste</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={() => exportBinsToCSV(filteredBins)}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Export CSV of filtered bins"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Table Body */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3 rounded-l-xl">Bin ID</th>
              <th className="p-3">Location & Stream</th>
              <th className="p-3">Fill Level</th>
              <th className="p-3">Telemetry</th>
              <th className="p-3">Last Emptied</th>
              <th className="p-3">Assigned Truck</th>
              <th className="p-3 text-right rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredBins.length > 0 ? (
              filteredBins.map((bin) => (
                <tr 
                  key={bin.id} 
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* ID */}
                  <td className="p-3 font-mono font-bold text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{
                        backgroundColor: bin.fillLevel >= 70 ? '#ef4444' : bin.fillLevel >= 50 ? '#f59e0b' : '#22c55e'
                      }} />
                      {bin.id}
                    </div>
                  </td>

                  {/* Name & Stream */}
                  <td className="p-3">
                    <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {bin.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-semibold uppercase">
                        {bin.wasteType}
                      </span>
                      <span>{bin.zone} • {bin.capacityLiters}L</span>
                    </div>
                  </td>

                  {/* Fill Level */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            bin.fillLevel >= 70 ? 'bg-rose-500' :
                            bin.fillLevel >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${bin.fillLevel}%` }}
                        />
                      </div>
                      <span className={`font-bold font-mono ${
                        bin.fillLevel >= 70 ? 'text-rose-400' :
                        bin.fillLevel >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {bin.fillLevel}%
                      </span>
                    </div>
                  </td>

                  {/* Telemetry Icons */}
                  <td className="p-3">
                    <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1" title="Temperature">
                        <Thermometer className="w-3 h-3 text-rose-400" />
                        {bin.temperature}°C
                      </span>
                      <span className="flex items-center gap-1" title="Methane / Odor Gas">
                        <Wind className="w-3 h-3 text-amber-400" />
                        {bin.gasLevelPpm}ppm
                      </span>
                      <span className="flex items-center gap-1" title="Sensor Battery">
                        <Battery className="w-3 h-3 text-emerald-400" />
                        {bin.batteryLevel}%
                      </span>
                    </div>
                  </td>

                  {/* Last Emptied */}
                  <td className="p-3 text-slate-400">
                    {bin.lastEmptied}
                  </td>

                  {/* Truck */}
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
                      {bin.assignedTruck}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => emptyBin(bin.id)}
                        className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all"
                        title="Mark Emptied"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedBinId(bin.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                        title="Open Diagnostics"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No smart bins match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
