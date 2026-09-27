const CACHE_NAME = 'zhuangcheng-shell-v3'
const BASE_URL = new URL('./', self.location.href)
const assetUrl = (path) => new URL(path, BASE_URL).href
const CORE_ASSETS = [
  '',
  'index.html',
  'manifest.webmanifest',
  'app-icon.svg',
  'app-icon-192.png',
  'app-icon-512.png',
  'apple-touch-icon.png',
].map(assetUrl)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith('zhuangcheng-') && key !== CACHE_NAME && key !== 'zhuangcheng-runtime-v1')
        .map((key) => caches.delete(key)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open('zhuangcheng-runtime-v1').then((cache) => cache.put(event.request, copy))
        }
        return response
      }).catch(() => caches.match(assetUrl('index.html')))
    }),
  )
})
