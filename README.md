# 清華大學學生申訴協力系統

Next.js + Supabase + Resend + Vercel Cron 的學生申訴送件與學權組織協作系統。

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase Auth, Postgres, RLS, Storage
- Resend + React Email
- Vercel Cron
- Tiptap rich-text editor

## Development

```bash
pnpm install
pnpm dev
```

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `MINISTER_EMAILS`
- `RESEND_API_KEY`
- `DISCORD_REVIEW_WEBHOOK_URL`
- `DISCORD_REPLY_WEBHOOK_URL`
- `CRON_SECRET`

## Database

Apply the migration in `supabase/migrations/20260622000000_initial_schema.sql`.

It creates the case tables, RLS policies, explicit Data API grants, and the private `case-attachments` Storage bucket.

## Checks

```bash
pnpm lint
pnpm test
pnpm build
```
