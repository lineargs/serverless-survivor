"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, getDocsFromServer, doc, getDocFromServer } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { submitAnswer, startLevel, finalizeLevel, getQuestions, getUserData, setNickname } from "@/app/actions";
import JungleAtmosphere from "@/components/JungleAtmosphere";
import JungleForeground from "@/components/JungleForeground";
import KongTitle from "@/components/KongTitle";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "@/components/Confetti";

/**
 * @file game/page.tsx
 * @description Main Game Loop Controller.
 * Manages the entire gameplay state machine:
 * - LOADING: Fetching user data/questions
 * - LEVEL_SELECT: Displaying unlocked levels
 * - PLAYING: Active quiz session with timer
 * - FEEDBACK: Correct/Incorrect result display
 * - FINISHED: Level completion screen
 * 
 * Handles interactions with Server Actions for secure validation.
 */

export const dynamic = "force-dynamic";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number; // Only used in demo mode client-side
}

function GameContent() {
  // State Management: User Profile & Game Progress
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  // maxLevel is the highest level the user has unlocked based on Firestore
  const [maxLevel, setMaxLevel] = useState(1);
  // currentLevel is the level currently being played
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Refactored Score State
  const [totalScore, setTotalScore] = useState(0); // Career Score (from Firestore)
  const [pendingScore, setPendingScore] = useState(0); // Current Level Score (starts at 0) 
  
  const [gameState, setGameState] = useState<"LOADING" | "LEVEL_SELECT" | "PLAYING" | "FEEDBACK" | "FINISHED">("LOADING");
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string; scoreDelta: number } | null>(null);

  /* New Sync Error State */
  const [syncError, setSyncError] = useState(false);
  
  /* Nickname Modal State */
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Auth & User Level Fetch
  // Listens for Firebase Auth state changes and syncs with Firestore data.
  useEffect(() => {
    if (isDemo) {
        setUser({ 
            uid: "demo-guest", 
            displayName: "Guest Survivor", 
            email: "guest@example.com",
            emailVerified: true,
            isAnonymous: true,
            providerData: [],
            metadata: {},
            refreshToken: "",
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => "",
            getIdTokenResult: async () => ({} as any),
            reload: async () => {},
            toJSON: () => ({}),
            phoneNumber: null,
            photoURL: null,
            providerId: "demo"
        } as any); 
        setCurrentLevel(1);
        setTotalScore(0);
        setGameState("LEVEL_SELECT");
        setLoading(false);
        return; 
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/");
        return;
      }
      setUser(u);
      
      try {
          // Force server fetch to reset any stale user state
          // Force server fetch via Secure Action
          const token = await u.getIdToken();
          const res = await getUserData(token);
          
          if (res.error || !res.userData) {
              console.error("Failed to fetch user data:", res.error);
              setMaxLevel(1);
              setTotalScore(0);
              setGameState("LEVEL_SELECT");
          } else {
              setMaxLevel(res.userData.unlockedLevel);
              setTotalScore(res.userData.totalScore);

              if (!res.userData.nicknameSet) {
                  setShowNicknameModal(true);
                  // Do NOT set GameState to LEVEL_SELECT Yet
              } else {
                  setGameState("LEVEL_SELECT");
              }
          }
      } catch (error) {
          console.error("Failed to fetch user data:", error);
          // Fallback to defaults so user can play
          setMaxLevel(1);
          setTotalScore(0);
          setGameState("LEVEL_SELECT");
      } finally {
          setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, isDemo]);



  /**
   * Fetches questions for the selected level.
   * Handles both "Demo Mode" (static local data) and "Live Mode" (server-side secure fetch).
   * @param level - The level number to load (1-3)
   */
  async function fetchQuestions(level: number) {
      setGameState("LOADING");
      setCurrentLevel(level);
      setPendingScore(0); // Reset pending score

      if (isDemo) {
          await new Promise(r => setTimeout(r, 1000)); 
          
          let demoQs: Question[] = [];
          
          if (level === 1) {
             demoQs = [
              { id: "d1-1", text: "L1: What runs without legs but creates latency?", options: ["A Database Join", "A Cold Start", "A Memory Leak", "A Docker Container"], correctAnswer: 1 },
              { id: "d1-2", text: "L1: Which beast guards the Gateway?", options: ["Cloud Armor", "The Load Balancer", "API Gateway", "Identity Aware Proxy"], correctAnswer: 0 },
              { id: "d1-3", text: "L1: What is the best way to survive a traffic spike?", options: ["Auto-Scaling", "Praying", "Manual Provisioning", "Turning it off"], correctAnswer: 0 }
             ];
          } else if (level === 2) {
             demoQs = [
              { id: "d2-1", text: "L2: Where do lost logs go to die?", options: ["/dev/null", "Cloud Logging", "The Console", "Stack Overflow"], correctAnswer: 0 },
              { id: "d2-2", text: "L2: What is the most dangerous predator?", options: ["Infinite Loops", "OOM Errors", "Billing Alerts", "Spiders"], correctAnswer: 2 },
              { id: "d2-3", text: "L2: How do you escape a deadlock?", options: ["Kill process", "Restart", "Timeout", "Wait forever"], correctAnswer: 2 }
             ];
          } else {
             demoQs = [
              { id: "d3-1", text: "L3: The Temple of Production requires a sacrifice...", options: ["A deploy on Friday", "Unit Tests", "Documentation", "Sleep"], correctAnswer: 3 },
              { id: "d3-2", text: "L3: Who holds the keys to the kingdom?", options: ["IAM", "Root", "Admin", "The Intern"], correctAnswer: 0 },
              { id: "d3-3", text: "L3: What is the ultimate survival tool?", options: ["Kubernetes", "Coffee", "Git", "Backup Strategy"], correctAnswer: 3 }
             ];
          }

          setQuestions(demoQs);
          setQuestionIndex(0);
          setGameState("PLAYING");
          return;
      }

      if (user) {
          const token = await user.getIdToken();
          
          // 1. Start session
          const startRes = await startLevel(token, level);
          if (startRes.error) {
              alert(startRes.error);
              setGameState("LEVEL_SELECT");
              return;
          }

          // 2. Secure Fetch (Server-Side)
          const qRes = await getQuestions(token, level);
          if (qRes.error || !qRes.questions) {
             alert(qRes.error || "Failed to load questions");
             setGameState("LEVEL_SELECT");
             return;
          }

          setQuestions(qRes.questions);
          setQuestionIndex(0);
          setGameState("PLAYING");
      }
  }

  // 2. Timer Logic
  useEffect(() => {
    if (gameState === "PLAYING") {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, questionIndex]);

  function handleTimeOut() {
    if (timerRef.current) clearInterval(timerRef.current);
    handleAnswer(-1); 
  }

  // 3. Answer Submission
  // Submits the selected answer index to the server for verification.
  async function handleAnswer(index: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!user) return;

    const currentQ = questions[questionIndex];
    console.log("Submitting Answer for:", { 
        questionId: currentQ?.id, 
        index, 
        level: currentLevel,
        questionIndex 
    });

    if (isDemo) {
        const isCorrect = currentQ.correctAnswer === index;
        const pts = isCorrect ? (100 + Math.floor(timeLeft * 0.5)) : 0;

        setFeedback({
            correct: isCorrect,
            explanation: isCorrect ? "Excellent survival instinct!" : "The jungle adapts... and you didn't.",
            scoreDelta: pts
        });

        if (isCorrect) setPendingScore(s => s + pts); // Update Pending
        
        setGameState("FEEDBACK");
        // REMOVED: setTimeout(() => nextQuestion(), 4000);
        return;
    }

    // Pass display name so it gets saved to Firestore for Leaderboard
    const token = await user.getIdToken();
    const result = await submitAnswer(token, currentQ.id, index, timeLeft, currentLevel);
    
    if (result.error) {
        console.error("Submit Answer Error:", result.error);
        if (result.error === "Question not found") {
            setSyncError(true);
            return;
        }
        alert("Transmission Failed: " + result.error);
        return;
    }

    setFeedback({
        correct: !!result.correct,
        explanation: result.explanation || "",
        scoreDelta: result.scoreDelta || 0
    });
    
    if (result.correct) {
        setPendingScore(s => s + (result.scoreDelta || 0)); // Update Pending
        // If they passed the level (backend logic handles this, but we update UI if needed)
        // For simple game loop, we just add score.
    }

    setGameState("FEEDBACK");
    
    // REMOVED: setTimeout(() => { nextQuestion(); }, 4000);
  }

  function nextQuestion() {
      if (questionIndex + 1 >= questions.length) {
          // Level Completed!
          // We just show the finish screen. Finalize happens on button click.
          setGameState("FINISHED");
      } else {
          setQuestionIndex(prev => prev + 1);
          setGameState("PLAYING");
          setFeedback(null);
      }
  }

  /**
   * Captures the user's nickname and saves it to Firestore/Auth Profile.
   * Required for leaderboard participation.
   */
  async function handleSetNickname() {
    if (!user) return;
    
    if (nicknameInput.length < 3) {
      setNicknameError("TOO SHORT (MIN 3 CHARS)");
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await setNickname(token, nicknameInput);
      
      if (res.error) {
        setNicknameError(res.error.toUpperCase());
      } else {
        setShowNicknameModal(false);
        setGameState("LEVEL_SELECT");
      }
    } catch (e) {
      console.error("Set Nickname Error", e);
      setNicknameError("CONNECTION FAILED. RETRY.");
    }
  }

  async function handleLevelComplete() {
      setLoading(true);
      if (user && !isDemo) {
          const token = await user.getIdToken();
          await finalizeLevel(token, currentLevel);
      }
      // Reload to ensure fresh state (unlocked levels) from server
      window.location.href = "/game";
  }

  async function handleSignOut() {
      if (!isDemo) {
          await signOut(auth);
      }
      router.push("/");
  }

  const handleSyncReload = () => {
      window.location.reload();
  };

  // RENDER HELPERS

  return (
    <>
      <JungleAtmosphere />
      <JungleForeground />
      
      <AnimatePresence mode="wait">
        {(gameState === "LOADING" || loading) && (
             <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center min-h-screen relative z-40"
            >
                <div className="text-survivor-terminal font-display text-2xl animate-pulse">Scanning Bio-Signature...</div>
            </motion.div>
        )}

        {/* Sync Error Modal */}
        {syncError && (
             <motion.div 
                key="sync-error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
             >
                 <div className="bg-wood border-4 border-survivor-alert p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-shake">
                     <h2 className="text-3xl text-survivor-alert font-display tracking-widest">TRANSMISSION LOST</h2>
                     <p className="font-body text-gray-300">
                         The jungle has shifted. These coordinates are no longer valid.
                         <br/><br/>
                         <span className="text-sm font-mono text-survivor-alert opacity-80">[Error: Question Not Found]</span>
                     </p>
                     <button 
                        onClick={handleSyncReload}
                        className="btn-retro bg-survivor-alert text-black hover:bg-red-500 w-full"
                     >
                        RE-SYNC MISSION DATA
                     </button>
                 </div>
             </motion.div>
        )}

        {gameState === "LEVEL_SELECT" && (
            <motion.div 
                key="level-select"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative min-h-screen"
            >
                <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50 flex flex-col items-end space-y-2 pointer-events-none">
                    <div className="text-survivor-gold font-mono text-xs md:text-sm tracking-widest uppercase">
                        OPERATOR: {user?.displayName}
                    </div>
                    <Link 
                        href="/about" 
                        className="text-survivor-paper hover:text-survivor-gold font-mono text-xs md:text-sm tracking-widest transition-colors cursor-pointer pointer-events-auto"
                    >
                        [ MISSION DATA ]
                    </Link>
                    <button 
                        onClick={handleSignOut}
                        className="text-survivor-paper hover:text-survivor-alert font-mono text-xs md:text-sm tracking-widest transition-colors cursor-pointer pointer-events-auto"
                    >
                        [ ABORT MISSION ]
                    </button>
                </div>

                <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative z-40 max-w-4xl mx-auto space-y-8">
                    
                    <div className="text-center space-y-4">
                        <div className="flex flex-col items-center">
                            <KongTitle text="SELECT" className="text-3xl md:text-5xl text-arcade text-survivor-gold tracking-widest" />
                            <KongTitle text="MISSION" className="text-4xl md:text-6xl text-arcade text-survivor-gold tracking-widest mt-2" />
                        </div>
                        <p className="text-survivor-paper font-body text-sm md:text-base tracking-wider">Choose your survival path, {user?.displayName}</p>
                        
                        <div className="pt-4">
                             <span className="inline-block bg-black/60 text-survivor-gold px-4 py-1 rounded-full font-display text-sm border border-survivor-gold/30 shadow-sm">
                                TOTAL SCORE: {totalScore}
                             </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {[1, 2, 3].map((level) => {
                            const isLocked = level > maxLevel;
                            return (
                                <motion.div 
                                    key={level} 
                                    whileHover={!isLocked ? { scale: 1.05 } : {}}
                                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                                    className={`card-retro flex flex-col items-center justify-between h-64 ${isLocked ? 'opacity-60 grayscale' : 'cursor-pointer'}`}
                                    onClick={() => !isLocked && fetchQuestions(level)}
                                >
                                    <div className="text-center">
                                        <h2 className="text-2xl font-display text-survivor-gold mb-2">LEVEL {level}</h2>
                                        <p className="font-mono text-xs text-survivor-paper">
                                            {level === 1 && "Jungle Periphery"}
                                            {level === 2 && "Deep Canopy"}
                                            {level === 3 && "The Lost Temple"}
                                        </p>
                                    </div>
                                    
                                    {isLocked ? (
                                        <div className="text-5xl text-wood-dark">🔒</div>
                                    ) : (
                                        <div className="text-5xl text-survivor-terminal animate-pulse">⚡</div>
                                    )}

                                    <button 
                                        disabled={isLocked}
                                        className={`w-full py-2 font-display text-xs ${isLocked ? 'bg-wood-dark text-wood-light cursor-not-allowed' : 'btn-retro btn-retro-primary pointer-events-none'}`}
                                    >
                                        {isLocked ? "RESTRICTED" : "START"}
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>

                    <button 
                        onClick={() => router.push(isDemo ? '/leaderboard?demo=true' : '/leaderboard')}
                        className="flex items-center space-x-2 text-survivor-gold hover:text-white transition-colors border-b-2 border-transparent hover:border-survivor-gold cursor-pointer"
                    >
                        <span className="font-display text-sm">VIEW GLOBAL LEADERBOARD</span>
                    </button>
                </div>
            </motion.div>
        )}

        {gameState === "FINISHED" && (
            <motion.div 
                key="finished"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen bg-black/80 p-8 flex flex-col items-center justify-center text-center space-y-8 relative z-40"
            >
                <Confetti />
                <h1 className="text-4xl text-survivor-gold font-display animate-bounce">MISSION COMPLETE</h1>
                <div className="bg-wood p-8 border-4 border-wood-dark shadow-2xl">
                    <p className="font-body text-white mb-4">You survived Level {currentLevel}</p>
                    <p className="text-2xl text-survivor-terminal font-mono">Level Score: {pendingScore}</p>
                </div>
                <div className="flex space-x-4">
                    <button onClick={handleLevelComplete} className="btn-retro btn-retro-primary px-8 py-3 text-lg hover:scale-105 transition-transform">
                        CONTINUE MISSION
                    </button>
                </div>
            </motion.div>
        )}

        {(gameState === "PLAYING" || gameState === "FEEDBACK") && (
            <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative min-h-screen"
            >
                <div className="min-h-screen p-4 md:p-8 flex flex-col items-center relative z-40 max-w-3xl mx-auto">
                    {/* HUD */}
                    <div className="w-full flex justify-between items-end mb-8 border-b-2 border-jungle-600 pb-4">
                        <div className="text-left">
                            <p className="text-xs text-jungle-600 font-mono">OPERATOR</p>
                            <p className="text-wood-light font-display">{user?.displayName}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-jungle-600 font-mono">LEVEL</p>
                            <p className="text-survivor-gold font-display text-xl">L{currentLevel}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-jungle-600 font-mono">PENDING</p>
                            <p className="text-survivor-terminal font-display">{pendingScore}</p>
                        </div>
                    </div>

                    {/* HEALTH BAR (TIMER) */}
                    <div className="w-full bg-black h-4 mb-8 border border-jungle-600 relative overflow-hidden rounded">
                        <div 
                            className="h-full bg-survivor-warning transition-all duration-1000 ease-linear"
                            style={{ width: `${(timeLeft / 30) * 100}%` }}
                        />
                    </div>

                    {/* QUESTION CRATE */}
                    {questions[questionIndex] ? (
                        gameState === "FEEDBACK" && feedback ? (
                            <motion.div 
                                key="feedback"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`w-full p-8 border-4 ${feedback.correct ? 'border-survivor-terminal bg-jungle-800' : 'border-survivor-alert bg-wood-dark animate-shake'} shadow-2xl text-center space-y-4`}
                            >
                                <h2 className={`text-2xl font-display ${feedback.correct ? 'text-survivor-terminal' : 'text-survivor-alert'}`}>
                                    {feedback.correct ? "SUPPLY CRATE UNLOCKED" : "TRAP TRIGGERED"}
                                </h2>
                                <div className="font-body text-gray-300">
                                    {feedback.explanation}
                                </div>
                                {feedback.correct && <div className="text-survivor-gold text-xl font-display">+{feedback.scoreDelta} PTS</div>}
                                
                                <button 
                                    onClick={() => nextQuestion()}
                                    className="btn-retro bg-survivor-gold text-black hover:bg-yellow-400 w-full mt-4"
                                >
                                    CONTINUE MISSION
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key={questionIndex}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="w-full bg-wood border-4 border-wood-dark p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.6)] relative"
                            >
                                <div className="absolute top-0 left-0 bg-wood-dark px-4 py-1 text-xs text-wood-light font-mono">
                                    Q-{questionIndex + 1}/{questions.length}
                                </div>
                                <h2 className="text-base md:text-lg font-body font-bold text-white mb-8 mt-4 leading-relaxed">
                                    {questions[questionIndex].text}
                                </h2>

                                <div className="grid grid-cols-1 gap-4">
                                    {questions[questionIndex].options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className="cursor-pointer bg-jungle-800 text-left px-6 py-4 border-2 border-jungle-600 text-gray-200 hover:text-survivor-gold hover:border-survivor-gold hover:bg-jungle-700 transition-all font-mono text-sm md:text-base group"
                                        >
                                            <span className="text-jungle-600 group-hover:text-survivor-gold mr-3">[{String.fromCharCode(65+idx)}]</span>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    ) : (
                        <div>No Questions Found</div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNicknameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-wood-dark border-4 border-wood p-8 rounded-lg shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              {/* Jungle Vines Decoration */}
              <div className="absolute top-0 left-0 w-full h-4 bg-jungle-800 opacity-50" />
              
              <h2 className="text-2xl md:text-3xl font-display text-survivor-gold mb-4 text-center drop-shadow-md">
                IDENTIFY YOURSELF
              </h2>
              
              <p className="text-survivor-paper font-mono text-sm mb-6 text-center leading-relaxed">
                To enter the jungle, you must choose a callsign. This will be your permanent handle on the <span className="text-survivor-alert">Global Roster</span>.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="ENTER CALLSIGN..."
                  className="w-full bg-black/50 border-2 border-jungle-600 text-white font-mono p-3 text-center uppercase tracking-widest focus:border-survivor-gold focus:outline-none transition-colors"
                  maxLength={15}
                />
                
                {nicknameError && (
                   <div className="text-red-500 font-mono text-xs text-center animate-pulse">
                     {nicknameError}
                   </div>
                )}

                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleSetNickname}
                    className="w-full bg-survivor-gold text-black font-display text-xl py-3 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                  >
                    CONFIRM IDENTITY
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-survivor-paper hover:text-survivor-alert font-mono text-xs uppercase tracking-widest transition-colors py-2 cursor-pointer"
                  >
                    [ ABORT MISSION / LOGOUT ]
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-center opacity-50 text-[10px] font-mono text-survivor-paper uppercase">
                Warning: Identity cannot be changed later.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-2 right-2 md:bottom-4 md:right-4 z-[50] text-right pointer-events-auto">
         <p className="text-[10px] font-display text-survivor-gold/80 drop-shadow-md">
            CREATED BY <a href="https://lineargs.dev" target="_blank" rel="noopener noreferrer" className="text-white hover:text-survivor-warning transition-colors cursor-pointer ml-1">GORAN MINOV</a>
         </p>
      </div>
    </>
  );
}

/**
 * Game Page Wrapper
 * Wraps the content in Suspense to handle useSearchParams usage in Next.js.
 */
export default function GamePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-jungle-900 flex items-center justify-center text-survivor-terminal font-display animate-pulse">Loading Mission...</div>}>
            <GameContent />
        </Suspense>
    );
}
