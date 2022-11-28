const _ = require('lodash')

class EventsRegistry {
  rum = []
  logs = []
  telemetry = []
  callback = undefined

  push(type, event) {
    this[type].push(event)
    this.callback && this.callback()
  }

  count() {
    return this.logs.length + this.rum.length + this.telemetry.length
  }

  empty() {
    this.rum.length = 0
    this.telemetry.length = 0
    this.logs.length = 0
  }

  onPush(callback) {
    this.callback = _.throttle(callback, 100)
  }
}

module.exports = EventsRegistry
