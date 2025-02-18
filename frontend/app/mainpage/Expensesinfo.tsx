import React, { useState, useEffect } from "react";
import { DashboardCard } from "../components/DashboardCard";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { TrendingUp, Heart, CreditCard } from "lucide-react";

interface ExpensesinfoProps {
    totalSpent: number;
    highestExpenditure: number;
  }

const Expensesinfo : React.FC<ExpensesinfoProps>= ({ totalSpent, highestExpenditure }) => {
  const [isDonateModalOpen, setDonateModalOpen] = useState(false);
  const charityAmount = totalSpent * 0.01;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  function DonateModal({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) {
    const [recipientEmail, setRecipientEmail] = useState("");
    const [donorEmail, setDonorEmail] = useState("");
    const [amount, setAmount] = useState(50);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
  
    useEffect(() => {
      if (isOpen) {
        setError("");
        setSuccess("");
        // Get next user in queue
        fetch("http://localhost:5000/get-next-low-income-user")
          .then((res) => res.json())
          .then((data) => {
            if (data.email) {
              setRecipientEmail(data.email);
            } else {
              setError("No low income user available at the moment.");
            }
          })
          .catch(() => {
            setError("Failed to fetch low income user.");
          });
      }
    }, [isOpen]);
  
    const handleDonate = async () => {
      setError("");
      setSuccess("");
  
      if (!recipientEmail || !donorEmail || amount <= 0) {
        setError("Please fill in all fields properly.");
        return;
      }
  
      try {
        const res = await fetch("http://localhost:5000/donate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donorEmail,
            recipientEmail,
            amount,
          }),
        });
  
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Donation failed.");
          return;
        }
        setSuccess("Donation successful!");
      } catch (err: any) {
        setError(err.message || "Network error.");
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Donate to Low-Income User</h2>
          {success ? (
            <p className="text-green-500 mb-4">{success}</p>
          ) : (
            <>
              {error && <p className="text-red-500 mb-4">{error}</p>}
  
              <div className="mb-4">
                <label className="block font-medium">Donor Email:</label>
                <input
                  type="email"
                  className="border rounded w-full px-2 py-1"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="donor@example.com"
                />
              </div>
  
              <div className="mb-4">
                <label className="block font-medium">Recipient Email:</label>
                <input
                  type="email"
                  className="border rounded w-full px-2 py-1"
                  value={recipientEmail}
                  readOnly
                />
              </div>
  
              <div className="mb-4">
                <label className="block font-medium">Amount:</label>
                <input
                  type="number"
                  className="border rounded w-full px-2 py-1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                />
              </div>
            </>
          )}
  
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            {!success && (
              <Button
                onClick={handleDonate}
                className="bg-teal-500 text-white hover:bg-teal-400"
              >
                Donate
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <>
     <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setDonateModalOpen(false)}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div variants={fadeIn} transition={{ delay: 0.4 }}>
          <DashboardCard
            title="Highest Expenditure"
            value={`$${highestExpenditure.toLocaleString()}`}
            icon={<TrendingUp className="w-8 h-8 text-teal-300" />}
          />
        </motion.div>

        <motion.div variants={fadeIn} transition={{ delay: 0.5 }}>
          <DashboardCard
            title="Charity Contribution"
            value={`$${charityAmount.toLocaleString()}`}
            icon={<Heart className="w-8 h-8 text-teal-300" />}
          />
          <Button
            className="mt-4 w-full bg-pink-500 hover:bg-pink-400"
            onClick={() => setDonateModalOpen(true)}
          >
            Donate
          </Button>
        </motion.div>

        <motion.div variants={fadeIn} transition={{ delay: 0.6 }}>
          <DashboardCard
            title="Total Expenses"
            value={`$${totalSpent.toLocaleString()}`}
            icon={<CreditCard className="w-8 h-8 text-teal-300" />}
          />
        </motion.div>
      </div>
    </>
  );
};

export default Expensesinfo;
