import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /* fsevents delivery on this machine is unreliable — its fseventsd has
     * been up for months and ballooned past 2GB — so the watcher silently
     * stops firing and Vite serves stale modules. Polling does not depend on
     * that daemon. Safe to drop once fseventsd is healthy again. */
    watch: { usePolling: true, interval: 300 },
  },
  build: {
    /* A page each: the way in, and the two prototypes it opens. They share
       every component and all the data; what differs is which one a link
       opens. */
    rollupOptions: {
      input: {
        index: path.resolve(import.meta.dirname, 'index.html'),
        generator: path.resolve(import.meta.dirname, 'generator.html'),
        planner: path.resolve(import.meta.dirname, 'planner.html'),
      },
    },
  },
  resolve: {
    alias: [
      /* Exact match only, so `cn/config` still resolves to the package. */
      { find: /^cn$/, replacement: path.resolve(import.meta.dirname, './src/lib/cn.ts') },
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
    ],
  },
})
