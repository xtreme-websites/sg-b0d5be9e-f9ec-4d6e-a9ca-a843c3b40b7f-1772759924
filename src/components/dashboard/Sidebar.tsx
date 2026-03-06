import React, { useState } from "react";
import { 
  MapPin, BarChart3, History, Settings, PlusCircle, 
  TrendingUp, TrendingDown, Activity, ChevronsRight, ChevronsLeft,
  Search, LogOut
} from "lucide-react";
import type { Keyword, Business } from "@/types";
import { cn } from "@/lib/utils";
import { BusinessSelector } from "@/components/dashboard/BusinessSelector";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  viewMode: string;
  setViewMode: (v: string) => void;
  keywords: Keyword[];
  onAddKeyword: (text: string) => void;
  selectedKeywordId?: string | null;
  onSelectKeyword: (id: string) => void;
  businessName: string;
  currentBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
}

export function Sidebar({
  collapsed,
  setCollapsed,
  viewMode,
  setViewMode,
  keywords,
  onAddKeyword,
  selectedKeywordId,
  onSelectKeyword,
  businessName,
  currentBusiness,
  onSelectBusiness
}: SidebarProps) {
  const [newKeywordInput, setNewKeywordInput] = useState("");

  const handleAddKeyword = () => {
    if (newKeywordInput.trim()) {
      onAddKeyword(newKeywordInput.trim());
      setNewKeywordInput("");
    }
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-200 flex flex-col shadow-xl z-[60] transition-all duration-300 h-screen",
        collapsed ? "w-20" : "w-60"
      )}
    >
      <div className="p-4 flex flex-col h-full">
        
        {/* Brand & Collapse Toggle */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
              <MapPin size={18} />
            </div>
            {!collapsed && (
              <div className="animate-in fade-in duration-300">
                <h1 className="font-black text-base leading-tight tracking-tighter">GeoNinja</h1>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        {/* Business Context */}
        {!collapsed && (
          <div className="px-2 mb-6">
            <BusinessSelector 
              currentBusiness={currentBusiness}
              onSelectBusiness={onSelectBusiness}
            />
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "history", label: "Comparison", icon: History },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                viewMode === item.id 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:bg-slate-50"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="font-bold text-xs">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Keywords Section */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 border-t border-slate-100 pt-4">
          <div className={cn("flex items-center justify-between mb-3 px-2", collapsed ? "justify-center" : "")}>
             {!collapsed && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keywords</span>}
             <button 
               onClick={() => !collapsed && handleAddKeyword()}
               className="text-indigo-600 hover:text-indigo-800 transition-colors"
               disabled={collapsed}
             >
               <PlusCircle size={collapsed ? 20 : 16} />
             </button>
          </div>

          {!collapsed && (
            <div className="px-2 mb-3">
              <input 
                type="text" 
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                placeholder="Quick add..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {keywords.map((kw) => (
              <button 
                key={kw.id}
                onClick={() => onSelectKeyword(kw.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all border",
                  selectedKeywordId === kw.id 
                    ? "bg-indigo-50 border-indigo-100" 
                    : "border-transparent hover:bg-slate-50 hover:border-slate-100 group",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {kw.trend === "up" ? <TrendingUp size={14} className="text-green-500 shrink-0" /> : 
                   kw.trend === "down" ? <TrendingDown size={14} className="text-red-500 shrink-0" /> : 
                   <Activity size={14} className="text-slate-300 shrink-0" />}
                  {!collapsed && <span className="text-[11px] font-bold text-slate-600 truncate">{kw.text}</span>}
                </div>
                {!collapsed && (
                  <span className={cn(
                    "text-[10px] font-black",
                     kw.current_rank && kw.current_rank <= 3 ? "text-green-600" : "text-slate-400"
                  )}>
                    {kw.current_rank ? `#${kw.current_rank}` : "-"}
                  </span>
                )}
              </button>
            ))}
            
            {keywords.length === 0 && !collapsed && (
              <div className="text-center p-4">
                <p className="text-[10px] text-slate-400 italic">No keywords yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Admin */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button 
            onClick={() => setViewMode("admin")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
              viewMode === "admin" 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
            )}
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span className="text-xs font-bold animate-in fade-in">Admin Controls</span>}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </aside>
  );
}