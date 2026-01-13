"use client";

import { motion } from "framer-motion";

/**
 * @file KongTitle.tsx
 * @description Animated title component inspired by classic gaming aesthetics.
 * Each character animates independently for a "bouncy" feel.
 */

interface KongTitleProps {
  text: string;
  className?: string; // For font sizing/colors
}

/**
 * Renders text with individual character animations (bounce/scale).
 * Adds interactive hover effects to each letter.
 */
export default function KongTitle({ text, className = "" }: KongTitleProps) {
  // Split text into characters
  const characters = text.split("");

  return (
    <div className={`flex flex-wrap justify-center ${className}`}>
      {characters.map((char, index) => {
        // Handle spaces
        if (char === " ") {
            return <div key={index} className="w-4 md:w-8" />;
        }
        
        return (
          <motion.span
            key={index}
            className="inline-block"
            // IDLE ANIMATION: Bouncing Wave
            animate={{
              y: [0, -15, 0], // Bounce up 15px
              scale: [1, 1.1, 1], // Subtle stretch
            }}
            transition={{
              duration: 1.2, // Slowed down from 0.6
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: index * 0.1, // Increased stagger
            }}
            // HOVER INTERACTION: Freeze & Pop
            whileHover={{
              y: 0,
              scale: 1.3,
              rotate: [0, -10, 10, 0], // Wiggle on hover
              color: "#FFD700", // Gold
              transition: { duration: 0.2, repeat: 0 } // Create instant feedback
            }}
            style={{ 
                cursor: "default",
                textShadow: "4px 4px 0px rgba(0,0,0,0.8)" 
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </div>
  );
}
