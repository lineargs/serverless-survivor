import { VertexAI, GenerativeModel } from "@google-cloud/vertexai";

/**
 * @file vertex.ts
 * @description Configuration for Google Cloud Vertex AI.
 * Used for generating dynamic quiz questions.
 */

// Initialize Vertex with your Cloud project and location
const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

if (!project) {
    console.warn("GOOGLE_CLOUD_PROJECT or NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set. Vertex AI might fail.");
}

const vertex_ai = new VertexAI({ project: project || 'placeholder-project', location });
const model = "gemini-1.5-pro-preview-0409"; // Or 'gemini-1.0-pro' depending on availability, defaulting to a stable one or what user asked.
// User asked for "gemini-pro".
/**
 * @const geminiModel
 * @description The configured Generative Model instance (Gemini Pro).
 */
const geminiModel: GenerativeModel = vertex_ai.getGenerativeModel({ model: "gemini-pro" });

export { geminiModel };
