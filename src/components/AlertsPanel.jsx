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
  ArrowRight,
  Cross,
  Truck
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function AlertsPanel() {
  const { alerts, dismissAlert, setSelectedBinId, emptyBin } = useWasteData();

  const getAlertIcon = (type, category) => {
    if (type === 'SHARPS_BIN_CRITICAL' || type === 'MEDICAL_WASTE_CRITICAL') {
      return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    }
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
    <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
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
              Municipal & Bio-Medical anomaly triggers
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
          alerts.map((alert) => {
            const isHospital = alert.category === 'HOSPITAL' || alert.type.includes('MEDICAL') || alert.type.includes('SHARPS');

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all relative overflow-hidden group shadow-lg ${
                  isHospital
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-950/90 border border-rose-500/40 shrink-0 mt-0.5">
                      {getAlertIcon(alert.type, alert.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-rose-300">
                          {alert.binName}
                        </span>
                        {isHospital && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 border border-rose-400/40 font-mono font-bold">
                            BIO-HAZARD
                          </span>
                        )}
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
                    <span>Diagnostics</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => emptyBin(alert.binId)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-[10px] transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear & Empty</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No Critical Alerts</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All municipal & hospital waste sensors are operating within optimal parameters.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
