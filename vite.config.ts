import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    // public/assets holds the site's images; keep bundler output in its own folder
    assetsDir: "static",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap") || id.includes("node_modules/lenis")) return "motion";
          return undefined;
        }
      }
    }
  }
});
