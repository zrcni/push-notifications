import React, { useEffect, useState } from "react"
import logo from "./logo.svg"
import "./App.css"

const PUBLIC_VAPID_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY

let swRegistration = null

if ("serviceWorker" in navigator && "PushManager" in window) {
  console.log("Service Worker and Push is supported")

  navigator.serviceWorker
    .register("sw.js")
    .then(swReg => {
      console.log("Service Worker is registered", swReg)
      swRegistration = swReg
    })
    .catch(function(error) {
      console.error("Service Worker Error", error)
    })
} else {
  console.warn("Push messaging is not supported")
}

async function updateSubscriptionOnServer(userId, subscription) {
  const data = {
    userId,
    subscription: subscription || null
  }
  await fetch(`${process.env.REACT_APP_PUSH_SERVER_URL}/subscribe`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
}

function App() {
  const [buttonEnabled, setButtonEnabled] = useState(true)
  const [isSubscribed, setSubscribed] = useState(false)
  const userId = "12345"

  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(PUBLIC_VAPID_KEY)
    if (!swRegistration) {
      return
    }
    swRegistration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey
      })
      .then(function(subscription) {
        console.log("User is subscribed.")

        updateSubscriptionOnServer(userId, subscription)
        setSubscribed(true)
        setButtonEnabled(true)
      })
      .catch(function(err) {
        console.error("Failed to subscribe the user: ", err)
        setButtonEnabled(true)
      })
  }

  function unsubscribeUser() {
    swRegistration.pushManager
      .getSubscription()
      .then(subscription => {
        if (subscription) {
          return subscription.unsubscribe()
        }
      })
      .then(() => {
        updateSubscriptionOnServer(userId, null)
        setSubscribed(false)
        setButtonEnabled(true)
      })
      .catch(err => {
        console.error("Error unsubscribing", err)
        // setSubscribed(false)
        // setButtonEnabled(true)
      })
  }

  useEffect(() => {
    // Set the initial subscription value
    swRegistration &&
      swRegistration.pushManager.getSubscription().then(async subscription => {
        const isSubscribed = !!subscription
        if (isSubscribed) {
          console.log("User is subscribed.")
        } else {
          console.log("User is NOT subscribed.")
        }
        setButtonEnabled(true)
      })
  }, [])

  return (
    <div className="App">
      <button
        id="push-button"
        disabled={!buttonEnabled}
        onClick={() => {
          setButtonEnabled(false)
          if (isSubscribed) {
            unsubscribeUser()
          } else {
            subscribeUser()
          }
        }}
      >
        {isSubscribed
          ? "Disable push notifications"
          : "Enable push notification"}
      </button>
    </div>
  )
}

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default App
