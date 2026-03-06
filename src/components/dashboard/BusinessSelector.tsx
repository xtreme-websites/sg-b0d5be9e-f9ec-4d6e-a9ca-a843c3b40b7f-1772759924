import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Building2 } from "lucide-react";
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

// Global flag to track if script is loaded
let isGoogleMapsLoaded = false;
let loadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      console.log("✅ Google Maps script loaded");
      resolve();
    };
    
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function BusinessSelector({ currentBusiness, onSelectBusiness }: BusinessSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!isOpen || !inputRef.current || !apiKey) return;

    console.log("🔧 Dialog opened, initializing autocomplete...");
    setIsLoading(true);
    setError(null);

    const initAutocomplete = () => {
      if (!inputRef.current) return;

      try {
        // Clean up old instance
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }

        // Create new autocomplete
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["establishment"],
          fields: ["place_id", "name", "formatted_address", "geometry", "vicinity"]
        });

        // Add listener
        autocomplete.addListener("place_changed", () => {
          console.log("🔔 place_changed event fired!");
          const place = autocomplete.getPlace();
          
          if (!place || !place.place_id) {
            console.log("❌ Invalid place object");
            setError("Please select a business from the dropdown suggestions");
            return;
          }

          console.log("📍 Valid place:", place.name);
          
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();

          if (!lat || !lng) {
            setError("Could not get location coordinates");
            return;
          }

          const business: Business = {
            id: place.place_id,
            user_id: "current_user",
            ghl_subaccount_id: null,
            name: place.name!,
            address: place.formatted_address || place.vicinity || "Address not available",
            place_id: place.place_id,
            subscription_tier: "Standard",
            reporting_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log("✅ Business created, calling onSelectBusiness");
          onSelectBusiness(business);
          setIsOpen(false);
          setError(null);
        });

        autocompleteRef.current = autocomplete;
        setIsLoading(false);
        console.log("✅ Autocomplete initialized");
      } catch (err) {
        console.error("❌ Error creating autocomplete:", err);
        setError("Failed to initialize search. Please try again.");
        setIsLoading(false);
      }
    };

    // Load script and init
    loadGoogleMapsScript(apiKey)
      .then(() => {
        initAutocomplete();
      })
      .catch((err) => {
        console.error("❌ Failed to load Google Maps:", err);
        setError("Failed to load Google Maps. Please refresh the page.");
        setIsLoading(false);
      });

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };
  }, [isOpen, apiKey, onSelectBusiness]);

  if (!apiKey) {
    return (
      <div className="px-2 py-4 text-center">
        <p className="text-xs text-red-600 font-bold">
          ⚠️ Google Maps API key not configured
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
        </p>
      </div>
    );
  }

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
            Start typing your business name and location, then select from the dropdown
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">
              Business Name and Location
            </label>
            <Input
              ref={inputRef}
              placeholder="e.g., Starbucks Phoenix Arizona"
              className="h-11"
              autoComplete="off"
              disabled={isLoading}
            />
            {isLoading && (
              <p className="text-xs text-slate-500 mt-2">
                🔄 Loading autocomplete...
              </p>
            )}
            {!isLoading && (
              <p className="text-xs text-slate-500 mt-2">
                💡 Type to see suggestions, then click on one to select
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {currentBusiness && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-green-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-green-900">
                    ✅ Current: {currentBusiness.name}
                  </h4>
                  <p className="text-xs text-green-700 mt-1">
                    {currentBusiness.address}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}