const expressWsFn = require('express-ws')

function withEventsManager(app, serverEvents) {
  expressWsFn(app)
  app.ws('/read', function (ws, req) {
    console.log('client connected')
    const dumpRegistry = () => {
      ws.send(JSON.stringify({
        rum: serverEvents.rum,
        logs: serverEvents.logs
      }))
    };
    dumpRegistry()
    serverEvents.onPush(dumpRegistry)
  })
}

module.exports = { withEventsManager }
