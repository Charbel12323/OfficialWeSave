"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "../components/ui/button"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebaseClient"


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter() // 🚀 Initialize router for navigation

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const email = e.currentTarget.email.value
    const password = e.currentTarget.password.value

    try {
      // 🔐 Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()

      // ✅ Verify the token with your backend
      const res = await fetch("http://localhost:5000/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess("Logged in successfully!")

        // 🚀 Redirect to the main dashboard after login
        setTimeout(() => {
          router.push("/mainpage") // Change this to your main page
        }, 1500)
      } else {
        setError(data.error || "Token verification failed")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-teal-700 flex flex-col justify-center items-center px-4 py-12">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md"
      >
        Back
      </button>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Log in to WeSave
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-teal-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-teal-500 rounded-md text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-teal-300 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-teal-500 rounded-md text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-teal-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {/* ✅ Show Success or Error Messages */}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
          
          <Button type="submit" size="lg" className="w-full">
            Log In
          </Button>
        </form>

        {/* 🛠 Links for Sign Up & Forgot Password */}
        <div className="mt-6 text-center">
          <Link href="/signup" className="text-teal-300 hover:text-teal-100 transition-colors">
            Don't have an account? Sign up
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link href="/forgot-password" className="text-teal-300 hover:text-teal-100 transition-colors">
            Forgot your password?
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
