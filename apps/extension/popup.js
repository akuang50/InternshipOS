document.getElementById("open").href = INTERNSHIPOS_ORIGIN;
document.getElementById("fill").addEventListener("click", () => {
  const result = document.getElementById("result");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) {
      result.textContent = "Open an application page first.";
      return;
    }
    chrome.tabs.sendMessage(tab.id, { type: "fill" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        result.textContent = "This page is not a Greenhouse, Lever, Ashby, or Workday application.";
        return;
      }
      result.textContent = response.message;
    });
  });
});
