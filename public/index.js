init();
displayActions();
displayServerContent();

function init() {
  if (!window.DD_LOGS || !window.DD_RUM) {
    displayError("The browser SDK is not loaded.");
    return;
  }
  const params = new URLSearchParams(location.search);
  const clientToken = params.get("client_token");
  const applicationId = params.get("application_id");
  const site = params.get("site") || undefined;

  if (!clientToken || !applicationId) {
    displayError("Missing client_token or application_id in URL parameters.");
    return;
  }

  DD_LOGS.init({
    site,
    clientToken,
    telemetrySampleRate: 100,
    proxyUrl: `${window.location.origin}/proxy`
  });

  DD_RUM.init({
    site,
    clientToken,
    applicationId,
    trackInteractions: true,
    telemetrySampleRate: 100,
    enableExperimentalFeatures: [],
    proxyUrl: `${window.location.origin}/proxy`
  });

  function displayError(text) {
    const container = document.createElement("p");
    container.innerText = text;
    document.body.appendChild(container);
  }
}

function displayActions() {
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

  addButton("Flush events", "flush-events", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState')
    Object.defineProperty(Document.prototype, 'visibilityState', { value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
    Object.defineProperty(Document.prototype, 'visibilityState', descriptor)
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
  })


  addButton("Empty server events", "empty-server-events", () => {
    void fetch(`${window.location.origin}/empty`, {
      method: 'POST'
    })
  })
}

function displayServerContent() {
  const rumContainer = document.createElement("details");
  const rumSummary = document.createElement("summary");
  const rumContent = document.createElement("pre");
  rumSummary.innerText = "rum events"
  rumContainer.appendChild(rumSummary)
  rumContainer.appendChild(rumContent)
  document.body.appendChild(rumContainer);
  const logsContainer = document.createElement("details");
  const logsSummary = document.createElement("summary");
  const logsContent = document.createElement("pre");
  logsSummary.innerText = "log events"
  logsContainer.appendChild(logsSummary)
  logsContainer.appendChild(logsContent)
  document.body.appendChild(logsContainer);

  const wsUrl = `${window.location.origin.replace(/^http/, 'ws')}/read`
  const ws = new WebSocket(wsUrl)
  ws.onmessage = function (event) {
    let serverEvents = JSON.parse(event.data);
    rumSummary.innerText = `rum events (${serverEvents.rum.length})`
    logsSummary.innerText = `logs events (${serverEvents.logs.length})`
    rumContent.innerText = JSON.stringify(serverEvents.rum, null, 2)
    logsContent.innerText = JSON.stringify(serverEvents.logs, null, 2)
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
