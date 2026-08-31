import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    esbuild: {
      target: 'es2022',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022',
      },
    },
    build: {
      assetsDir: 'static',
      emptyOutDir: false,
      target: 'es2022',
      cssCodeSplit: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('/react-dom/') || id.includes('/react-dom.')) {
                return 'vendor-react-dom';
              }
              if (id.includes('/react-router-dom/') || id.includes('/react-router-dom.')) {
                return 'vendor-react-router';
              }
              if (id.includes('/react/') || id.includes('/react.')) {
                return 'vendor-react';
              }
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'vendor-recharts';
              }
              if (id.includes('jspdf')) {
                return 'vendor-jspdf';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('motion') || id.includes('lenis') || id.includes('lottie-react')) {
                return 'vendor-motion';
              }
              if (id.includes('zod')) {
                return 'vendor-zod';
              }
              if (id.includes('@aws-sdk')) {
                return 'vendor-aws';
              }
            }
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: [
          '**/blog-posts.json',
          '**/contact-form-config.json',
          '**/testimonials.json',
          '**/submissions.json',
        ]
      },
    },
  };
});
