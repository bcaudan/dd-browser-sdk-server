init();

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
