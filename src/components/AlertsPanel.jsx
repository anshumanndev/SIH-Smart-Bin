import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Wind, 
  RotateCw, 
  Trash2, 
  CheckCircle, 
  X, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function AlertsPanel() {
  const { alerts, dismissAlert, setSelectedBinId, emptyBin } = useWasteData();

  const getAlertIcon = (type) => {
    switch (type) {
      case 'FIRE_HEAT_WARNING':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'HIGH_GAS_LEVEL':
        return <Wind className="w-4 h-4 text-amber-400" />;
      case 'TAMPER_TILT_ALARM':
        return <RotateCw className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Critical Alerts Feed
              {alerts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time anomaly & overflow notifications
            </p>
          </div>
        </div>

        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {alerts.length} Active
        </span>
      </div>

      {/* Alerts Stream */}
      <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 transition-all relative overflow-hidden group shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-950/90 border border-rose-500/40 shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-300">
                        {alert.binName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  title="Dismiss Alert"
                  className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <button
                  onClick={() => setSelectedBinId(alert.binId)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Sensor Diagnostics</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => emptyBin(alert.binId)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-[10px] transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Mark Emptied</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No Critical Alerts</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All bin fill levels, gas concentrations, and temperatures within normal bounds.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
