import React, { useState } from "react";
import { Search, MapPin, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Business } from "@/types";

interface BusinessSelectorProps {
  currentBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
}

interface SearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export function BusinessSelector({ currentBusiness, onSelectBusiness }: BusinessSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !searchLocation.trim()) {
      setError("Please enter both business name and location");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Call OpenWeb Ninja's Search Business Locations endpoint
      const response = await fetch("/api/search-businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          near: searchLocation
        })
      });

      if (!response.ok) {
        throw new Error("Failed to search businesses");
      }

      const data = await response.json();
      setSearchResults(data.results || []);

      if (data.results.length === 0) {
        setError("No businesses found. Try a different search.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBusiness = (result: SearchResult) => {
    const business: Business = {
      id: result.place_id,
      user_id: "current_user", // Will be replaced with real user ID when auth is added
      ghl_subaccount_id: null,
      name: result.name,
      address: result.formatted_address,
      place_id: result.place_id,
      subscription_tier: "Standard",
      reporting_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSelectBusiness(business);
    setIsOpen(false);
    setSearchQuery("");
    setSearchLocation("");
    setSearchResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 h-auto hover:bg-slate-50 rounded-xl"
        >
          <div className="flex items-start gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 size={16} className="text-indigo-600" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Current Business
              </p>
              <div className="font-bold text-slate-800 text-sm truncate">
                {currentBusiness?.name || "Select a business"}
              </div>
              {currentBusiness?.address && (
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentBusiness.address}
                </div>
              )}
            </div>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Search className="text-indigo-600" size={20} />
            </div>
            Search Business Location
          </DialogTitle>
          <DialogDescription>
            Search for your business on Google to get accurate ranking data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">
                Business Name
              </label>
              <Input
                placeholder="e.g., Clockwork Pizza"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-11"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">
                Location
              </label>
              <Input
                placeholder="e.g., Tempe, AZ or 85283"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-11"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700"
            >
              {isSearching ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  Search Businesses
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Found {searchResults.length} business{searchResults.length !== 1 ? "es" : ""}
              </p>
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectBusiness(result)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-indigo-600 mt-1 shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-600">
                        {result.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {result.formatted_address}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}