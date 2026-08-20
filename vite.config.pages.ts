// Static build config, used only by the GitHub Pages workflow
// (.github/workflows/deploy-pages.yml). Lovable owns vite.config.ts — keep the
// Pages-specific settings here so the two don't fight.
//
// Differences from the Lovable build:
//   - nitro: false        -> no Cloudflare Worker; we want plain files
//   - prerender           -> crawls every route from "/" and writes real HTML
//   - base                -> asset/link prefix for project Pages sites
//                            (mxtdnl.github.io/coach-spark-space/)
//   - preview.host        -> prerendering boots a Vite preview server; pin it to
//                            IPv4 so it works on hosts without IPv6 loopback
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const base = process.env.PAGES_BASE ?? "/";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: false },
    prerender: { enabled: true, crawlLinks: true },
  },
  vite: {
    base,
    preview: { host: "127.0.0.1" },
  },
});
