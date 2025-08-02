import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Upload from './pages/Upload.tsx';
import ResultsPage from './pages/ResultsPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import HowItWorksPage from './pages/HowItWorksPage.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
          <Home />
        </main>
        <Footer />
      </div>
    ),
  },
  {
    path: '/upload',
    element: (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
          <Upload />
        </main>
        <Footer />
      </div>
    ),
  },
  {
    path: '/results',
    element: (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
          <ResultsPage />
        </main>
        <Footer />
      </div>
    ),
  },
  {
    path: '/history',
    element: (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
          <HistoryPage />
        </main>
        <Footer />
      </div>
    ),
  },
  {
    path: '/how-it-works',
    element: (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
          <HowItWorksPage />
        </main>
        <Footer />
      </div>
    ),
  },
]);

export default router;