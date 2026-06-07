import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './lib/LanguageContext';
import { AuthProvider } from './lib/AuthContext';
import { initAmbientCanvas } from './lib/ambient-canvas';
import { initProgressBar } from './lib/progress-bar';

// Disable browser's automatic scroll restoration (root cause of the bug)
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Mobile optimization verification
if (window.innerWidth <= 640) {
  console.log("📱 Incroute mobile optimizations loaded");
}

// Register service worker for offline caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Initialize premium motion layers
initProgressBar();
initAmbientCanvas();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

