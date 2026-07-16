# Hourfold

A collaborative scheduling app for figuring out when a group can actually meet up - built with [TanStack Start](https://tanstack.com/start) and [Supabase](https://supabase.com).

Someone starts a plan, shares a short code, and everyone adds the dates and times that work for them by dragging a slider - no back-and-forth messages, no fixed time picked before anyone's even weighed in.

## Features

- **Flexible dates** - everyone (including the person who started the plan) picks any number of dates and drags a slider to mark the times they're free. The app finds the window with the most overlap.
- **Fixed dates** - for things that can't move, like a birthday: set one specific date and time, and guests RSVP instead of voting on availability.
- **Flexible duration** - pick from common presets (30 min–4+ hours, all day) or enter a custom length; the group votes on what works.
- **Location suggestions** - propose one or more places and let the group vote, with an inline map preview.
- **No accounts required** - a plan is identified by a short shareable code; anyone with the code can view and respond.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React, file-based routing, SSR) on [Nitro](https://nitro.build) targeting Cloudflare Workers
- [Supabase](https://supabase.com) (Postgres + PostgREST) for storage
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) components
- TypeScript throughout

## Getting started

This project uses [bun](https://bun.sh) as its package manager (see `bunfig.toml` / `bun.lock`).

```bash
bun install
cp .env.example .env   # then fill in your Supabase project's values
bun run dev
```

Other scripts:

```bash
bun run build     # production build
bun run lint       # eslint
bun run format     # prettier --write
```

### Environment variables

This project is connected to [Lovable](https://lovable.dev), which requires `.env` to be **committed to the repo** — Lovable's build reads `VITE_`-prefixed values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) directly from the committed `.env` file to bake them into the client bundle at build time; gitignoring it breaks Lovable's preview and published builds. This is safe: these are Supabase's anon/publishable key, explicitly designed to be public — access is controlled by Row Level Security policies on the tables, not by keeping the key secret. `.env.example` documents the same shape for anyone running the project outside of Lovable.

Server-only secrets (no `VITE_` prefix, e.g. `SUPABASE_SERVICE_ROLE_KEY`, which bypasses Row Level Security entirely) must never go in `.env` or be committed — set those under **Cloud → Secrets** in the Lovable editor instead. Lovable's Secrets panel will reject any `VITE_`-prefixed name for exactly this reason (build-time browser values belong in `.env`, not Secrets).

### Database

Schema and RLS policies live in `supabase/migrations/`. If you're managing this project through [Lovable](https://lovable.dev), migrations added outside of Lovable's own chat flow (e.g. merged in from a PR) aren't applied to the live database automatically - either ask Lovable to run the pending migration, or run the SQL directly from the Supabase SQL editor (linked from Lovable's Cloud tab).

## Project structure

```
src/
  routes/          File-based routes (/, /create, /event/$code)
  components/      Shared UI, including shadcn/ui primitives in components/ui/
  lib/hangout.ts   Core scheduling logic (slot types, overlap calculation, formatting)
  integrations/    Supabase client + generated types
supabase/
  migrations/      SQL migrations, applied in order
```
