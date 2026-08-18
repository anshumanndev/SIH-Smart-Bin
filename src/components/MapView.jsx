import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMapEvents,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  PlusCircle, 
  Navigation, 
  Truck, 
  AlertTriangle, 
  Battery, 
  Thermometer, 
  Wind, 
  Trash2, 
  Compass,
  Maximize2,
  Building2,
  ShieldAlert,
  Cross,
  CheckSquare,
  Square
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { getWasteTypeConfig } from '../data/wasteTypes';
import { VEHICLES } from '../data/vehicles';
import { calculateBinPriority } from '../utils/priorityCalculator';

// Custom Marker Generator for Bins
function createBinMarkerIcon(bin, stopNumber = null) {
  const isHospital = bin.binCategory === 'HOSPITAL' || Boolean(bin.hospitalName);
  const wConfig = getWasteTypeConfig(bin.wasteType);
  let badgeColor = wConfig.color || "#22c55e";

  let statusRing = "border-emerald-500";
  let pulseClass = "";
  let boxShadowVal = `0 0 10px ${badgeColor}80`;

  if (bin.fillLevel >= 70 || bin.status === 'critical') {
    statusRing = "border-rose-500";
    boxShadowVal = "0 0 16px rgba(239,68,68,0.9)";
    pulseClass = "animate-ping";
  } else if (bin.fillLevel >= 50) {
    statusRing = "border-amber-500";
    boxShadowVal = "0 0 12px rgba(245,158,11,0.7)";
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer select-none">
      ${(bin.fillLevel >= 70 || bin.status === 'critical') ? `<div class="absolute w-10 h-10 rounded-full bg-rose-500/25 ${pulseClass}"></div>` : ''}
      
      <div class="relative w-8 h-8 rounded-full bg-slate-950/95 border-2 ${statusRing} flex items-center justify-center text-[10px] font-bold font-mono text-white" style="box-shadow: ${boxShadowVal};">
        ${isHospital 
          ? `<span class="text-[9px] font-black" style="color: ${badgeColor};">${bin.fillLevel}%</span>` 
          : `<span>${bin.fillLevel}%</span>`
        }
      </div>

      ${isHospital ? `
        <div class="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-rose-900 border border-rose-400 flex items-center justify-center text-[8px] text-white font-bold shadow">
          +
        </div>
      ` : ''}

      ${stopNumber !== null ? `
        <div class="absolute -top-2 -right-2 w-4 h-4 bg-indigo-600 rounded-full border border-white flex items-center justify-center text-[9px] text-white font-black shadow-md">
          ${stopNumber}
        </div>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-bin-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// Municipal Depot Marker
const depotIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center cursor-pointer">
      <div class="absolute w-12 h-12 rounded-full bg-blue-500/20 animate-ping"></div>
      <div class="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-indigo-700 to-blue-500 border-2 border-white/80 shadow-[0_0_20px_rgba(59,130,246,0.8)] flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div class="absolute -bottom-4 bg-slate-900/90 text-[9px] font-mono font-bold text-sky-300 px-1.5 rounded border border-slate-700 whitespace-nowrap">
        CENTRAL DEPOT
      </div>
    </div>
  `,
  className: 'custom-depot-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Custom Vehicle Marker Generator
function createVehicleMarkerIcon(vehicle, isSimulating = false) {
  const isMedical = vehicle.category === 'HOSPITAL' || vehicle.type.includes('MEDICAL') || vehicle.type.includes('SHARPS');
  const bgColor = isMedical ? 'bg-gradient-to-tr from-rose-700 to-amber-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-500';
  const glow = isMedical ? 'shadow-[0_0_20px_rgba(244,63,94,0.9)]' : 'shadow-[0_0_18px_rgba(16,185,129,0.9)]';

  const html = `
    <div class="relative flex flex-col items-center justify-center select-none">
      <div class="absolute w-12 h-12 rounded-full ${isMedical ? 'bg-rose-500/30' : 'bg-emerald-500/30'} animate-ping"></div>
      
      <div class="relative w-9 h-9 rounded-2xl ${bgColor} border-2 border-white ${glow} flex items-center justify-center text-white">
        ${isMedical ? `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/><path d="M10 9h4"/><path d="M12 7v4"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="16.5" cy="18.5" r="2.5"/></svg>
        ` : `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
        `}
      </div>

      <div class="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-mono font-bold text-white whitespace-nowrap shadow">
        ${vehicle.id}
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-vehicle-marker',
    iconSize: [36, 44],
    iconAnchor: [18, 22]
  });
}

// Map Click Listener to Add Smart Bins
function MapEventsHandler({ isAddingBin, onAddBin }) {
  useMapEvents({
    click(e) {
      if (isAddingBin) {
        onAddBin(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Controller to auto-pan or center
function MapViewController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function MapView() {
  const { 
    bins, 
    depot, 
    allRoutes,
    activeRoute,
    activeRouteId,
    setActiveRouteId,
    vehicles,
    vehiclePositions,
    setSelectedBinId, 
    addNewBin, 
    emptyBin,
    isDrivingRoute, 
    startRouteSimulation,
    stopRouteSimulation,
    criticalBins
  } = useWasteData();

  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'streets' | 'satellite'
  const [isAddingBin, setIsAddingBin] = useState(false);
  const [focusCenter, setFocusCenter] = useState(null);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  // Layer Visibility Toggles
  const [layerVisibility, setLayerVisibility] = useState({
    generalBins: true,
    hospitalBins: true,
    criticalOnly: false,
    vehicles: true,
    routes: true,
  });

  const toggleLayer = (layerKey) => {
    setLayerVisibility((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Map Tile URLs
  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const handleAddBinClick = (lat, lng) => {
    const isHosp = window.confirm("Is this a Hospital / Bio-Medical waste bin?\n(Click OK for Hospital, Cancel for General Municipal)");
    const defaultName = prompt("Enter location name for new Smart Bin:", isHosp ? "St. Jude Pathology Lab" : "Metro Concourse South Gate");
    
    if (defaultName !== null) {
      if (isHosp) {
        addNewBin(lat, lng, defaultName || "Hospital Care Station", "MEDICAL", "HOSPITAL", "City Medical Center");
      } else {
        addNewBin(lat, lng, defaultName || "New Smart Bin", "DRY", "GENERAL");
      }
      setIsAddingBin(false);
    }
  };

  const handleFocusDepot = () => {
    setFocusCenter([depot.lat, depot.lng]);
  };

  // Map stop numbers for the active route
  const stopNumberMap = useMemo(() => {
    const map = {};
    if (activeRoute && activeRoute.optimizedStops) {
      activeRoute.optimizedStops.forEach((bin, idx) => {
        map[bin.id] = idx + 1;
      });
    }
    return map;
  }, [activeRoute]);

  // Filter bins based on active layer toggles
  const visibleBins = useMemo(() => {
    return bins.filter((bin) => {
      const isHospital = bin.binCategory === 'HOSPITAL' || Boolean(bin.hospitalName);
      if (isHospital && !layerVisibility.hospitalBins) return false;
      if (!isHospital && !layerVisibility.generalBins) return false;
      if (layerVisibility.criticalOnly && bin.fillLevel < 70 && bin.status !== 'critical') return false;
      return true;
    });
  }, [bins, layerVisibility]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex flex-col h-[560px] lg:h-[620px]">
      
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badges */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Live Multi-Stream Fleet Grid
            </span>
          </div>

          {isDrivingRoute && activeRoute && (
            <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 bg-emerald-950/90 border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-lg animate-pulse">
              <Truck className="w-3.5 h-3.5" />
              <span>Simulating {activeRoute.vehicleShortName || activeRoute.vehicleId} Dispatch</span>
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Layer Controls Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLayersMenu(!showLayersMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg transition-all border ${
                showLayersMenu ? 'bg-indigo-600 text-white border-indigo-400' : 'glass-panel text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>

            {/* Floating Layer Menu */}
            {showLayersMenu && (
              <div className="absolute right-0 top-10 w-52 glass-dropdown rounded-2xl p-3 border border-slate-700 shadow-2xl z-50 space-y-2 text-xs">
                <div className="font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                  Map Layer Toggles
                </div>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                  <span>General Bins</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.generalBins}
                    onChange={() => toggleLayer('generalBins')}
                    className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                  <span className="text-rose-300">Hospital & Bio-Waste</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.hospitalBins}
                    onChange={() => toggleLayer('hospitalBins')}
                    className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                  <span>Critical Only (≥70%)</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.criticalOnly}
                    onChange={() => toggleLayer('criticalOnly')}
                    className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                  <span>Fleet Vehicles</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.vehicles}
                    onChange={() => toggleLayer('vehicles')}
                    className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                  <span>Optimized Route Paths</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.routes}
                    onChange={() => toggleLayer('routes')}
                    className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Add Bin Mode Toggle */}
          <button
            onClick={() => setIsAddingBin(!isAddingBin)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
              isAddingBin
                ? 'bg-rose-600 text-white border border-rose-400 animate-pulse'
                : 'glass-panel text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAddingBin ? 'Click on Map...' : 'Add Bin'}</span>
          </button>

          {/* Map Base Tile Switcher */}
          <div className="glass-panel p-1 rounded-xl flex items-center border border-slate-700 shadow-lg">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mapStyle === 'dark' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mapStyle === 'streets' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Roads
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mapStyle === 'satellite' ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Recenter Depot */}
          <button
            onClick={handleFocusDepot}
            title="Recenter Map on Central Depot"
            className="glass-panel p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700 shadow-lg"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Body */}
      <div className="w-full h-full relative z-0">
        <MapContainer
          center={[depot.lat, depot.lng]}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <MapViewController center={focusCenter} />
          <MapEventsHandler isAddingBin={isAddingBin} onAddBin={handleAddBinClick} />

          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrls[mapStyle]}
          />

          {/* Render Multi-Category Route Polylines */}
          {layerVisibility.routes && allRoutes.map((route) => {
            const isCurrentActive = activeRoute && activeRoute.id === route.id;
            const routeColor = route.routeColor || '#38bdf8';

            if (!route.coordinatesPath || route.coordinatesPath.length <= 1) return null;

            return (
              <React.Fragment key={route.id}>
                {/* Outer Glow Line */}
                <Polyline
                  positions={route.coordinatesPath}
                  pathOptions={{
                    color: routeColor,
                    weight: isCurrentActive ? 8 : 4,
                    opacity: isCurrentActive ? 0.35 : 0.15,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
                {/* Core Polyline */}
                <Polyline
                  positions={route.coordinatesPath}
                  pathOptions={{
                    color: routeColor,
                    weight: isCurrentActive ? 3.5 : 2,
                    opacity: isCurrentActive ? 0.95 : 0.6,
                    dashArray: (isCurrentActive && isDrivingRoute) ? '8, 8' : undefined
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Municipal Depot Marker */}
          <Marker position={[depot.lat, depot.lng]} icon={depotIcon}>
            <Popup>
              <div className="p-3 w-60">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Truck className="w-4 h-4" />
                  <span>Municipal Sorting & Transfer Yard</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{depot.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{depot.address}</div>
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-300">
                  <span>Fleet Yard: <strong>{depot.capacityTrucks} Bays</strong></span>
                  <span>Active Routes: <strong className="text-emerald-400">{allRoutes.length} Generated</strong></span>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Smart Bin & Hospital Bin Markers */}
          {visibleBins.map((bin) => {
            const stopNumber = stopNumberMap[bin.id] || null;
            const wConfig = getWasteTypeConfig(bin.wasteType);
            const priority = calculateBinPriority(bin);
            const isHospital = bin.binCategory === 'HOSPITAL' || Boolean(bin.hospitalName);

            return (
              <Marker
                key={bin.id}
                position={[bin.lat, bin.lng]}
                icon={createBinMarkerIcon(bin, stopNumber)}
              >
                <Popup>
                  <div className="p-3 w-64">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {bin.id}
                        </span>
                        {isHospital && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            HOSPITAL
                          </span>
                        )}
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bin.fillLevel >= 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        bin.fillLevel >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {bin.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="font-bold text-slate-100 text-sm mt-1.5">
                      {bin.hospitalName || bin.name}
                    </div>
                    
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span style={{ color: wConfig.color }} className="font-semibold">
                        {wConfig.label}
                      </span>
                      <span>Priority: <strong className={priority.badgeText}>{priority.score}</strong></span>
                    </div>

                    {/* Sensor Telemetry Grid */}
                    <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[9px]">Fill</span>
                        <strong className={bin.fillLevel >= 70 ? 'text-rose-400' : 'text-slate-100'}>
                          {bin.fillLevel}%
                        </strong>
                      </div>
                      <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[9px]">Temp</span>
                        <strong className={bin.temperature > 38 ? 'text-rose-400' : 'text-slate-100'}>
                          {bin.temperature}°C
                        </strong>
                      </div>
                      <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[9px]">Battery</span>
                        <strong className="text-emerald-400">{bin.batteryLevel}%</strong>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => emptyBin(bin.id)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Empty</span>
                      </button>
                      <button
                        onClick={() => setSelectedBinId(bin.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                      >
                        Diagnostics
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Live Fleet Vehicle Markers */}
          {layerVisibility.vehicles && vehicles.map((vehicle) => {
            const pos = vehiclePositions[vehicle.id] || [depot.lat, depot.lng];
            const isSimulating = isDrivingRoute && activeRoute && activeRoute.vehicleId === vehicle.id;

            return (
              <Marker
                key={vehicle.id}
                position={pos}
                icon={createVehicleMarkerIcon(vehicle, isSimulating)}
              >
                <Popup>
                  <div className="p-3 w-56">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{vehicle.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Driver: {vehicle.driverName}</div>
                    <div className="text-[11px] text-slate-400">Plate: {vehicle.plateNumber}</div>
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] flex justify-between">
                      <span>Capacity: <strong>{vehicle.capacityKg} kg</strong></span>
                      <span className="text-emerald-400"><strong>{vehicle.status}</strong></span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>
      </div>

      {/* Bottom Map Legend & Route Selector */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Stream Badges Legend */}
        <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-3 text-[11px] text-slate-300 pointer-events-auto shadow-lg flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Dry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Wet/Bio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Medical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Sharps</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Pharma</span>
          </div>
        </div>

        {/* Quick Simulation Trigger Button */}
        <div className="pointer-events-auto">
          {!isDrivingRoute ? (
            <button
              onClick={() => startRouteSimulation()}
              disabled={criticalBins.length === 0}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-700 via-indigo-600 to-emerald-600 hover:from-brand-600 hover:to-emerald-500 text-white text-xs font-bold shadow-xl shadow-brand-500/25 border border-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Simulate Fleet Run ({allRoutes.length} Loops)</span>
            </button>
          ) : (
            <button
              onClick={stopRouteSimulation}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xl shadow-rose-600/30 border border-rose-400 transition-all animate-pulse"
            >
              <span>Stop Simulation</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
