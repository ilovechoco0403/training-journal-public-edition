'use strict';
const CACHE='runner-public-journal-dev-20260928-3';
const ROOT=new URL('./',self.location).href;
const ASSETS=['./','index.html','styles.css?v=public-dev-20260928-3','app.js?v=public-dev-20260928-3','vendor/xlsx.full.min.js','manifest.webmanifest?v=public-dev-20260928-3','icon.svg?v=public-dev-20260928-3','icon-192.png?v=public-dev-20260928-3','icon-512.png?v=public-dev-20260928-3'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(p=>new Request(new URL(p,ROOT).href,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('runner-public-journal-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
if(event.request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(cache=>cache.match(new URL('index.html',ROOT).href)).then(cached=>cached||fetch(event.request)));return;}
event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(cached=>cached||fetch(event.request)));
});
