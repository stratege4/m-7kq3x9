const APP = "mallorca-app-v1", TILES = "mallorca-tiles-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => ![APP,TILES].includes(k)).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET") return;
  if(url.hostname.includes("arcgisonline.com") || url.hostname === "upload.wikimedia.org" || url.hostname.includes("gstatic.com")){
    e.respondWith(caches.open(TILES).then(async c => { const hit = await c.match(e.request); if(hit) return hit; try{ const res = await fetch(e.request); if(res.ok || res.type==="opaque") c.put(e.request, res.clone()); return res; }catch(err){ return hit || Response.error(); } }));
    return;
  }
  if(url.origin === location.origin || url.hostname === "cdnjs.cloudflare.com" || url.hostname === "fonts.googleapis.com"){
    e.respondWith(caches.open(APP).then(async c => { const hit = await c.match(e.request); const net = fetch(e.request).then(res => { if(res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit); return hit || net; }));
  }
});
