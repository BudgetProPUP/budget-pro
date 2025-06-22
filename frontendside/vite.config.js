import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react-hook-form"], // Add this line
  },
  server: {
    port: 5173,
    host: '0.0.0.0',  
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: [
      'frontend-production-906f.up.railway.app',
      '.railway.app',
      'localhost',
      '127.0.0.1',
      'frontend-r2az.onrender.com'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});