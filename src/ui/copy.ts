/* "Copy my intro": Clipboard API → execCommand fallback → prompt() last resort (legacy behavior). */
import { PLAYER_DATA } from "../data";
import { $, $$ } from "./dom";

const buildIntroText = () => PLAYER_DATA.copy.template.replace(PLAYER_DATA.copy.placeholder, () => window.location.href);

function legacyCopy(text: string): boolean {
  const previous = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  let ok = false;
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
  document.body.appendChild(area);
  try {
    area.focus({ preventScroll: true });
    area.select();
    area.setSelectionRange(0, text.length);
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  previous?.focus?.({ preventScroll: true });
  return ok;
}

function copyPlayerIntro(): Promise<boolean> {
  const text = buildIntroText();
  if (navigator.clipboard?.writeText && window.isSecureContext !== false) {
    return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
  }
  return Promise.resolve(legacyCopy(text));
}

export function initCopyButtons(): void {
  for (const button of $$("[data-copy-intro]")) {
    const label = $("[data-copy-label]", button) ?? button;
    const status = $("[data-copy-status]");
    let timer = 0;
    label.textContent = PLAYER_DATA.copy.idle;
    button.addEventListener("click", () => {
      copyPlayerIntro().then((ok) => {
        if (!ok) {
          window.prompt("Copy your introduction (Ctrl/Cmd + C):", buildIntroText());
          return;
        }
        window.clearTimeout(timer);
        label.textContent = PLAYER_DATA.copy.done;
        button.classList.add("is-copied");
        if (status) status.textContent = "Introduction copied to the clipboard.";
        timer = window.setTimeout(() => {
          label.textContent = PLAYER_DATA.copy.idle;
          button.classList.remove("is-copied");
          if (status) status.textContent = "";
        }, 2400);
      });
    });
  }
}
