import { create } from 'zustand';
import type { Analysis } from '../../types/analysisTypes.ts';

interface AppState {
  resumeFile: File | null;
  jobFile: File | null;
  resumeText: string;
  jobText: string;
  currentAnalysis: Analysis | null;
  history: Analysis[];
  setResumeFile: (file: File | null) => void;
  setJobFile: (file: File | null) => void;
  setResumeText: (text: string) => void;
  setJobText: (text: string) => void;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  addToHistory: (analysis: Analysis) => void;
}

export const useAppStore = create<AppState>((set) => ({
  resumeFile: null,
  jobFile: null,
  resumeText: '',
  jobText: '',
  currentAnalysis: null,
  history: [],
  setResumeFile: (file) => set({ resumeFile: file }),
  setJobFile: (file) => set({ jobFile: file }),
  setResumeText: (text) => set({ resumeText: text }),
  setJobText: (text) => set({ jobText: text }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  addToHistory: (analysis) => set((state) => ({ history: [analysis, ...state.history.slice(0, 9)] })),
}));