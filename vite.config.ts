import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Optimizaciones de performance
      build: {
        target: 'es2020',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        rollupOptions: {
          output: {
            manualChunks: {
              // Separar vendor chunks para mejor caching
              vendor: ['react', 'react-dom', 'react-router-dom'],
              firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
              ui: [
                './components/shared/Modal.tsx',
                './components/shared/LoadingSpinner.tsx',
                './components/shared/ErrorBoundary.tsx',
                './components/shared/Icons.tsx'
              ]
            }
          }
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false, // Desactivar sourcemaps en producción
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          'firebase/app',
          'firebase/auth', 
          'firebase/firestore'
        ]
      }
    };
});
