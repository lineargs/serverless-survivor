"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * @file Confetti.tsx
 * @description Renders a celebration effect with falling particles.
 * Used when players level up or achieve a high score.
 */

/**
 * Full-screen confetti overlay using client-side generated particles.
 */
export default function Confetti() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate 50 random confetti particles
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random start x position (%)
      y: -10 - Math.random() * 20, // start above the screen
      color: ["#FFD700", "#FF4500", "#32CD32", "#00BFFF", "#FF69B4"][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            top: `${p.y}%`, 
            left: `${p.x}%`, 
            rotate: p.rotation, 
            scale: p.scale,
            opacity: 1
          }}
          animate={{ 
            top: "110%", 
            rotate: p.rotation + 360 + Math.random() * 180,
            opacity: 0
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            ease: "easeOut",
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2
          }}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%"
          }}
        />
      ))}
    </div>
  );
}
