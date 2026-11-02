// Обработчики push-уведомлений (pr-083). Service Worker собирает Workbox, этот
// файл он подключает через importScripts: так кэширование и push живут в одном
// воркере
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'VitiGuard MD', {
      body: data.body || '',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      lang: 'ru',
      data: { url: data.url || '/' },
    }),
  )
})

// Нажатие открывает приложение: уже открытая вкладка переходит по ссылке,
// иначе открывается новая
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data.url, self.location.origin).href
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        const open = windows.find((client) => 'navigate' in client)
        return open
          ? open.navigate(url).then((client) => client && client.focus())
          : self.clients.openWindow(url)
      }),
  )
})
