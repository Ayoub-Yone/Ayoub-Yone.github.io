/* Navigation state, scroll-spy, one-shot reveals, and the pointer-tracked glass sheen. */
import { $, $$, reducedMotion } from "./dom";

export function initScrollReveal(): void {
  $$("[data-stagger]").forEach((group) => {
    Array.from(group.children).forEach((child, index) => (child as HTMLElement).style.setProperty("--i", String(index)));
  });
  const items = $$(".reveal");
  if (!items.length) return;
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((node) => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  items.forEach((node) => observer.observe(node));
}

export function initNav(): void {
  const nav = $("[data-nav]");
  let ticking = false;
  const update = () => {
    nav?.classList.toggle("is-scrolled", window.scrollY > 12);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });
  update();

  const spyMap: Record<string, string> = { top: "", yone: "yone", style: "style", jungle: "style", stats: "stats", profils: "profils", carte: "" };
  const links = $$<HTMLAnchorElement>(".nav__links a[data-spy]");
  const sections = Object.keys(spyMap).map((id) => document.getElementById(id)).filter((n): n is HTMLElement => !!n);
  if (!links.length || !sections.length) return;
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const key = spyMap[entry.target.id];
      links.forEach((link) => {
        const active = link.dataset.spy === key;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  sections.forEach((section) => spy.observe(section));
}

/* Profile cards: pointer-tracked radial glow (CSS vars only), one rAF-batched read then write. */
export function initGlow(): void {
  if (!window.matchMedia("(hover: hover)").matches || reducedMotion()) return;
  let target: HTMLElement | null = null;
  let x = 0;
  let y = 0;
  let raf = 0;
  const flush = () => {
    raf = 0;
    if (!target) return;
    const r = target.getBoundingClientRect();
    target.style.setProperty("--mx", (((x - r.left) / r.width) * 100).toFixed(1) + "%");
    target.style.setProperty("--my", (((y - r.top) / r.height) * 100).toFixed(1) + "%");
  };
  document.addEventListener("pointermove", (event) => {
    const el = event.target instanceof Element ? event.target.closest<HTMLElement>(".glow") : null;
    if (!el) return;
    target = el;
    x = event.clientX;
    y = event.clientY;
    if (!raf) raf = window.requestAnimationFrame(flush);
  }, { passive: true });
}
