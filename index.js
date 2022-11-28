const path = require('path')
const express = require('express')
const EventsRegistry = require("./server/eventsRegistry");
const { withEventsManager } = require("./server/eventsManager");
const { withIntake } = require("./server/intake");

const port = process.env.PORT || 5000;
const app = express()

const eventsRegistry = new EventsRegistry();
withEventsManager(app, eventsRegistry)
withIntake(app, eventsRegistry)

app.use(express.static(path.join(__dirname, './public')))

app.get('/status', (_, res) => {
  res.send('ok')
})

app.listen(port, () => console.log(`Server listening on port ${port}.`))
