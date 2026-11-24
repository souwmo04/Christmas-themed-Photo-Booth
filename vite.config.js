import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `npm run dev:phone` serves over HTTPS on your local network so phones
// can open the camera (browsers only allow the camera on HTTPS or localhost).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'phone' ? [basicSsl()] : [],
  server: { port: 5173 },
  build: { target: 'es2020', outDir: 'dist' },
}));
