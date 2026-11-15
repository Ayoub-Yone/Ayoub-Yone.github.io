/* Legal dialog: EN/FR switch, section jump, focus return (legacy behavior). */
type Lang = "en" | "fr";
const NAV: Record<Lang, Record<string, string>> = {
  en: { title: "Legal information", notice: "Legal notice", privacy: "Privacy & cookies", credits: "Disclaimer & credits", close: "Close" },
  fr: { title: "Informations légales", notice: "Mentions légales", privacy: "Confidentialité et cookies", credits: "Avertissement et crédits", close: "Fermer" }
};

export function initLegal(): void {
  const dlg = document.getElementById("legal") as HTMLDialogElement | null;
  if (!dlg) return;
  const body = dlg.querySelector<HTMLElement>(".legal__body");
  if (!body) return;
  let lastFocus: HTMLElement | null = null;
  let lang: Lang = /^fr/i.test(navigator.language || "") ? "fr" : "en";

  const setLang = (l: Lang) => {
    lang = l;
    dlg.setAttribute("data-lang", l);
    dlg.querySelectorAll<HTMLElement>("[data-legal-lang]").forEach((n) => { n.hidden = n.getAttribute("data-legal-lang") !== l; });
    dlg.querySelectorAll("[data-legal-setlang]").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-legal-setlang") === l)));
    const title = dlg.querySelector("#legal-title");
    if (title) title.textContent = NAV[l].title;
    dlg.querySelectorAll(".legal__nav [data-legal-open]").forEach((b) => { b.textContent = NAV[l][b.getAttribute("data-legal-open") ?? "notice"]; });
    dlg.querySelector("[data-legal-close]")?.setAttribute("aria-label", NAV[l].close);
  };

  const scrollToSection = (name: string) => {
    const sec = body.querySelector('[data-legal-lang]:not([hidden]) [data-legal-section="' + name + '"]');
    body.scrollTop = sec ? sec.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 4 : 0;
  };

  const onClosed = () => {
    document.documentElement.classList.remove("legal-open");
    lastFocus?.focus?.();
  };

  const openLegal = (name: string | null) => {
    if (!dlg.open) {
      lastFocus = document.activeElement as HTMLElement | null;
      setLang(lang);
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      document.documentElement.classList.add("legal-open");
    }
    scrollToSection(name || "notice");
  };

  const closeLegal = () => {
    if (typeof dlg.close === "function") dlg.close();
    else { dlg.removeAttribute("open"); onClosed(); }
  };

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const o = t.closest("[data-legal-open]");
    if (o) { openLegal(o.getAttribute("data-legal-open")); return; }
    const s = t.closest("[data-legal-setlang]");
    if (s) { setLang(s.getAttribute("data-legal-setlang") === "fr" ? "fr" : "en"); body.scrollTop = 0; return; }
    if (t.closest("[data-legal-close]") || t === dlg) closeLegal();
  });
  dlg.addEventListener("close", onClosed);
}
