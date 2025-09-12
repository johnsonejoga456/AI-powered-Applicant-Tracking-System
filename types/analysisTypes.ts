export interface FeedbackItem {
       category: string;
       text: string;
     }

     export interface Analysis {
       id: string;
       resumeText: string;
       jobText: string;
       score: number;
       matchedKeywords: string[];
       missingKeywords: string[];
       feedback: FeedbackItem[];
       suggestions: string[];
       timestamp: string;
     }