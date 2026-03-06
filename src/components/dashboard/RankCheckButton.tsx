import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rankService } from "@/services/rankService";
import { useToast } from "@/hooks/use-toast";

interface RankCheckButtonProps {
  keyword: string;
  placeId: string;
  businessId: string;
  onSuccess?: () => void;
}

export function RankCheckButton({ keyword, placeId, businessId, onSuccess }: RankCheckButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    setIsLoading(true);
    try {
      const result = await rankService.checkRanks({
        keyword,
        place_id: placeId,
        business_id: businessId,
        grid_size: 7
      });

      toast({
        title: "✅ Rank Check Complete",
        description: `Average Rank: ${result.avg_rank.toFixed(1)} | Visibility: ${result.visibility_score}%`
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "❌ Rank Check Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheck}
      disabled={isLoading}
      className="h-11 px-5 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl flex items-center gap-2"
    >
      <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
      {isLoading ? "CHECKING..." : "CHECK RANKS"}
    </Button>
  );
}