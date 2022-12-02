const express = require("express")
const cors = require("cors")
const https = require("https")
const FormData = require("form-data")
const connectBusboy = require('connect-busboy');

function withIntake(app, eventsRegistry) {
  app.use(cors())
  app.use(express.text())
  app.use(connectBusboy({ immediate: true }))

  app.post('/proxy/:testId', (req, res) => {
    storeEvents(req, eventsRegistry);
    forwardToIntake(req, res)
  })
}

function storeEvents(req, eventsRegistry) {
  const testId = req.params.testId;
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
}

function forwardToIntake(req, res) {
  if (/^https:\/\/(rum|logs)\.browser-intake-datadoghq\.com\//.test(req.query.ddforward)) {
    // console.log('forward', req.query.ddforward)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'Content-Length': req.body.length,
        'X-Forwarded-For': req.socket.remoteAddress,
        'User-Agent': req.headers['user-agent']
      }
    }
    const intakeReq = https.request(req.query.ddforward, options, () =>  {
      // console.log('intake response received')
      res.end()
    })
    intakeReq.write(req.body)
    intakeReq.on('error', console.error)
    intakeReq.end()
  } else if (/^https:\/\/session-replay\.browser-intake-datadoghq\.com\//.test(req.query.ddforward)) {
    console.log('session-replay forward')
    if (req.busboy) {
      const form = new FormData()
      req.busboy.on('file', (name, file, {filename}) => {
        console.log('received file')
        form.append(name, file, {filename})
        const options = {
          method: 'POST',
          headers: {
            ...form.getHeaders(),
            'X-Forwarded-For': req.socket.remoteAddress,
            'User-Agent': req.headers['user-agent']
          }
        }
        const intakeReq = https.request(req.query.ddforward, options)
        form.pipe(intakeReq)
        intakeReq.on('response', function() {
          console.log('intake response received')
          res.end()
        });
      });
      req.busboy.on('field', (name, value, _info) => {
        console.log('received field')
        form.append(name, value)
      });
      req.busboy.on('close', () => {
      })
    }
  } else {
    console.log('cancel intake forwarding')
    res.end()
  }
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
