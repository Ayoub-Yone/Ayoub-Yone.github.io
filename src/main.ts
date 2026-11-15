import "./styles/site.css";
import "./styles/lolbtn.css";
import "./styles/eren.css";

import { ScrollEngine } from "./motion/ScrollEngine";
import { initArt } from "./ui/art";
import { initGlow, initNav, initScrollReveal } from "./ui/chrome";
import { initCopyButtons } from "./ui/copy";
import { reducedMotion } from "./ui/dom";
import { initLegal } from "./ui/legal";
import { initMobileMenu } from "./ui/menu";
import { renderAll } from "./ui/render";
import { initRouter, pageFromHash } from "./ui/router";

const reduced = reducedMotion();

renderAll();
initMobileMenu();
initScrollReveal();
initNav();
initGlow();
initCopyButtons();
initArt();

const engine = new ScrollEngine(reduced);
initRouter();
initLegal();

// System font stacks: layout is stable now; one frame lets the first paint land before the intro.
requestAnimationFrame(() => {
  engine.choreograph();
  engine.intro(pageFromHash() === "eren");
});
