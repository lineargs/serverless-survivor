"use server";

/**
 * @file actions.ts
 * @description Server Actions for "The Serverless Survivor".
 * Handles game logic, secure data fetching, and score submission.
 * Validates user sessions and enforces game rules (like level locking).
 */

import { adminDb, adminAuth } from "@/lib/firebase-admin";
// import { geminiModel } from "@/lib/vertex"; // We will import this dynamically or ensure it works on server.
// Note: @google-cloud/vertexai might need Node environment. Next.js Server Actions run in Node.

import { FieldValue } from "firebase-admin/firestore";

// Define Question Interface
interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  weight?: number; // default 10
}

interface QuestionData extends Question {
    level: number;
}

// ---------------------------------------------------------
// Secure Backend Logic: submitAnswer
// ---------------------------------------------------------
// ---------------------------------------------------------
// Secure Backend Logic
// ---------------------------------------------------------

// Helper to verify token
async function verifyUser(token: string) {
    if (!token) return null;
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded.uid;
    } catch (e) {
        console.error("Token verification failed", e);
        return null;
    }
}

// Helper to verify token AND nickname enforcement
async function verifyUserStrict(token: string) {
    const userId = await verifyUser(token);
    if (!userId) return null;

    // 1. Fetch user document to check 'nicknameSet' flag
    const userRef = adminDb.collection("users").doc(userId);
    const snap = await userRef.get();
    
    // 2. Gatekeeping: User must have set a nickname to perform sensitive actions
    if (!snap.exists || !snap.data()?.nicknameSet) {
        console.warn(`[Security] Blocked access for user ${userId} (No Nickname)`);
        return null;
    }

    return userId;
}

/**
 * Verification helper to ensure user is authenticated and has a nickname set.
 * @param token - Firebase ID token
 * @returns {Promise<string|null>} User ID if valid, null otherwise
 */
// 1. Start Level: Resets pending score and verifies access
export async function startLevel(token: string, level: number) {
    // 1. Authentication Check
    const userId = await verifyUserStrict(token);
    if (!userId) return { error: "Unauthorized: Setup Required" };

    console.log(`[Server] startLevel: userId=${userId}, level=${level}`);

    // 2. Verify Level Access (Prevent skipping levels)
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    
    // Default unlocked level is 1
    const currentUnlocked = userSnap.exists ? (userSnap.data()?.unlockedLevel || 1) : 1;

    console.log(`[Server] startLevel check: locked=${level > currentUnlocked}, currentUnlocked=${currentUnlocked}`);

    if (!Number.isInteger(level) || level < 1 || level > currentUnlocked) {
        return { error: "Level Locked" };
    }

    // 3. Session Initialization
    // Reset pending score to 0 to prevent carrying over points from previous attempts
    // This ensures only the current run counts towards verification
    await userRef.set({
        pendingScore: 0,
        currentLevel: level,
        answeredQuestions: [],
        currentStartTimestamp: FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true };
}

/**
 * Submits an answer for validation.
 * Calculates score based on correctness, time remaining, and question weight.
 * Accumulates score into a temporary 'pendingScore' field.
 * 
 * @param token - User ID token
 * @param userDisplayName - Current display name
 * @param questionId - ID of the question answered
 * @param selectedIndex - Index of the option selected
 * @param timeLeft - Seconds remaining (used for speed bonus)
 * @param level - Current level
 */
// 2. Submit Answer: Accumulates to pendingScore
export async function submitAnswer(
  token: string,
  questionId: string,
  selectedIndex: number,
  timeLeft: number,
  level: number
) {
  // 1. Authorize User
  const userId = await verifyUserStrict(token);
  if (!userId) return { error: "Unauthorized: Setup Required" };

  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return { error: "User not found" };
    }

    const userData = userSnap.data();
    const currentUnlocked = Number(userData?.unlockedLevel) || 1;

    if (!Number.isInteger(level) || level < 1 || level > currentUnlocked) {
      return { error: "Level Locked" };
    }

    // 2. Fetch Question Data (Source of Truth)
    const questionRef = adminDb.collection("questions").doc(questionId);
    const questionSnap = await questionRef.get();

    if (!questionSnap.exists) {
      return { error: "Question not found" };
    }

    const question = questionSnap.data() as QuestionData;
    const questionLevel = Number(question.level);

    if (!Number.isInteger(questionLevel) || questionLevel < 1 || questionLevel > currentUnlocked) {
      return { error: "Level Locked" };
    }

    if (questionLevel !== level) {
      return { error: "Invalid level for question" };
    }

    if (userData?.currentLevel !== undefined && userData?.currentLevel !== null && Number(userData.currentLevel) !== questionLevel) {
      return { error: "Invalid active level session" };
    }

    const answeredQuestions: string[] = Array.isArray(userData?.answeredQuestions)
      ? userData.answeredQuestions
      : [];

    if (answeredQuestions.includes(questionId)) {
      return { error: "Question already answered" };
    }

    if (answeredQuestions.length >= 10) {
      return { error: "Maximum questions for level reached" };
    }

    if (typeof timeLeft !== "number" || !Number.isFinite(timeLeft) || timeLeft < 0 || timeLeft > 30) {
      return { error: "Invalid time remaining" };
    }

    // 3. Validation Logic
    const isCorrect = question.correctIndex === selectedIndex;
    const weight = Number(question.weight) || 10;

    let scoreDelta = 0;
    const levelMultiplier = questionLevel;

    // 4. Scoring Algorithm
    if (isCorrect) {
      const safeTimeLeft = Math.max(0, Math.min(30, Math.floor(timeLeft)));
      // Speed Bonus: 1 pt for every 2 seconds remaining
      const speedBonus = safeTimeLeft > 0 ? Math.floor(safeTimeLeft / 2) : 0;
      scoreDelta = (weight * levelMultiplier) + speedBonus;
    }

    // Force integer for Firestore safety
    scoreDelta = Math.round(Number(scoreDelta));

    console.log(`[Server] submitAnswer: u=${userId} delta=${scoreDelta}`);

    // 5. Update State
    // Only increment PENDING score. This prevents users from spamming endpoints to boost total score.
    // Total score is only updated at the end of the level via finalizeLevel.
    // NOTE: We do NOT update displayName here to preserve the anonymized nickname.
    await userRef.set({
        pendingScore: FieldValue.increment(scoreDelta),
        answeredQuestions: [...answeredQuestions, questionId],
        lastPlayed: FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      correct: isCorrect,
      correctIndex: question.correctIndex, // Reveal correct answer
      explanation: question.explanation,   // Provide educational context
      scoreDelta,
      newTotalScore: 0 // Placeholder, not used in UI currently
    };

  } catch (error) {
    console.error("submitAnswer Error:", error);
    return { error: "Internal Server Error" };
  }
}

/**
 * Finalizes the level session.
 * Compares 'pendingScore' against the user's previous best for this level.
 * Updates 'totalScore' only if the new score helps beat the personal best.
 * Unlocks the next level if applicable.
 */
// 3. Finalize Level: Commits pending score to total IF it beats previous best
export async function finalizeLevel(token: string, level: number) {
    const userId = await verifyUserStrict(token);
    if (!userId) return { error: "Unauthorized: Setup Required" };

    console.log(`[Server] finalizeLevel called: userId=${userId}, level=${level}`);

    const userRef = adminDb.collection("users").doc(userId);
    
    try {
        const docSnap = await userRef.get();
        if (!docSnap.exists) {
            console.error("[Server] finalizeLevel: User doc not found");
            return { error: "User not found" };
        }

        const data = docSnap.data();
        const pending = Number(data?.pendingScore) || 0;
        const currentUnlocked = Number(data?.unlockedLevel) || 1;

        if (!Number.isInteger(level) || level < 1 || level > currentUnlocked) {
            return { error: "Level Locked" };
        }

        if (data?.currentLevel !== undefined && data?.currentLevel !== null && Number(data.currentLevel) !== level) {
            return { error: "Invalid level session" };
        }
        
        // Safely parse levelScores map to track PB per level
        const levelScores = data?.levelScores || {};
        const previousBest = Number(levelScores[level.toString()]) || 0;

        console.log(`[Server] Finalize: Pending=${pending}, PrevBest=${previousBest} for Level ${level}`);

        let updates: any = {
            pendingScore: 0, // Cleanup: Always reset pending score after finalization
            answeredQuestions: [],
            currentLevel: null
        };

        // 1. Level Progression Logic
        // If user completes the current max level, unlock the next one
        const newUnlocked = level >= currentUnlocked ? level + 1 : currentUnlocked;
        if (newUnlocked > currentUnlocked) {
            updates.unlockedLevel = newUnlocked;
        }

        // 2. High Score Logic
        // Only add to Total Score if the new pending score is greater than the previous best for this level.
        // This prevents farming total score by replaying the same level.
        if (pending > previousBest) {
            const scoreDiff = pending - previousBest;
            updates.totalScore = FieldValue.increment(scoreDiff);
            
            // Update the map in memory and write the whole field to ensure it exists
            levelScores[level.toString()] = pending;
            updates.levelScores = levelScores;
            
            console.log(`[Server] New High Score! Adding ${scoreDiff} to total. Updated LevelMap:`, levelScores);
        } else {
            console.log(`[Server] No high score beat. Keeping previous best.`);
        }

        // Atomic update to Firestore
        await userRef.set(updates, { merge: true });
        
        return { 
            success: true, 
            highScoreBeaten: pending > previousBest, 
            previousBest, 
            newScore: pending 
        };

    } catch (e) {
        console.error("Finalize Level Error", e);
        return { error: "Failed to finalize level" };
    }
}

// ---------------------------------------------------------
// Seeding Logic: generateQuestions
// ---------------------------------------------------------

/**
 * Fetches a random set of questions for a specific level.
 * Shuffles questions server-side and returns a subset (10).
 * Strips 'correctIndex' and 'explanation' to prevent cheating.
 */
// 4. Secure Question Fetching
export async function getQuestions(token: string, level: number) {
    const userId = await verifyUserStrict(token);
    if (!userId) return { error: "Unauthorized: Setup Required" };

    console.log(`[Server] getQuestions: u=${userId} level=${level}`);

    // 1. Verify Level Access
    // Ensure the user has actually unlocked this level before serving questions
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const currentUnlocked = userSnap.exists ? (userSnap.data()?.unlockedLevel || 1) : 1;
    
    if (level > currentUnlocked) {
        return { error: "Level Locked" };
    }

    try {
        const qRef = adminDb.collection("questions");
        const snapshot = await qRef.where("level", "==", level).get();

        if (snapshot.empty) {
             console.log(`[Server] No questions found for level ${level}`);
             return { questions: [] };
        }

        const allQuestions = snapshot.docs.map(doc => {
            const data = doc.data() as Question;
            return {
                id: doc.id,
                text: data.text,
                options: data.options,
                // SECURITY: Explicitly strip 'correctIndex' and 'explanation'
                // This prevents users from inspecting network traffic to find answers
            };
        });

        // 2. Randomization strategy
        // Shuffle questions server-side so the order is unpredictable
        const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
        
        return { questions: shuffled };

    } catch (error) {
        console.error("getQuestions Error:", error);
        return { error: "Failed to fetch questions" };
    }
}

/**
 * Retrieves essential user data (score, unlocked levels, nickname status).
 */
// 5. Secure User Data Fetching
export async function getUserData(token: string) {
    // Note: getUserData STAYS on standard verification to allow checking 'nicknameSet' status
    const userId = await verifyUser(token);
    if (!userId) return { error: "Unauthorized" };

    try {
        const userRef = adminDb.collection("users").doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            // Treat missing document as a new user who needs to set a nickname
            return {
                userData: {
                    unlockedLevel: 1,
                    totalScore: 0,
                    displayName: "Survivor",
                    nicknameSet: false
                }
            };
        }

        const data = userSnap.data();
        return {
            userData: {
                unlockedLevel: data?.unlockedLevel || 1,
                totalScore: data?.totalScore || 0,
                displayName: data?.displayName || "Survivor",
                nicknameSet: !!data?.nicknameSet // Check if nickname has been explicitly set
            }
        };
    } catch (error) {
        console.error("getUserData Error:", error);
        return { error: "Failed to fetch user data" };
    }
}

/**
 * Sets the user's nickname.
 * Enforces length constraints (3-15 chars).
 */
// 6. Set Nickname
export async function setNickname(token: string, nickname: string) {
    // Standard verification permitted for setting nickname
    const userId = await verifyUser(token);
    if (!userId) return { error: "Unauthorized" };

    if (!nickname || nickname.length < 3 || nickname.length > 15) {
        return { error: "Nickname must be between 3 and 15 characters." };
    }

    try {
        const userRef = adminDb.collection("users").doc(userId);
        const userSnap = await userRef.get();
        
        // Prepare update data
        const updateData: any = {
            displayName: nickname,
            nicknameSet: true,
            updatedAt: FieldValue.serverTimestamp()
        };

        // If user is new (or missing score fields), initialize them
        // This ensures they show up in leaderboard queries (which filter by totalScore)
        if (!userSnap.exists || userSnap.data()?.totalScore === undefined) {
            updateData.totalScore = 0;
        }
        if (!userSnap.exists || userSnap.data()?.unlockedLevel === undefined) {
            updateData.unlockedLevel = 1;
        }

        await userRef.set(updateData, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("setNickname Error:", error);
        return { error: "Failed to set nickname" };
    }
}

/**
 * Retrieves the global leaderboard.
 * Only accessible to users who have set a nickname.
 * 
 * @param limitCount - Max number of users to return (default 10)
 */
// 6. Secure Leaderboard Fetching
export async function getLeaderboard(token: string, limitCount: number = 10) {
    // STRICT VERIFICATION: Must have nickname set to view leaderboard
    const userId = await verifyUserStrict(token);
    if (!userId) return { error: "Unauthorized: Setup Required" };
    
    try {
        const usersRef = adminDb.collection("users");
        const q = usersRef.orderBy("totalScore", "desc").limit(limitCount);
        const snapshot = await q.get();

        const leaderboard = snapshot.docs.map(doc => ({
            id: doc.id,
            displayName: doc.data().displayName || "Anonymous",
            totalScore: doc.data().totalScore || 0,
            unlockedLevel: doc.data().unlockedLevel || 1,
            photoURL: doc.data().photoURL || null
        }));

        return { leaderboard };
    } catch (error) {
        console.error("getLeaderboard Error:", error);
        return { error: "Failed to fetch leaderboard" };
    }
}
