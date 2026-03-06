import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RankGrid } from "@/components/dashboard/RankGrid";
import { Timeline } from "@/components/dashboard/Timeline";
import { StatCard } from "@/components/dashboard/StatCard";
import { businessService } from "@/services/businessService";
import type { Business, Keyword, Snapshot, GridPoint } from "@/types";
import { Map as MapIcon, Download, Users, ImageIcon, MapPin, Zap, Database, Search, MoreHorizontal, ArrowRightLeft, Activity, CheckCircle2 } from "lucide-react";

// Mock data for initial render if DB is empty
const MOCK_GRID_SIZE = 7;
const MOCK_POINTS: GridPoint[] = Array.from({ length: 49 }).map((_, i) => {
  const row = Math.floor(i / 7);
  const col = i % 7;
  const dist = Math.sqrt(Math.pow(row - 3, 2) + Math.pow(col - 3, 2));
  let rank = Math.floor(dist * 1.5) + 1;
  if (dist > 3.5) rank = 21;
  return { 
    lat: 0, 
    lng: 0, 
    rank, 
    competitors: [
      { name: "Competitor A", rank: rank + 1, reviews: 100, rating: 4.5 },
      { name: "Competitor B", rank: rank + 2, reviews: 50, rating: 4.2 }
    ] 
  };
});

export default function Dashboard() {
  const [viewMode, setViewMode] = useState("dashboard"); // dashboard | admin | history
  const [adminSubTab, setAdminSubTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Data State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<Snapshot | null>(null);
  
  // UI State
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // In a real app with auth, we'd get the user ID from context
      // For now, we'll try to fetch businesses or create a mock one
      
      // Simulating data load for the preview
      setTimeout(() => {
        const mockBusiness: Business = {
          id: "1",
          user_id: "user_1",
          ghl_subaccount_id: null,
          name: "Clockwork Pizza", // Updated property name
          address: "7520 S Rural Rd Ste A9, Tempe, AZ 85283",
          place_id: "ChIJ...",
          subscription_tier: "Standard",
          reporting_enabled: true,
          // verified: true, // Removed
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setBusinesses([mockBusiness]);
        setCurrentBusiness(mockBusiness);
        
        const mockKeywords: Keyword[] = [
          { id: "1", business_id: "1", text: "artisan pizza tempe", current_rank: 1.1, trend: 'up', created_at: "", updated_at: "" },
          { id: "2", business_id: "1", text: "best pizza near me", current_rank: 2.4, trend: 'up', created_at: "", updated_at: "" },
          { id: "3", business_id: "1", text: "pizza delivery 85283", current_rank: 5.2, trend: 'down', created_at: "", updated_at: "" },
        ];
        
        setKeywords(mockKeywords);
        setSelectedKeywordId("1");
        
        // Mock snapshots
        const mockSnapshots: Snapshot[] = [
          {
            id: "s1", 
            keyword_id: "1", 
            // business_id: "1", // Removed
            // timestamp: new Date().toISOString(), // Removed
            avg_rank: 1.1, 
            visibility_score: 98,
            points: MOCK_POINTS, // Flattened structure
            created_at: new Date().toISOString()
          }
        ];
        setSnapshots(mockSnapshots);
        setCurrentSnapshot(mockSnapshots[0]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to load data", error);
      setIsLoading(false);
    }
  };

  const handleAddKeyword = async (text: string) => {
    // In real implementation: Call API to add keyword
    const newKw: Keyword = {
      id: Date.now().toString(),
      business_id: currentBusiness?.id || "1",
      text,
      current_rank: null,
      trend: 'none',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setKeywords(prev => [newKw, ...prev]);
  };

  const handleSelectKeyword = (id: string) => {
    setSelectedKeywordId(id);
    // Fetch snapshots for this keyword
    // For demo, we just keep the mock snapshot
  };

  const selectedPointData = selectedPointIndex !== null && currentSnapshot
    ? currentSnapshot.points[selectedPointIndex]
    : null;

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      <Head>
        <title>Local Rank Tracker | GeoNinja</title>
      </Head>

      <Sidebar 
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
        viewMode={viewMode}
        setViewMode={setViewMode}
        keywords={keywords}
        onAddKeyword={handleAddKeyword}
        selectedKeywordId={selectedKeywordId}
        onSelectKeyword={handleSelectKeyword}
        businessName={currentBusiness?.name || "Loading..."}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Timeline (Dashboard Only) */}
        {viewMode === 'dashboard' && snapshots.length > 0 && (
          <Timeline 
            snapshots={snapshots}
            activeSnapshotId={currentSnapshot?.id}
            onSelectSnapshot={(id) => {
              const snap = snapshots.find(s => s.id === id);
              if (snap) setCurrentSnapshot(snap);
            }}
          />
        )}

        {/* View Engine */}
        {viewMode === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-8 animate-in fade-in duration-500">
             <header className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                    <MapIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Geo-Rank Dashboard</h2>
                    <p className="text-xs text-slate-400 font-bold italic">
                      {currentBusiness?.address ? `${currentBusiness.address.split(',')[1]} • ` : ''} 
                      Keyword: {keywords.find(k => k.id === selectedKeywordId)?.text}
                    </p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                 <button onClick={() => setViewMode('history')} className="h-11 px-5 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2">
                   <ImageIcon size={16}/> ALL HISTORY
                 </button>
                 <button className="h-11 px-5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 shadow-xl flex items-center gap-2">
                   <Download size={16} /> EXPORT PDF
                 </button>
               </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Map/Grid Section */}
              <div className="lg:col-span-3">
                <div className="relative min-h-[700px] rounded-[3rem] border border-slate-200 overflow-hidden shadow-2xl bg-slate-300">
                    <div className="absolute inset-0 z-0 grayscale-[0.2]" style={{ 
                      backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-111.9261,33.3340,12,0/1200x800?access_token=none')`,
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                    
                    {/* Map Overlay Stats */}
                    <div className="absolute top-6 left-6 z-30 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-2xl p-6">
                       <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500"><MapPin size={16}/></div>
                             <div>
                                <h4 className="font-black text-sm text-slate-800">{currentBusiness?.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 truncate w-48">{currentBusiness?.address}</p>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Avg Rank</span>
                             <span className="text-2xl font-black text-slate-900">{currentSnapshot?.avg_rank.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-4">
                             {['High', 'Med', 'Low', 'Out'].map((l, i) => (
                               <div key={l} className="flex flex-col items-center">
                                  <div className={`w-2 h-2 rounded-full mb-1 ${i===0?'bg-green-500':i===1?'bg-yellow-400':i===2?'bg-red-500':'bg-slate-300'}`}></div>
                                  <span className="text-[10px] font-black">{i===0?'100%':'0%'}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* The Grid Component */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-12 lg:p-24">
                      {currentSnapshot && (
                        <RankGrid 
                          points={currentSnapshot.points}
                          onPointClick={(point, index) => setSelectedPointIndex(index)}
                          selectedPointIndex={selectedPointIndex}
                        />
                      )}
                    </div>
                </div>
              </div>

              {/* Sidebar Info Panel */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2">
                      <Users size={16} className="text-indigo-600"/> 
                      {selectedPointData ? `Rank #${selectedPointData.rank} Competitors` : "Local Pack"}
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {(selectedPointData?.competitors || [
                      { name: currentBusiness?.name || "Your Business", rank: 1, reviews: 44, rating: 5.0, you: true },
                      { name: "Competitor A", rank: 2, reviews: 201, rating: 5.0, you: false },
                      { name: "Competitor B", rank: 3, reviews: 9, rating: 5.0, you: false },
                    ]).map((comp, i) => (
                      <div key={i} className="p-5 border-b border-slate-50">
                          <div className="flex items-start gap-4">
                             <div className="flex flex-col items-center">
                                <div className={`w-1.5 h-1.5 rounded-full mb-1.5 ${comp.rank === 1 ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                                <span className="text-[11px] font-black text-slate-400">{comp.rank.toFixed(1)}</span>
                             </div>
                             <div className="flex-1">
                                <div className="flex items-center gap-2">
                                   <h5 className="text-xs font-black text-slate-800 truncate">{comp.name}</h5>
                                   {(comp as any).you && <span className="bg-slate-200 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded">You</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-400">{comp.rating} ★</span>
                                  <span className="text-[10px] text-slate-400">({comp.reviews})</span>
                                </div>
                             </div>
                          </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* History / Admin Views placeholder logic */}
        {viewMode === 'admin' && (
           <div className="flex-1 overflow-y-auto p-12 bg-[#fcfdfe] animate-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-6xl mx-auto space-y-12 pb-24">
                <header className="flex items-end justify-between border-b border-slate-100 pb-8">
                   <div>
                     <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Platform Admin</h2>
                     <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">OpenWeb Ninja Bridge Management</p>
                   </div>
                   <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                     {['overview', 'clients', 'logs', 'plans'].map(sub => (
                       <button 
                         key={sub}
                         onClick={() => setAdminSubTab(sub)}
                         className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${adminSubTab === sub ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
                       >
                         {sub}
                       </button>
                     ))}
                   </div>
                </header>

                {adminSubTab === 'overview' && (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <StatCard label="API Engine" value="v3.2" icon={<Zap className="text-green-500" size={24}/>} subtitle="Global Core 100%" />
                      <StatCard label="Agency Nodes" value="1,492" icon={<Users className="text-indigo-600" size={24}/>} subtitle="Sub-Account Sync OK" />
                      <StatCard label="Credit Pool" value="42.8k" icon={<Database className="text-blue-500" size={24}/>} subtitle="/ 50k monthly" />
                   </div>
                )}
                
                {/* Other tabs would go here, replicating the original logic */}
             </div>
           </div>
        )}
      </main>
    </div>
  );
}