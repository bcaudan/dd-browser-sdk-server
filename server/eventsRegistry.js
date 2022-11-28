const _ = require('lodash')

class EventsRegistry {
  eventsByTestId = {}

  push(testId, type, event) {
    if (!this.eventsByTestId[testId]) {
      console.error('missing test id', testId)
      return
    }
    this.eventsByTestId[testId][type].push(event)
    this.eventsByTestId[testId].onChangeCallback()
  }

  get(testId) {
    if (!this.eventsByTestId[testId]) {
      console.error('missing test id', testId)
      return
    }
    return this.eventsByTestId[testId]
  }

  empty(testId) {
    if (!this.eventsByTestId[testId]) {
      console.error('missing test id', testId)
      return
    }
    this.eventsByTestId[testId].rum.length = 0
    this.eventsByTestId[testId].telemetry.length = 0
    this.eventsByTestId[testId].logs.length = 0
    this.eventsByTestId[testId].onChangeCallback()
  }

  init(testId, callback) {
    if (!this.eventsByTestId[testId]) {
      this.eventsByTestId[testId] = {
        rum: [],
        logs: [],
        telemetry: [],
        onChangeCallback: _.throttle(callback, 100)
      }
    }
  }
}

module.exports = EventsRegistry
