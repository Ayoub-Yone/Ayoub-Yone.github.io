/* One clock: gsap.ticker drives Lenis (and ScrollTrigger through Lenis' scroll event).
   Choreography is restrained: masked type reveals, slow depth parallax on the original artwork layers,
   staggered metric counters. Everything animates transform/opacity only (counters write text).
   Under prefers-reduced-motion: no Lenis, no splitting, no parallax, no counting. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { $, $$ } from "../ui/dom";
import type { PageChangeDetail } from "../ui/router";
import { installScroller } from "../ui/scroller";
import { splitChars, splitWords } from "./split";

gsap.registerPlugin(ScrollTrigger);

const EASE = "expo.out";

export class ScrollEngine {
  readonly lenis: Lenis | null;

  constructor(private readonly reduced: boolean) {
    this.lenis = reduced ? null : new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    if (this.lenis) {
      const lenis = this.lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      installScroller({
        to: (target, opts) => lenis.scrollTo(target, { immediate: opts?.immediate, offset: typeof target === "number" ? 0 : -this.navOffset(), duration: 1.3, force: true })
      });
      this.bindAnchors();
      this.bindLocks();
    }
    gsap.ticker.lagSmoothing(0);

    window.addEventListener("page:change", (e) => {
      const { page, first } = (e as CustomEvent<PageChangeDetail>).detail;
      if (!first) this.intro(page === "eren");
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }

  private navOffset(): number {
    return (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 68) * 0.5;
  }

  /* Same-page hash links glide through Lenis; page-switching links (#eren ↔ Yone) stay native for the router. */
  private bindAnchors(): void {
    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link) return;
      const hash = link.getAttribute("href") ?? "";
      const id = hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      const targetPage = /^eren(-|$)/.test(id) ? "eren" : "yone";
      const currentPage = document.documentElement.getAttribute("data-page-active") === "eren" ? "eren" : "yone";
      if (!target || id === "main" || targetPage !== currentPage) return;
      event.preventDefault();
      if (window.location.hash !== hash) history.pushState(null, "", hash);
      this.lenis?.scrollTo(target, { offset: -this.navOffset(), duration: 1.3 });
    });
  }

  /* Freeze smooth scroll while the mobile menu or the legal dialog own the screen. */
  private bindLocks(): void {
    const root = document.documentElement;
    new MutationObserver(() => {
      const locked = root.classList.contains("menu-open") || root.classList.contains("legal-open");
      if (locked) this.lenis?.stop(); else this.lenis?.start();
    }).observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  /* Hero entrance for the active page. */
  intro(eren: boolean): void {
    const root = document.documentElement;
    const hero = eren ? $("#eren-top .hero__inner") : $("#top .hero__inner");
    root.classList.add("is-ready");
    if (!hero || this.reduced) return;
    const name = $<HTMLElement>(".hero__name", hero);
    const chars = name ? splitChars(name) : [];
    const quote = $<HTMLElement>(".hero__quote", hero);
    const words = quote ? splitWords(quote) : [];
    const rest = Array.from(hero.children).filter((c) => c !== name && c !== quote);
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.fromTo(hero, { opacity: 0 }, { opacity: 1, duration: 0.01 })
      .fromTo(chars, { yPercent: 108 }, { yPercent: 0, duration: 1.4, stagger: 0.07 }, 0.05)
      .fromTo(rest, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, clearProps: "transform,opacity" }, 0.45);
    if (words.length) tl.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: 0.035 }, 0.5);
  }

  choreograph(): void {
    if (this.reduced) {
      document.documentElement.classList.add("is-ready");
      return;
    }

    // Masked section titles
    for (const el of $$(".h2, .jungle__title")) {
      const words = splitWords(el);
      gsap.fromTo(words, { yPercent: 108 }, {
        yPercent: 0, duration: 1.15, ease: EASE, stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    }
    const card = $<HTMLElement>(".pcard__name");
    if (card?.textContent) {
      gsap.fromTo(splitChars(card), { yPercent: 108 }, {
        yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.06,
        scrollTrigger: { trigger: card, start: "top 85%", once: true }
      });
    }

    // Depth parallax on the original artwork layers (oversized in CSS, so edges never show)
    const parallax = (selector: string, from: number, to: number, trigger?: string) => {
      for (const el of $$(selector)) {
        gsap.fromTo(el, { yPercent: from }, {
          yPercent: to, ease: "none",
          scrollTrigger: { trigger: trigger ? el.closest(trigger) : el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
      }
    };
    gsap.to("#top .hero__art", { yPercent: 9, ease: "none", scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true } });
    parallax(".section--art .section__bg", -6, 6, "section");
    parallax(".jungle__art", -7, 7, ".jungle");
    parallax(".pcard__art", -5, 5, ".pcard");

    this.counters();
    ScrollTrigger.refresh();
  }

  /* Staggered metric counters: count up to the exact rendered string, then restore it verbatim. */
  private counters(): void {
    const groups = $$(".snap, .pcard__stats");
    for (const group of groups) {
      const items = $$(".ring__center strong, .row__wr, .game b, .pstat dd", group)
        .map((el) => ({ el, final: el.textContent ?? "", m: /^(\d+(?:\.(\d+))?)(%?)$/.exec((el.textContent ?? "").trim()) }))
        .filter((x): x is { el: HTMLElement; final: string; m: RegExpExecArray } => !!x.m);
      if (!items.length) continue;
      items.forEach(({ el, m }) => {
        el.dataset.count = "";
        el.textContent = (0).toFixed(m[2]?.length ?? 0) + m[3];
      });
      ScrollTrigger.create({
        trigger: group,
        start: "top 82%",
        once: true,
        onEnter: () => items.forEach(({ el, final, m }, i) => {
          const value = parseFloat(m[1]);
          const digits = m[2]?.length ?? 0;
          const state = { v: 0 };
          gsap.to(state, {
            v: value, duration: 1.4, delay: i * 0.05, ease: "power3.out",
            onUpdate: () => { el.textContent = state.v.toFixed(digits) + m[3]; },
            onComplete: () => { el.textContent = final; }
          });
        })
      });
    }
  }
}
