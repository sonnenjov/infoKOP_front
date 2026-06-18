import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // For root deployment
  build: {
    outDir: 'dist',  // This should match your build folder
  },
})