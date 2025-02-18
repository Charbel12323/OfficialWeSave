import React from 'react'
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
  } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {motion} from 'framer-motion'
import {useState, useEffect} from 'react'
import {
RefreshCcw,
CheckCircle2
} from "lucide-react";

function renderCheckList(text: string) {
    // Split into lines, removing any empty lines
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    return (
      <ul className="space-y-4">
        {lines.map((line, idx) => {
          // Remove leading dashes, asterisks, or brackets with a quick regex
          const cleanedLine = line.replace(/^[-*()\[\]]+\s*/, "").trim();
          return (
            <li key={idx} className="flex items-start">
              <CheckCircle2 className="text-teal-400 w-8 h-8 mr-3 mt-1" />
              <span className="leading-relaxed text-white">{cleanedLine}</span>
            </li>
          );
        })}
      </ul>
    );
}  
  
const AiCard = () => {


    // --- AI tips
      const [creditTips, setCreditTips] = useState("");
      const [tipsTitle, setTipsTitle] = useState("");
      const [tipsLoading, setTipsLoading] = useState(true);
      const [tipsError, setTipsError] = useState("");
      const [retryCount, setRetryCount] = useState(0);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      };

      const fetchCreditTips = async () => {
        setTipsLoading(true);
        setTipsError("");
        try {
          const response = await fetch("http://localhost:5000/credit-tips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          if (response.ok) {
            setTipsTitle(data.title || "AI Financial Tips");
            setCreditTips(data.tips || "");
          } else {
            throw new Error(data.error || "Failed to fetch tips");
          }
        } catch (error: any) {
          setTipsError(error.message || "Failed to fetch credit tips");
        } finally {
          setTipsLoading(false);
        }
      };
    
      useEffect(() => {
        fetchCreditTips();
      }, [retryCount]);
    
      const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
      };
  return (
    <div>
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  {tipsTitle || "AI Financial Tips"}
                </CardTitle>
                <CardDescription className="text-lg text-white">
                  Actionable insights from AI:
                </CardDescription>
              </div>
              <Button
                onClick={handleRetry}
                variant="outline"
                className="text-white"
                disabled={tipsLoading}
              >
                <RefreshCcw
                  className={`h-4 w-4 ${tipsLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </CardHeader>
            <CardContent>
              {tipsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : tipsError ? (
                <div className="bg-red-600 text-white rounded-lg p-4 flex items-center justify-between">
                  <span>{tipsError}</span>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="ml-4 text-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                // Always render as checklist
                renderCheckList(creditTips)
              )}
            </CardContent>
          </Card>
        </motion.div>
      
      




    </div>
    
  )
}

export default AiCard
