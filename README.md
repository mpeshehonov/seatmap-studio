# Seatmap Studio

Прототип замены seats.io: админка для площадок и залов, простой редактор схемы и публичный embed-виджет выбора мест.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase Auth/Postgres/RLS
- Vercel-ready API routes

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase setup

The project uses Supabase Auth, Postgres, and RLS.

1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local`.
4. Fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Useful routes

- `/dashboard` - admin shell
- `/venues` - create venues and halls
- `/halls/[hallId]/editor` - hall editor shell
- `/embed/[hallId]` - public embed preview for published halls
- `/api/embed/halls/[hallId]` - public JSON payload for published halls
- `/embed/demo-hall` - built-in demo embed fallback

## Development plan

See `docs/mvp-plan.md`.

## Vercel deploy

See `docs/vercel-deploy.md`.

## Checks

```bash
npm test
npm run lint
npm run build
```
