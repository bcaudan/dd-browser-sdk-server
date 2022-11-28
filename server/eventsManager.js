const expressWsFn = require('express-ws')

function withEventsManager(app, eventsRegistry) {
  expressWsFn(app)
  app.ws('/read/:testId', function (ws, req) {
    const testId = req.params.testId;
    console.log('client connected', testId)
    const dumpRegistry = () => {
      const testEvents = eventsRegistry.get(testId);
      ws.send(JSON.stringify({
        rum: testEvents.rum,
        logs: testEvents.logs,
        telemetry: testEvents.telemetry
      }))
    };
    eventsRegistry.init(testId, dumpRegistry)
    dumpRegistry()
  })

  app.post('/empty/:testId', function (req, res) {
    const testId = req.params.testId;
    eventsRegistry.empty(testId)
    res.end()
  })
}

module.exports = { withEventsManager }
