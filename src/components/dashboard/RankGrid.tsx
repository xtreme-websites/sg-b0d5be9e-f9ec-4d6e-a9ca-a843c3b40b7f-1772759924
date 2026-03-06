import React from "react";
import { Star, Crown, X } from "lucide-react";
import type { GridPoint } from "@/types";

interface RankGridProps {
  gridSize?: number;
  points: GridPoint[];
  onPointClick?: (point: GridPoint, index: number) => void;
  selectedPointIndex?: number | null;
}

export function RankGrid({ 
  gridSize = 7, 
  points, 
  onPointClick,
  selectedPointIndex 
}: RankGridProps) {
  
  const getRankStyles = (rank: number) => {
    if (rank === 1) return "bg-[#10b981] text-white shadow-lg shadow-green-100 ring-4 ring-green-50 scale-110";
    if (rank <= 3) return "bg-[#10b981] text-white shadow-md ring-2 ring-green-50";
    if (rank <= 10) return "bg-[#facc15] text-white shadow-md ring-2 ring-yellow-50";
    if (rank <= 20) return "bg-[#f97316] text-white shadow-md ring-2 ring-orange-50";
    return "bg-[#94a3b8] text-white shadow-md ring-2 ring-slate-100";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Star size={10} fill="white" stroke="white" />;
    if (rank <= 3) return <Crown size={10} />;
    if (rank > 20) return <X size={10} />;
    return null;
  };

  return (
    <div 
      className="w-full h-full grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
      }}
    >
      {points.map((point, index) => (
        <div
          key={index}
          onClick={() => onPointClick?.(point, index)}
          className={`rounded-full flex flex-col items-center justify-center text-[10px] lg:text-[12px] font-black cursor-pointer transition-all hover:scale-150 active:scale-95 z-20 ${getRankStyles(point.rank)} ${selectedPointIndex === index ? "ring-4 ring-indigo-400" : ""}`}
        >
          {getRankIcon(point.rank)}
          <span>{point.rank > 20 ? "20+" : point.rank}</span>
        </div>
      ))}
    </div>
  );
}