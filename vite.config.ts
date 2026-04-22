import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-markdown') || id.includes('rehype-highlight') || id.includes('highlight.js')) {
            return 'markdown'
          }
          return undefined
        },
      },
    },
  },
})
