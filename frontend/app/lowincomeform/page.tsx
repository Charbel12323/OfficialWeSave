"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  text: string;
}

const questions: Question[] = [
  { id: "unemployed", text: "Are you currently unemployed?" },
  { id: "benefits", text: "Do you receive any government benefits?" },
  { id: "dependents", text: "Do you have any dependents?" },
  { id: "debt", text: "Do you have any outstanding debts?" },
  { id: "savings", text: "Do you have any savings?" },
  { id: "housing", text: "Do you struggle with housing costs?" },
  { id: "food", text: "Do you have difficulty affording food?" },
  { id: "healthcare", text: "Do you have access to healthcare?" },
  { id: "education", text: "Are you currently pursuing education or job training?" },
  { id: "transport", text: "Do you have reliable transportation?" },
];

export default function LowIncomeQuestionnaire() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [email, setEmail] = useState(""); // User email
  const [description, setDescription] = useState(""); // Short description field
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    setQueuePosition(null);

    if (!email) {
      setError("Please provide your email.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/submit-low-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          answers,
          uploadedFileName: uploadedFile?.name || "",
          description, // send the short description
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit low income data.");
        return;
      }

      // If the backend returns a queue position, set it.
      if (data.queuePosition) {
        setQueuePosition(data.queuePosition);
      }
      setShowPopup(true);
    } catch (err: any) {
      setError(err.message || "Network error.");
    }
  };

  const handleBackToSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-teal-700 flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Back button at top left */}
      <button
        onClick={handleBackToSignUp}
        className="absolute top-4 left-4 bg-teal-500 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
      >
        Back
      </button>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-2xl"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Financial Assistance Questionnaire
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-1" htmlFor="email">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-teal-500 rounded-md text-white placeholder-teal-200 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Short Description Field */}
          <div>
            <label
              className="block text-white text-lg mb-1"
              htmlFor="description"
            >
              Short Description (Why should someone donate to you?)
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-teal-500 rounded-md text-white placeholder-teal-200 focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your situation..."
              rows={3}
              required
            />
          </div>

          {questions.map((question) => (
            <div
              key={question.id}
              className="flex items-center justify-between"
            >
              <label className="text-white text-lg">{question.text}</label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={() => handleAnswer(question.id, true)}
                  className={`bg-teal-500 ${
                    answers[question.id] === true ? "ring-2 ring-white" : ""
                  }`}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  onClick={() => handleAnswer(question.id, false)}
                  className={`bg-red-500 ${
                    answers[question.id] === false ? "ring-2 ring-white" : ""
                  }`}
                >
                  No
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <label className="block text-lg font-medium text-teal-300 mb-2">
              Upload Proof of Payment
            </label>
            <div className="border-2 border-dashed border-teal-500 rounded-lg p-6 flex flex-col items-center justify-center bg-white bg-opacity-20">
              <Upload size={40} className="text-teal-300 mb-2" />
              <p className="text-teal-200 text-sm mb-2">
                Drag & drop or click to upload
              </p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-md text-sm font-medium mt-2"
              >
                Choose File
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-4 bg-white bg-opacity-20 p-4 rounded-lg flex items-center justify-between">
                <span className="text-white text-sm">{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Button type="submit" size="lg" className="w-full mt-8">
            Submit
          </Button>
        </form>
      </motion.div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
            <h3 className="text-2xl font-bold mb-4">Submission Successful!</h3>
            <p className="text-lg mb-4">
              Your information has been submitted.
            </p>
            {queuePosition !== null && (
              <p className="text-lg mb-6">
                You are number <strong>{queuePosition}</strong> in the queue.
              </p>
            )}
            <Button
              onClick={() => {
                setShowPopup(false);
                router.push("/");
              }}
              className="bg-teal-500 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
