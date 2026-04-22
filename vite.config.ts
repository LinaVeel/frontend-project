import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/oauth': {
        target: 'https://ngw.devices.sberbank.ru:9443',
        changeOrigin: true,
        // Dev-only: avoid TLS verification issues inside Docker/corp networks.
        secure: false,
        rewrite: (path) => path.replace(/^\/oauth\b/, '/api/v2/oauth'),
      },
      '/api/v1': {
        target: 'https://gigachat.devices.sberbank.ru',
        changeOrigin: true,
        // Dev-only: avoid TLS verification issues inside Docker/corp networks.
        secure: false,
      },
    },
  },
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
