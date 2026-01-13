import type { Metadata } from "next";
import { Press_Start_2P, Space_Mono } from "next/font/google"; // proper casing? usually underscores.
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";

/**
 * @file layout.tsx
 * @description Root layout component for the Next.js application.
 * Sets up global fonts (Pixel/Display), metadata, and the persistent AuthProvider.
 * Also configures the global vignette and wood texture overlays.
 */

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Serverless Survivor",
  description: "A Jungle Survival Challenge on Google Cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Vignette & Texture Overlays provided globally for consistent atmosphere
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} ${spaceMono.variable} antialiased bg-jungle-800 text-foreground relative min-h-screen overflow-x-hidden`}
      >
         <Suspense fallback={<div className="min-h-screen bg-jungle-800" />}>
           <AuthProvider>
             {/* Lighter vignette: Fades to dark green instead of pure black, and slightly more transparent center */}
             <div className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(5,31,16,0.6)_60%,#051F10_100%)] opacity-70 mix-blend-multiply transition-opacity duration-300"></div>
             <div className="fixed inset-0 pointer-events-none z-[49] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay"></div> 
            
             {children}
           </AuthProvider>
         </Suspense>
      </body>
    </html>
  );
}
