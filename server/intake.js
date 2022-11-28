const express = require("express")
const cors = require("cors")

function withIntake(app, eventsRegistry) {
  app.use(cors())
  app.use(express.text())

  app.post('/proxy/:testId', (req, res) => {
    const testId = req.params.testId;
    console.log('testId', testId)
    const intakeType = computeIntakeType(req)
    if (intakeType !== 'sessionReplay') {
      req.body.split('\n').map(rawEvent => {
        const event = JSON.parse(rawEvent)
        if (intakeType === 'rum' && event.type === 'telemetry') {
          eventsRegistry.push(testId, 'telemetry', event)
        } else {
          eventsRegistry.push(testId, intakeType, event)
        }
      })
    }
    res.end()
  })
}


function computeIntakeType(req) {
  const ddforward = req.query.ddforward
  if (!ddforward) {
    throw new Error('ddforward is missing')
  }

  let intakeType
  const forwardUrl = new URL(ddforward)
  const endpoint = forwardUrl.pathname.split('/').pop()
  if (endpoint === 'logs' || endpoint === 'rum') {
    intakeType = endpoint
  } else if (endpoint === 'replay') {
    intakeType = 'sessionReplay'
  } else {
    throw new Error("Can't find intake type")
  }
  return intakeType
}

module.exports = { withIntake }
