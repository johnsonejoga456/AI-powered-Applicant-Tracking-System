import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { parseFile } from '../utils/fileParser';
import { analyzeResume } from '../utils/ai';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

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

  // Check if models are loaded
  useEffect(() => {
    const checkModels = async () => {
      try {
        // Simulate model loading check (ai.ts handles actual loading)
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        setIsModelLoading(false);
      } catch (err) {
        setError('Failed to load AI models. Please refresh the page.');
        setIsModelLoading(false);
      }
    };
    checkModels();
  }, []);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-6 text-center">Upload Your Files</h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="glass-card p-6">
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Upload Resume (PDF, DOCX)
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 mx-auto mb-4 text-teal-500" />
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, 'resume')}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer text-teal-500 hover:text-teal-600"
            >
              Drag & drop or click to upload
            </label>
            {resumeFileName && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Selected: {resumeFileName}</p>
            )}
            {resumePreview && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-semibold">Preview:</p>
                <p className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border">{resumePreview}</p>
              </div>
            )}
          </div>
        </div>
        <div className="glass-card p-6">
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Upload Job Posting (PDF, DOCX, or Paste Text)
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <FileText className="w-8 h-8 mx-auto mb-4 text-teal-500" />
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, 'job')}
              className="hidden"
              id="job-upload"
            />
            <label
              htmlFor="job-upload"
              className="cursor-pointer text-teal-500 hover:text-teal-600"
            >
              Drag & drop or click to upload
            </label>
            {jobFileName && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Selected: {jobFileName}</p>
            )}
            {jobPreview && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-semibold">Preview:</p>
                <p className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border">{jobPreview}</p>
              </div>
            )}
          </div>
          <textarea
            className="mt-4 w-full p-4 border rounded-lg dark:bg-gray-700 dark:text-white"
            placeholder="Or paste job description here"
            onChange={handleTextPaste}
          />
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-center mt-4 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 mr-2" /> {error}
        </p>
      )}
      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition disabled:bg-gray-400"
          disabled={isAnalyzing || !useAppStore.getState().resumeText || !useAppStore.getState().jobText}
        >
          {isAnalyzing ? (
            <span className="flex items-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
            </span>
          ) : (
            'Analyze Now'
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default FileUpload;