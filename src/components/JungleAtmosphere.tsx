"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * @file JungleAtmosphere.tsx
 * @description Renders ambient background elements (leaves, clouds, hexagonal "nodes").
 * Uses Framer Motion for continuous, non-interactive drift animations.
 */

const SHAPES = [
  // Cloud
  {
    type: "cloud",
    path: "M17.5,19c-1.7,0-3.2-0.9-4-2.3c-0.6,0.2-1.2,0.3-1.9,0.3c-3.6,0-6.6-2.9-6.6-6.6s2.9-6.6,6.6-6.6 c0.7,0,1.4,0.1,2,0.4c1.7-3,4.9-5.1,8.6-5.1c5.4,0,9.9,4.4,9.9,9.9c0,0.6-0.1,1.2-0.2,1.7c2.6,0.7,4.6,3.1,4.6,5.9 c0,3.4-2.8,6.2-6.2,6.2L17.5,19z",
  },
  // Leaf
  {
    type: "leaf",
    path: "M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10 0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8 4.41 0 8 3.59 8 8 0 4.41-3.59 8-8 8z M12 4c-3.31 0-6 2.69-6 6 0 2.21 1.21 4.15 3 5.19V18h6v-2.81c1.79-1.04 3-2.98 3-5.19 0-3.31-2.69-6-6-6z", // Simplified leaf/nature shape
  },
  // Hexagon (Node)
  {
    type: "hexagon",
    path: "M21 16.5l-6 3.5-6-3.5v-7l6-3.5 6 3.5v7zm-9-5l3 1.7 3-1.7", // Partial hex
  },
  // Square Crate
  {
    type: "crate",
    path: "M3 3h18v18H3z M5 5v14h14V5H5z M7 7h10v10H7z",
  },
];

const COLORS = ["#2E7D32", "#1B4D3E", "#5D4037", "#8D6E63", "#FFD700"];

/**
 * Renders the atmospheric background layer.
 * Generates random elements client-side to ensure unique patterns per session.
 */
export default function JungleAtmosphere() {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    // Generate random elements strictly on the client side.
    // This prevents Hydration Mismatch errors where server-rendered HTML fails to match client-side random values.
    const count = 20;
    const newElements = Array.from({ length: count }).map((_, i) => ({
      id: i,
      // Randomize shape, color, and size for visual variety
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 30 + 20, // 20-50px
      
      // Randomize position and animation parameters
      left: Math.random() * 100, // Horizontal start (0-100%)
      top: Math.random() * 100,  // Vertical start (0-100%)
      duration: Math.random() * 15 + 15, // Slow drift (15-30s)
      delay: Math.random() * 5,
      yDistance: Math.random() * 100 - 50, // Drift up or down
      xDistance: Math.random() * 60 - 30,  // Drift left or right
      rotate: Math.random() * 360,
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{
            opacity: 0,
            x: `${el.left}vw`,
            y: `${el.top}vh`,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 0.5, 0], // Increased from 0.2 to 0.5 for visibility behind vignette
            x: [`${el.left}vw`, `${el.left + el.xDistance / 10}vw`],
            y: [`${el.top}vh`, `${el.top - 20}vh`],
            rotate: [0, el.rotate],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: "linear",
            delay: el.delay,
          }}
          style={{
            position: "absolute",
            width: el.size,
            height: el.size,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={el.color}
            style={{ width: "100%", height: "100%" }} // Removed opacity: 0.3
          >
            <path d={el.shape.path} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
