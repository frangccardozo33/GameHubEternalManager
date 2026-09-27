import { defineConfig } from 'vite';
export default defineConfig({
  build: { outDir: 'dist-mgr', emptyOutDir: true, chunkSizeWarningLimit: 2000, target: 'esnext', rollupOptions: { input: 'mgr.html' } }
});
