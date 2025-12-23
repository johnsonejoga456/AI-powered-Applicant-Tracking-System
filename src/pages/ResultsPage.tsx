import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { analyzeResume } from '../lib/ai';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const ResultsPage = () => {
  const { resumeText, jobText, setCurrentAnalysis } = useAppStore();
  const [tab, setTab] = useState<'score' | 'feedback' | 'suggestions' | 'keywords'>('score');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const analysis = useAppStore((state) => state.currentAnalysis);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setLoading(true);
        const analysis = await analyzeResume(resumeText, jobText);
        setCurrentAnalysis(analysis);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    };

    if (resumeText && jobText && !analysis) {
      runAnalysis();
    } else {
      setLoading(false);
    }
  }, [resumeText, jobText, analysis, setCurrentAnalysis]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"
      >
        <p className="text-gray-600 dark:text-gray-300 text-lg">Analyzing your resume...</p>
      </motion.div>
    );
  }

  if (error || !analysis) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <p className="text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error || 'No analysis available'}
        </p>
      </motion.div>
    );
  }

  const { score, feedback, suggestions, matchedKeywords, missingKeywords } = analysis;

  const tabs = ['score', 'feedback', 'suggestions', 'keywords'] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-4 py-10"
    >
      <h2 className="text-4xl font-bold text-center text-navy-900 dark:text-white mb-10">
        Resume Analysis Report
      </h2>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Tabs */}
        <div className="flex justify-center gap-6 border-b pb-4 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`capitalize text-sm md:text-base font-medium relative pb-2 transition-all ${tab === t
                ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-teal-500'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'score' && (
          <div className="text-center">
            <div className="text-6xl font-bold text-teal-500">{score}%</div>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Resume match score for the job description
            </p>
          </div>
        )}

        {tab === 'feedback' && (
          <ul className="space-y-5">
            {feedback.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <FileText className="text-teal-500 w-5 h-5 mt-1" />
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">{item.category}:</span> {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'suggestions' && (
          <ul className="space-y-5">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="text-teal-500 w-5 h-5 mt-1" />
                <p className="text-sm text-gray-800 dark:text-gray-200">{s}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'keywords' && (
          <div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-teal-600 font-semibold mb-2">Matched Keywords</h4>
                <ul className="space-y-2">
                  {matchedKeywords.map((k, i) => (
                    <li key={i} className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" /> {k}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-red-500 font-semibold mb-2">Missing Keywords</h4>
                <ul className="space-y-2">
                  {missingKeywords.map((k, i) => (
                    <li key={i} className="flex items-center text-red-600 text-sm">
                      <XCircle className="w-4 h-4 mr-2" /> {k}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Highlighted Resume */}
            <div className="mt-8">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Resume Keyword Highlights</h4>
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                {resumeText.split(' ').map((word, i) => {
                  const lower = word.toLowerCase();
                  const isMatched = matchedKeywords.includes(lower);
                  const isMissing = missingKeywords.includes(lower);
                  return (
                    <span
                      key={i}
                      className={`px-1 rounded ${isMatched
                        ? 'bg-green-200 text-green-800'
                        : isMissing
                          ? 'bg-red-200 text-red-800'
                          : ''
                        }`}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultsPage;
