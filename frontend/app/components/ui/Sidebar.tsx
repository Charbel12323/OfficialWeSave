"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { Button } from "../ui/button";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    console.log("Toggling sidebar");
    setIsOpen((prev) => !prev);
  };

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  };

  return (
    <>

      <Button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-teal-500 hover:bg-teal-600"
      >
        <Menu size={24} />
      </Button>

      <motion.div
        className="fixed top-0 left-0 w-64 h-full bg-blue-900 text-white z-50 p-4"
        variants={sidebarVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        transition={{ type: "tween", duration: 0.3 }}
      >
        <div className="flex justify-end">
          <Button onClick={toggleSidebar} variant="default">
            <X size={24} />
          </Button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-4">
            <li>
              <Link href="/mainpage" onClick={toggleSidebar}>
                Dashboard
              </Link>
            </li>
          
            <li>
              <Link href="/Donations" onClick={toggleSidebar}>
                Donations
              </Link>
            </li>

            <li>
              <Link href="/contact" onClick={toggleSidebar}>
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </motion.div>
    </>
  );
}