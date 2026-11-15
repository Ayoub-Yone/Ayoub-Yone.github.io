/* Tiny indirection so UI modules can scroll without knowing whether Lenis is active.
   ScrollEngine installs its implementation; otherwise native scrolling is used. */
export interface Scroller {
  to(target: HTMLElement | number, opts?: { immediate?: boolean }): void;
}

const nativeScroller: Scroller = {
  to(target, opts) {
    const behavior: ScrollBehavior = opts?.immediate ? "instant" : "smooth";
    if (typeof target === "number") window.scrollTo({ top: target, behavior });
    else target.scrollIntoView({ block: "start", behavior });
  }
};

let current: Scroller = nativeScroller;

export const scroller: Scroller = { to: (target, opts) => current.to(target, opts) };
export const installScroller = (impl: Scroller | null): void => { current = impl ?? nativeScroller; };
