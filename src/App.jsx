import React from 'react';
import { WasteDataProvider, useWasteData } from './context/WasteDataContext';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import MapView from './components/MapView';
import RoutePanel from './components/RoutePanel';
import AlertsPanel from './components/AlertsPanel';
import BinTable from './components/BinTable';
import DriverHud from './components/DriverHud';
import AnalyticsView from './components/AnalyticsView';
import BinDetailModal from './components/BinDetailModal';
import IoTSimulator from './components/IoTSimulator';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  ListOrdered, 
  Navigation, 
  BarChart3, 
  Radio, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

function DashboardContent() {
  const { activeRole, activeTab, setActiveTab, criticalBins, alerts } = useWasteData();

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-500 selection:text-white pb-20">
      
      {/* Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-6 py-6 flex-1 space-y-6">
        
        {/* Navigation Bar for Admin View */}
        {activeRole === 'admin' && (
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-brand-700 text-white shadow-md shadow-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'map'
                    ? 'bg-brand-700 text-white shadow-md shadow-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Full Map</span>
              </button>

              <button
                onClick={() => setActiveTab('bins')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'bins'
                    ? 'bg-brand-700 text-white shadow-md shadow-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Bin Inventory</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-brand-700 text-white shadow-md shadow-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Impact Analytics</span>
              </button>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TSP 2-Opt Engine Active</span>
            </div>
          </div>
        )}

        {/* View Switcher based on Active Role & Tab */}
        {activeRole === 'driver' || activeTab === 'driver-hud' ? (
          <DriverHud />
        ) : activeRole === 'supervisor' || activeTab === 'analytics' ? (
          <AnalyticsView />
        ) : activeTab === 'bins' ? (
          <BinTable />
        ) : activeTab === 'map' ? (
          <div className="h-[750px]">
            <MapView />
          </div>
        ) : (
          /* Default: Overview Command Center */
          <div className="space-y-6">
            {/* KPI Cards */}
            <KpiCards />

            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Columns: Live Interactive Map */}
              <div className="lg:col-span-7">
                <MapView />
              </div>

              {/* Right 5 Columns: Route Optimizer & Alerts Stack */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="h-[340px]">
                  <RoutePanel />
                </div>
                <div className="h-[256px]">
                  <AlertsPanel />
                </div>
              </div>
            </div>

            {/* Full Bin Status Inventory Table */}
            <BinTable />
          </div>
        )}

      </main>

      {/* Sensor Diagnostics Modal */}
      <BinDetailModal />

      {/* Floating IoT Telemetry Simulation Drawer */}
      <IoTSimulator />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 lg:px-6 mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">EcoRoute™</span>
          <span>•</span>
          <span>Smart Waste Bin with Dynamic Route Optimization</span>
          <span>•</span>
          <span className="text-brand-400 font-semibold">SIH PS-14</span>
        </div>
        <div>
          ESP32 + HC-SR04 IoT Telemetry • Traveling Salesperson 2-Opt Algorithm
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <WasteDataProvider>
      <DashboardContent />
    </WasteDataProvider>
  );
}
