const CACHE_NAME = "ndc-attendance-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./assets/ndc-logo.jpeg"
];


/* INSTALL */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())

    );

});


/* ACTIVATE */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            );

        }).then(() => self.clients.claim())

    );

});


/* FETCH */

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(networkResponse => {

                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(
                                        event.request,
                                        responseClone
                                    );
                                });

                        }

                        return networkResponse;

                    })
                    .catch(() => {

                        return caches.match("./index.html");

                    });

            })

    );

});
