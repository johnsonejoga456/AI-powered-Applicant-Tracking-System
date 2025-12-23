// src/lib/ai.ts
import type { Analysis, FeedbackItem } from "../../types/analysisTypes";
import nlp from "compromise";
import { pipeline } from "@xenova/transformers";
import puter from "@heyputer/puter.js";

// Singleton for the extractor
let extractor: any = null;

// -------------------
// Embeddings via Xenova (Local)
// -------------------
async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (!extractor) {
      // Use a lightweight model for browser
      extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    const output = await extractor(text, { pooling: "mean", normalize: true });
    // output.data is a Float32Array, convert to normal array
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

// -------------------
// Text generation via PuterJS
// -------------------
async function generateText(prompt: string): Promise<string> {
  try {
    // Attempt to use chat (v2 API) or generateText (v1/compat)
    // using 'any' cast to avoid TS errors if types are incomplete
    if (!puter.auth.isSignedIn()) {
      await puter.auth.signIn();
    }
    const ai = (puter as any).ai;

    if (ai.chat) {
      const response = await ai.chat(prompt);
      // Handle response: might be string or object with content
      if (typeof response === "string") return response;
      return response?.message?.content || JSON.stringify(response);
    }

    if (ai.generateText) {
      const result = await ai.generateText(prompt, {
        model: "gpt-4o-mini",
      });
      return result.output?.trim() || "No rephrasing available";
    }

    return "AI capability not found.";
  } catch (error) {
    console.error("Error generating text:", error);
    return "Error: Unable to generate suggestion.";
  }
}

// -------------------
// Main Analysis Function
// -------------------
export const analyzeResume = async (
  resumeText: string,
  jobText: string
): Promise<Analysis> => {
  const cleanText = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  const cleanedResume = cleanText(resumeText);
  const cleanedJob = cleanText(jobText);

  // ✅ Embeddings
  const [resumeVector, jobVector] = await Promise.all([
    getEmbedding(cleanedResume),
    getEmbedding(cleanedJob),
  ]);

  // ✅ Cosine similarity
  const dotProduct = resumeVector.reduce(
    (sum, a, i) => sum + a * jobVector[i],
    0
  );
  const resumeNorm = Math.sqrt(
    resumeVector.reduce((sum, a) => sum + a * a, 0)
  );
  const jobNorm = Math.sqrt(jobVector.reduce((sum, a) => sum + a * a, 0));
  const similarity = dotProduct / (resumeNorm * jobNorm);
  const score = Math.round(similarity * 100);

  // ✅ Keyword analysis
  const jobKeywords = nlp(cleanedJob).nouns().out("array");
  const resumeKeywords = nlp(cleanedResume).nouns().out("array");
  const matchedKeywords = resumeKeywords.filter((k: string) =>
    jobKeywords.includes(k)
  );
  const missingKeywords = jobKeywords.filter(
    (k: string) => !resumeKeywords.includes(k)
  );

  // ✅ Feedback
  const feedback: FeedbackItem[] = [];
  if (missingKeywords.length > 0) {
    feedback.push({
      category: "Skills",
      text: `Consider adding: ${missingKeywords.slice(0, 3).join(", ")}`,
    });
  }

  // ✅ Suggestions
  const suggestions: string[] = [];
  if (resumeText.length > 0) {
    const prompt = `Rephrase this resume snippet to better match a job posting:\n\n"${resumeText.slice(
      0,
      200
    )}"`;
    suggestions.push(await generateText(prompt));
  }

  return {
    id: crypto.randomUUID(),
    resumeText,
    jobText,
    score,
    feedback,
    suggestions,
    matchedKeywords,
    missingKeywords,
    timestamp: new Date().toISOString(),
  };
};