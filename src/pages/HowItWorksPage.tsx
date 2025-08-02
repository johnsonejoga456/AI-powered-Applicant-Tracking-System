import { motion } from 'framer-motion';

const HowItWorksPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-6 text-center">How It Works</h2>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">1. Upload Your Files</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your resume and a job posting (PDF or DOCX) or paste the job description. Our app extracts the text
            securely in your browser.
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">2. AI Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI, powered by Transformers.js, compares your resume to the job posting, scoring it based on semantic
            similarity and keywords. It also suggests improvements.
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">3. Get Results</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View your ATS score, feedback, keyword highlights, and rewrite suggestions. All data stays on your device for
            maximum privacy.
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            100% private, no data leaves your device. Optimized for all major ATS systems.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HowItWorksPage;