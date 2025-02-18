import React from "react";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-teal-300">{value}</p>
    </div>
  );
};
