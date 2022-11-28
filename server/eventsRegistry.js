class EventsRegistry {
  rum = []
  logs = []
  telemetry = []

  push(type, event) {
    this[type].push(event)
  }

  count() {
    return this.logs.length + this.rum.length + this.telemetry.length
  }

  empty() {
    this.rum.length = 0
    this.telemetry.length = 0
    this.logs.length = 0
  }
}

module.exports = EventsRegistry
