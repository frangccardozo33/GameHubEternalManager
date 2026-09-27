import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  plugins: [viteSingleFile()],
  build: { outDir: 'dist-live', chunkSizeWarningLimit: 2000, rollupOptions: { input: 'live.html' } }
});
