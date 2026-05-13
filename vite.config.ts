import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { loadEnv } from "vite";

const mode =
  process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test"
    ? "production"
    : "development";
const loadedEnv = loadEnv(mode, process.cwd(), "");
const vercelHttps =
  process.env.VERCEL === "1" && typeof process.env.VERCEL_URL === "string"
    ? `https://${process.env.VERCEL_URL}`
    : "";
const viteBetterAuthOrigin =
  process.env.VITE_BETTER_AUTH_URL ??
  process.env.BETTER_AUTH_URL ??
  loadedEnv.VITE_BETTER_AUTH_URL ??
  loadedEnv.BETTER_AUTH_URL ??
  vercelHttps ??
  "";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [nitro()],
    define: {
      "import.meta.env.VITE_BETTER_AUTH_URL": JSON.stringify(viteBetterAuthOrigin),
    },
  },
});
