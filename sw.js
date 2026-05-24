// Service Worker for TaskMaster PWA
const CACHE_NAME = 'taskmaster-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/settings.html',
  '/manifest.json'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 網取請攔截
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
            // 如果有快取，返回快取
            if (response) {
                return response;
            }
            
            // 否則發送網路請求
            return fetch(event.request);
        })
    );
});

// 處理推送通知
self.addEventListener('push', event => {
    const options = {
        body: event.data?.body || 'TaskMaster 通知',
        icon: '/icons/icon-512x512.svg',
        badge: '/icons/icon-96x96.svg',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        silent: false
    };
    
    event.waitUntil(
        self.registration.showNotification(options)
    );
});

// 處理訂閱通知點擊
self.addEventListener('notificationclick', event => {
    event.notification.close();
    // 可以在這裡添加點擊處理邏輯
    if (event.notification.data?.url) {
        clients.openWindow(event.notification.data.url);
    }
});

// 處理訊息來自主應用程式
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
