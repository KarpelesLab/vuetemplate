// Static service worker that adds version headers to asset requests
// This file remains the same across all deployments

let currentVersion = null;

// Listen for a message from the main thread to set the version
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_VERSION') {
    currentVersion = event.data.version;
  } else if (event.data && event.data.type === 'RESET_VERSION') {
    currentVersion = null;
  }
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  // Skip modification if we don't have a version
  if (!currentVersion) {
    return;
  }

  // Skip API requests (paths starting with /_)
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/_')) {
    return;
  }

  // Skip document requests (HTML pages)
  if (event.request.destination === 'document') {
    return;
  }

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Clone the request to modify it
  const modifiedRequest = new Request(event.request.url, {
    method: event.request.method,
    headers: new Headers(event.request.headers),
    mode: 'cors',
    credentials: event.request.credentials,
    redirect: event.request.redirect
  });

  // Add our version header
  modifiedRequest.headers.set('X-Version-Hint', currentVersion);

  // Use the modified request
  event.respondWith(
    fetch(modifiedRequest)
      .catch(error => {
        console.error('Service worker fetch error:', error);
        // Fall back to the original request if our modification fails
        return fetch(event.request);
      })
  );
});

// Cache management
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
