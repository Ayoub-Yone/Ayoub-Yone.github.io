/* Masked editorial type: wraps words (or glyphs) in overflow-hidden masks so they can rise into view.
   Inline elements (e.g. the red "faker" span) are kept whole as a single masked unit.
   Glyph splits keep a screen-reader copy so the word is announced intact. */
const make = (tag: string, cls: string) => {
  const el = document.createElement(tag);
  el.className = cls;
  return el;
};

function mask(content: Node): HTMLSpanElement {
  const outer = make("span", "mask");
  const inner = make("span", "mask__in");
  inner.append(content);
  outer.append(inner);
  return outer;
}

export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split) return Array.from(el.querySelectorAll<HTMLElement>(".mask__in"));
  el.dataset.split = "words";
  const nodes = Array.from(el.childNodes);
  el.textContent = "";
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const part of (node.textContent ?? "").split(/(\s+)/)) {
        if (!part) continue;
        el.append(/^\s+$/.test(part) ? document.createTextNode(part) : mask(document.createTextNode(part)));
      }
    } else {
      el.append(mask(node));
    }
  }
  return Array.from(el.querySelectorAll<HTMLElement>(".mask__in"));
}

export function splitChars(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split) return Array.from(el.querySelectorAll<HTMLElement>(".mask__in"));
  el.dataset.split = "chars";
  const text = el.textContent ?? "";
  el.textContent = "";
  el.classList.add("is-split");
  const sr = make("span", "sr-only");
  sr.textContent = text;
  el.append(sr);
  for (const ch of text) {
    const m = mask(document.createTextNode(ch));
    m.setAttribute("aria-hidden", "true");
    el.append(m);
  }
  return Array.from(el.querySelectorAll<HTMLElement>(".mask__in"));
}
