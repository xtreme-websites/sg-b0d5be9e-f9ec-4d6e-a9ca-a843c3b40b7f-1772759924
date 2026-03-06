import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: /api/rank-check
 * 
 * PURPOSE: This is where you call the OpenWeb Ninja API to get ranking data.
 * 
 * ⚠️ HOW TO ADD YOUR OPENWEBNINJA API KEY:
 * 
 * 1. Open your `.env.local` file in the project root
 * 2. Add this line:
 *    OPENWEBNINJA_API_KEY=your_actual_api_key_here
 * 
 * 3. The key will be available as process.env.OPENWEBNINJA_API_KEY
 * 
 * EXAMPLE REQUEST FROM FRONTEND:
 * ```
 * const response = await fetch('/api/rank-check', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     keyword: "artisan pizza tempe",
 *     place_id: "ChIJ...",
 *     grid_size: 7
 *   })
 * });
 * const data = await response.json();
 * ```
 */

interface RankCheckRequest {
  keyword: string;
  place_id: string;
  grid_size?: number;
  location?: {
    lat: number;
    lng: number;
  };
}

interface RankCheckResponse {
  success: boolean;
  data?: {
    average_rank: number;
    visibility_score: number;
    grid_points: Array<{
      lat: number;
      lng: number;
      rank: number;
      competitors: Array<{
        name: string;
        rank: number;
        reviews: number;
        rating: number;
      }>;
    }>;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RankCheckResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { keyword, place_id, grid_size = 7, location } = req.body as RankCheckRequest;

  // Validate required fields
  if (!keyword || !place_id) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: keyword and place_id"
    });
  }

  // Get API key from environment variables
  const apiKey = process.env.OPENWEBNINJA_API_KEY;

  if (!apiKey) {
    console.error("OPENWEBNINJA_API_KEY is not set in environment variables");
    return res.status(500).json({
      success: false,
      error: "API configuration error. Please add OPENWEBNINJA_API_KEY to .env.local"
    });
  }

  try {
    // Call OpenWeb Ninja API
    const response = await fetch("https://www.openwebninja.com/api/local-rank-tracker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}` // Adjust this based on actual API auth method
      },
      body: JSON.stringify({
        keyword,
        place_id,
        grid_size,
        location
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenWeb Ninja API error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `API request failed: ${response.statusText}`
      });
    }

    const data = await response.json();

    // Transform the response to match our expected format
    const transformedData = {
      average_rank: data.average_rank || 0,
      visibility_score: data.visibility_score || 0,
      grid_points: data.grid_points || []
    };

    return res.status(200).json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error("Error calling OpenWeb Ninja API:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}