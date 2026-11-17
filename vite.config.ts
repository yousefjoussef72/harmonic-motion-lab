import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages project sites are hosted under /<repository-name>/.
  base: "/harmonic-motion-lab/",
  resolve: { tsconfigPaths: true },
  server: { host: "0.0.0.0", port: 8080 },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // The app is client-interactive but has no server-only features,
      // so prerender its single route to static HTML for GitHub Pages.
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
});
