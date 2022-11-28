const express = require("express")
const cors = require("cors")

function withIntake(app, serverEvents) {
  app.use(cors())
  app.use(express.text())

  app.post('/proxy', (req, res) => {
    const intakeType = computeIntakeType(req)
    if (intakeType !== 'sessionReplay') {
      req.body.split('\n').map(rawEvent => {
        const event = JSON.parse(rawEvent)
        if (intakeType === 'rum' && event.type === 'telemetry') {
          serverEvents.push('telemetry', event)
        } else {
          serverEvents.push(intakeType, event)
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
