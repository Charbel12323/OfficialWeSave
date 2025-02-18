import React, { useState, useEffect } from "react";
import PieChart from "./PieChart";
import Expensesinfo from "./Expensesinfo";

const Dashboard = () => {
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
    <div>
      <PieChart 
        spendingData={spendingData} 
        totalSpent={totalSpent} 
        highestExpenditure={highestExpenditure} 
        loadingSpending={loadingSpending} 
      />
      
      <Expensesinfo 
        totalSpent={totalSpent} 
        highestExpenditure={highestExpenditure} 
      />
    </div>
  );
};

export default Dashboard;
