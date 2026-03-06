import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

export function StatCard({ label, value, icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm transition-all hover:scale-[1.02]">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-slate-900 leading-none">
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="text-[10px] text-slate-500 font-bold mt-2 italic tracking-tight">
          {subtitle}
        </p>
      )}
    </div>
  );
}