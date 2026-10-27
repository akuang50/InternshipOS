const isTop = window.top === window;
let packet = null;
let status = null;
let fillButton = null;
let actions = null;

if (isTop) {
  const root = document.createElement("aside");
  root.className = "ios-panel";
  root.innerHTML = `
    <header>
      <strong>InternshipOS</strong>
      <button type="button" aria-label="Close">×</button>
    </header>
    <p class="ios-status">Checking this posting against your feed…</p>
    <div class="ios-actions">
      <button type="button" class="ios-fill" disabled>Fill application</button>
    </div>
    <p class="ios-note">Fills empty fields from your profile. It does not guess salary or work authorization, and it does not submit.</p>
  `;
  document.documentElement.appendChild(root);
  root.querySelector("button[aria-label='Close']").addEventListener("click", () => root.remove());
  status = root.querySelector(".ios-status");
  fillButton = root.querySelector(".ios-fill");
  actions = root.querySelector(".ios-actions");
  fillButton.addEventListener("click", () => fillFromHere());
}

function fieldLabel(el) {
  const bits = [
    el.getAttribute("autocomplete"),
    el.getAttribute("aria-label"),
    el.getAttribute("name"),
    el.getAttribute("id"),
    el.getAttribute("placeholder"),
  ];
  if (el.id) {
    const explicit = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (explicit) bits.push(explicit.textContent);
  }
  const wrapping = el.closest("label");
  if (wrapping) bits.push(wrapping.textContent);
  let node = el.parentElement;
  for (let depth = 0; depth < 4 && node; depth += 1) {
    const labels = [...node.children].filter((child) => child.tagName === "LABEL");
    if (labels.length === 1) {
      bits.push(labels[0].textContent);
      break;
    }
    node = node.parentElement;
  }
  return bits.filter(Boolean).join(" ");
}

function writeValue(el, value) {
  if (el.tagName === "SELECT") {
    const option = [...el.options].find((item) => {
      const text = item.textContent.trim().toLowerCase();
      return text === value.toLowerCase() || item.value === value;
    });
    if (!option) return false;
    el.value = option.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.classList.add("ios-filled");
    return true;
  }
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.classList.add("ios-filled");
  return true;
}

function fillDocument(data) {
  const fields = [...document.querySelectorAll("input, textarea, select")];
  let filled = 0;
  let skipped = 0;
  let kept = 0;
  fields.forEach((el) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) return;
    if (el.disabled || el.readOnly) return;
    const type = (el.getAttribute("type") || "text").toLowerCase();
    if (["hidden", "password", "file", "submit", "button", "image", "reset", "checkbox", "radio"].includes(type)) return;
    const box = el.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) return;
    const plan = fieldPlan(fieldLabel(el), data);
    if (!plan) return;
    if (plan.skip || !plan.value) {
      skipped += 1;
      return;
    }
    if ("value" in el && String(el.value || "").trim()) {
      kept += 1;
      return;
    }
    if (writeValue(el, plan.value)) filled += 1;
  });
  return { filled, skipped, kept };
}

function report(result) {
  if (!status) return;
  const line = document.createElement("span");
  line.textContent = `Filled ${result.filled} empty field${result.filled === 1 ? "" : "s"}. Left ${result.skipped} blank. Kept ${result.kept} you had already typed. Review before you submit.`;
  status.appendChild(line);
}

function fillFromHere() {
  if (!packet) return { filled: 0, skipped: 0, kept: 0, message: "Sign in at InternshipOS, then reopen this page." };
  window.postMessage({ source: "internshipos", type: "fill" }, "*");
  const result = fillDocument(packet);
  report(result);
  return { ...result, message: `Filled ${result.filled} empty fields on this page.` };
}

window.addEventListener("message", (event) => {
  if (event.source !== window && event.source !== window.parent) return;
  if (!event.data || event.data.source !== "internshipos" || event.data.type !== "fill" || !packet) return;
  if (event.source === window) return;
  fillDocument(packet);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "fill") return;
  sendResponse(fillFromHere());
});

const title = document.title || "";
const company = location.hostname.split(".")[0] || "";
chrome.runtime.sendMessage({ type: "match", title, company, url: location.href }, (data) => {
  if (!data || data.error) {
    if (status) status.textContent = data?.error || "Couldn't reach InternshipOS. Start the app, sign in, then reload this page.";
    return;
  }
  packet = data.autofill || null;
  if (!isTop) return;
  fillButton.disabled = !packet;
  if (!data.matched) {
    status.textContent = data.message;
    return;
  }
  const job = data.job;
  const checklist = data.application?.checklist;
  status.textContent = "";
  const heading = document.createElement("strong");
  heading.textContent = `${job.company} — ${job.title}`;
  const match = document.createElement("span");
  match.textContent = `${job.match.overall}% match · ${job.freshness.label}`;
  const resume = document.createElement("span");
  resume.textContent = checklist?.resumeTailored ? "Resume tailored for this role." : "Resume not tailored yet. Fill uses your saved profile.";
  status.append(heading, match, resume);
  if (data.application) {
    const open = document.createElement("a");
    open.href = `${INTERNSHIPOS_ORIGIN}/applications/${data.application.id}`;
    open.target = "_blank";
    open.rel = "noreferrer";
    open.textContent = "Review";
    actions.appendChild(open);
  }
});
