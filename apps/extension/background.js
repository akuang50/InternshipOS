importScripts("config.js");

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "match") return;
  const params = new URLSearchParams({
    title: message.title || "",
    company: message.company || "",
    url: message.url || "",
  });
  fetch(`${INTERNSHIPOS_ORIGIN}/api/extension/match?${params}`, { credentials: "include" })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        sendResponse({ error: `Sign in at ${INTERNSHIPOS_ORIGIN}, then reopen this posting.` });
        return;
      }
      sendResponse(data);
    })
    .catch(() => sendResponse({ error: `InternshipOS isn't reachable at ${INTERNSHIPOS_ORIGIN}.` }));
  return true;
});
