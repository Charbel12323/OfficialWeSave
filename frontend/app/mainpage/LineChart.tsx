import React from 'react'
import {ExpensesLineChart} from "@/app/components/ExpensesLineChart"
import { motion } from "framer-motion";
import { useState, useEffect } from 'react';



const LineChart = () => {

    const [forecastData, setForecastData] = useState<{ day: string; amount: number }[]>([]);
    const [loadingForecast, setLoadingForecast] = useState(true);


useEffect(() => {
    async function fetchForecast() {
      try {
        setLoadingForecast(true);

        // Example transaction data
        const sampleTransactions = [
          { date: "2024-11-20", expense: 50 },
          { date: "2024-11-21", expense: 60 },
          { date: "2024-11-22", expense: 75 },
          { date: "2024-11-23", expense: 80 },
          { date: "2024-11-24", expense: 120 },
          { date: "2024-11-25", expense: 40 },
          { date: "2024-11-26", expense: 95 },
          { date: "2024-11-27", expense: 110 },
          { date: "2024-11-28", expense: 100 },
          { date: "2024-11-29", expense: 90 },
          { date: "2024-11-30", expense: 130 },
          { date: "2024-12-01", expense: 85 },
        ];

        const firebaseUid = localStorage.getItem("firebaseUid");
        if (!firebaseUid) {
          console.error("Firebase UID not found");
          return;
        }
        const res = await fetch("http://localhost:5000/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_uid: firebaseUid }),
        });
        if (!res.ok) throw new Error("Forecast fetch failed.");
        const data = await res.json();

        // Convert historical
        const histPoints = (data.historical || []).map(
          (item: { ds: string; y_original: number }) => {
            const dateObj = new Date(item.ds);
            return {
              day: dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              amount: item.y_original,
            };
          }
        );

        // Convert forecast
        const forecastPoints = (data.forecast || []).map(
          (item: { ds: string; yhat: number }) => {
            const dateObj = new Date(item.ds);
            return {
              day: dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              amount: item.yhat,
            };
          }
        );

        // Merge them into a single array
        const combined = [...histPoints, ...forecastPoints];

        // Sort by date to ensure a continuous line
        combined.sort((a, b) => {
          const da = new Date(a.day);
          const db = new Date(b.day);
          return da.getTime() - db.getTime();
        });

        setForecastData(combined);
      } catch (err) {
        console.error(err);
        setForecastData([]);
      } finally {
        setLoadingForecast(false);
      }
    }
    fetchForecast();
  }, []);



    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      };
  return (
    <div>
        <motion.div
            variants={fadeIn}
            transition={{ delay: 0.3 }}
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              7-Day Forecast
            </h2>
            {loadingForecast ? (
              <div className="text-white">Loading forecast data...</div>
            ) : forecastData.length < 2 ? (
              <div className="text-white">
                Not enough data to display a line chart.
              </div>
            ) : (
              <ExpensesLineChart
                data={forecastData.map((item) => ({
                  month: item.day, // reuse the 'month' key in the chart
                  amount: item.amount,
                }))}
              />
            )}
          </motion.div>
      
    </div>
  )
}

export default LineChart
