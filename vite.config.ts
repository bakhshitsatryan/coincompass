import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CoinStats' API returns `access-control-allow-origin: *`, so the browser can
// call it directly — no proxy needed. We keep an optional dev proxy under
// `/cs-proxy` as a safety hatch in case CORS ever changes for an endpoint.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/cs-proxy': {
        target: 'https://api.coinstats.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cs-proxy/, ''),
      },
    },
  },
})
