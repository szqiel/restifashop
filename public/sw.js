self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo.svg',
      badge: '/logo.svg',
      vibrate: [200, 100, 200, 100, 200, 100, 200], // distinct pattern for orders
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/ibu-restifashop-dashboard',
      },
      requireInteraction: true, // Keep notification open until user interacts
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  const targetUrl = event.notification.data.url || '/ibu-restifashop-dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      // Check if a window matching the URL is already open and focus it
      const hadWindowToFocus = clientsArr.some((windowClient) => {
        if (windowClient.url.includes(targetUrl)) {
          windowClient.focus();
          return true;
        }
        return false;
      });
      // Otherwise open a new window
      if (!hadWindowToFocus) {
        clients.openWindow(targetUrl);
      }
    })
  );
});
