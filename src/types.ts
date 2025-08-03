export interface FeedbackItem {
  category: 'Skills' | 'Experience' | 'Structure' | 'Analysis';
  text: string;
}

export interface Analysis {
  id: string;
  resumeText: string;
  jobText: string;
  score: number;
  feedback: FeedbackItem[];
  suggestions: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  timestamp: string;
}