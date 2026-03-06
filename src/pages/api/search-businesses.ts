import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: /api/search-businesses
 * 
 * PURPOSE: Search for businesses using OpenWeb Ninja's Search Business Locations endpoint
 * 
 * This uses the same /places endpoint we tested in test-rank-api.ts
 */

interface SearchBusinessRequest {
  query: string;
  near: string;
}

interface BusinessResult {
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

interface SearchBusinessResponse {
  success: boolean;
  results?: BusinessResult[];
  error?: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchBusinessResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed. Use POST." 
    });
  }

  const { query, near } = req.body as SearchBusinessRequest;

  // Validate required fields
  if (!query || !near) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      details: "Required: query (business name), near (location)"
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
    console.log("=== OpenWeb Ninja Business Search ===");
    console.log("Query:", query);
    console.log("Near:", near);

    // Build the URL with query parameters for Search Business Locations endpoint
    const url = new URL("https://api.openwebninja.com/local-rank-tracker/places");
    url.searchParams.append("query", query);
    url.searchParams.append("near", near);

    console.log("Full URL:", url.toString());

    // Call OpenWeb Ninja API with correct authentication
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Accept": "*/*"
      }
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Response Body:", responseText);

    if (!response.ok) {
      console.error("❌ OpenWeb Ninja API error:", responseText);
      
      let errorMessage = `API request failed: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Keep default error message if response isn't JSON
      }

      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        details: responseText
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      return res.status(500).json({
        success: false,
        error: "Invalid response format from API",
        details: responseText
      });
    }

    console.log("✅ Parsed data:", data);
    console.log("Results count:", data.results?.length || 0);

    // Transform the response to match our expected format
    const results: BusinessResult[] = (data.results || []).map((item: any) => ({
      place_id: item.place_id,
      name: item.name,
      formatted_address: item.formatted_address || item.vicinity || "Address not available",
      geometry: item.geometry
    }));

    return res.status(200).json({
      success: true,
      results
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