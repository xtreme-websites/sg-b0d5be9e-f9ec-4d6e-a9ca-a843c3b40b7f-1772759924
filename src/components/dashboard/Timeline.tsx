import React, { useState } from "react";
import type { Snapshot } from "@/types";
import { cn } from "@/lib/utils";

interface TimelineProps {
  snapshots: Snapshot[];
  activeSnapshotId?: string;
  onSelectSnapshot: (id: string) => void;
}

export function Timeline({ snapshots, activeSnapshotId, onSelectSnapshot }: TimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (snapshots.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shrink-0 z-50 shadow-sm">
      <div className="flex items-center gap-8 flex-1 max-w-4xl">
        <div className="flex flex-col shrink-0">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Timeline</span>
          <span className="text-xs font-bold text-slate-700 italic">Snapshot Track</span>
        </div>
        
        <div className="relative flex-1 flex items-center px-4 h-12">
          {/* Connecting Line */}
          <div className="absolute left-4 right-4 h-[2px] bg-slate-100 top-1/2 -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 w-full flex justify-between items-center">
            {snapshots.map((snap) => {
              const isActive = snap.id === activeSnapshotId;
              const date = new Date(snap.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              
              // Determine color based on rank improvement (mock logic for now, could be real)
              const colorClass = snap.avg_rank < 5 ? "bg-green-500" : "bg-indigo-500";
              
              return (
                <div 
                  key={snap.id} 
                  className="relative group"
                  onMouseEnter={() => setHoveredId(snap.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelectSnapshot(snap.id)}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full cursor-pointer transition-all hover:scale-150 border-2 border-white shadow-sm",
                    colorClass,
                    isActive ? "ring-4 ring-indigo-100 scale-125" : "opacity-80"
                  )}></div>
                  
                  {/* Tooltip */}
                  {hoveredId === snap.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 bg-slate-900 text-white rounded-xl p-3 shadow-2xl animate-in fade-in zoom-in duration-200 z-[100]">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{date}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-400">Avg Rank</span>
                          <span className="text-xs font-bold text-green-400">#{snap.avg_rank.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-400">Visibility</span>
                          <span className="text-xs font-bold text-indigo-400">{snap.visibility_score}%</span>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}