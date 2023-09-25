self.addEventListener('push', function (event) {
  const body = event.data?.text() ?? '';

  event.waitUntil(
    self.registration.showNotification('GLA Notificator', {
      body,
    })
  )
})