import React from "react";
import { SpendingPieChart } from "../components/spendingpiechart";
import { motion } from "framer-motion";

interface PieChartProps {
    spendingData: { name: string; value: number }[];
    totalSpent: number;
    highestExpenditure: number;
    loadingSpending: boolean;
}
const PieChart: React.FC<PieChartProps> = ({ spendingData, totalSpent, highestExpenditure, loadingSpending }) => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div>
      <motion.div
        variants={fadeIn}
        transition={{ delay: 0.2 }}
        className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Spending Overview</h2>
        {loadingSpending ? (
          <div className="text-white">Loading spending data...</div>
        ) : spendingData.length === 0 ? (
          <div className="text-white">No spending data found.</div>
        ) : (
          <SpendingPieChart data={spendingData} totalAmount={totalSpent} />
        )}
      </motion.div>
    </div>
  );
};

export default PieChart;
