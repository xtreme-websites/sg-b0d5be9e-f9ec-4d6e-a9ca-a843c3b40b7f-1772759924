import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { rankService } from "@/services/rankService";
import { useToast } from "@/hooks/use-toast";

interface AIInsightButtonProps {
  businessName: string;
  currentRank?: number;
  previousRank?: number;
  competitors?: string[];
}

export function AIInsightButton({ businessName, currentRank, previousRank, competitors }: AIInsightButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<string>("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Build context from available data
      let context = `Business: ${businessName}`;
      if (currentRank && previousRank) {
        const trend = currentRank < previousRank ? "improved" : "declined";
        context += `\nRank ${trend} from ${previousRank.toFixed(1)} to ${currentRank.toFixed(1)}`;
      }
      if (competitors && competitors.length > 0) {
        context += `\nTop competitors: ${competitors.join(", ")}`;
      }

      const result = await rankService.getAIInsight({
        context,
        business_name: businessName,
        competitors: competitors || []
      });

      setInsight(result.insight);
    } catch (error) {
      toast({
        title: "❌ AI Insight Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-11 px-5 bg-purple-600 text-white rounded-2xl text-xs font-black hover:bg-purple-700 shadow-xl flex items-center gap-2"
        >
          <Sparkles size={16} />
          AI INSIGHT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="text-purple-600" size={20} />
            </div>
            AI Strategy Insight
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!insight && (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">
                Get AI-powered recommendations to improve your local rankings
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? "Analyzing..." : "Generate Insight"}
              </Button>
            </div>
          )}
          
          {insight && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {insight}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}