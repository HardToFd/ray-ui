import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: mode === 'docs' ? { outDir: 'site-dist' } : {
    outDir: 'dist',
    lib: { entry: 'src/bundle.ts', formats: ['es'], fileName: 'index', cssFileName: 'styles' },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@radix-ui\//, /^@daypicker\/react($|\/)/],
      output: { banner: '"use client";' }
    }
  }
}));
