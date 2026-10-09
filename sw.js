var CACHE_NAME = 'jincun-mobile-v5';

self.addEventListener('install', function(e) {
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(names.map(function(name) {
                return caches.delete(name);
            }));
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;

    var url = new URL(e.request.url);

    // HTML文件：网络优先，离线才用缓存
    if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('loca.lt')) {
        e.respondWith(
            fetch(e.request).then(function(response) {
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            }).catch(function() {
                return caches.match(e.request);
            })
        );
        return;
    }

    // 其他文件：缓存优先
    e.respondWith(
        caches.match(e.request).then(function(cached) {
            if (cached) return cached;
            return fetch(e.request).then(function(response) {
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            });
        })
    );
});
