import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { analyzeResume } from '../utils/ai';
import { FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ResultsPage = () => {
  const { resumeText, jobText, setCurrentAnalysis } = useAppStore();
  const [tab, setTab] = useState<'score' | 'feedback' | 'suggestions' | 'keywords'>('score');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (resumeText && jobText) {
      runAnalysis();
    }
  }, [resumeText, jobText, setCurrentAnalysis]);

  const analysis = useAppStore((state) => state.currentAnalysis);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <p className="text-lg text-gray-600 dark:text-gray-300">Analyzing your resume...</p>
      </motion.div>
    );
  }

  if (error || !analysis) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <p className="text-red-500 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 mr-2" /> {error || 'No analysis available'}
        </p>
      </motion.div>
    );
  }

  const { score, feedback, suggestions, matchedKeywords, missingKeywords } = analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-6 text-center">Analysis Results</h2>
      <div className="glass-card p-6 max-w-4xl mx-auto">
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['score', 'feedback', 'suggestions', 'keywords'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`pb-2 capitalize ${tab === t ? 'text-teal-500 border-b-2 border-teal-500' : 'text-gray-600 dark:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === 'score' && (
          <div className="text-center">
            <div className="text-5xl font-bold text-teal-500">{score}%</div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Your resume matches the job posting</p>
          </div>
        )}
        {tab === 'feedback' && (
          <ul className="space-y-4">
            {feedback.map((item, i) => (
              <li key={i} className="flex items-start">
                <FileText className="w-5 h-5 text-teal-500 mr-2 mt-1" />
                <div>
                  <span className="font-semibold">{item.category}:</span> {item.text}
                </div>
              </li>
            ))}
          </ul>
        )}
        {tab === 'suggestions' && (
          <ul className="space-y-4">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-teal-500 mr-2 mt-1" />
                <div>{s}</div>
              </li>
            ))}
          </ul>
        )}
        {tab === 'keywords' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Keyword Analysis</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-teal-500">Matched Keywords</h4>
                <ul className="space-y-2 mt-2">
                  {matchedKeywords.map((k, i) => (
                    <li key={i} className="text-green-500 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> {k}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-coral-500">Missing Keywords</h4>
                <ul className="space-y-2 mt-2">
                  {missingKeywords.map((k, i) => (
                    <li key={i} className="text-red-500 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" /> {k}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Resume Preview</h4>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                {resumeText.split(' ').map((word, i) => (
                  <span
                    key={i}
                    className={
                      matchedKeywords.includes(word.toLowerCase())
                        ? 'bg-green-100 text-green-700 px-1 rounded'
                        : missingKeywords.includes(word.toLowerCase())
                        ? 'bg-red-100 text-red-700 px-1 rounded'
                        : ''
                    }
                    title={missingKeywords.includes(word.toLowerCase()) ? `Missing keyword: ${word}` : ''}
                  >
                    {word}{' '}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultsPage;