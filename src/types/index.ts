export interface Plan {
  id: string;
  name: string;
  max_keywords: number;
  price: number;
  grid_enabled: boolean;
  ai_insights_enabled: boolean;
  reporting_enabled: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  ghl_subaccount_id: string | null;
  business_name: string;
  address: string;
  place_id: string;
  subscription_tier: string;
  reporting_enabled: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Keyword {
  id: string;
  business_id: string;
  text: string;
  current_rank: number | null;
  trend: 'up' | 'down' | 'none';
  created_at: string;
  updated_at: string;
}

export interface GridPoint {
  lat: number;
  lng: number;
  rank: number;
  competitors: Array<{
    name: string;
    rank: number;
    reviews: number;
    rating: number;
  }>;
}

export interface Snapshot {
  id: string;
  keyword_id: string;
  business_id: string;
  timestamp: string;
  avg_rank: number;
  visibility_score: number;
  grid_data: {
    points: GridPoint[];
  };
  created_at: string;
}

export interface OpenWebNinjaRequest {
  keyword: string;
  place_id: string;
  grid_size?: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface OpenWebNinjaResponse {
  average_rank: number;
  visibility_score: number;
  grid_points: GridPoint[];
  competitors: Array<{
    name: string;
    rank: number;
    reviews: number;
    rating: number;
  }>;
}