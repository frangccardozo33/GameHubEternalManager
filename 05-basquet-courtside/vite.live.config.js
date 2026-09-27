import { defineConfig } from 'vite';
export default defineConfig({
  build: { outDir: 'dist-live', emptyOutDir: true, chunkSizeWarningLimit: 2000, rollupOptions: { input: 'live.html' } }
});
