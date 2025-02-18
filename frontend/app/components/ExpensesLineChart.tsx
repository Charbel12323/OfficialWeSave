"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ExpensesLineChartProps {
  data: { month: string; amount: number }[];
}

export const ExpensesLineChart: React.FC<ExpensesLineChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis dataKey="month" stroke="#ffffff80" />
          <YAxis stroke="#ffffff80" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff20",
              border: "none",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#ffffff" }}
            itemStyle={{ color: "#ffffff" }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#00C49F"
            strokeWidth={2}
            dot={{ fill: "#00C49F", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
