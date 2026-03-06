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

  // Test with the "Search Business Locations" endpoint as shown in the dashboard
  // This is a simple GET request with query parameters
  const testQuery = "Jives Media";
  const testNear = "California, USA";

  try {
    console.log("=== OpenWeb Ninja API Test ===");
    console.log("API Key (first 15 chars):", apiKey.substring(0, 15) + "...");
    console.log("Test Query:", testQuery);
    console.log("Test Location:", testNear);
    
    // Build the URL with query parameters exactly as shown in the dashboard
    const url = new URL("https://api.openwebninja.com/local-rank-tracker/places");
    url.searchParams.append("query", testQuery);
    url.searchParams.append("near", testNear);

    console.log("Full URL:", url.toString());
    
    // Use the correct authentication method from the dashboard screenshot
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,  // Uppercase as shown in OpenWeb Ninja dashboard
        "Accept": "*/*"
      }
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Response Body (first 500 chars):", responseText.substring(0, 500));

    if (response.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        data = { raw: responseText };
      }

      return res.status(200).json({
        success: true,
        message: "✅ API connection successful!",
        authentication_method: "X-API-Key (Uppercase Header)",
        status_code: response.status,
        endpoint_tested: "/places (Search Business Locations)",
        sample_data: data,
        next_steps: [
          "Authentication is working correctly!",
          "Now we can implement the Full Grid Search endpoint for rank tracking"
        ]
      });
    }

    // If failed, return detailed error info
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { raw_response: responseText };
    }

    return res.status(response.status).json({
      success: false,
      error: "API request failed",
      status_code: response.status,
      error_details: errorData,
      request_details: {
        endpoint: url.toString(),
        method: "GET",
        headers: {
          "X-API-Key": apiKey.substring(0, 15) + "... (truncated for security)"
        }
      },
      troubleshooting: [
        "1. Verify your API key is active in OpenWeb Ninja dashboard",
        "2. Check if you have sufficient API credits",
        "3. Verify the query parameters are correct",
        "4. Check if your IP needs to be whitelisted",
        "5. Ensure the endpoint URL matches the API documentation"
      ]
    });

  } catch (error) {
    console.error("Network/Fetch Error:", error);
    return res.status(500).json({
      success: false,
      error: "Network error or invalid endpoint",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      api_endpoint: "https://api.openwebninja.com/local-rank-tracker/places"
    });
  }
}