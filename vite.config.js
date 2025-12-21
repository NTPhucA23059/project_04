import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Vite default port
    host: true, // Allow external connections
    hmr: {
      overlay: false
    }
  },
  css: {
    devSourcemap: true
  },
  optimizeDeps: {
    exclude: []
  }
})
