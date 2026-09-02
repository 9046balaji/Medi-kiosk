import React from 'react';
import { Users, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface TriageMetricsBarProps {
  totalQueue: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
}

export const TriageMetricsBar: React.FC<TriageMetricsBarProps> = ({
  totalQueue,
  p1Count,
  p2Count,
  p3Count
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-md flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Active Queue</div>
          <div className="text-2xl font-black text-white font-mono mt-0.5">{totalQueue}</div>
        </div>
        <Users className="w-7 h-7 text-teal-400 opacity-80" />
      </div>

      <div className="p-4 bg-red-950/60 rounded-2xl border border-red-500/40 shadow-md flex items-center justify-between">
        <div>
          <div className="text-red-300 text-[10px] font-bold uppercase tracking-wider">P1 Emergency Alerts</div>
          <div className="text-2xl font-black text-red-400 font-mono mt-0.5">{p1Count}</div>
        </div>
        <AlertTriangle className="w-7 h-7 text-red-400 animate-bounce" />
      </div>

      <div className="p-4 bg-amber-950/60 rounded-2xl border border-amber-500/40 shadow-md flex items-center justify-between">
        <div>
          <div className="text-amber-300 text-[10px] font-bold uppercase tracking-wider">P2 Urgent Priority</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{p2Count}</div>
        </div>
        <Clock className="w-7 h-7 text-amber-400 opacity-80" />
      </div>

      <div className="p-4 bg-teal-950/60 rounded-2xl border border-teal-500/40 shadow-md flex items-center justify-between">
        <div>
          <div className="text-teal-300 text-[10px] font-bold uppercase tracking-wider">P3 Routine OPD</div>
          <div className="text-2xl font-black text-teal-400 font-mono mt-0.5">{p3Count}</div>
        </div>
        <CheckCircle2 className="w-7 h-7 text-teal-400 opacity-80" />
      </div>
    </div>
  );
};
