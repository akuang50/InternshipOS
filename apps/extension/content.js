const root = document.createElement("aside");
root.className = "ios-panel";
root.innerHTML = `
  <header>
    <strong>InternshipOS</strong>
    <button type="button" aria-label="Close">×</button>
  </header>
  <p class="ios-status">Checking this posting against your feed…</p>
`;
document.documentElement.appendChild(root);
root.querySelector("button").addEventListener("click", () => root.remove());

const title = document.title || "";
const company = location.hostname.split(".")[0] || "";
chrome.runtime.sendMessage({ type: "match", title, company, url: location.href }, (data) => {
  const status = root.querySelector(".ios-status");
  if (!data || data.error) {
    status.textContent = data?.error || "Couldn't reach InternshipOS.";
    return;
  }
  if (!data.matched) {
    status.textContent = data.message;
    return;
  }
  const job = data.job;
  const checklist = data.application?.checklist;
  status.innerHTML = `
    <strong>${job.company} — ${job.title}</strong>
    <span>${job.match.overall}% match · ${job.freshness.label}</span>
    <span>Resume: ${checklist?.resumeTailored ? "tailored" : "not tailored yet"}</span>
    <span>Network: not connected in this version</span>
    <span class="ios-note">Autofill stops at review. It will not guess work authorization or salary, and it will not submit.</span>
  `;
  const actions = document.createElement("div");
  actions.className = "ios-actions";
  const open = document.createElement("a");
  open.href = data.application
    ? `${INTERNSHIPOS_ORIGIN}/applications/${data.application.id}`
    : `${INTERNSHIPOS_ORIGIN}/opportunities?job=${job.id}`;
  open.target = "_blank";
  open.rel = "noreferrer";
  open.textContent = data.application ? "Review" : "Prepare";
  actions.appendChild(open);
  root.appendChild(actions);
});
