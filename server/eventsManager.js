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
    serverEvents.onChange(dumpRegistry)
  })

  app.post('/empty', function (_, res) {
    serverEvents.empty()
    res.end()
  })
}

module.exports = { withEventsManager }
