import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { FileText } from 'lucide-react';

const HistoryPage = () => {
  const { history } = useAppStore();

  // Placeholder data
  const mockHistory = [
    { id: '1', jobText: 'Software Engineer @ Acme', score: 85, timestamp: '2025-08-01' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-6 text-center">Analysis History</h2>
      <div className="grid gap-6 max-w-4xl mx-auto">
        {(history.length ? history : mockHistory).map((item) => (
          <div key={item.id} className="glass-card p-6 flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-teal-500 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{item.jobText}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Score: {item.score}% | {item.timestamp}
                </p>
              </div>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
                Re-run
              </button>
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HistoryPage;