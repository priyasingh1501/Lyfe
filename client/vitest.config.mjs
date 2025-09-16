import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    css: true,
    exclude: ['**/node_modules/**', '**/e2e-tests/**'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});


