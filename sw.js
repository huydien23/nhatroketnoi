const CACHE_NAME = "nhatroketnoi-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/404.html",
  "/manifest.json",
  "/assets/css/layouts/main.css",
  "/assets/css/pages/index.css",
  "/assets/css/pages/auth.css",
  "/assets/css/components/testimonial.css",
  "/assets/css/user-dropdown.css",
  "/assets/js/main.js",
  "/assets/js/auth.js",
  "/assets/js/testimonial.js",
  "/assets/js/ai-chat.js",
  "/assets/image/logo.svg",
  "/assets/image/favicon.svg",
  "/assets/image/404-illustration.svg",
  "/assets/image/background.jpg",
  "/pages/auth/dangnhap.html",
  "/pages/auth/dangky.html",
  "/pages/phong/phong.html",
  "/pages/tintuc.html",
  "/pages/thongtin.html",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching assets");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle network requests
self.addEventListener("fetch", (event) => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith("http")) return;

  // Cache First strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();

          if (
            event.request.method === "GET" &&
            (event.request.url.endsWith(".html") ||
              event.request.url.endsWith(".css") ||
              event.request.url.endsWith(".js") ||
              event.request.url.includes("/assets/"))
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch((error) => {
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline.html");
          }

          console.error("Fetch failed:", error);
        });
    })
  );
});
