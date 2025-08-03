import { createBrowserRouter, Outlet } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Upload from './pages/Upload.tsx';
import ResultsPage from './pages/ResultsPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import HowItWorksPage from './pages/HowItWorksPage.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';

const router = createBrowserRouter([
  {
    element: (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/upload', element: <Upload /> },
      { path: '/results', element: <ResultsPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/how-it-works', element: <HowItWorksPage /> },
    ],
  },
]);

export default router;