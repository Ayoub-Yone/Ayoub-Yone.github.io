export const NBSP = " ";

export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector);

export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

export const reducedMotion = (): boolean =>
  !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Props = Record<string, string | number | boolean | null | undefined | Record<string, string>>;
type Child = Node | string | number | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props | null, children?: Child[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === "class") node.className = String(value);
      else if (key === "text") node.textContent = String(value);
      else if (key === "vars" && typeof value === "object") {
        for (const [name, v] of Object.entries(value)) node.style.setProperty(name, v);
      } else node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  for (const child of children ?? []) {
    if (child === null || child === undefined || child === false) continue;
    node.append(typeof child === "object" ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function setText(selector: string, text: string): void {
  const node = $(selector);
  if (node) node.textContent = text;
}
