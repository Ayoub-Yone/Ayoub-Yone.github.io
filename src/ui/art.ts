/* Original artwork layers, now self-hosted in public/assets/.
   Each layer fades in once its image is decoded (legacy behavior; gradients stay if a file fails). */
import { $, $$ } from "./dom";

// Absolute URL: a relative url() inside a custom property would resolve against the stylesheet folder.
const asset = (name: string) => new URL(import.meta.env.BASE_URL + "assets/" + name, document.baseURI).href;

export const ART = {
  splash: asset("yone-splash.webp"),
  jungleSplash: asset("yone-highnoon.webp"), // High Noon Yone
  erenArt: asset("eren-bg.webp")
};

function apply(nodes: HTMLElement[], url: string): void {
  if (!nodes.length) return;
  const img = new Image();
  img.decoding = "async";
  img.onload = () => nodes.forEach((node) => {
    node.style.setProperty("--art", 'url("' + url + '")');
    node.classList.add("has-art");
  });
  img.src = url;
}

export function initArt(): void {
  apply($$("[data-art]"), ART.splash);
  apply($$("[data-art-jungle]"), ART.jungleSplash);
}

export function loadErenArt(): void {
  const node = $("[data-eren-art]");
  if (!node || node.dataset.loading) return;
  node.dataset.loading = "1";
  apply([node], ART.erenArt);
}
