import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'dev-html-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (/^\/(?:index\.html|qr|maraton|semana\/[1-6])?(?:\?.*)?$/.test(req.url || '/')) {
            req.url = '/index.source.html'
          }
          next()
        })
      },
    },
  ],
  server: { proxy: { '/api/maraton': { target: 'http://127.0.0.1:8787', ws: true } } },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.source.html'),
      },
    },
  },
})
