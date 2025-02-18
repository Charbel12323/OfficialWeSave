"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/ui/Sidebar";
import { Button } from "../components/ui/button";
import { getAuth } from "firebase/auth";

// Import the shared Auth instance
import { auth } from "@/firebaseClient"; // adjust this path as needed

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1) Get the currently logged-in user
  const user = auth.currentUser;
  const userEmail = user?.email || ""; // empty if not logged in

  const fetchDonations = async () => {
    if (!userEmail) {
      setError("No user email found (user not logged in?).");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Use the endpoint for all donations; adjust URL if needed
      const res = await fetch("http://localhost:5000/all-donations");
      if (!res.ok) {
        throw new Error("Failed to fetch donations");
      }
      const data = await res.json();
      setDonations(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchDonations();
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  // Calculate donation summary values using useMemo
  const { userTotal, globalTotal, percentage, rating } = useMemo(() => {
    // global total: sum of all donations' amounts
    const global = donations.reduce((sum, donation) => {
      return sum + Number(donation.amount || 0);
    }, 0);
    // user total: sum of donations where donorEmail matches current user's email
    const userSum = donations
      .filter((donation) => donation.donorEmail === userEmail)
      .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
    // percentage: if global > 0, else 0
    const perc = global > 0 ? (userSum / global) * 100 : 0;

    // Simple rating logic (adjust thresholds as needed):
    let rate = "";
    if (perc >= 15) {
      rate = "Gold";
    } else if (perc >= 5) {
      rate = "Silver";
    } else {
      rate = "Bronze";
    }
    return { userTotal: userSum, globalTotal: global, percentage: perc, rating: rate };
  }, [donations, userEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-teal-700 px-4 py-12 relative">
      <Sidebar />
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Donations</h1>
          <Button onClick={fetchDonations} variant="outline" className="text-white">
            Refresh
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="bg-red-600 text-white rounded-lg p-4 text-center">{error}</div>
        ) : donations.length === 0 ? (
          <p className="text-white text-center">No donations found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {donations.map((donation, idx) => (
                <div
                  key={idx}
                  className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6 text-white shadow-lg"
                >
                  <h2 className="text-2xl font-semibold mb-2">Donation #{idx + 1}</h2>
                  <p>
                    <span className="font-bold">Donor:</span>{" "}
                    {donation.donorEmail || donation.donorUid}
                  </p>
                  <p>
                    <span className="font-bold">Recipient:</span> {donation.recipientEmail}
                  </p>
                  <p>
                    <span className="font-bold">Amount:</span> $
                    {Number(donation.amount).toLocaleString()}
                  </p>
                  {donation.date && (
                    <p>
                      <span className="font-bold">Date:</span>{" "}
                      {new Date(donation.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {/* Donation Summary Section */}
            <div className="mt-4 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-6 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Donation Summary</h2>
              <p className="mb-2">
                <strong>Total Donated by You:</strong> ${userTotal.toLocaleString()}
              </p>
              <p className="mb-2">
                <strong>Your Contribution to Global Donations:</strong>{" "}
                {percentage.toFixed(2)}%
              </p>
              <p className="mb-2">
                <strong>Your Rating:</strong> {rating}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
