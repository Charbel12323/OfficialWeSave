"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SpendingPieChart } from "../components/spendingpiechart";
import { ExpensesLineChart } from "@/app/components/ExpensesLineChart";
import { DashboardCard } from "@/app/components/DashboardCard";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import Expensesinfo from "./Expensesinfo";
import AiCard from "./AiCard";

import Sidebar from "../components/ui/Sidebar";





export default function DashboardPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const [spendingData, setSpendingData] = useState<{ name: string; value: number }[]>([]);
    const [loadingSpending, setLoadingSpending] = useState(true);
    const [totalSpent, setTotalSpent] = useState(0);
    const [highestExpenditure, setHighestExpenditure] = useState(0);
  
    useEffect(() => {
      async function fetchSpendingSummary() {
        try {
          setLoadingSpending(true);
          const firebaseUid = localStorage.getItem("firebaseUid");
          if (!firebaseUid) {
            console.warn("No firebaseUid found in localStorage.");
            setSpendingData([]);
            return;
          }
          const res = await fetch(
            `http://localhost:5000/saltedge/get-spending-summary?firebase_uid=${firebaseUid}`
          );
          if (!res.ok) throw new Error("Failed to fetch spending summary.");
          const data = await res.json();
          setSpendingData(data.pie_chart_data || []);
          setTotalSpent(data.summary?.total_spent || 0);
          setHighestExpenditure(data.summary?.highest_expenditure || 0);
        } catch (err) {
          console.error(err);
          setSpendingData([]);
        } finally {
          setLoadingSpending(false);
        }
      }
  
      fetchSpendingSummary();
    }, []);

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-teal-700 px-4 py-12">
      {/* Sidebar (if you're using it) */}
      <Sidebar />

      {/* Donation Modal */}
      

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Personal Dashboard
        </h1>

        {/* Row: Spending + Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
        <PieChart 
        spendingData={spendingData} 
        totalSpent={totalSpent} 
        highestExpenditure={highestExpenditure} 
        loadingSpending={loadingSpending} 
      />
      
     

          <LineChart />
         </div>

        {/* Dashboard Cards */}
        

        <Expensesinfo 
        totalSpent={totalSpent} 
        highestExpenditure={highestExpenditure} 
      />
          
        

        {/* AI Tips */}
        <AiCard />

      </motion.div>
    </div>
  );
}
