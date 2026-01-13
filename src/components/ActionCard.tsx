"use client";

import { motion } from "framer-motion";

/**
 * @file ActionCard.tsx
 * @description A reusable card component with subtle floating animations.
 * Used for wrapping interactive content like game choices or stats.
 */

interface ActionCardProps {
  children: React.ReactNode;
  className?: string; // For passing existing Tailwind classes
}

/**
 * Renders a card that gently floats in the "jungle" breeze.
 * Adjusts animation state on hover for better interactivity.
 */
export default function ActionCard({ children, className = "" }: ActionCardProps) {
  // Extract rotation from class if present? Hard to do.
  // Instead, we assume the user removed the rotation class from the parent usage 
  // and we apply rotation here.

  return (
    <motion.div
      className={`${className} origin-center`} // Ensure Tailwind classes work
      // IDLE: Sway
      animate={{
        rotate: [1, -1, 1], // Gentle sway
        y: [0, -5, 0], // Gentle float
      }}
      transition={{
        duration: 8, // Slowed down from 4
        repeat: Infinity,
        ease: "easeInOut",
      }}
      // HOVER: Stabilize & Alert
      whileHover={{
        rotate: 0,
        scale: 1.02,
        y: 0,
        transition: { type: "spring", stiffness: 300 }
      }}
    >
      {children}
    </motion.div>
  );
}
