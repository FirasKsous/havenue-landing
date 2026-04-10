import { defineConfig, type PluginOption, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const POLICY_SLUGS = ['privacy-policy', 'cookie-policy', 'marketing-policy'] as const

// Vite dev server does not auto-resolve directory index.html files from publicDir,
// so requests like /privacy-policy/ fall through to the SPA history fallback and
// serve the root index.html (which shows the hero). In production and `vite preview`
// these routes work correctly, so this middleware only patches dev parity.
function staticPolicyRoutes(): PluginOption {
  return {
    name: 'havenue-static-policy-routes',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        const url = req.url.split('?')[0].replace(/\/+$/, '')
        for (const slug of POLICY_SLUGS) {
          if (url === `/${slug}` || url === `/${slug}/index.html`) {
            const filePath = path.resolve(__dirname, 'public', slug, 'index.html')
            try {
              const body = fs.readFileSync(filePath, 'utf8')
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
              res.statusCode = 200
              res.end(body)
              return
            } catch {
              // fall through
            }
          }
        }
        return next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), staticPolicyRoutes()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
})
