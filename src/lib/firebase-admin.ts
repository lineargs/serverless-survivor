import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * @file firebase-admin.ts
 * @description Initializes Firebase Admin SDK for server-side usage.
 * Handles both local development (Service Account) and Cloud environment (ADC).
 */

let app: App;

if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // If a service account key JSON string is provided (e.g., local dev)
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
       console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY", error);
       // Fallback to default which might work if other env vars are set
       app = initializeApp();
    }
  } else {
    // Cloud Run / Default environment
    // Explicitly set projectId to ensure it connects to the right project locally
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    console.log(`[Firebase Admin] Attempting init with explicit Project ID: ${projectId}`);
    
    app = initializeApp({
        projectId: projectId
    });
  }
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

console.log(`[Firebase Admin] Initialized. Project ID: ${app.options.credential ? (app.options.credential as any).projectId : app.options.projectId}`);

export { adminDb, adminAuth };
