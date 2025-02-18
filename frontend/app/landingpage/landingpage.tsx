"use client"

import React from "react"
import { motion } from "framer-motion"
import { useSpring, animated } from "react-spring"
import { ChevronDown, CreditCard, PiggyBank, TrendingUp, Heart } from "lucide-react"
import { Button } from "../components/ui/button"
import Link from "next/link"
import Sidebar from "../components/ui/Sidebar"

export default function LandingPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const springProps = useSpring({
    from: { transform: "translateY(20px)" },
    to: { transform: "translateY(0px)" },
    config: { tension: 300, friction: 10 },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-teal-700 text-white">
   
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold">WeSave</h1>
        </motion.div>
        <nav>
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="flex space-x-6"
          >
            {["Features", "How it works", "Testimonials", "Contact"].map((item) => (
              <motion.li key={item} variants={fadeIn}>
                <a href={`#${item.toLowerCase().replace(" ", "-")}`} className="hover:text-teal-300 transition-colors">
                  {item}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </nav>
      </header>

      {/* Main */}
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-6"
          >
            Master Your Finances, Elevate Your Life
          </motion.h2>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Track expenses, predict future payments, boost your credit score, and give back to charity — all in one
            powerful app.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/signup">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
                    Get Started Free
                </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <motion.h3
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-12 text-center"
          >
            Features That Empower Your Financial Journey
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CreditCard,
                title: "Expense Tracking",
                description: "Effortlessly monitor all your expenses in real-time",
              },
              {
                icon: TrendingUp,
                title: "Future Payments",
                description: "Predict and plan for upcoming expenses with AI-powered insights",
              },
              {
                icon: PiggyBank,
                title: "Credit Score Tips",
                description: "Personalized advice to boost your credit score",
              },
              {
                icon: Heart,
                title: "Charitable Giving",
                description: "Automatically donate 1% of purchases to causes you care about",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-lg"
              >
                <feature.icon className="w-12 h-12 mb-4 text-teal-300" />
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-teal-100">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-4 py-20">
          <motion.h3
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-12 text-center"
          >
            How It Works
          </motion.h3>
          <div className="max-w-3xl mx-auto">
            {[
              "Connect your accounts securely",
              "Track expenses automatically",
              "Receive personalized insights and predictions",
              "Improve your credit score with tailored advice",
              "Give back to charity effortlessly",
            ].map((step, index) => (
              <motion.div
                key={step}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center mb-8"
              >
                <div className="bg-teal-500 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                  {index + 1}
                </div>
                <p className="text-lg">{step}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="container mx-auto px-4 py-20">
          <motion.h3
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-12 text-center"
          >
            What Our Users Say
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah L.",
                quote:
                  "FinanceTrack has completely transformed how I manage my money. The future payment predictions are a game-changer!",
              },
              {
                name: "Michael R.",
                quote:
                  "I've seen my credit score improve by 50 points in just three months thanks to the personalized tips.",
              },
              {
                name: "Emily T.",
                quote:
                  "The charitable giving feature makes me feel good about every purchase. It's so easy to give back!",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-lg"
              >
                <p className="mb-4 italic">"{testimonial.quote}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call To Action Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.h3
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-6"
          >
            Ready to Take Control of Your Finances?
          </motion.h3>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl mb-8"
          >
            Join thousands of users who have transformed their financial lives with FinanceTrack.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
              Start Your Free Trial
            </Button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 FinanceTrack. All rights reserved.</p>
        </div>
      </footer>

     
    </div>
  )
}
