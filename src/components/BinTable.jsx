import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Building2,
  Cross
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { exportBinsToCSV } from '../utils/exportUtils';
import { getWasteTypeConfig, WASTE_TYPES } from '../data/wasteTypes';
import { calculateBinPriority } from '../utils/priorityCalculator';

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

  // Multi-type filter state
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'GENERAL' | 'HOSPITAL'

  // Filtered List
  const filteredBins = useMemo(() => {
    return bins.filter((b) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        (b.zone && b.zone.toLowerCase().includes(query)) ||
        (b.hospitalName && b.hospitalName.toLowerCase().includes(query)) ||
        (b.department && b.department.toLowerCase().includes(query));

      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'critical' && (b.fillLevel >= 70 || b.status === 'critical')) ||
        (filterStatus === 'warning' && b.fillLevel >= 50 && b.fillLevel < 70) ||
        (filterStatus === 'optimal' && b.fillLevel < 50);

      const matchesCategory = 
        selectedCategory === 'all' || 
        (selectedCategory === 'HOSPITAL' && (b.binCategory === 'HOSPITAL' || b.hospitalName)) ||
        (selectedCategory === 'GENERAL' && b.binCategory !== 'HOSPITAL' && !b.hospitalName);

      const matchesType = 
        filterType === 'all' || b.wasteType.toUpperCase() === filterType.toUpperCase();

      return matchesSearch && matchesStatus && matchesCategory && matchesType;
    });
  }, [bins, searchQuery, filterStatus, selectedCategory, filterType]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col">
      
      {/* Controls & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bins by ID, location, hospital, stream, or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Category Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({bins.length})
            </button>
            <button
              onClick={() => setSelectedCategory('GENERAL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedCategory === 'GENERAL' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setSelectedCategory('HOSPITAL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedCategory === 'HOSPITAL' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hospital
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Crit
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'warning' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warn
            </button>
          </div>

          {/* Waste Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Waste Streams</option>
            <option value="DRY">Dry Recyclables</option>
            <option value="WET">Wet Organic</option>
            <option value="ORGANIC">Organic Compostable</option>
            <option value="MEDICAL">Medical Bio-Waste</option>
            <option value="SHARPS">Sharps & Syringes</option>
            <option value="INFECTIOUS">Infectious Biohazard</option>
            <option value="PHARMACEUTICAL">Pharmaceutical</option>
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
              <th className="p-3">Location / Facility</th>
              <th className="p-3">Category & Stream</th>
              <th className="p-3">Fill Level</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Telemetry</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3 text-right rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredBins.length > 0 ? (
              filteredBins.map((bin) => {
                const wConfig = getWasteTypeConfig(bin.wasteType);
                const priority = calculateBinPriority(bin);
                const isHospital = bin.binCategory === 'HOSPITAL' || Boolean(bin.hospitalName);

                return (
                  <tr 
                    key={bin.id} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Bin ID */}
                    <td className="p-3 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: wConfig.color }} />
                        <span>{bin.id}</span>
                      </div>
                    </td>

                    {/* Location / Facility */}
                    <td className="p-3">
                      <div className="font-bold text-white text-xs">{bin.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {bin.hospitalName ? `${bin.hospitalName} • ${bin.department || bin.zone}` : bin.zone}
                      </div>
                    </td>

                    {/* Category & Stream Badge */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            borderColor: `${wConfig.color}40`,
                            backgroundColor: `${wConfig.color}15`,
                            color: wConfig.color
                          }}
                        >
                          {wConfig.label}
                        </span>
                        {isHospital && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30 font-mono">
                            HOSP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fill Level */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              bin.fillLevel >= 70 ? 'bg-rose-500' :
                              bin.fillLevel >= 50 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${bin.fillLevel}%` }}
                          />
                        </div>
                        <span className={`font-mono font-bold ${
                          bin.fillLevel >= 70 ? 'text-rose-400' :
                          bin.fillLevel >= 50 ? 'text-amber-400' :
                          'text-slate-300'
                        }`}>
                          {bin.fillLevel}%
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${priority.badgeBg} ${priority.badgeText} ${priority.badgeBorder}`}>
                        {priority.score} ({priority.level})
                      </span>
                    </td>

                    {/* Telemetry */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5 text-slate-400 font-mono text-[11px]">
                        <span className={bin.temperature > 35 ? 'text-rose-400 font-bold' : ''}>
                          {bin.temperature}°C
                        </span>
                        <span className={bin.gasLevelPpm > 60 ? 'text-amber-400 font-bold' : ''}>
                          {bin.gasLevelPpm}ppm
                        </span>
                        <span className="text-emerald-400">
                          {bin.batteryLevel}%
                        </span>
                      </div>
                    </td>

                    {/* Assigned Vehicle */}
                    <td className="p-3 font-mono text-xs text-indigo-300">
                      {bin.assignedTruck || 'Unassigned'}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBinId(bin.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          title="Diagnostics"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => emptyBin(bin.id)}
                          className="p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors"
                          title="Empty Bin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No bins found matching current search and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
