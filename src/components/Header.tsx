import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const Header = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold text-teal-500">
          ATS Optimizer
        </NavLink>
        <nav className="flex space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-gray-700 dark:text-gray-300 hover:text-teal-500 ${isActive ? 'font-semibold' : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `text-gray-700 dark:text-gray-300 hover:text-teal-500 ${isActive ? 'font-semibold' : ''}`
            }
          >
            Upload
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `text-gray-700 dark:text-gray-300 hover:text-teal-500 ${isActive ? 'font-semibold' : ''}`
            }
          >
            History
          </NavLink>
          <NavLink
            to="/how-it-works"
            className={({ isActive }) =>
              `text-gray-700 dark:text-gray-300 hover:text-teal-500 ${isActive ? 'font-semibold' : ''}`
            }
          >
            How It Works
          </NavLink>
        </nav>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
      </div>
    </motion.header>
  );
};

export default Header;