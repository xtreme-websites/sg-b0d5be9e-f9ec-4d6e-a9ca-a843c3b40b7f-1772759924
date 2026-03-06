import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: /api/rank-check
 * 
 * PURPOSE: Call OpenWeb Ninja's Full Grid Search API to get ranking data across a geographic grid
 * 
 * Authentication: Uses X-API-Key header (uppercase) as per OpenWeb Ninja docs
 * 
 * EXAMPLE REQUEST FROM FRONTEND:
 * ```
 * const response = await fetch('/api/rank-check', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     keyword: "artisan pizza tempe",
 *     place_id: "ChIJ...",
 *     lat: 33.4255,
 *     lng: -111.9400,
 *     grid_size: 7,
 *     radius: 5
 *   })
 * });
 * const data = await response.json();
 * ```
 */

interface RankCheckRequest {
  keyword: string;
  place_id: string;
  lat: number;
  lng: number;
  grid_size?: number;
  radius?: number;
  radius_units?: string;
  shape?: string;
  zoom?: number;
}

interface GridPoint {
  lat: number;
  lng: number;
  rank: number;
  competitors: Array<{
    name: string;
    rank: number;
    reviews: number;
    rating: number;
    place_id: string;
  }>;
}

interface RankCheckResponse {
  success: boolean;
  data?: {
    average_rank: number;
    visibility_score: number;
    grid_points: GridPoint[];
    total_points: number;
    business_info: {
      name: string;
      place_id: string;
    };
  };
  error?: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RankCheckResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed. Use POST." 
    });
  }

  const { 
    keyword, 
    place_id, 
    lat,
    lng,
    grid_size = 7, 
    radius = 5,
    radius_units = "km",
    shape = "square",
    zoom = 13
  } = req.body as RankCheckRequest;

  // Validate required fields
  if (!keyword || !place_id || !lat || !lng) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      details: "Required: keyword, place_id, lat, lng"
    });
  }

  // Get API key from environment variables
  const apiKey = process.env.OPENWEBNINJA_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENWEBNINJA_API_KEY is not set in environment variables");
    return res.status(500).json({
      success: false,
      error: "API configuration error. Please add OPENWEBNINJA_API_KEY to .env.local"
    });
  }

  try {
    console.log("=== OpenWeb Ninja Full Grid Search ===");
    console.log("Keyword:", keyword);
    console.log("Place ID:", place_id);
    console.log("Center Point:", { lat, lng });
    console.log("Grid Size:", grid_size);
    console.log("Radius:", radius, radius_units);

    // Build the URL with query parameters for Full Grid Search endpoint
    const url = new URL("https://api.openwebninja.com/local-rank-tracker/grid");
    url.searchParams.append("place_id", place_id);
    url.searchParams.append("query", keyword);
    url.searchParams.append("lat", lat.toString());
    url.searchParams.append("lng", lng.toString());
    url.searchParams.append("grid_size", grid_size.toString());
    url.searchParams.append("radius", radius.toString());
    url.searchParams.append("radius_units", radius_units);
    url.searchParams.append("shape", shape);
    url.searchParams.append("zoom", zoom.toString());

    console.log("Full URL:", url.toString());

    // Call OpenWeb Ninja API with correct authentication (X-API-Key header, uppercase)
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,  // Uppercase as shown in OpenWeb Ninja dashboard
        "Accept": "*/*"
      }
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenWeb Ninja API error:", errorText);
      
      let errorMessage = `API request failed: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Keep default error message if response isn't JSON
      }

      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        details: errorText
      });
    }

    const data = await response.json();
    console.log("✅ Success! Received data:", JSON.stringify(data, null, 2).substring(0, 500));

    // Transform the response to match our expected format
    // OpenWeb Ninja returns grid_points array with ranking data
    const transformedData = {
      average_rank: data.average_rank || 0,
      visibility_score: data.visibility_score || 0,
      grid_points: data.grid_points || [],
      total_points: data.total_points || (grid_size * grid_size),
      business_info: {
        name: data.business_name || "Unknown Business",
        place_id: place_id
      }
    };

    return res.status(200).json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error("❌ Error calling OpenWeb Ninja API:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error instanceof Error ? error.stack : undefined
    });
  }
}