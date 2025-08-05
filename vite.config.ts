// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      allow: ['.', './public/models'], // Allow model files for Transformers.js
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  css: {
    modules: {
      generateScopedName: undefined,
    },
    postcss: './postcss.config.js', // Make sure PostCSS is configured
  },
});
