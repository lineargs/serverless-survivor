"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { getLeaderboard, getUserData } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import JungleAtmosphere from "@/components/JungleAtmosphere";
import JungleForeground from "@/components/JungleForeground";
import KongTitle from "@/components/KongTitle";

/**
 * @file leaderboard/page.tsx
 * @description Global Leaderboard (Campfire Roster).
 * distinct from the high-octane game loop, this page offers a view of top scores.
 * 
 * Security:
 * - Requires authentication to view.
 * - Forces nickname creation before access (redirects to game if missing).
 */

interface Survivor {
    id: string;
    displayName: string;
    totalScore: number;
    unlockedLevel: number;
}

export default function LeaderboardPage() {
  // State for list of survivors and local user verification status
  const router = useRouter();
    const [survivors, setSurvivors] = useState<Survivor[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const userRowRef = useRef<HTMLTableRowElement | null>(null);

    const searchParams = useSearchParams();
    const isDemo = searchParams.get("demo") === "true";

    useEffect(() => {
        if (isDemo) {
            setUser({ displayName: "Guest Survivor" } as User);
            setVerified(true);
        } else {
            const unsubscribe = onAuthStateChanged(auth, async (u) => {
                setUser(u);
                if (u) {
                    // Check if nickname is set
                    try {
                        const token = await u.getIdToken();
                        const res = await getUserData(token);
                        
                        // If nickname NOT set, bounce back to game
                        if (res.userData && !res.userData.nicknameSet) {
                            router.push("/game");
                        } else {
                            // Only confirm verification if check passes
                            setVerified(true);
                        }
                    } catch (e) {
                        console.error("Leaderboard Auth Check Failed", e);
                    }
                } else {
                     // No user, wait for redirect or handle outside
                }
            });
            return () => unsubscribe();
        }
    }, [isDemo, router]);

    // Effect: Load Leaderboard Data once verified
    useEffect(() => {
        // GATEKEEPING: Don't load anything until verified or demo
        if (!verified && !isDemo) return;

        if (isDemo) {
            setSurvivors([
                { id: "d1", displayName: "JungleKing", totalScore: 9999, unlockedLevel: 3 },
                { id: "d2", displayName: "PythonCharmer", totalScore: 8500, unlockedLevel: 3 },
                { id: "d3", displayName: "CloudNinja", totalScore: 7200, unlockedLevel: 2 },
                { id: "d4", displayName: "DockerWhale", totalScore: 6100, unlockedLevel: 2 },
                { id: "d5", displayName: "LambdaSpeed", totalScore: 4500, unlockedLevel: 1 },
            ]);
            setLoading(false);
            return;
        }

        async function loadLeaderboard() {
            setLoading(true);
            
            // SECURITY: Must have token now
            if (auth.currentUser) {
                try {
                    const token = await auth.currentUser.getIdToken();
                    const res = await getLeaderboard(token, 100);
                    
                    if (res.error || !res.leaderboard) {
                        console.error("Failed to load leaderboard:", res.error);
                        // If authorized but failed (e.g. server error), stop loading to show empty/error state
                        setLoading(false); 
                        return;
                    }
                    
                    const mapped = res.leaderboard.map((u: any) => ({
                        id: u.id,
                        displayName: u.displayName,
                        totalScore: u.totalScore,
                        unlockedLevel: u.unlockedLevel 
                    }));
                    setSurvivors(mapped);
                } catch(e) {
                     console.error("Start Leadboard Error", e);
                }
            }
            setLoading(false);
        }

        loadLeaderboard();
    }, [isDemo, verified]);

    // Auto-scroll to user row when data is loaded
    useEffect(() => {
        if (userRowRef.current) {
            setTimeout(() => {
               userRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [survivors, user]);



    async function handleSignOut() {
        if (!isDemo) {
            await signOut(auth);
        }
        router.push("/");
    }

    if (loading) {
        return (
            <>
                <JungleAtmosphere />
                <JungleForeground />
                <div className="flex items-center justify-center min-h-screen relative z-40">
                    <div className="text-survivor-terminal font-display text-2xl animate-pulse">Scanning Bio-Signatures...</div>
                </div>
            </>
        );
    }

    return (
        <>
        <JungleAtmosphere />
        <JungleForeground />

        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50 flex flex-col items-end space-y-2 pointer-events-none">
            <div className="text-survivor-gold font-mono text-xs md:text-sm tracking-widest uppercase">
                OPERATOR: {user?.displayName}
            </div>
            <button 
                onClick={handleSignOut}
                className="text-survivor-paper hover:text-survivor-alert font-mono text-xs md:text-sm tracking-widest transition-colors cursor-pointer pointer-events-auto"
            >
                [ ABORT MISSION ]
            </button>
        </div>

        <div className="min-h-screen p-4 md:p-12 flex flex-col items-center relative z-10">
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>

            <KongTitle text="CAMPFIRE ROSTER" className="text-3xl md:text-5xl font-display text-survivor-alert mb-8 drop-shadow-lg text-center" />
            
            <div className="w-full max-w-2xl bg-wood-dark border-4 border-wood p-1 shadow-2xl rounded-sm flex flex-col max-h-[70vh]">
                <div className="overflow-y-auto custom-scrollbar flex-grow">
                    <table className="w-full text-left font-mono text-sm md:text-base relative">
                        <thead className="sticky top-0 bg-wood-dark z-10 shadow-md">
                            <tr className="border-b-2 border-wood-light text-survivor-gold opacity-70">
                                <th className="py-3 px-4">RANK</th>
                                <th className="py-3 px-4">SURVIVOR</th>
                                <th className="py-3 px-4 text-right">LEVEL</th>
                                <th className="py-3 px-4 text-right">SCORE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {survivors.map((s, idx) => {
                                const isCurrentUser = user?.uid === s.id;
                                return (
                                    <tr 
                                        key={s.id} 
                                        ref={isCurrentUser ? userRowRef : null}
                                        className={`transition-colors ${isCurrentUser ? 'bg-survivor-gold/20 text-survivor-gold border-l-4 border-survivor-gold' : 'hover:bg-white/5 text-gray-300'}`}
                                    >
                                        <td className="py-3 px-4 opacity-70">#{idx + 1}</td>
                                        <td className={`py-3 px-4 font-bold truncate max-w-[150px] ${isCurrentUser ? 'text-white' : ''}`}>
                                            {s.displayName || 'Unknown'}
                                            {isCurrentUser && <span className="ml-2 text-[10px] uppercase tracking-wider opacity-50">[YOU]</span>}
                                        </td>
                                        <td className="py-3 px-4 text-right text-jungle-600">L{s.unlockedLevel || 1}</td>
                                        <td className="py-3 px-4 text-right text-survivor-terminal font-display">{s.totalScore}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                 
                 {survivors.length === 0 && (
                     <div className="text-center py-12 text-gray-500 font-mono">No survivors signal detected...</div>
                 )}
            </div>

            <div className="mt-8">
                 <Link href={isDemo ? "/game?demo=true" : "/game"} className="text-survivor-gold hover:text-white font-display text-sm underline decoration-wavy">
                    &lt; RETURN TO MISSION
                 </Link>
            </div>
        </div>
        </>
    );
}
