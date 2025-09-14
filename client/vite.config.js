import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Add any aliases you need here
      }
    },
    server: {
      port: 5173,
      // Proxy only in development
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true
        }
      } : undefined
    },
    // Build configuration for production
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production', // Disable sourcemaps in production
      // Reduce chunk size warnings
      chunkSizeWarningLimit: 1000
    },
    // Define global constants
    define: {
      // You can define global constants here
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    }
  }
})