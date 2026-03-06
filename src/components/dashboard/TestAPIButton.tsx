import React, { useState } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function TestAPIButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/test-rank-api");
      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ API Test Successful!",
          description: `Method: ${result.method}. Your OpenWeb Ninja API is working correctly.`,
          duration: 5000
        });
        console.log("API Test Results:", result);
      } else {
        toast({
          title: "❌ API Test Failed",
          description: result.error || "Check console for details",
          variant: "destructive",
          duration: 7000
        });
        console.error("API Test Failed:", result);
      }
    } catch (error) {
      toast({
        title: "❌ Test Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      console.error("Test error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTest}
      disabled={isLoading}
      variant="outline"
      className="h-11 px-5 border-2 border-slate-300 text-slate-700 rounded-2xl text-xs font-black hover:bg-slate-50"
    >
      <Bug size={16} className="mr-2" />
      {isLoading ? "TESTING..." : "TEST API"}
    </Button>
  );
}