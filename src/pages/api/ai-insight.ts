import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: /api/ai-insight
 * 
 * PURPOSE: This is where you call the Google Gemini API for AI-powered insights.
 * 
 * ⚠️ HOW TO ADD YOUR GEMINI API KEY:
 * 
 * 1. Open your `.env.local` file in the project root
 * 2. Add this line:
 *    GEMINI_API_KEY=your_google_gemini_key_here
 * 
 * 3. The key will be available as process.env.GEMINI_API_KEY
 * 
 * EXAMPLE REQUEST FROM FRONTEND:
 * ```
 * const response = await fetch('/api/ai-insight', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     prompt: "Why am I losing to competitors in the North quadrant?",
 *     context: {
 *       businessName: "Clockwork Pizza",
 *       avgRank: 1.1,
 *       competitors: ["Tempe Dough Works", "Sourdough Station"]
 *     }
 *   })
 * });
 * const data = await response.json();
 * ```
 */

const GEMINI_MODEL = "gemini-2.0-flash-exp";

interface AIInsightRequest {
  prompt: string;
  context?: {
    businessName?: string;
    avgRank?: number;
    visibility?: number;
    competitors?: string[];
    keyword?: string;
  };
  systemInstruction?: string;
}

interface AIInsightResponse {
  success: boolean;
  insight?: string;
  error?: string;
}

async function callGemini(
  prompt: string,
  systemInstruction = ""
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  let delay = 1000;
  
  // Retry logic with exponential backoff
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
    } catch (error) {
      if (i === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  
  throw new Error("Failed to get response from Gemini after 5 attempts");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIInsightResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { prompt, context, systemInstruction } = req.body as AIInsightRequest;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "Missing required field: prompt"
    });
  }

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    return res.status(500).json({
      success: false,
      error: "AI configuration error. Please add GEMINI_API_KEY to .env.local"
    });
  }

  try {
    // Build enhanced prompt with context
    let enhancedPrompt = prompt;
    
    if (context) {
      const contextStr = `
Business Context:
- Business: ${context.businessName || "Unknown"}
- Current Average Rank: ${context.avgRank || "N/A"}
- Visibility Score: ${context.visibility || "N/A"}%
- Top Competitors: ${context.competitors?.join(", ") || "None"}
- Keyword: ${context.keyword || "N/A"}

User Question: ${prompt}
      `.trim();
      
      enhancedPrompt = contextStr;
    }

    const defaultSystemInstruction = `You are an expert local SEO strategist. Provide actionable, data-driven insights about local search rankings. Be concise but specific. Focus on practical recommendations.`;

    const insight = await callGemini(
      enhancedPrompt,
      systemInstruction || defaultSystemInstruction
    );

    return res.status(200).json({
      success: true,
      insight
    });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}