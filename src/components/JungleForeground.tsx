"use client";

import { motion } from "framer-motion";

/**
 * @file JungleForeground.tsx
 * @description Foreground overlay containing parallax elements like vines, bushes, and wildlife.
 * Creates depth and immersion by sitting atop the main UI layer.
 */

/**
 * Renders SVG-based jungle flora and fauna with Framer Motion animations.
 * Includes interactive or ambient elements like swaying vines and blinking eyes.
 */
export default function JungleForeground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* ==================== VINES ==================== */}
      
      {/* 1. Main Top Left Vine */}
      <motion.div
        className="absolute top-0 left-[-20px] w-32 md:w-48 text-jungle-800"
        initial={{ rotate: -5 }}
        animate={{ rotate: 5 }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{ originY: 0, originX: 0.5 }}
      >
        <svg viewBox="0 0 100 200" fill="currentColor" className="drop-shadow-lg">
          <path d="M50,0 Q40,50 60,100 T50,200 L45,200 Q55,100 35,50 T40,0 Z" />
          <circle cx="60" cy="100" r="5" fill="#2E7D32" />
          <path d="M60,100 Q80,110 90,90 Z" fill="#1B4D3E" />
        </svg>
      </motion.div>

      {/* 2. Secondary Left Vine (Shorter, darker) */}
      <motion.div
        className="absolute top-0 left-16 md:left-24 w-16 md:w-24 text-jungle-900 opacity-60"
        initial={{ rotate: 2 }}
        animate={{ rotate: -2 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.5,
        }}
        style={{ originY: 0, originX: 0.5 }}
      >
        <svg viewBox="0 0 100 150" fill="currentColor">
           <path d="M50,0 Q55,40 45,80 T50,150 L48,150 Q43,80 53,40 T48,0 Z" />
        </svg>
      </motion.div>

      {/* 3. Main Top Right Vine */}
      <motion.div
        className="absolute top-0 right-[-10px] w-24 md:w-36 text-jungle-700"
        initial={{ rotate: 5 }}
        animate={{ rotate: -5 }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 1,
        }}
        style={{ originY: 0, originX: 0.5 }}
      >
        <svg viewBox="0 0 100 300" fill="currentColor" className="drop-shadow-lg">
          <path d="M50,0 Q60,75 40,150 T60,300 L55,300 Q35,150 55,75 T45,0 Z" />
        </svg>
      </motion.div>

      {/* 4. Secondary Right Vine (Thinner) */}
       <motion.div
        className="absolute top-0 right-20 md:right-32 w-12 text-jungle-800 opacity-80"
        initial={{ rotate: -3 }}
        animate={{ rotate: 3 }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ originY: 0, originX: 0.5 }}
      >
        <svg viewBox="0 0 100 200" fill="currentColor">
          <path d="M50,0 Q45,50 55,100 T50,200 Z" />
        </svg>
      </motion.div>

      {/* ==================== FOLIAGE / BUSHES ==================== */}

      {/* 5. Bottom Left Main Bush */}
      <motion.div
        className="absolute bottom-[-20px] left-[-20px] w-64 md:w-96 text-jungle-700"
        initial={{ x: -20, rotate: -2 }}
        animate={{ x: 0, rotate: 0 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 200 100" fill="currentColor">
          <path d="M0,100 Q50,0 100,80 T200,100 Z" />
          <path d="M-50,100 Q20,20 80,100 Z" fill="#1B4D3E" />
        </svg>
      </motion.div>

       {/* 6. Mid-Ground Left Fern (Rising from side) */}
       <motion.div
        className="absolute bottom-20 left-[-40px] w-48 text-jungle-600 opacity-90"
        initial={{ rotate: -10 }}
        animate={{ rotate: -5 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{ originY: 1, originX: 0 }}
      >
        <svg viewBox="0 0 100 100" fill="currentColor">
           <path d="M0,100 Q50,0 100,20 L100,100 Z" /> 
           {/* Serrated leaf look */}
           <path d="M10,90 L30,40 L35,50 L50,10 L55,20 L70,0 L100,100 Z" fill="#2E7D32" />
        </svg>
      </motion.div>


      {/* 7. Bottom Right Main Bush */}
      <motion.div
        className="absolute bottom-[-30px] right-[-20px] w-80 md:w-[500px] text-jungle-600"
        initial={{ x: 20, rotate: 2 }}
        animate={{ x: 0, rotate: 0 }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 300 150" fill="currentColor">
             <path d="M300,150 Q200,50 100,150 Z" />
             <path d="M150,150 Q220,20 300,120 Z" fill="#1B4D3E" />
             <path d="M250,150 Q280,80 350,150 Z" />
        </svg>
      </motion.div>

       {/* 8. Bottom Center Small Ferns */}
      <motion.div
        className="absolute bottom-0 left-1/3 w-32 text-jungle-800 opacity-80"
         initial={{ skewX: 5 }}
        animate={{ skewX: -5 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
         style={{ originY: 1 }}
      >
           <svg viewBox="0 0 100 80" fill="currentColor"><path d="M50,80 Q20,20 0,60 L50,80 Q80,20 100,60 Z" /></svg>
      </motion.div>

      {/* ==================== TREES ==================== */}
      
      {/* 9. Left Tree Trunk (Static grounding) */}
      <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-wood-dark opacity-40 z-[-1]">
         <svg height="100%" width="100%" preserveAspectRatio="none">
             <path d="M0,0 L30,0 L40,100 L20,200 L50,400 L30,800 L40,1200 L0,1200 Z" fill="#3E2723" />
         </svg>
      </div>

      {/* 10. Right Tree Trunk */}
      <div className="absolute top-0 bottom-0 right-0 w-20 md:w-40 bg-wood-dark opacity-40 z-[-1]">
          <svg height="100%" width="100%" preserveAspectRatio="none">
             <path d="M100,0 L70,0 L60,100 L80,200 L50,400 L70,800 L40,1200 L100,1200 Z" fill="#3E2723" />
         </svg>
      </div>

      {/* ==================== ANIMALS ==================== */}

      {/* 11. Glowing Eyes (Left Bush) */}
      <motion.div
        className="absolute bottom-12 left-10 md:left-32 w-8 h-4 flex space-x-2"
        animate={{ opacity: [0, 1, 0, 0, 1, 0] }} // Blink randomly
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.2, 0.5, 0.6, 1], delay: 2 }}
      >
          <div className="w-2 h-2 rounded-full bg-survivor-warning shadow-[0_0_5px_yellow]"></div>
          <div className="w-2 h-2 rounded-full bg-survivor-warning shadow-[0_0_5px_yellow]"></div>
      </motion.div>

       {/* 12. Snake Tail (Hanging Top Right) */}
       <motion.div
        className="absolute top-20 right-32 w-8 h-32 text-jungle-600"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ originY: 0 }}
       >
         <svg viewBox="0 0 20 100" fill="currentColor">
             <path d="M10,0 Q20,20 10,40 Q0,60 10,80 L12,90 L8,90 L10,80 Z" />
         </svg>
       </motion.div>

      {/* 13. SPIDER (Top Left Drop) */}
      <motion.div 
        className="absolute top-0 left-10 md:left-20 w-4 md:w-8 text-white"
        initial={{ y: -100 }}
        animate={{ y: [0, 150, 150, 0] }}
        transition={{ 
            duration: 8, 
            repeat: Infinity, 
            times: [0, 0.2, 0.8, 1], // Quick drop, long hang, quick retreat
            delay: 1 
        }}
      >
          {/* Thread */}
          <div className="absolute top-[-150px] left-1/2 w-[1px] h-[150px] bg-white/30"></div>
          {/* Spider Body */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-lg">
              <circle cx="12" cy="12" r="6" />
              <path d="M12,12 L4,4 M12,12 L20,4 M12,12 L4,12 M12,12 L20,12 M12,12 L4,20 M12,12 L20,20" stroke="currentColor" strokeWidth="2" />
              <circle cx="10" cy="10" r="1" fill="red" />
              <circle cx="14" cy="10" r="1" fill="red" />
          </svg>
      </motion.div>

      {/* 14. VIPER (Right Bush Peek) */}
      <motion.div
        className="absolute bottom-24 right-[-10px] w-24 h-24 text-survivor-terminal z-30"
        animate={{ x: [0, -40, -40, 0] }}
        transition={{ 
            duration: 10, 
            repeat: Infinity, 
            times: [0, 0.1, 0.4, 1],
            delay: 3 
        }}
      >
          <svg viewBox="0 0 100 100" fill="currentColor" className="drop-shadow-sm">
             {/* Head */}
             <path d="M100,50 Q80,50 70,70 L50,60 Q70,40 100,20 Z" />
             {/* Eye */}
             <circle cx="70" cy="65" r="3" fill="#FFD700" />
             <rect x="69" y="63" width="1" height="4" fill="black" /> {/* Slit pupil */}
             {/* Tongue */}
             <motion.path 
                d="M50,60 L30,65 L20,60 M30,65 L20,70" 
                stroke="#FF3D00" 
                strokeWidth="2" 
                fill="none"
                animate={{ opacity: [0, 1, 0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
             />
          </svg>
      </motion.div>

      {/* 15. ALLIGATOR (Bottom Center Water/Bush) */}
      <motion.div
        className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-48 h-16 text-jungle-600 opacity-100"
        animate={{ y: [0, -30, -30, 0] }}
        transition={{ 
            duration: 12, 
            repeat: Infinity, 
            times: [0, 0.2, 0.6, 1],
            delay: 5
        }}
      >
          <svg viewBox="0 0 200 60" fill="currentColor">
              {/* Snout */}
              <path d="M0,60 Q50,20 100,30 Q150,20 200,60 Z" />
              <path d="M10,60 Q50,30 100,40 Q150,30 190,60 Z" fill="#2E7D32" />
              {/* Eyes */}
              <circle cx="60" cy="30" r="5" fill="#FFAB00" />
              <rect x="59" y="28" width="1" height="4" fill="black" />
              <circle cx="140" cy="30" r="5" fill="#FFAB00" />
               <rect x="139" y="28" width="1" height="4" fill="black" />
               {/* Nostrils */}
               <circle cx="90" cy="45" r="2" fill="black" />
               <circle cx="110" cy="45" r="2" fill="black" />
          </svg>
      </motion.div>

      {/* 16. BATS (Hanging from top vines) */}
      <motion.div
        className="absolute top-10 right-12 w-8 h-8 text-white opacity-90"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
           <svg viewBox="0 0 50 50" fill="currentColor">
               <path d="M25,50 L10,30 Q0,40 10,20 L25,30 L40,20 Q50,40 40,30 Z" />
               <circle cx="20" cy="35" r="1" fill="red" />
               <circle cx="30" cy="35" r="1" fill="red" />
           </svg>
      </motion.div>

      {/* 17. CREEPY EYES (Red, Deep background) */}
      <motion.div
        className="absolute bottom-40 right-1/4 w-6 h-3 flex space-x-1 opacity-60"
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
      >
           <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_5px_red]"></div>
           <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_5px_red]"></div>
      </motion.div>

       {/* 18. CREEPY EYES (Yellow, Top Left background) */}
       <motion.div
        className="absolute top-32 left-12 w-4 h-2 flex space-x-1 opacity-40"
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
      >
           <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_3px_yellow]"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_3px_yellow]"></div>
      </motion.div>
    </div>
  );
}
