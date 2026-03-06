import type { OpenWebNinjaResponse } from "@/types";

interface RankCheckRequest {
  keyword: string;
  place_id: string;
  business_id: string;
  grid_size: number;
}

interface AIInsightRequest {
  context: string;
  business_name: string;
  competitors: string[];
}

export const rankService = {
  /**
   * Trigger a new rank check via the API route
   */
  async checkRanks(request: RankCheckRequest): Promise<OpenWebNinjaResponse> {
    const response = await fetch("/api/rank-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Rank check failed");
    }

    return response.json();
  },

  /**
   * Generate AI strategy insights
   */
  async getAIInsight(request: AIInsightRequest): Promise<{ insight: string }> {
    const response = await fetch("/api/ai-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate AI insight");
    }

    return response.json();
  }
};