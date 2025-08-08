self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installed");
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
});

self.addEventListener("fetch", (event) => {
  // You can intercept requests here if needed
});
