# Vercel Deploy Checklist

## 1. Repository

Push `seatmap-studio` to GitHub/GitLab/Bitbucket and import the repository in Vercel.

Vercel settings can stay default:

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: empty/default

## 2. Environment Variables

Add the same variables in Vercel Project Settings -> Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Use the publishable key from Supabase, not a secret/service role key.

## 3. Supabase Auth URLs

In Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL: your Vercel production URL, for example `https://seatmap-studio.vercel.app`
- Redirect URLs:
  - `https://seatmap-studio.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

For Vercel Preview Deployments, add the preview domain pattern you use for testing.

## 4. Database

The current remote project already has the schema applied through Supabase MCP.

For a fresh project, run `supabase/schema.sql` in Supabase SQL Editor before deploying.

## 5. Production Smoke Test

After deploy:

1. Open `/login`.
2. Send a magic link to your email.
3. Open `/venues`.
4. Create a venue.
5. Add a hall.
6. Publish the hall.
7. Open `/embed/<hall-id>`.
8. Check `/api/embed/halls/<hall-id>` returns JSON.

## 6. Known MVP Limits

- The editor currently displays the saved JSON and has tool placeholders.
- New halls are created with a demo straight-row map.
- Real seat-map editing operations are the next implementation step.
- Booking/hold/payment flows are not implemented yet.
