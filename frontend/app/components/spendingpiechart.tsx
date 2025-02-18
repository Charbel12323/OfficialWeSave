"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SpendingPieChartProps {
  /**
   * Example data array:
   * [
   *   { name: "Groceries", value: 300 },
   *   { name: "Entertainment", value: 150 },
   *   { name: "Rent", value: 2000 },
   *   { name: "Utilities", value: 200 },
   * ]
   */
  data: { name: string; value: number }[];
  /**
   * The total amount spent, displayed in the center.
   */
  totalAmount: number;
}

// Customize slice colors as you like
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export const SpendingPieChart: React.FC<SpendingPieChartProps> = ({
  data,
  totalAmount,
}) => {
  return (
    <div className="relative w-full h-80">
      {/* Title at the top */}
      <div className="absolute top-0 left-0 w-full text-center text-xl font-semibold text-white">
        Amount Spent
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Tooltip on hover, showing category name + $ amount */}
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name,
            ]}
          />

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={5}
            // Remove built-in labels so we can place a custom total in the center
            label={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Total in the donut's center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-3xl font-bold text-white">
          ${totalAmount.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
