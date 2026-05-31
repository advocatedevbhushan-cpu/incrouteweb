import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './lib/LanguageContext';
import { initAmbientCanvas } from './lib/ambient-canvas';
import { initProgressBar } from './lib/progress-bar';

// Initialize premium motion layers
initProgressBar();
initAmbientCanvas();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
