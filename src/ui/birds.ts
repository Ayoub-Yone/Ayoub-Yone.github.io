/* White birds crossing the Eren page as you scroll (1:1 port of the legacy behavior):
   scroll-driven flight, direction flip, idle cage-lock, click-to-release, release-all near the end. */
import { $ } from "./dom";

const BIRD_SVG = '<svg class="bird__svg" viewBox="0 0 64 60" aria-hidden="true" focusable="false">' +
  '<g class="bird__wing bird__wing--far"><path d="M27 29.5C23 21 18 14 11 8c10 2 19 11 27 21.5Z"/></g>' +
  '<path d="M4 31l8-2c10-4 24-4 34-1 4-2 7-2 9-.5L62 30l-7 1.5c-3 1.5-7 2-11 1C34 35 20 35 12 33Z"/>' +
  '<g class="bird__wing"><path d="M32 29.5C28 20 22 12 15 5c11 3 21 13 29 24.5Z"/></g>' +
  "</svg>";

const CAGE_SVG = (() => {
  const parts = [
    '<circle cx="50" cy="7" r="4" style="--d:0ms"/>',
    '<path d="M50 11v3" style="--d:90ms"/>'
  ];
  [14, 26, 38, 50, 62, 74, 86].forEach((x, i) => {
    parts.push('<path d="M50 14C' + (50 + (x - 50) * 1.25).toFixed(1) + " 34 " + (50 + (x - 50) * 1.1).toFixed(1) + " 66 " + x + ' 96" style="--d:' + (180 + i * 70) + 'ms"/>');
  });
  parts.push('<path d="M15 84Q50 91 85 84" style="--d:700ms"/>');
  parts.push('<path d="M11 96h78" style="--d:790ms"/>');
  parts.push('<path d="M14 96v6q36 7 72 0v-6" style="--d:880ms"/>');
  parts.push('<g class="cage-lock">' +
    '<path class="cage-lock__shackle" d="M45.5 99v-3.5a4.5 4.5 0 0 1 9 0V99"/>' +
    '<rect x="43.5" y="99" width="13" height="11" rx="2.2"/>' +
    '<circle class="cage-lock__hole" cx="50" cy="103.2" r="1.6"/>' +
    '<path class="cage-lock__hole" d="M50 104.4l-1.2 3.6h2.4z"/>' +
    "</g>");
  return '<svg class="bird__cage" viewBox="0 0 100 120" aria-hidden="true" focusable="false">' + parts.join("") + "</svg>";
})();

// size = width in px · speed = px travelled per px scrolled · offset = start position across the screen
const BIRDS = [
  { size: 60, y: 0.16, speed: 0.85, offset: 0.10, flap: 0.85, bob: 4.2, amp: 26, op: 0.95, blur: 0 },
  { size: 39, y: 0.30, speed: 0.55, offset: 0.55, flap: 0.95, bob: 5.0, amp: 18, op: 0.80, blur: 0 },
  { size: 29, y: 0.10, speed: 0.38, offset: 0.80, flap: 1.05, bob: 3.6, amp: 12, op: 0.75, blur: 0.4 },
  { size: 49, y: 0.62, speed: 0.72, offset: 0.30, flap: 0.90, bob: 4.6, amp: 24, op: 0.90, blur: 0 },
  { size: 34, y: 0.75, speed: 0.48, offset: 0.68, flap: 1.00, bob: 5.4, amp: 16, op: 0.70, blur: 0.4 },
  { size: 23, y: 0.45, speed: 0.30, offset: 0.92, flap: 1.10, bob: 3.9, amp: 10, op: 0.70, blur: 0.5 },
  { size: 44, y: 0.88, speed: 0.62, offset: 0.05, flap: 0.88, bob: 4.8, amp: 20, op: 0.85, blur: 0 }
];

const FEATHER_SVG = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
  '<path d="M17.5 2.5c-4.6.7-8.8 3.4-11.6 7.4-1.8 2.5-2.9 5.4-3.3 8.1 2.7-.4 5.6-1.5 8.1-3.3 4-2.8 6.7-7 7.4-11.6z" fill="#f4f1ea"/>' +
  '<path d="M3.5 17.5C7 12.5 11.5 7.5 17.5 2.5" fill="none" stroke="rgba(11,13,16,.35)" stroke-width=".8"/></svg>';

type BirdCfg = (typeof BIRDS)[number];
interface Bird { cfg: BirdCfg; el: HTMLDivElement; index: number; state: "fly" | "escaping" | "escaped"; x: number; y: number; dir: number; t0: number; prev: number; phase: number }

export interface BirdsController { enter(): void }

export function createBirds(): BirdsController | null {
  const layer = $("[data-birds]");
  if (!layer) return null;
  const art = $("[data-eren-art]");
  const items: Bird[] = BIRDS.map((cfg, index) => {
    const el = document.createElement("div");
    el.className = "bird";
    el.style.width = cfg.size + "px";
    el.style.opacity = String(cfg.op);
    if (cfg.blur) el.style.filter = "blur(" + cfg.blur + "px)";
    el.style.setProperty("--flap", cfg.flap + "s");
    el.style.setProperty("--bob", cfg.bob + "s");
    el.innerHTML = '<div class="bird__flip">' + BIRD_SVG + "</div>" + CAGE_SVG;
    layer.appendChild(el);
    return { cfg, el, index, state: "fly", x: 0, y: 0, dir: 1, t0: 0, prev: 0, phase: Math.random() * 6.28 };
  });
  for (let i = 0; i < 9; i++) {
    const f = document.createElement("div");
    f.className = "feather";
    f.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "vw");
    f.style.setProperty("--sway", Math.round(Math.random() * 140 - 50) + "px");
    f.style.setProperty("--dur", (11 + Math.random() * 9).toFixed(1) + "s");
    f.style.setProperty("--delay", (-Math.random() * 18).toFixed(1) + "s");
    f.style.setProperty("--op", (0.16 + Math.random() * 0.3).toFixed(2));
    f.style.width = Math.round(9 + Math.random() * 9) + "px";
    f.innerHTML = FEATHER_SVG;
    layer.appendChild(f);
  }
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let smooth = window.scrollY;
  let prev = smooth;
  let back = false;
  let raf = 0;

  const render = () => {
    raf = 0;
    const sy = window.scrollY;
    smooth += (sy - smooth) * 0.1;
    const delta = sy - prev;
    prev = sy;
    if (Math.abs(delta) > 1 && (delta < 0) !== back) {
      back = delta < 0;
      items.forEach((b) => { if (b.state === "fly") b.el.classList.toggle("is-back", back); });
    }
    items.forEach((b) => {
      if (b.state !== "fly") return;
      const cfg = b.cfg;
      const span = vw + cfg.size * 2;
      const x = (((cfg.offset * span + smooth * cfg.speed) % span) + span) % span - cfg.size;
      const y = cfg.y * vh + Math.sin(smooth * 0.0022 * (0.6 + cfg.speed) + b.index * 1.7) * cfg.amp;
      b.x = x;
      b.y = y;
      b.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    });
    if (art) art.style.setProperty("--edim", Math.min(0.56, 0.1 + (smooth / vh) * 0.45).toFixed(3));
    if (Math.abs(sy - smooth) > 0.3) raf = window.requestAnimationFrame(render);
  };
  const active = () => document.documentElement.getAttribute("data-page-active") === "eren";
  const kick = () => { if (active() && !raf) raf = window.requestAnimationFrame(render); };
  // Scroll stopped (and birds settled): wings freeze and a cage closes around each bird.
  let idleTimer = 0;
  const setIdle = (on: boolean) => layer.classList.toggle("is-idle", on);
  const checkIdle = () => {
    idleTimer = 0;
    if (!active()) return;
    if (Math.abs(window.scrollY - smooth) < 3) setIdle(true);
    else idleTimer = window.setTimeout(checkIdle, 120);
  };

  // ---- Release: a click on a bird opens its cage and it flies off-screen ----
  let escRaf = 0;
  const hitTest = (cx: number, cy: number): Bird | null => {
    for (const b of items) {
      if (b.state !== "fly") continue;
      const r = b.el.getBoundingClientRect();
      if (r.width && cx >= r.left - 8 && cx <= r.right + 8 && cy >= r.top - 8 && cy <= r.bottom + 8) return b;
    }
    return null;
  };
  const tickEscape = () => {
    escRaf = 0;
    const now = performance.now();
    let live = false;
    items.forEach((b) => {
      if (b.state !== "escaping") return;
      const dt = Math.min(48, now - b.prev);
      b.prev = now;
      const k = Math.min(1, (now - b.t0) / 1500);
      const ease = k * k * (3 - 2 * k);
      b.x += b.dir * (0.16 + 1.4 * ease) * dt;
      b.y += (-(0.38 * (1 - ease) + 0.05) + Math.sin((now - b.t0) * 0.006 + b.phase) * 0.05) * dt;
      if (b.x < -b.cfg.size * 2.4 || b.x > vw + b.cfg.size * 2.4 || b.y < -b.cfg.size * 3) {
        b.state = "escaped";
        b.el.style.visibility = "hidden";
        return;
      }
      b.el.style.transform = "translate3d(" + b.x.toFixed(1) + "px," + b.y.toFixed(1) + "px,0)";
      live = true;
    });
    if (live) escRaf = window.requestAnimationFrame(tickEscape);
  };
  const release = (b: Bird | null) => {
    if (!b || b.state !== "fly") return;
    b.state = "escaping";
    const el = b.el;
    el.classList.remove("is-hover");
    el.classList.add("is-free");
    el.style.setProperty("--flap", "0.3s");
    const r = el.getBoundingClientRect();
    if (r.width) { b.x = r.left; b.y = r.top; }
    b.dir = el.classList.contains("is-back") ? -1 : 1;
    el.style.setProperty("--face", String(b.dir));
    el.style.setProperty("--tilt", (b.dir * -12) + "deg");
    b.t0 = b.prev = performance.now();
    if (!escRaf) escRaf = window.requestAnimationFrame(tickEscape);
  };
  const releaseAll = () => {
    let n = 0;
    items.forEach((b) => {
      if (b.state !== "fly") return;
      n += 1;
      window.setTimeout(() => release(b), n * 130);
    });
  };
  // At the end of the Eren page, every remaining bird takes off.
  const maybeReleaseAtEnd = () => {
    if (!active()) return;
    const left = document.documentElement.scrollHeight - (window.scrollY + vh);
    if (left <= vh * 0.5) releaseAll();
  };

  const onScroll = () => {
    if (!active()) return;
    setIdle(false);
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(checkIdle, 200);
    kick();
    maybeReleaseAtEnd();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { vw = window.innerWidth; vh = window.innerHeight; kick(); });
  // Safety net: lock the cage even if rAF/scroll are throttled (background tab)
  let lastY = window.scrollY;
  let lastMoveAt = performance.now();
  window.setInterval(() => {
    if (!active()) { lastY = window.scrollY; lastMoveAt = performance.now(); return; }
    const sy = window.scrollY;
    if (sy !== lastY) {
      lastY = sy;
      lastMoveAt = performance.now();
      setIdle(false);
      kick();
      maybeReleaseAtEnd();
    } else if (!layer.classList.contains("is-idle") && performance.now() - lastMoveAt > 1600) {
      smooth = prev = sy;
      setIdle(true);
    }
  }, 250);

  document.addEventListener("click", (event) => {
    if (!active() || event.button) return;
    if (!(event.target instanceof Element) || event.target.closest("a,button,input,textarea,select,label")) return;
    release(hitTest(event.clientX, event.clientY));
  });

  let hoverRaf = 0;
  let mx = 0;
  let my = 0;
  document.addEventListener("mousemove", (event) => {
    if (!active()) {
      if (document.body.style.cursor) document.body.style.cursor = "";
      return;
    }
    mx = event.clientX;
    my = event.clientY;
    if (hoverRaf) return;
    hoverRaf = window.requestAnimationFrame(() => {
      hoverRaf = 0;
      const b = active() ? hitTest(mx, my) : null;
      items.forEach((it) => it.el.classList.toggle("is-hover", it === b));
      document.body.style.cursor = b ? "pointer" : "";
    });
  }, { passive: true });

  return {
    enter() {
      window.clearTimeout(idleTimer);
      setIdle(false);
      smooth = window.scrollY;
      prev = smooth;
      vw = window.innerWidth;
      vh = window.innerHeight;
      if (!raf) raf = window.requestAnimationFrame(render);
      maybeReleaseAtEnd();
    }
  };
}
