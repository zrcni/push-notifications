self.addEventListener("push", function(event) {
  try {
    console.log("[Service Worker] Push Received.")
    const data = JSON.parse(event.data.text())
    event.waitUntil(self.registration.showNotification(data.title, data.options))
  } catch (err) {
    console.error("[Service Worker] Push receive error: ", err)
  }
})
