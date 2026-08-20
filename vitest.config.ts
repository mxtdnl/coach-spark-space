/// <reference types="vitest" />
// Test-only Vite config.
//
// Deliberately NOT built on @lovable.dev/vite-tanstack-config: that preset
// pulls in TanStack Start, nitro and the router codegen plugin, none of which
// can run inside a jsdom unit-test process. Tests only need JSX and the "@/"
// alias, so this config declares exactly those two things.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Exercise smoke tests render 38 components each; give them room.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
        "src/routeTree.gen.ts",
        // Third-party shadcn/ui primitives, vendored verbatim.
        "src/components/ui/**",
      ],
    },
  },
});
