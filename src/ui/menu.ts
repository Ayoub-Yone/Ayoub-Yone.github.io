import { $ } from "./dom";

export function initMobileMenu(): void {
  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-menu]");
  if (!toggle || !menu) return;
  const root = document.documentElement;
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    root.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setOpen(!isOpen()));
  menu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => { if (event.matches) setOpen(false); });
}
