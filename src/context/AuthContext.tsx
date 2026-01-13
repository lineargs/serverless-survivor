"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * @file AuthContext.tsx
 * @description Provides global authentication state to the application.
 * Handles public route protection and user session management.
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});



/**
 * Custom hook to access the AuthContext.
 * @returns {AuthContextType} The current user and loading state.
 */
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Auth Listener Effect
  // Subscribe to Firebase Auth state changes (sign-in/sign-out)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Auth check complete, allow rendering
    });

    return () => unsubscribe();
  }, []);

  // 2. Route Protection Effect
  // Handles automatic Redirects based on auth state and current path
  useEffect(() => {
    if (loading) return; // Wait for initial auth check

    // Check query params for "Demo Mode" flag to bypass auth
    const isDemo = searchParams.get("demo") === "true";
    const isPublicPage = pathname === "/" || pathname.startsWith("/about");
    
    // Scenario A: Unauthenticated User on Private Route
    // Redirect to Landing Page if trying to access restricted areas
    if (!user && !isPublicPage && !isDemo) {
      router.push("/");
    }

    // Scenario B: Authenticated User on Landing Page
    // Redirect to Game Dashboard for better UX (skip landing)
    if (user && pathname === "/") {
        // Only redirect if explicitly on root to avoid hijacking intentional navigation
        router.push("/game");
    }
  }, [user, loading, pathname, searchParams, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading ? children : (
         // Loading state matching the theme
         <div className="flex min-h-screen flex-col items-center justify-center p-24 text-survivor-terminal font-display animate-pulse bg-jungle-900 text-survivor-gold">
            &gt; AUTH_CHECK_IN_PROGRESS...
         </div>
      )}
    </AuthContext.Provider>
  );
};
