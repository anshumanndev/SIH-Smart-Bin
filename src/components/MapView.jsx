import React, { useState, useEffect } from 'react';
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
  Maximize2
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

// Custom Marker Generator
function createBinIcon(bin, isTarget = false) {
  let badgeColor = "#22c55e"; // Optimal
  let glowStyle = "shadow-[0_0_12px_rgba(34,197,94,0.6)]";
  let pulseClass = "";

  if (bin.fillLevel >= 70) {
    badgeColor = "#ef4444"; // Critical
    glowStyle = "shadow-[0_0_16px_rgba(239,68,68,0.9)]";
    pulseClass = "animate-radar";
  } else if (bin.fillLevel >= 50) {
    badgeColor = "#f59e0b"; // Warning
    glowStyle = "shadow-[0_0_12px_rgba(245,158,11,0.6)]";
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer">
      ${bin.fillLevel >= 70 ? `<div class="absolute w-10 h-10 rounded-full bg-rose-500/30 ${pulseClass}"></div>` : ''}
      <div class="relative w-8 h-8 rounded-full bg-slate-950/90 border-2 flex items-center justify-center text-[10px] font-bold font-mono text-white ${glowStyle}" style="border-color: ${badgeColor};">
        <span>${bin.fillLevel}%</span>
      </div>
      ${isTarget ? `<div class="absolute -top-2 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold">★</div>` : ''}
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
    </div>
  `,
  className: 'custom-depot-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Live Truck Marker
const truckIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 rounded-full bg-emerald-500/40 animate-ping"></div>
      <div class="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-[0_0_18px_rgba(16,185,129,0.9)] flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    </div>
  `,
  className: 'custom-truck-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

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
    activeRoute, 
    setSelectedBinId, 
    addNewBin, 
    emptyBin,
    isDrivingRoute, 
    truckPosition,
    startRouteSimulation,
    stopRouteSimulation,
    criticalBins
  } = useWasteData();

  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'streets' | 'satellite'
  const [isAddingBin, setIsAddingBin] = useState(false);
  const [focusCenter, setFocusCenter] = useState(null);

  // Map Tile URLs
  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const handleAddBinClick = (lat, lng) => {
    const defaultName = prompt("Enter location name for new Smart Bin:", "Metro Concourse South Gate");
    if (defaultName !== null) {
      addNewBin(lat, lng, defaultName || "New Smart Bin", "General");
      setIsAddingBin(false);
    }
  };

  const handleFocusDepot = () => {
    setFocusCenter([depot.lat, depot.lng]);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex flex-col h-[560px] lg:h-[620px]">
      
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Live Fleet Grid
            </span>
          </div>

          {isDrivingRoute && (
            <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 bg-emerald-950/80 border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg animate-pulse">
              <Truck className="w-3.5 h-3.5" />
              <span>Simulating Driver Collection</span>
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
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

          {/* Map Layer Switcher */}
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
            title="Recenter Map on Depot"
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

          {/* Optimized Route Polyline */}
          {activeRoute && activeRoute.coordinatesPath.length > 1 && (
            <>
              {/* Outer Glow Polyline */}
              <Polyline
                positions={activeRoute.coordinatesPath}
                pathOptions={{
                  color: '#6366f1',
                  weight: 8,
                  opacity: 0.35,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              {/* Core Route Polyline */}
              <Polyline
                positions={activeRoute.coordinatesPath}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 3.5,
                  opacity: 0.9,
                  dashArray: isDrivingRoute ? '8, 8' : undefined,
                  dashSpeed: isDrivingRoute ? 20 : undefined
                }}
              />
            </>
          )}

          {/* Municipal Depot Marker */}
          <Marker position={[depot.lat, depot.lng]} icon={depotIcon}>
            <Popup>
              <div className="p-3 w-56">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Truck className="w-4 h-4" />
                  <span>Municipal Fleet Yard</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{depot.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{depot.address}</div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-300">
                  <span>Capacity: <strong>{depot.capacityTrucks} Trucks</strong></span>
                  <span>Active: <strong className="text-emerald-400">{depot.activeTrucks} Dispatched</strong></span>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Smart Bin Markers */}
          {bins.map((bin) => {
            const isTarget = activeRoute.optimizedStops.some((s) => s.id === bin.id);
            return (
              <Marker
                key={bin.id}
                position={[bin.lat, bin.lng]}
                icon={createBinIcon(bin, isTarget)}
              >
                <Popup>
                  <div className="p-3 w-64">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {bin.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bin.fillLevel >= 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        bin.fillLevel >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {bin.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="font-bold text-slate-100 text-sm mt-1.5">{bin.name}</div>
                    <div className="text-[11px] text-slate-400">{bin.wasteType} Waste • {bin.capacityLiters}L Tank</div>

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
                        <strong className="text-slate-100">{bin.temperature}°C</strong>
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

          {/* Live Simulated Collection Truck */}
          {isDrivingRoute && (
            <Marker position={truckPosition} icon={truckIcon} />
          )}

        </MapContainer>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-4 text-[11px] text-slate-300 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300" />
            <span>&lt;50% Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300" />
            <span>50-70% Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-300 animate-pulse" />
            <span>≥70% Critical (Target)</span>
          </div>
        </div>

        {/* Quick Simulation Trigger Button */}
        <div className="pointer-events-auto">
          {!isDrivingRoute ? (
            <button
              onClick={startRouteSimulation}
              disabled={criticalBins.length === 0}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-700 to-indigo-600 hover:from-brand-600 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-brand-500/25 border border-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Simulate Collection Run</span>
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
