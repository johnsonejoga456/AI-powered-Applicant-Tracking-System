import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-navy-900 text-white py-4"
    >
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; 2025 ATS Optimizer. Your data stays on your device.{' '}
          <a href="/how-it-works" className="underline hover:text-teal-400">
            Learn more
          </a>
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;