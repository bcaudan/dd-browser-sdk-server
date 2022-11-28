const _ = require('lodash')

class EventsRegistry {
  rum = []
  logs = []
  telemetry = []
  onChangeCallback = undefined

  push(type, event) {
    this[type].push(event)
    this.onChangeCallback && this.onChangeCallback()
  }

  count() {
    return this.logs.length + this.rum.length + this.telemetry.length
  }

  empty() {
    this.rum.length = 0
    this.telemetry.length = 0
    this.logs.length = 0
    this.onChangeCallback && this.onChangeCallback()
  }

  onChange(callback) {
    this.onChangeCallback = _.throttle(callback, 100)
  }
}

module.exports = EventsRegistry
