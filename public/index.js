window.testId = generateUUID()
console.log('testId', testId)
window.proxyUrl = `${window.location.origin}/proxy/${testId}`
window.clientToken = 'xxx';
window.applicationId = 'yyy';
window.serverEvents = {}

displayActions(testId);
displayServerContent(testId);

function displayActions(testId) {
  addButton("Init log", "init-log", () => {
    DD_LOGS.init({
      clientToken,
      proxyUrl,
      telemetrySampleRate: 100,
    });
  });

  addButton("Init rum", "init-rum", () => {
    DD_RUM.init({
      clientToken,
      applicationId,
      proxyUrl,
      trackInteractions: true,
      telemetrySampleRate: 100,
      enableExperimentalFeatures: [],
    });
  });

  addButton("Send a log", "send-log", () => {
    DD_LOGS.logger.log(`A click occured at ${new Date()}`);
  });

  addButton("Send a user action", "send-user-action", () => {
    DD_RUM.addAction("checkout", {
      cart: {
        amount: 42,
        currency: "$",
        nb_items: 2,
        items: ["socks", "t-shirt"],
      },
    });
  });

  addButton("Send a telemetry error", "send-telemetry-error", () => {
    const context = {
      get foo() {
        throw new window.Error("generated telemetry error");
      },
    };
    DD_RUM.addAction("foo", context);
  });

  addButton("Flush events", "flush-events", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState')
    Object.defineProperty(Document.prototype, 'visibilityState', { value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
    Object.defineProperty(Document.prototype, 'visibilityState', descriptor)
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
  })


  addButton("Empty server events", "empty-server-events", () => {
    void fetch(`${window.location.origin}/empty/${testId}`, {
      method: 'POST'
    })
  })
}

function displayServerContent(testId) {
  const rumContainer = document.createElement("details");
  rumContainer.setAttribute("open", "true")
  const rumSummary = document.createElement("summary");
  const rumContent = document.createElement("pre");
  rumSummary.innerText = "rum events (0)"
  rumContainer.appendChild(rumSummary)
  rumContainer.appendChild(rumContent)
  document.body.appendChild(rumContainer);
  const logsContainer = document.createElement("details");
  logsContainer.setAttribute("open", "true")
  const logsSummary = document.createElement("summary");
  const logsContent = document.createElement("pre");
  logsSummary.innerText = "logs events (0)"
  logsContainer.appendChild(logsSummary)
  logsContainer.appendChild(logsContent)
  document.body.appendChild(logsContainer);
  const telemetryContainer = document.createElement("details");
  telemetryContainer.setAttribute("open", "true")
  const telemetrySummary = document.createElement("summary");
  const telemetryContent = document.createElement("pre");
  telemetrySummary.innerText = "telemetry events (0)"
  telemetryContainer.appendChild(telemetrySummary)
  telemetryContainer.appendChild(telemetryContent)
  document.body.appendChild(telemetryContainer);

  const wsUrl = `${window.location.origin.replace(/^http/, 'ws')}/read/${testId}`
  const ws = new WebSocket(wsUrl)
  ws.onmessage = function (event) {
    serverEvents = JSON.parse(event.data);
    rumSummary.innerText = `rum events (${serverEvents.rum.length})`
    logsSummary.innerText = `logs events (${serverEvents.logs.length})`
    telemetrySummary.innerText = `telemetry events (${serverEvents.telemetry.length})`
    rumContent.innerText = JSON.stringify(serverEvents.rum, null, 2)
    logsContent.innerText = JSON.stringify(serverEvents.logs, null, 2)
    telemetryContent.innerText = JSON.stringify(serverEvents.telemetry, null, 2)
  }
}

function addButton(label, id, handler) {
  const button = document.createElement("button");
  button.innerText = label;
  button.id = id;
  button.addEventListener("click", handler);

  const container = document.createElement("p");
  container.appendChild(button);
  document.body.appendChild(container);
}

function generateUUID(placeholder) {
  return placeholder
    ? // eslint-disable-next-line  no-bitwise
    (parseInt(placeholder, 10) ^ ((Math.random() * 16) >> (parseInt(placeholder, 10) / 4))).toString(16)
    : `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateUUID)
}
