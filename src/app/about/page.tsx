"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import JungleAtmosphere from "@/components/JungleAtmosphere";
import JungleForeground from "@/components/JungleForeground";
import KongTitle from "@/components/KongTitle";
import ActionCard from "@/components/ActionCard";

/**
 * @file about/page.tsx
 * @description The "Mission Data" page (About).
 * Provides background lore, game rules, and technical architecture details.
 * Accessible publicly to explain the project.
 */

export default function About() {
  return (
    <>
      <JungleAtmosphere />
      <JungleForeground />
      
      <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-12 relative z-10 overflow-y-auto">
        
        <div className="w-full max-w-5xl space-y-8 pb-24">
            {/* Header */}
            <div className="text-center space-y-4 pt-8">
                <KongTitle text="MISSION DATA" className="text-3xl md:text-5xl text-arcade text-survivor-gold tracking-widest" />
                <p className="font-mono text-survivor-terminal text-sm md:text-base tracking-wider animate-pulse">
                    &gt; ACCESSING CLASSIFIED FILES...
                </p>
            </div>

            {/* Mission Briefing */}
            <ActionCard className="card-retro transform hover:scale-[1.01] transition-transform duration-300">
                <h2 className="text-2xl font-display text-survivor-gold mb-4 border-b-2 border-survivor-gold/30 pb-2">
                    &gt; MISSION_BRIEFING
                </h2>
                <div className="font-body text-survivor-paper space-y-4 leading-relaxed">
                    <p>
                        <strong className="text-white">The Serverless Survivor</strong> is a retro-futuristic survival challenge designed to test your resilience in the unforgiving <strong>Google Cloud Jungle</strong>.
                    </p>
                    <p>
                        Dropped into a wild ecosystem of managed services and serverless functions, you play as a <strong>Survivor</strong> seeking to navigate the chaos. Your mission? To master the terrain, outsmart the <strong>Proprietary Monoliths</strong>, and harness the power of the Cloud to build a scalable sanctuary.
                    </p>
                    <p>
                        Guided only by your wits and a mysterious signal known as <strong>"The Documentation"</strong>, you must solve architectural puzzles to survive.
                    </p>
                </div>
            </ActionCard>

            {/* Survival Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ActionCard className="card-retro h-full">
                    <h2 className="text-xl font-display text-survivor-gold mb-4 border-b-2 border-survivor-gold/30 pb-2">
                        &gt; SURVIVAL_GUIDE
                    </h2>
                    <div className="font-body text-survivor-paper space-y-4 text-sm">
                        <p>
                            Your survival depends on answering a series of <strong>10 survival scenarios per level</strong>, each focusing on using Google Cloud Serverless services to survive properly.
                        </p>
                        <ul className="list-disc list-inside space-y-2 marker:text-survivor-gold">
                            <li><strong>Level 1:</strong> The Beach Landing</li>
                            <li><strong>Level 2:</strong> The Deep Jungle</li>
                            <li><strong>Level 3:</strong> The Volcano Escape Signal</li>
                        </ul>
                        <p>
                            Decipher the clues, choose the right architecture, and build your solution to progress. Correct answers earn you <strong>Survival Points</strong>. Speed and accuracy climb you higher on the <strong>Survivor Leaderboard</strong>.
                        </p>
                        <p className="text-xs text-survivor-gold/80 italic border-t border-survivor-gold/20 pt-2 mt-2">
                             * Levels must be unlocked sequentially. You can replay any level to improve your score, but only your highest score for each level counts.
                        </p>
                    </div>
                </ActionCard>

                <ActionCard className="card-retro h-full">
                    <h2 className="text-xl font-display text-survivor-gold mb-4 border-b-2 border-survivor-gold/30 pb-2">
                        &gt; TARGET_OPERATIVES
                    </h2>
                    <div className="font-body text-survivor-paper space-y-4 text-sm">
                        <p>
                            This challenge is open for:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-survivor-gold mr-2">➜</span>
                                <div>
                                    <strong>Cloud Architects</strong> eager to prove their mastery over the infrastructure.
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="text-survivor-gold mr-2">➜</span>
                                <div>
                                    <strong>Full Stack Developers</strong> wanting to explore the serverless wilderness.
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="text-survivor-gold mr-2">➜</span>
                                <div>
                                    <strong>Adventurers</strong> who enjoy a challenge with a retro-gaming twist.
                                </div>
                            </li>
                        </ul>
                    </div>
                </ActionCard>
            </div>

            {/* System Architecture */}
            <ActionCard className="card-retro">
                <h2 className="text-xl font-display text-survivor-gold mb-4 border-b-2 border-survivor-gold/30 pb-2">
                    &gt; SYSTEM_ARCHITECTURE
                </h2>
                <div className="font-mono text-xs md:text-sm text-survivor-terminal space-y-4 bg-black/40 p-4 rounded border border-jungle-600">
                    <p className="mb-2">
                        // THE GAME RUNS ON A SERVERLESS STACK
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-survivor-gold">FRONTEND:</span> Next.js (App Router) on App Hosting
                        </div>
                        <div>
                            <span className="text-survivor-gold">DATABASE:</span> Cloud Firestore
                        </div>
                        <div>
                            <span className="text-survivor-gold">AI CORE:</span> Vertex AI (Gemini 2.5 Flash)
                        </div>
                        <div>
                            <span className="text-survivor-gold">AUTH:</span> Firebase Authentication
                        </div>
                    </div>
                    <p className="mt-4 pt-4 border-t border-jungle-600/50 italic text-survivor-paper/60">
                        "Built with the speed of a cheetah and the scale of the cloud."
                    </p>
                </div>
            </ActionCard>

            <div className="text-center pt-8">
                 <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-retro text-sm md:text-base px-8 py-4"
                    >
                        &lt; RETURN TO BASE CAMP
                    </motion.button>
                 </Link>
            </div>

        </div>
      </main>
    </>
  );
}
