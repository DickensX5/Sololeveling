const CACHE_NAME = 'solo-leveling-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
  '/sound.mp3'
];

// INSTALL — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH — serve from cache first (offline first)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// NOTIFICATION — daily quest reminder
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

// PUSH — receive push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || '⚔ SOLO LEVELING';
  const options = {
    body: data.body || 'Your daily quest awaits, Hunter. ARISE.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: '/' },
    actions: [
      { action: 'open', title: '▶ Enter Dungeon' },
      { action: 'close', title: 'Later' }
    ]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// SCHEDULE daily notification at 6AM
function scheduleDailyQuest() {
  const now = new Date();
  const next6AM = new Date();
  next6AM.setHours(6, 0, 0, 0);
  if(now >= next6AM) next6AM.setDate(next6AM.getDate() + 1);
  const msUntil6AM = next6AM - now;

  setTimeout(() => {
    self.registration.showNotification('⚔ NEW QUEST ASSIGNED', {
      body: 'A new day. A new quest. The system awaits you, Hunter.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [300, 100, 300, 100, 300, 100, 300],
      requireInteraction: true,
      actions: [
        { action: 'open', title: '▶ ARISE' },
        { action: 'close', title: 'Later' }
      ]
    });
    // Reschedule for next day
    setInterval(() => {
      self.registration.showNotification('⚔ NEW QUEST ASSIGNED', {
        body: 'A new day. A new quest. The system awaits you, Hunter.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [300, 100, 300, 100, 300, 100, 300],
        requireInteraction: true,
      });
    }, 24 * 60 * 60 * 1000);
  }, msUntil6AM);
}

scheduleDailyQuest();
