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

// Cài đặt Service Worker và cache các static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Xóa bỏ cache cũ khi có phiên bản mới của Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log("Xóa cache cũ:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Xử lý các request network
self.addEventListener("fetch", (event) => {
  // Bỏ qua các request không phải HTTP/HTTPS
  if (!event.request.url.startsWith("http")) return;

  // Chiến lược Cache First, sau đó Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Trả về từ cache nếu có
      if (cachedResponse) {
        return cachedResponse;
      }

      // Nếu không có trong cache, fetch từ network
      return fetch(event.request)
        .then((response) => {
          // Kiểm tra response hợp lệ
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone response để cache
          const responseToCache = response.clone();

          // Chỉ cache tài nguyên static và các trang HTML
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
          // Nếu không có internet và là trang HTML, chuyển về trang offline
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline.html");
          }

          console.error("Fetch thất bại:", error);
        });
    })
  );
});
