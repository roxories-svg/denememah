import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function pwaServiceWorkerPlugin() {
  return {
    name: 'mahir-hocam-pwa-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const bundledAssets = Object.entries(bundle)
        .filter(([fileName, asset]) => asset.type === 'chunk' || (asset.type === 'asset' && fileName.endsWith('.css')))
        .map(([fileName]) => `/${fileName}`)
      const precacheUrls = [...new Set([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.png',
        '/apple-touch-icon.png',
        '/app-icon-192.png',
        '/app-icon-512.png',
        '/app-icon-maskable-512.png',
        '/banner.png',
        ...bundledAssets
      ])]

      const serviceWorker = `
const CACHE_NAME = 'mahir-hocam-pwa-v1'
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)}
const PRECACHED_PATHS = new Set(PRECACHE_URLS.map((path) => new URL(path, self.location.origin).pathname))

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('mahir-hocam-pwa-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy))
          }
          return response
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/index.html')) || Response.error())
    )
    return
  }

  const isStaticAsset = PRECACHED_PATHS.has(url.pathname) || ['script', 'style', 'image', 'font'].includes(request.destination)
  if (!isStaticAsset) return

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
      }
      return response
    }))
  )
})
`

      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorker })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pwaServiceWorkerPlugin(),
  ],
  base: '/', // Vercel ve statik barındırma servisleri için kök dizin tanımı
})
