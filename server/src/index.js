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

const subscriptions = {}

app.get('/subscriptions', (req, res) => {
  res.status(200).json(subscriptions)
})

app.post('/push', (req, res) => {
  const { message, icon, badge } = req.body
  res.status(201).json({})

  const payload = JSON.stringify({
    title: message,
    options: {
      body: "This is from the server whoooaa",
      icon,
      badge,
    }
  })
  
  Object.values(subscriptions).forEach(subscription => {
    webPush
      .sendNotification(subscription, payload)
      .catch(error => console.error(error))
  })
})

app.post("/subscribe", (req, res) => {
  const { userId, subscription } = req.body
  res.status(201).json({})

  if (subscription === null) {
    subscriptions[userId] = undefined
  } else {
    if (!(userId in subscriptions)) {
      subscriptions[userId] = subscription
    }
  }
})

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000

const server = app.listen(port, () => {
  console.log(`Express running on PORT ${port}`)
})
