import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-16 text-center"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-navy-900 dark:text-white mb-4">
        Optimize Your Resume for Success
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Upload your resume and a job posting to get an ATS score, actionable feedback, and rewrite suggestions—all
        privately in your browser.
      </p>
      <Link
        to="/upload"
        className="inline-block px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition"
      >
        Get Started
      </Link>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        100% private, no data leaves your device
      </div>
    </motion.div>
  );
};

export default Home;