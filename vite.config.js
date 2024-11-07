import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tasks': {
        target: 'https://tasks-server-2rby.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
