<div align="center">

  <a href="#readme-top">
    <img
      src="docs/taskflow-mark.svg"
      alt="Task-Flow"
      width="120"
      height="120"
    />
  </a>

  <h3 id="readme-top">Task-Flow</h3>

  <p>
    <strong>Personal task manager — full-stack, persisted, and ready for real workflows</strong> <br />
    <sub>Tasks, tags, subtasks, smart views, Google sign-in, soft-delete trash, stats, and keyboard shortcuts.</sub>
  </p>

  <p>
    <a href="https://tanstack.com/start"><img src="https://img.shields.io/badge/TanStack_Start-app-0284c7?logo=react&logoColor=white" alt="TanStack Start" /></a>
    &nbsp;
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
    &nbsp;
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" /></a>
    &nbsp;
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    &nbsp;
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma" /></a>
    &nbsp;
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-db-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  </p>

  <p>
    <a href="#features">Features</a>
    &nbsp;·&nbsp;
    <a href="#tech-stack">Stack</a>
    &nbsp;·&nbsp;
    <a href="#local-setup">Run locally</a>
    &nbsp;·&nbsp;
    <a href="#project-structure">Structure</a>
    &nbsp;·&nbsp;
    <a href="#assignment-alignment--rubric">Brief &amp; rubric</a>
    &nbsp;·&nbsp;
    <a href="#deployment-notes">Deploy</a>
  </p>

  <br />

</div>

Production-oriented personal task manager: full-stack TypeScript, PostgreSQL persistence, Google sign-in, and a responsive dashboard for organizing tasks, tags, subtasks, smart views, and stats.

This repository started from an intern take-home brief (see **Assignment alignment** below) and was extended with authentication, validation, soft-delete/trash, and deployment-ready structure.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Assignment alignment & rubric](#assignment-alignment--rubric)
- [Deployment notes](#deployment-notes)
- [AI assistance disclosure](#ai-assistance-disclosure)

## Features

**Core**

- List tasks with title, description, status, priorities, due dates, and timestamps
- Create, edit, and delete tasks with confirmation where destructive actions warrant it
- Toggle completion / status with optimistic updates
- Filter and search tasks; sort and URL-synced explorer state
- Client and server validation (empty titles and invalid payloads rejected with clear feedback)

**Beyond the brief**

- **Google OAuth** via Better Auth; data scoped per user in PostgreSQL
- **Soft delete** with trash, restore, and bulk actions
- **Tags, subtasks, drag-to-reorder**, Today / Upcoming / Completed views
- **Stats** and keyboard shortcuts (see `FEATURES.md` for the full product spec)

## Tech stack

| Layer                | Choice                                                          |
| -------------------- | --------------------------------------------------------------- |
| App framework        | [TanStack Start](https://tanstack.com/start) (React 19, Vite 7) |
| Routing              | TanStack Router                                                 |
| Server / data access | TanStack `createServerFn`, Prisma 7                             |
| Database             | PostgreSQL ([NeonDB](https://neon.tech))                        |
| Auth                 | [Better Auth](https://www.better-auth.com) + Google OAuth       |
| Validation           | Zod (shared schemas for server and forms)                       |
| Server state         | TanStack Query                                                  |
| Forms                | React Hook Form + Zod resolver                                  |
| Styling              | Tailwind CSS 4                                                  |
| Tests                | Vitest (unit), Playwright (E2E)                                 |

## Architecture

- **Full-stack in one repo**: the browser calls **server functions** defined in `src/lib/*.functions.ts` instead of hand-written `fetch` to ad-hoc REST paths. Each function runs on the server, checks the session, validates input with Zod, and calls the Prisma layer in `src/lib/tasks.repo.ts` (and related modules).
- **Auth**: Better Auth exposes `/api/auth/*` (see `src/routes/api/auth/$.ts`). All task operations require a signed-in user; data is always filtered by `userId`.
- **Persistence**: Prisma migrations live in `prisma/migrations/`; the schema is `prisma/schema.prisma`.

The original assignment specified a minimal REST shape (`GET/POST /api/tasks`, etc.). This project fulfills the same **behaviors** through authenticated server functions and a richer domain model (soft delete, tags, and multi-status tasks). See the mapping table in [Assignment alignment](#assignment-alignment--rubric).

## Prerequisites

- **Node.js** 22.x (LTS) or newer — [nodejs.org](https://nodejs.org)
- **PostgreSQL** — local instance or a hosted URL (Neon recommended for quick setup)
- **Bun** (optional but recommended) — [bun.sh](https://bun.sh) — used by some npm scripts (`bunx`). If you prefer not to install Bun, use the alternatives in [Local setup](#local-setup).
- **Google Cloud OAuth** credentials (OAuth client ID + secret) with authorized redirect URI:  
  `{BETTER_AUTH_URL}/api/auth/callback/google`  
  (for local dev, `BETTER_AUTH_URL` is typically `http://localhost:5173`).

## Local setup

**Goal:** clone, configure env, migrate, seed, run — under ~10 minutes on a typical machine with Postgres and Node already available.

1. **Clone the repository**

   ```bash
   git clone <your-repo-url> task-flow
   cd task-flow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`: set `DATABASE_URL`, `BETTER_AUTH_SECRET` (≥ 32 random characters), `BETTER_AUTH_URL` (e.g. `http://localhost:5173`), and Google OAuth keys. See [Environment variables](#environment-variables).

4. **Create the database schema**

   ```bash
   npm run db:migrate
   ```

   Applies Prisma migrations to your database.

5. **Seed demo data (optional)**

   ```bash
   npm run db:seed
   ```

   The script uses `bunx` internally. If the command fails, install [Bun](https://bun.sh) or run the seed directly:

   ```bash
   npx tsx --tsconfig tsconfig.json prisma/seed.ts
   ```

   Seeding creates a **synthetic** user (`dev@taskflow.local`) with sample tasks for database inspection (e.g. Prisma Studio). **Signing in with Google** creates or loads your real user, which is separate—expect an empty list until you add tasks in the UI.

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open the URL printed in the terminal (defaults to **`http://localhost:5173`** when following Playwright/local conventions).

7. **Sign in**

   Open **Sign in with Google** on the login page. After authentication you are redirected into the dashboard at `/tasks`.

## Environment variables

| Variable               | Required               | Description                                                |
| ---------------------- | ---------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`         | Yes                    | PostgreSQL connection string (`sslmode=require` for Neon). |
| `BETTER_AUTH_URL`      | Yes                    | Public origin of the app (e.g. `http://localhost:5173`).   |
| `BETTER_AUTH_SECRET`   | Yes                    | Secret for session signing (≥ 32 chars).                   |
| `GOOGLE_CLIENT_ID`     | Yes (for Google login) | OAuth 2.0 client ID.                                       |
| `GOOGLE_CLIENT_SECRET` | Yes (for Google login) | OAuth 2.0 client secret.                                   |

All placeholders are listed in **`.env.example`**. Never commit a real `.env` file.

## Scripts

| Command                     | Purpose                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev`               | Start Vite dev server (TanStack Start).                                                     |
| `npm run build`             | Production build.                                                                           |
| `npm run preview`           | Preview production build locally.                                                           |
| `npm run lint`              | ESLint.                                                                                     |
| `npm run format`            | Prettier write.                                                                             |
| `npm run db:generate`       | Regenerate Prisma client.                                                                   |
| `npm run db:migrate`        | Run migrations (dev).                                                                       |
| `npm run db:migrate:deploy` | Apply migrations (deploy/CI).                                                               |
| `npm run db:seed`           | Seed the database (requires Bun for `bunx` or use `npx tsx` fallback above).                |
| `npm run db:studio`         | Open Prisma Studio.                                                                         |
| `npm test`                  | Vitest unit tests.                                                                          |
| `npm run test:e2e`          | Playwright E2E (starts dev server on `127.0.0.1:5173` unless `PLAYWRIGHT_BASE_URL` is set). |

## Testing

- **Unit:** `npm test` — validation and repository-level tests under `tests/unit/`.
- **E2E:** `npm run test:e2e` — requires a runnable app and appropriate env for auth/database where tests need it.

## Project structure

```text
├── docs/
│   └── taskflow-mark.svg    # README / branding mark
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # SQL migrations (source of truth for schema history)
│   └── seed.ts             # Sample tasks/tags
├── src/
│   ├── routes/             # File-based routes (TanStack Router)
│   ├── components/         # UI (dashboard, primitives)
│   ├── hooks/              # React Query hooks, UX hooks
│   ├── lib/
│   │   ├── auth.ts         # Better Auth server config
│   │   ├── *.functions.ts  # Server functions (tasks, auth, …)
│   │   ├── *.repo.ts       # Prisma data access
│   │   └── validations/    # Zod schemas
│   └── generated/prisma/   # Generated client (after `prisma generate`)
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example            # Documented env template (copy to .env)
├── AGENTS.md               # Contributor / agent conventions
├── FEATURES.md             # Detailed product specification
└── README.md               # This file
```

## Deployment notes

- Configure the same environment variables on the host as in `.env.example`; set `BETTER_AUTH_URL` to the **public** origin users hit in the browser.
- Run `npm run db:migrate:deploy` against production `DATABASE_URL` before serving traffic.
- Google OAuth console must list the production callback URL.
- A `wrangler.jsonc` is present for **Cloudflare Workers**-style targets; adjust naming and secrets in the Cloudflare dashboard to match your org.
