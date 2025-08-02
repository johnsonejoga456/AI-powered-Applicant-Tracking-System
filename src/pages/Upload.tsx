import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Upload, FileText } from 'lucide-react';

const FileUpload = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setResumeFile, setJobFile, setResumeText, setJobText } = useAppStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'job') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    if (type === 'resume') {
      setResumeFile(file);
      // Placeholder for file parsing (pdf.js, mammoth.js)
      setResumeText('Parsed resume text placeholder');
    } else {
      setJobFile(file);
      setJobText('Parsed job text placeholder');
    }
  };

  const handleSubmit = () => {
    if (!useAppStore.getState().resumeFile || !useAppStore.getState().jobFile) {
      setError('Please upload both a resume and a job posting');
      return;
    }
    // Placeholder for AI processing
    navigate('/results');
  };

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
          </div>
          <textarea
            className="mt-4 w-full p-4 border rounded-lg dark:bg-gray-700 dark:text-white"
            placeholder="Or paste job description here"
            onChange={(e) => setJobText(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition"
        >
          Analyze Now
        </button>
      </div>
    </motion.div>
  );
};

export default FileUpload;