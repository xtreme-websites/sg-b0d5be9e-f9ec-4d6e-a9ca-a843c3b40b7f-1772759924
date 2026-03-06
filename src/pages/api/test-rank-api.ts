import type { NextApiRequest, NextApiResponse } from "next";

/**
 * TEST ENDPOINT: /api/test-rank-api
 * 
 * Purpose: Verify OpenWeb Ninja API connection and authentication
 * 
 * Usage: Visit /api/test-rank-api in your browser or call it from the dashboard
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env.OPENWEBNINJA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "OPENWEBNINJA_API_KEY not found in environment variables"
    });
  }

  // Test with a simple example - Search Business Locations endpoint
  const testPayload = {
    query: "Jives Media",
    near: "California, USA"
  };

  try {
    console.log("Testing OpenWeb Ninja API with key:", apiKey.substring(0, 10) + "...");
    
    // Use the correct authentication method from the dashboard screenshot: X-API-Key (uppercase)
    const response = await fetch("https://api.openwebninja.com/local-rank-tracker/places", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,  // Correct format from OpenWeb Ninja dashboard
        "Accept": "*/*"
      }
    });

    const responseText = await response.text();
    console.log("API Response Status:", response.status);
    console.log("API Response:", responseText.substring(0, 500));

    if (response.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { raw: responseText };
      }

      return res.status(200).json({
        success: true,
        method: "X-API-Key Header (Correct Format)",
        message: "✅ API connection successful!",
        status_code: response.status,
        sample_data: data
      });
    }

    // If failed, return detailed error info
    return res.status(response.status).json({
      success: false,
      error: "API request failed",
      status_code: response.status,
      response_preview: responseText.substring(0, 500),
      headers_used: {
        "X-API-Key": "ak_vddtmp3ca0x6ims5oubp0sehd22i1a934ixqj60t3xfrhm1 (correct format)",
        "Accept": "*/*"
      },
      next_steps: [
        "1. Verify your API key is active in OpenWeb Ninja dashboard",
        "2. Check if you have sufficient API credits",
        "3. Verify the endpoint URL matches the API documentation",
        "4. Check if your IP needs to be whitelisted"
      ]
    });

  } catch (error) {
    console.error("Network error:", error);
    return res.status(500).json({
      success: false,
      error: "Network error or invalid endpoint",
      details: error instanceof Error ? error.message : "Unknown error",
      api_endpoint: "https://api.openwebninja.com/local-rank-tracker/places"
    });
  }
}