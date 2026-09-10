import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /* macOS does not deliver fsevents for this project path, so the watcher
     * never fires and HMR silently serves stale modules. Polling is the
     * reliable fallback; without it every edit needs a server restart. */
    watch: { usePolling: true, interval: 300 },
  },
  resolve: {
    alias: [
      /* Exact match only, so `cn/config` still resolves to the package. */
      { find: /^cn$/, replacement: path.resolve(import.meta.dirname, './src/lib/cn.ts') },
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
    ],
  },
})
