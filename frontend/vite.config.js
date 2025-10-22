/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  // Load env from the frontend root (default) and also from the monorepo root
  const envFromFrontend = loadEnv(mode, __dirname, '')
  const envFromRepoRoot = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const mergedEnv = { ...envFromRepoRoot, ...envFromFrontend }

  return {
    plugins: [react()],
    // Ensure critical vars are defined even if the .env is at repo root
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(mergedEnv.VITE_API_BASE_URL || ''),
    },
  }
})
