import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Duplicating plugins here breaks the build — the preset already registers them.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
