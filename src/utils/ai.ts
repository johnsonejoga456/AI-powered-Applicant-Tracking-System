import type { Analysis, FeedbackItem } from '../types';
import { pipeline } from '@xenova/transformers';
import nlp from 'compromise';

// Initialize transformer pipelines with error handling
let embedder: any = null;
let generator: any = null;

try {
  embedder = await pipeline('feature-extraction', '/models/all-MiniLM-L6-v2');
} catch (error) {
  console.error('Failed to load MiniLM model:', error);
  throw new Error('Unable to initialize feature extraction model.');
}

try {
  generator = await pipeline('text2text-generation', '/models/t5-small');
} catch (error) {
  console.error('Failed to load T5 model:', error);
  throw new Error('Unable to initialize text generation model.');
}

export const analyzeResume = async (resumeText: string, jobText: string): Promise<Analysis> => {
  try {
    // Clean and normalize text
    const cleanText = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const cleanedResume = cleanText(resumeText);
    const cleanedJob = cleanText(jobText);

    // 1. Semantic Similarity Score (MiniLM)
    const resumeEmbedding = await embedder(cleanedResume, { pooling: 'mean', normalize: true });
    const jobEmbedding = await embedder(cleanedJob, { pooling: 'mean', normalize: true });

    // Explicitly type embeddings as Float32Array
    const resumeVector = resumeEmbedding.data as Float32Array;
    const jobVector = jobEmbedding.data as Float32Array;

    // Cosine similarity
    const dotProduct = resumeVector.reduce((sum: number, a: number, i: number) => sum + a * jobVector[i], 0);
    const score = Math.round(dotProduct * 100); // Scale to 0-100

    // 2. Keyword Extraction (Compromise.js)
    const jobDoc = nlp(cleanedJob);
    const resumeDoc = nlp(cleanedResume);

    // Extract nouns and terms as keywords
    const jobKeywords = jobDoc
      .nouns()
      .concat(jobDoc.terms().filter((t: any) => t.tags.has('Noun') || t.tags.has('Adjective')))
      .out('array')
      .map((k: string) => k.toLowerCase())
      .filter((k: string, i: number, arr: string[]) => arr.indexOf(k) === i); // Unique keywords

    const resumeKeywords = resumeDoc
      .nouns()
      .concat(resumeDoc.terms().filter((t: any) => t.tags.has('Noun') || t.tags.has('Adjective')))
      .out('array')
      .map((k: string) => k.toLowerCase())
      .filter((k: string, i: number, arr: string[]) => arr.indexOf(k) === i);

    const matchedKeywords = resumeKeywords.filter((k: string) => jobKeywords.includes(k));
    const missingKeywords = jobKeywords.filter((k: string) => !resumeKeywords.includes(k));

    // 3. Feedback Generation
    const feedback: FeedbackItem[] = [];
    if (missingKeywords.length > 0) {
      feedback.push({
        category: 'Skills',
        text: `Consider adding these skills to your resume: ${missingKeywords.slice(0, 3).join(', ')}`,
      });
    }
    if (score < 80) {
      feedback.push({
        category: 'Structure',
        text: 'Ensure your resume aligns closely with the job description’s language and requirements.',
      });
    }
    if (resumeText.length < 200) {
      feedback.push({
        category: 'Structure',
        text: 'Your resume seems too short. Add more details about your experience and skills.',
      });
    }

    // 4. Rewrite Suggestions (T5-small)
    const suggestions: string[] = [];
    if (resumeText.length > 0 && generator) {
      const prompt = `Rephrase the following resume text to align with a job posting: "${resumeText.slice(0, 200)}"`;
      try {
        const generated = await generator(prompt, { max_length: 100 });
        const generatedText = (generated as any)[0]?.generated_text ?? 'No rephrasing available';
        suggestions.push(generatedText);
      } catch (error) {
        console.error('T5 generation error:', error);
        suggestions.push('No rephrasing available due to model error');
      }
    } else {
      suggestions.push('No rephrasing available');
    }

    // 5. Create Analysis Object
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
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};