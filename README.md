# Salary Management System

Next.js + Supabase (Postgres) + Prisma.

## Setup

1. Run [`supabase/schema/schema_v1.sql`](supabase/schema/schema_v1.sql) in the Supabase SQL Editor.
2. Copy `.env.example` → `.env.local` (Supabase API keys + Prisma `DATABASE_URL` / `DIRECT_URL`).
3. `npm install && npm run db:generate`

## Commands

```bash
npm run dev        # http://localhost:3000
npm run db:seed    # 10k employees (safe to re-run; skips duplicate emails)
npm run db:studio  # Browse data
npm test           # Seed tests
```

Schema lives in `supabase/schema/schema_v1.sql`. Server data access: `@/lib/prisma`.
