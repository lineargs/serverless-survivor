"use client";

import { useAuth } from "@/context/AuthContext"; // Use the hook
import { useRouter } from "next/navigation";
import Link from "next/link";
import JungleAtmosphere from "@/components/JungleAtmosphere";
import JungleForeground from "@/components/JungleForeground";
import KongTitle from "@/components/KongTitle";
import ActionCard from "@/components/ActionCard";
import SignInModal from "@/components/SignInModal";
import { motion } from "framer-motion";
import { useState } from "react";

/**
 * @file page.tsx (Home)
 * @description The landing page of the application.
 * Introduces the "Serverless Survivor" theme and handles initial authentication.
 * 
 * Features:
 * - Retro jungle aesthetic initialization
 * - Google Sign-In integration via Modal
 * - "Demo Mode" bypass for quick testing
 */

export default function Home() {
  const { user, loading } = useAuth(); // Global auth state
  const router = useRouter();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleSignInClick = () => {
    setShowSignInModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-survivor-terminal font-display animate-pulse">
        Initializing Survival Protocol...
      </div>
    );
  }

  // AuthContext handles the redirect if user is logged in, but we can return loading/null here just in case to prevent flash
  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-survivor-terminal font-display">
        Authenticating Survivor...
      </div>
    );
  }

  return (
    <>
      <JungleAtmosphere />
      <JungleForeground />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative z-10">
        
        <div className="max-w-4xl w-full text-center space-y-12">
          {/* ActionCard handles the container animation and hover. */}
          <ActionCard className="card-retro max-w-4xl w-full mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="mb-8 flex flex-col items-center space-y-2">
                 <KongTitle text="THE SERVERLESS" className="text-2xl md:text-4xl text-arcade text-survivor-gold tracking-widest" />
                 <KongTitle text="SURVIVOR" className="text-4xl md:text-7xl text-arcade text-survivor-gold tracking-widest mt-2" />
            </div>
            
            <p className="font-body text-survivor-paper text-lg md:text-xl tracking-wider mb-8 font-bold text-center">
              Can you survive the Google Cloud Jungle?
            </p>

            <div className="space-y-6 flex flex-col items-center">
               <div className="p-4 bg-jungle-800 border-2 border-jungle-600 font-mono text-xs md:text-sm text-survivor-terminal shadow-inner w-full max-w-lg mb-4">
                  <p className="mb-2">&gt; MISSION_BRIEFING: CONNECTED</p>
                  <p className="mb-2">&gt; TARGET: SURVIVE 3 LEVELS</p>
                  <p className="animate-pulse">&gt; STATUS: AWAITING AUTH...</p>
               </div>

              <motion.button
                onClick={handleSignInClick}
                animate={{
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.1 }
                }}
                whileTap={{ scale: 0.95 }}
                className="btn-retro btn-retro-primary text-base md:text-lg w-full md:w-auto"
              >
                Sign in to Start Mission
              </motion.button>

              <div className="pt-2">
                  <button onClick={() => router.push('/game?demo=true')} className="text-[#5D4037] font-mono text-xs hover:text-survivor-alert underline decoration-dotted cursor-pointer hover:font-bold transition-all">
                      [ BYPASS SECURITY: ENTER DEMO MODE ]
                  </button>
              </div>
            </div>
          </ActionCard>
        </div>
        
      </main>

      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)}
      />

      <div className="fixed top-4 right-4 z-[50] pointer-events-auto">
          <Link href="/about">
              <span className="text-xs md:text-sm font-mono text-survivor-gold/80 hover:text-survivor-gold cursor-pointer tracking-widest decoration-dotted underline hover:decoration-solid transition-all">
                  [ ABOUT_MISSION ]
              </span>
          </Link>
      </div>

      <div className="fixed bottom-2 right-2 md:bottom-4 md:right-4 z-[50] text-right pointer-events-auto">
         <p className="text-[10px] font-display text-survivor-gold/80 drop-shadow-md">
            CREATED BY <a href="https://lineargs.dev" target="_blank" rel="noopener noreferrer" className="text-white hover:text-survivor-warning transition-colors cursor-pointer ml-1">GORAN MINOV</a>
         </p>
      </div>
    </>
  );
}
