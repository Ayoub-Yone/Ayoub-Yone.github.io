/* Pages — Yone (default) / Eren, hash routing inside one document (legacy behavior preserved).
   Emits `page:change` so the scroll choreography can replay the hero entrance. */
import { loadErenArt } from "./art";
import { createBirds, type BirdsController } from "./birds";
import { $$ } from "./dom";
import { scroller } from "./scroller";

export type PageName = "yone" | "eren";
export interface PageChangeDetail { page: PageName; first: boolean }

const PAGE_TITLES: Record<PageName, string> = { yone: document.title, eren: "Eren Yeager — Attack on Titan" };

export const pageFromHash = (): PageName => (/^#eren(-|$)/.test(window.location.hash) ? "eren" : "yone");

export function initRouter(): void {
  const root = document.documentElement;
  const cats = $$("[data-cat]");
  let current: PageName | null = null;
  let birds: BirdsController | null | undefined;

  const route = () => {
    const name = pageFromHash();
    const first = current === null;
    const changed = name !== current;
    current = name;
    root.setAttribute("data-page-active", name);
    document.title = PAGE_TITLES[name];
    cats.forEach((link) => {
      if (link.dataset.cat === name) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (name === "eren") {
      loadErenArt();
      if (birds === undefined) birds = createBirds();
      birds?.enter();
    }
    if (!changed) return;
    window.dispatchEvent(new CustomEvent<PageChangeDetail>("page:change", { detail: { page: name, first } }));
    if (first) return;
    const id = window.location.hash.slice(1);
    const target = id && id !== "eren" ? document.getElementById(id) : null;
    scroller.to(target ?? 0, { immediate: true });
    if (name === "eren") birds?.enter();
  };
  window.addEventListener("hashchange", route);
  route();
}
