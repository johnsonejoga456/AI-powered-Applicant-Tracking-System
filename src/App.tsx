import { RouterProvider } from 'react-router-dom';
import router from './router.tsx';
import { MotionConfig } from 'framer-motion';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}

export default App;