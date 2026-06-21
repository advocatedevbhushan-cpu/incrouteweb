/**
 * Page Load Progress Bar — Thin neon green line at top of viewport.
 * Fills 0% → 100% on page load. Also exposes start/done for SPA navigation.
 */

let barEl: HTMLDivElement | null = null;
let trickleInterval: ReturnType<typeof setInterval> | null = null;
let currentProgress = 0;

function createBar(): HTMLDivElement {
  const bar = document.createElement("div");
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    width: 0%;
    background: linear-gradient(90deg, #4F46E5, #0D9488);
    z-index: 99999;
    transition: width 0.3s ease-out, opacity 0.3s ease;
    box-shadow: 0 0 6px rgba(79, 70, 229, 0.45);
    pointer-events: none;
  `;
  document.body.appendChild(bar);
  return bar;
}

function setProgress(n: number) {
  currentProgress = Math.min(n, 99.5);
  if (barEl) {
    barEl.style.width = `${currentProgress}%`;
    barEl.style.opacity = "1";
  }
}

function trickle() {
  if (currentProgress < 20) {
    setProgress(currentProgress + 3);
  } else if (currentProgress < 50) {
    setProgress(currentProgress + 2);
  } else if (currentProgress < 80) {
    setProgress(currentProgress + 0.5);
  } else if (currentProgress < 99) {
    setProgress(currentProgress + 0.1);
  }
}

export function startProgress() {
  currentProgress = 0;
  if (!barEl) barEl = createBar();
  setProgress(5);
  if (trickleInterval) clearInterval(trickleInterval);
  trickleInterval = setInterval(trickle, 200);
}

export function doneProgress() {
  if (trickleInterval) {
    clearInterval(trickleInterval);
    trickleInterval = null;
  }
  setProgress(100);
  setTimeout(() => {
    if (barEl) {
      barEl.style.opacity = "0";
      setTimeout(() => {
        if (barEl) barEl.style.width = "0%";
        currentProgress = 0;
      }, 300);
    }
  }, 200);
}

export function initProgressBar() {
  if (typeof window === "undefined") return;

  barEl = createBar();

  // Simulate page load progress
  startProgress();

  // Complete when page is fully loaded
  if (document.readyState === "complete") {
    doneProgress();
  } else {
    window.addEventListener("load", () => doneProgress(), { once: true });
    // Fallback: complete after 2s max
    setTimeout(() => doneProgress(), 2000);
  }
}
