import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  plugins: [viteSingleFile()],
  build: { outDir: 'dist-mgr', emptyOutDir: true, chunkSizeWarningLimit: 2000, target: 'esnext', rollupOptions: { input: 'mgr.html' } }
});
