import type { Analysis, FeedbackItem } from '../types';
import { pipeline, env } from '@xenova/transformers';
import nlp from 'compromise';

let embedder: any = null;
let generator: any = null;

env.localModelPath = '/models/';
env.allowRemoteModels = false;

export async function initEmbedder() {
  if (!embedder) {
    try {
      console.log('Loading MiniLM model from /models/Xenova/all-MiniLM-L6-v2');
      embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
      console.log('MiniLM model loaded successfully');
    } catch (error) {
      console.error('Failed to load MiniLM model:', error);
      throw new Error('Unable to initialize feature extraction model. Please ensure model files are in /public/models/Xenova/all-MiniLM-L6-v2/');
    }
  }
}

async function initGenerator() {
  if (!generator) {
    try {
      console.log('Loading T5 model from /models/Xenova/t5-small');
      generator = await pipeline('text2text-generation', 'Xenova/t5-small', {
        quantized: true,
      });
      console.log('T5 model loaded successfully');
      return generator;
    } catch (error) {
      console.error('Failed to load T5 model:', error);
      return null;
    }
  }
  return generator;
}

export const analyzeResume = async (resumeText: string, jobText: string): Promise<Analysis> => {
  try {
    if (!embedder) await initEmbedder();

    const cleanText = (text: string) =>
      text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const cleanedResume = cleanText(resumeText);
    const cleanedJob = cleanText(jobText);

    const resumeEmbedding = await embedder(cleanedResume, { pooling: 'mean', normalize: true });
    const jobEmbedding = await embedder(cleanedJob, { pooling: 'mean', normalize: true });

    const resumeVector = resumeEmbedding.data as Float32Array;
    const jobVector = jobEmbedding.data as Float32Array;

    const dotProduct = resumeVector.reduce(
      (sum: number, a: number, i: number) => sum + a * jobVector[i],
      0
    );
    const score = Math.round(dotProduct * 100);

    const jobDoc = nlp(cleanedJob);
    const resumeDoc = nlp(cleanedResume);

    const jobKeywords = jobDoc
      .nouns()
      .concat(jobDoc.terms().filter((t: any) => t.tags.has('Noun') || t.tags.has('Adjective')))
      .out('array')
      .map((k: string) => k.toLowerCase())
      .filter((k: string, i: number, arr: string[]) => arr.indexOf(k) === i);

    const resumeKeywords = resumeDoc
      .nouns()
      .concat(resumeDoc.terms().filter((t: any) => t.tags.has('Noun') || t.tags.has('Adjective')))
      .out('array')
      .map((k: string) => k.toLowerCase())
      .filter((k: string, i: number, arr: string[]) => arr.indexOf(k) === i);

    const matchedKeywords = resumeKeywords.filter((k: string) => jobKeywords.includes(k));
    const missingKeywords = jobKeywords.filter((k: string) => !resumeKeywords.includes(k));

    const feedback: FeedbackItem[] = [];
    if (missingKeywords.length > 0) {
      feedback.push({
        category: 'Skills',
        text: `Consider adding these skills to your resume: ${missingKeywords
          .slice(0, 3)
          .join(', ')}`,
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

    const suggestions: string[] = [];
    if (resumeText.length > 0) {
      const generator = await initGenerator();
      if (generator) {
        const prompt = `Rephrase the following resume text to align with a job posting: "${resumeText.slice(
          0,
          200
        )}"`;
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
    } else {
      suggestions.push('No rephrasing available');
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
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};