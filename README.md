# Adatnama

Adatnama is a streak and habit tracker, built on TanStack Start and deployed to Cloudflare. Users check in daily on the habits they're building, and Adatnama keeps score: current streak, longest streak, and a history of every day logged. The whole app ships to Cloudflare Workers, with D1 as the database and KV, R2, and Durable Objects available as additional edge storage.

## Status

The account system is built: sign up, sign in (username/password and Google), session management, and account/password self-service. The habit-tracking domain itself is still being built out. The target functionality is:

- **Daily check-ins & streak counts** — log a habit for the day; Adatnama tracks current and longest streak.
- **Multiple habits per user** — track several habits at once (e.g. "Exercise", "Read"), each with its own streak.
- **Streak freezes / grace periods** — forgive an occasional missed day instead of resetting the streak to zero.

None of the above has database tables or routes yet — `migrations/` currently only defines the Better Auth schema (`user`, `session`, `account`, `verification`). Habit and check-in tables will be added as this is built out.

# Getting Started

To run this application:

```bash
npm install
npm run dev
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for styling and components.

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
npm run lint
npm run format
npm run check
```

## Database (Cloudflare D1)

The app uses a D1 database (binding `DB`, database `adatnama-db` in `wrangler.jsonc`) queried through [Kysely](https://kysely.dev) (`src/lib/db`). Migrations are plain SQL files in `migrations/`, numbered and tracked by Wrangler:

```bash
npm run db:migration:create <name>  # create the next numbered migration file
npm run db:migrate                  # apply pending migrations to the local D1
npm run db:migrate:remote           # apply pending migrations to the real D1
```

After changing `wrangler.jsonc` or `.dev.vars`, rerun `npm run cf-typegen` to refresh `worker-configuration.d.ts`.

## Authentication (Better Auth)

Auth is handled by [Better Auth](https://www.better-auth.com), signing in with a username and password (via the `username` plugin):

- Server instance: `src/lib/auth.ts` (Kysely + D1, cookies via `tanstackStartCookies`)
- API routes: `src/routes/api/auth/$.ts` (everything under `/api/auth/*`)
- React client: `src/lib/auth-client.ts`; session on the server via `src/lib/data/auth.ts`
- Page: `/login`, laid out separately from the marketing chrome in `src/routes/_auth/route.tsx` (no header/footer)

Local setup: copy `.dev.vars.example` to `.dev.vars` and fill in `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`).

## Avatar uploads (Cloudflare R2)

Profile pictures are stored in an R2 bucket (binding `AVATARS_BUCKET`, bucket `adatnama-avatars` in `wrangler.jsonc`), served from its public r2.dev URL:

- Upload/remove logic: `src/actions/avatar.ts` (`createServerFn`s that validate the file, write/delete R2 objects via `src/lib/storage.ts`, then update `user.image` through `auth.api.updateUser`)
- Shared constraints (accepted types, max size): `src/lib/avatar.ts`
- UI: `src/components/profile/avatar-form.tsx`, using `src/hooks/use-file-upload.ts` for drag/drop and validation, rendered on its own card on `/home/profile`

Local setup: the bucket and its public URL already exist for this project (`adatnama-avatars`); `R2_PUBLIC_URL` is set in `.dev.vars`. The `r2_buckets` entry in `wrangler.jsonc` has `"remote": true`, so `npm run dev` connects to the real bucket instead of a local simulation — this is required because uploads must actually be reachable at the public r2.dev URL. That means local-dev uploads write to the real bucket (not an isolated sandbox); clean up test uploads with `wrangler r2 object delete adatnama-avatars/<key> --remote`.

To set up a bucket for a new environment:

```bash
wrangler r2 bucket create <bucket-name>
wrangler r2 bucket dev-url enable <bucket-name>   # gives you the public r2.dev URL
```

Then set `binding`/`bucket_name` in `wrangler.jsonc` under `r2_buckets` (with `"remote": true`), and `R2_PUBLIC_URL` in `.dev.vars` (local) / `vars` in `wrangler.jsonc` (deployed) to the printed r2.dev URL. Rerun `npm run cf-typegen` after changing `wrangler.jsonc`.

## Project Structure

Routes live in `src/routes` and are grouped by layout:

- `_auth/` — login page, no marketing chrome (`src/routes/_auth/route.tsx`)
- `_marketing/` — public marketing pages (home, about, features, status)
- `home/` — the authenticated app (sidebar layout, `beforeLoad` redirects to `/login` when there's no session); currently just account/password settings at `/home/profile`
- `api/` — server routes, including Better Auth's catch-all handler

Server-side data fetching follows a `queryOptions` convention in `src/lib/data/*.ts` (e.g. `sessionQueryOptions`), consumed via `queryClient.ensureQueryData` in route `beforeLoad`/`loader`. Mutations that need to run on the server live in `src/actions/*.ts` as `createServerFn` calls.

## Deploy to Cloudflare Workers

This project uses the Cloudflare Vite plugin (configured in `vite.config.ts`) and `wrangler.jsonc`:

1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Apply migrations: `npm run db:migrate:remote`
4. Set secrets: `wrangler secret put BETTER_AUTH_SECRET`
5. Add `BETTER_AUTH_URL` (your deployed origin) and `R2_PUBLIC_URL` (the `adatnama-avatars` bucket's r2.dev URL) under `vars` in `wrangler.jsonc`
6. Deploy: `npx wrangler deploy`

Public (non-secret) vars go in `wrangler.jsonc` under `vars`; secrets are set with `wrangler secret put`. KV, D1, R2, and Durable Object bindings are configured in `wrangler.jsonc`. See https://developers.cloudflare.com/workers/wrangler/configuration/.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
