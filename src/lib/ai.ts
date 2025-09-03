// src/lib/ai.ts
import type { Analysis, FeedbackItem } from '../types';
import nlp from 'compromise';
import { pipeline } from '@xenova/transformers';

let embedder: any = null;
let generator: any = null;

async function loadModels() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "/models/all-MiniLM-L6-v2");
  }
  if (!generator) {
    generator = await pipeline("text2text-generation", "/models/t5-small");
  }
}

// -------------------
// Embeddings via MiniLM
// -------------------
async function getEmbedding(text: string): Promise<number[]> {
  await loadModels();
  const result = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

// -------------------
// Text generation via T5
// -------------------
async function generateText(prompt: string): Promise<string> {
  await loadModels();
  const output = await generator(prompt, { max_length: 100 });
  return output[0]?.generated_text ?? "No rephrasing available";
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

  // ✅ Local embeddings
  const [resumeVector, jobVector] = await Promise.all([
    getEmbedding(cleanedResume),
    getEmbedding(cleanedJob),
  ]);

  // ✅ Cosine similarity
  const dotProduct = resumeVector.reduce((sum, a, i) => sum + a * jobVector[i], 0);
  const resumeNorm = Math.sqrt(resumeVector.reduce((sum, a) => sum + a * a, 0));
  const jobNorm = Math.sqrt(jobVector.reduce((sum, a) => sum + a * a, 0));
  const similarity = dotProduct / (resumeNorm * jobNorm);
  const score = Math.round(similarity * 100);

  // ✅ Keyword analysis
  const jobKeywords = nlp(cleanedJob).nouns().out("array");
  const resumeKeywords = nlp(cleanedResume).nouns().out("array");
  const matchedKeywords = resumeKeywords.filter((k: string) => jobKeywords.includes(k));
  const missingKeywords = jobKeywords.filter((k: string) => !resumeKeywords.includes(k));

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
    const prompt = `Rephrase this resume snippet to match a job posting: "${resumeText.slice(
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
