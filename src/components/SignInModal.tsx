"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * @file SignInModal.tsx
 * @description A styled modal for handling user authentication via Google.
 * Overlays the game UI with a retro-themed login prompt.
 */

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess?: () => void;
}

const GoogleIcon = () => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5 mr-3"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    ></path>
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-5.57 6.92-12.94 11.47-12.94 11.47l7.98 6.19C40.66 41.5 46.98 33.78 46.98 24.55z"
    ></path>
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    ></path>
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.98-6.19c-2.14 1.44-4.88 2.29-7.91 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    ></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);

/**
 * Modal component handling the Firebase Google Sign-In flow.
 * 
 * @param isOpen - Controls modal visibility
 * @param onClose - Handler to close the modal
 * @param onSignInSuccess - Optional callback triggered after successful login
 */
export default function SignInModal({
  isOpen,
  onClose,
  onSignInSuccess,
}: SignInModalProps) {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onSignInSuccess?.();
      onClose();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-jungle-900 border-2 border-survivor-gold/50 p-8 rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.15)] max-w-sm w-full"
          >
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-xl font-display text-survivor-gold mb-2 tracking-wide">
                  AUTHENTICATION REQUIRED
                </h3>
                <p className="font-mono text-survivor-paper/80 text-sm">
                  Identify yourself to access the secure terminal.
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-md shadow transition-colors duration-200 cursor-pointer"
              >
                <GoogleIcon />
                <span className="font-roboto">Sign in with Google</span>
              </button>

              <button
                onClick={onClose}
                className="text-survivor-terminal/50 hover:text-survivor-terminal text-xs font-mono mt-4 tracking-widest uppercase cursor-pointer"
              >
                [ Cancel Log In ]
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
