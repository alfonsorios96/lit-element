const CACHE_NAME = 'my-site-cache-v1';

const urlsToCache = [
    '/ChatApp.js',
    '/style.css'
];

self.addEventListener('activate', event => {
    const cacheAllowlist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
            )
    );
});

self.addEventListener('push', async (event) => {
    if (event.data.text() === 'new-email') {
        const cache = await caches.open(CACHE_NAME);
        const response = await fetch('/inbox.json');
        await cache.put('/inbox.json', response.clone());
        const emails = await response.json();

        self.registration.showNotification("New email", {
            body: "From " + emails[0].from.name,
            tag: "new-email"
        });
    }
});

self.addEventListener('notificationclick', event => {
    if (event.notification.tag === 'new-email') {
        // Assume that all of the resources needed to render
        // /inbox/ have previously been cached, e.g. as part
        // of the install handler.
        new WindowClient();
    }
});
