import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { parseFile } from '../utils/fileParser';
import { analyzeResume, initEmbedder } from '../utils/ai';
import { Upload, FileText, AlertCircle, Loader2, RefreshCcw } from 'lucide-react';

const FileUpload = () => {
  const [error, setError] = useState<string | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [jobPreview, setJobPreview] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [jobFileName, setJobFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const navigate = useNavigate();
  const { setResumeFile, setJobFile, setResumeText, setJobText, setCurrentAnalysis, addToHistory } = useAppStore();

  useEffect(() => {
    const checkModels = async () => {
      try {
        await initEmbedder();
        setIsModelLoading(false);
      } catch (err) {
        setError('Failed to load AI models. Please try again or refresh the page.');
        setIsModelLoading(false);
      }
    };
    checkModels();
  }, []);

  const handleRetry = async () => {
    setIsModelLoading(true);
    setError(null);
    try {
      await initEmbedder();
      setIsModelLoading(false);
    } catch (err) {
      setError('Failed to load AI models. Please ensure model files are in /public/models/Xenova/all-MiniLM-L6-v2/ and refresh.');
      setIsModelLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'job') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    try {
      const text = await parseFile(file);
      if (type === 'resume') {
        setResumeFile(file);
        setResumeText(text);
        setResumePreview(text.slice(0, 200) + (text.length > 200 ? '...' : ''));
        setResumeFileName(file.name);
      } else {
        setJobFile(file);
        setJobText(text);
        setJobPreview(text.slice(0, 200) + (text.length > 200 ? '...' : ''));
        setJobFileName(file.name);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const handleTextPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJobText(text);
    setJobPreview(text.slice(0, 200) + (text.length > 200 ? '...' : ''));
    setJobFile(null);
    setJobFileName(null);
    setError(null);
  };

  const handleSubmit = async () => {
    const { resumeText, jobText } = useAppStore.getState();
    if (!resumeText || !jobText) {
      setError('Please provide both a resume and a job posting');
      return;
    }

    try {
      setIsAnalyzing(true);
      const analysis = await analyzeResume(resumeText, jobText);
      setCurrentAnalysis(analysis);
      addToHistory(analysis);
      setError(null);
      navigate('/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isModelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300 flex items-center">
          <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading AI models...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 mr-2" /> {error}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all"
          >
            <RefreshCcw className="w-5 h-5 mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-10"
    >
      <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
        Upload Your Files
      </h2>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="rounded-2xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg p-6">
          <label className="block text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
            Upload Resume (PDF or DOCX)
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-3 text-teal-500" />
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, 'resume')}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer text-teal-600 hover:underline">
              Drag & drop or click to upload
            </label>
            {resumeFileName && (
              <p className="mt-4 text-sm text-gray-700 dark:text-gray-400">Selected: {resumeFileName}</p>
            )}
            {resumePreview && (
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold">Preview:</p>
                <div className="mt-2 p-3 bg-white dark:bg-gray-900 border rounded-lg max-h-40 overflow-y-auto">
                  {resumePreview}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg p-6">
          <label className="block text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
            Upload Job Posting (PDF, DOCX or Paste)
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-3 text-teal-500" />
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, 'job')}
              className="hidden"
              id="job-upload"
            />
            <label htmlFor="job-upload" className="cursor-pointer text-teal-600 hover:underline">
              Drag & drop or click to upload
            </label>
            {jobFileName && (
              <p className="mt-4 text-sm text-gray-700 dark:text-gray-400">Selected: {jobFileName}</p>
            )}
            {jobPreview && (
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold">Preview:</p>
                <div className="mt-2 p-3 bg-white dark:bg-gray-900 border rounded-lg max-h-40 overflow-y-auto">
                  {jobPreview}
                </div>
              </div>
            )}
          </div>
          <textarea
            onChange={handleTextPaste}
            placeholder="Or paste job description here..."
            className="mt-4 w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white resize-none h-32"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-center mt-6 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 mr-2" /> {error}
        </p>
      )}

      <div className="text-center mt-10">
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || !useAppStore.getState().resumeText || !useAppStore.getState().jobText}
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Now'
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default FileUpload;