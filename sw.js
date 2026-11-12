/* Photon BCS offline cache: everything is precached, served cache-first, refreshed when a new version deploys */
const C = 'pbcs-v1-xl-photon-bcs-1.1.3XL-805f65a5', FILES = ["./", "index.html", "manifest.webmanifest", "author.jpg", "author-cover.jpg", "icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png", "favicon-32.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pbcs-v1-xl-photon-bcs-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match('index.html')))); });
