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

  // Test with a simple example keyword and place_id
  const testPayload = {
    keyword: "pizza",
    place_id: "ChIJOwg_06VPwokRYv534QaPC8g", // Example: Empire State Building
    grid_size: 3 // Small grid for testing
  };

  try {
    console.log("Testing OpenWeb Ninja API with key:", apiKey.substring(0, 10) + "...");
    
    // Try Method 1: Bearer token
    const bearerResponse = await fetch("https://www.openwebninja.com/api/local-rank-tracker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(testPayload)
    });

    if (bearerResponse.ok) {
      const data = await bearerResponse.json();
      return res.status(200).json({
        success: true,
        method: "Bearer Token",
        message: "✅ API connection successful!",
        sample_data: data
      });
    }

    // Try Method 2: x-api-key header
    const apiKeyResponse = await fetch("https://www.openwebninja.com/api/local-rank-tracker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify(testPayload)
    });

    if (apiKeyResponse.ok) {
      const data = await apiKeyResponse.json();
      return res.status(200).json({
        success: true,
        method: "x-api-key Header",
        message: "✅ API connection successful!",
        sample_data: data
      });
    }

    // Try Method 3: API-Key header (another common variant)
    const altKeyResponse = await fetch("https://www.openwebninja.com/api/local-rank-tracker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apiKey
      },
      body: JSON.stringify(testPayload)
    });

    if (altKeyResponse.ok) {
      const data = await altKeyResponse.json();
      return res.status(200).json({
        success: true,
        method: "API-Key Header",
        message: "✅ API connection successful!",
        sample_data: data
      });
    }

    // If all methods fail, return detailed error info
    const errorText = await bearerResponse.text();
    return res.status(bearerResponse.status).json({
      success: false,
      error: "All authentication methods failed",
      status_code: bearerResponse.status,
      response_preview: errorText.substring(0, 500),
      tested_methods: ["Bearer Token", "x-api-key", "API-Key"],
      next_steps: [
        "1. Check OpenWeb Ninja API documentation for correct auth method",
        "2. Verify your API key is active and has sufficient credits",
        "3. Check if your IP needs to be whitelisted"
      ]
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Network error or invalid endpoint",
      details: error instanceof Error ? error.message : "Unknown error",
      api_endpoint: "https://www.openwebninja.com/api/local-rank-tracker"
    });
  }
}