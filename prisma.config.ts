// Run Prisma CLI with: bunx prisma <command> (loads this config and DATABASE_URL from .env).
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bunx tsx --tsconfig tsconfig.json prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
