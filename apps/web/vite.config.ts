import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    host: '0.0.0.0',
  },

  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});