import React, { useState, useMemo } from 'react';
import { 
  Cross, 
  ShieldAlert, 
  AlertTriangle, 
  Trash2, 
  Truck, 
  Activity, 
  Thermometer, 
  Wind, 
  Battery, 
  Search, 
  Filter, 
  ExternalLink, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  Clock,
  Building2,
  Navigation
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { WASTE_TYPES, getWasteTypeConfig } from '../data/wasteTypes';
import { calculateBinPriority } from '../utils/priorityCalculator';
import { exportBinsToCSV } from '../utils/exportUtils';

export default function HospitalWasteView() {
  const { 
    bins, 
    setSelectedBinId, 
    emptyBin, 
    allRoutes, 
    startRouteSimulation, 
    isDrivingRoute,
    setActiveTab
  } = useWasteData();

  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter only hospital / biomedical bins
  const hospitalBins = useMemo(() => {
    return bins.filter((b) => b.binCategory === 'HOSPITAL' || b.hospitalName);
  }, [bins]);

  // List of unique hospitals
  const hospitalNames = useMemo(() => {
    const names = new Set();
    hospitalBins.forEach((b) => {
      if (b.hospitalName) names.add(b.hospitalName);
    });
    return Array.from(names);
  }, [hospitalBins]);

  // Filtered hospital bins
  const filteredBins = useMemo(() => {
    return hospitalBins.filter((b) => {
      const matchesHospital = selectedHospital === 'all' || b.hospitalName === selectedHospital;
      const matchesStream = selectedStream === 'all' || b.wasteType === selectedStream;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'critical' && (b.fillLevel >= 70 || b.status === 'critical')) ||
        (statusFilter === 'warning' && b.fillLevel >= 50 && b.fillLevel < 70) ||
        (statusFilter === 'optimal' && b.fillLevel < 50);

      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        (b.hospitalName && b.hospitalName.toLowerCase().includes(query)) ||
        (b.department && b.department.toLowerCase().includes(query));

      return matchesHospital && matchesStream && matchesStatus && matchesSearch;
    });
  }, [hospitalBins, selectedHospital, selectedStream, statusFilter, searchQuery]);

  // Key KPI Metrics for Hospital Waste
  const totalHospitalBins = hospitalBins.length;
  const criticalHospitalBins = hospitalBins.filter((b) => b.fillLevel >= 70 || b.status === 'critical');
  const medicalBinsCount = hospitalBins.filter((b) => b.wasteType === 'MEDICAL').length;
  const sharpsBinsCount = hospitalBins.filter((b) => b.wasteType === 'SHARPS').length;
  const infectiousBinsCount = hospitalBins.filter((b) => b.wasteType === 'INFECTIOUS').length;
  const pharmaBinsCount = hospitalBins.filter((b) => b.wasteType === 'PHARMACEUTICAL').length;

  // Find active medical / sharps routes
  const hospitalRoutes = allRoutes.filter((r) => r.category === 'HOSPITAL' || r.vehicleType.includes('MEDICAL') || r.vehicleType.includes('SHARPS'));

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 border-2 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-indigo-950/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-900/80 border-2 border-rose-500/60 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-950/80">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-rose-900/80 border border-rose-500/50 text-rose-300">
                Bio-Medical Waste Command
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Healthcare Node Tracking</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Simulated Hospital Waste & Hazardous Containment Center
            </h2>
          </div>
        </div>

        {/* Action Button: Dispatch Hospital Loop */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (hospitalRoutes.length > 0) {
                startRouteSimulation(hospitalRoutes[0].id);
              }
            }}
            disabled={criticalHospitalBins.length === 0 || isDrivingRoute}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-xl shadow-rose-600/30 border border-rose-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch Med-Van Fleet ({hospitalRoutes.length} Loops)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Hospital Nodes */}
        <div className="glass-card rounded-2xl p-3.5 border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Hospital Nodes</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{totalHospitalBins}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across <strong>{hospitalNames.length} Facilities</strong>
          </div>
        </div>

        {/* Card 2: Critical Bio-Waste */}
        <div className="glass-card rounded-2xl p-3.5 border-2 border-rose-500/50 bg-rose-950/30">
          <div className="flex items-center justify-between text-xs text-rose-300 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Critical Overflow
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1.5">{criticalHospitalBins.length}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Priority HazMat Action</div>
        </div>

        {/* Card 3: Medical Waste Bins */}
        <div className="glass-card rounded-2xl p-3.5 border border-amber-500/40 bg-amber-950/20">
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
            <span>General Medical</span>
            <span className="text-xs">🟡</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1.5">{medicalBinsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Trauma & Ward Units</div>
        </div>

        {/* Card 4: Sharps Containers */}
        <div className="glass-card rounded-2xl p-3.5 border border-rose-500/40 bg-rose-950/20">
          <div className="flex items-center justify-between text-xs text-rose-300 font-semibold">
            <span>Sharps Vaults</span>
            <span className="text-xs">🔴</span>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1.5">{sharpsBinsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Puncture-proof Syringes</div>
        </div>

        {/* Card 5: Infectious & Pharma */}
        <div className="glass-card rounded-2xl p-3.5 border border-purple-500/40 bg-purple-950/20">
          <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
            <span>Infectious & Pharma</span>
            <span className="text-xs">🟣</span>
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1.5">
            {infectiousBinsCount + pharmaBinsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Isolation & Lab Units</div>
        </div>

      </div>

      {/* Stream Category Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {Object.keys(WASTE_TYPES)
          .filter((k) => WASTE_TYPES[k].category === 'HOSPITAL' || k === 'ORGANIC')
          .map((key) => {
            const wType = WASTE_TYPES[key];
            const matchingCount = hospitalBins.filter((b) => b.wasteType === key).length;
            const critCount = hospitalBins.filter((b) => b.wasteType === key && b.fillLevel >= 70).length;

            return (
              <div 
                key={key}
                onClick={() => setSelectedStream(selectedStream === key ? 'all' : key)}
                className={`glass-card rounded-2xl p-4 border transition-all cursor-pointer group ${
                  selectedStream === key 
                    ? 'border-indigo-400 bg-slate-800/80 shadow-lg shadow-indigo-500/20' 
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                    style={{ 
                      borderColor: `${wType.color}50`, 
                      backgroundColor: `${wType.color}15`, 
                      color: wType.color 
                    }}
                  >
                    {wType.shortLabel}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {matchingCount} Units
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                  {wType.label}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {wType.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  <strong className="text-indigo-300 font-mono">{wType.vehicleType.replace('_WASTE', '')}</strong>
                </div>
              </div>
            );
          })}
      </div>

      {/* Main Table: Hospital Bio-Waste Inventory */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col">
        
        {/* Controls & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospital, department, or bin ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Hospital Filter */}
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Hospitals ({hospitalNames.length})</option>
              {hospitalNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Waste Stream Filter */}
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Bio Streams</option>
              <option value="MEDICAL">Medical Waste</option>
              <option value="SHARPS">Sharps & Syringes</option>
              <option value="INFECTIOUS">Infectious Biohazard</option>
              <option value="PHARMACEUTICAL">Pharmaceutical</option>
              <option value="ORGANIC">Hospital Kitchen Organic</option>
            </select>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'all' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('critical')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setStatusFilter('warning')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'warning' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Warning
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={() => exportBinsToCSV(filteredBins)}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Export Hospital Waste Manifest CSV"
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
                <th className="p-3">Hospital & Department</th>
                <th className="p-3">Waste Category</th>
                <th className="p-3">Fill Level</th>
                <th className="p-3">Priority Score</th>
                <th className="p-3">Telemetry</th>
                <th className="p-3">Assigned Vehicle</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBins.length > 0 ? (
                filteredBins.map((bin) => {
                  const wConfig = getWasteTypeConfig(bin.wasteType);
                  const priority = calculateBinPriority(bin);

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

                      {/* Hospital & Department */}
                      <td className="p-3">
                        <div className="font-bold text-white text-xs">{bin.hospitalName || bin.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{bin.department || bin.zone}</span>
                        </div>
                      </td>

                      {/* Waste Category Badge */}
                      <td className="p-3">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
                          style={{
                            borderColor: `${wConfig.color}40`,
                            backgroundColor: `${wConfig.color}15`,
                            color: wConfig.color
                          }}
                        >
                          <span>{wConfig.label}</span>
                        </span>
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

                      {/* Priority Score */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${priority.badgeBg} ${priority.badgeText} ${priority.badgeBorder}`}>
                          Score: {priority.score} ({priority.level})
                        </span>
                      </td>

                      {/* Telemetry (Temp, Gas, Battery) */}
                      <td className="p-3">
                        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
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
                      <td className="p-3">
                        <span className="font-mono text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                          {bin.assignedTruck || 'MED-01'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBinId(bin.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="Sensor Diagnostics"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => emptyBin(bin.id)}
                            className="p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors"
                            title="Mark Collected & Decontaminated"
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
                    No hospital bins match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
