require("dotenv").config()
const express = require("express")
const webPush = require("web-push")
const bodyParser = require("body-parser")
const path = require("path")
const cors = require("cors")
const morgan = require('morgan')

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.json())

const publicVapidKey = process.env.PUBLIC_VAPID_KEY
const privateVapidKey = process.env.PRIVATE_VAPID_KEY

webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  publicVapidKey,
  privateVapidKey
)

const subscriptions = new Map()

app.get('subscriptions', (req, res) => {
  res.status(200).json(JSON.parse(subscriptions))
})

app.post('/push', (req, res) => {
  const { message } = req.body
  res.status(201).json({})
console.log('mESSAGE', message)
  const payload = JSON.stringify({
    title: message,
    options: {
      body: "This is from the server whoooaa",
      icon: undefined,
      badge: undefined
    }
  })
  
  subscriptions.forEach(subscription => {
    webPush
      .sendNotification(subscription, payload)
      .catch(error => console.error(error))
  })
})

app.post("/subscribe", (req, res) => {
  const { userId, subscription } = req.body
  console.log('body:', req.body)
  res.status(201).json({})

  const payload = JSON.stringify({
    title: subscription !== null ? "subscribbled" : "unsubscribbled",
    options: {
      body: "This is from the server whoooaa",
      icon: undefined,
      badge: undefined
    }
  })
  
  if (subscription === null) {
    subscriptions.delete(userId)
  } else {
    if (!subscriptions.has(userId)) {
      subscriptions.set(userId, subscription)
    }
  }
})

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000
app.set("port", port)

const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`)
})
