import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      /* plugin options */
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        dir: './dist/',
        entryFileNames: 'fit-tracker.js',
        assetFileNames: 'fit-tracker.css',
        chunkFileNames: 'chunk.js',
        manualChunks: undefined,
      },
    },
  },
});
