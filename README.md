# UDAN Technology LMS

Nepal's practical online learning platform — project-based courses, memberships,
manual payment approval (eSewa / Khalti / bank), and verifiable certificates.

Built with **Next.js 16 (App Router)** · **Supabase** · **Tailwind v4 + shadcn/ui**
· **Cloudinary** (media) · **Resend** (email). Hosted on **Vercel**.

---

## Tech stack

| Layer        | Choice                                                           |
| ------------ | --------------------------------------------------------------- |
| Framework    | Next.js 16, React 19, TypeScript                                |
| Styling/UI   | Tailwind v4, shadcn/ui (Nova preset), Lucide icons              |
| State        | Zustand, React Query                                            |
| Backend      | Supabase (Postgres, Auth, Storage, Realtime) — RLS-first        |
| Media        | Cloudinary (images, thumbnails, banners)                        |
| Email        | Resend (transactional)                                          |
| Hosting      | Vercel (`output: standalone`, so it's portable to any Node host)|

---

## 1. Install

```bash
npm install
```

## 2. Create a Supabase project

1. Create a project at <https://supabase.com>.
2. In **Project Settings → API**, copy the **Project URL**, **anon key**, and
   **service_role key**.
3. Run the SQL migrations in `supabase/migrations/` **in order** (0001 → 0009).
   Either:
   - Paste each file into the **SQL Editor** and run, or
   - Use the Supabase CLI: `supabase link` then `supabase db push`.

This creates all tables, RLS policies, helper functions, storage buckets, and
seed data (categories, membership plans, default settings).

## 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`
- **Cloudinary**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET` (from your Cloudinary dashboard)
- **Resend**: `RESEND_API_KEY`, `EMAIL_FROM` (verify your sending domain in Resend)
- **Payment numbers**: `NEXT_PUBLIC_ESEWA_NUMBER`, `NEXT_PUBLIC_KHALTI_NUMBER`,
  bank details — these display on the payment page.

## 4. Enable Google login (optional but recommended)

1. In Supabase: **Authentication → Providers → Google** → enable.
2. Create OAuth credentials in Google Cloud Console; set the redirect URL to:
   `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`.
3. Paste the Client ID/Secret into Supabase.

Email verification works out of the box — Supabase sends the confirmation link to
`/auth/confirm`.

## 5. Make yourself the Super Admin

After signing up once, promote your account in the Supabase SQL editor:

```sql
update public.profiles set role = 'super_admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## 6. Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
```

> The marketing pages render with **sample content** until you add real courses,
> so you can preview the design before connecting Supabase.

---

## Project structure

```
src/
  app/
    (auth)/            login, register, forgot/reset password, auth actions
    (marketing)/       homepage, courses catalog, course detail, layout (header/footer)
    auth/              OAuth + email-confirm route handlers
  components/
    ui/                shadcn components
    brand/             logo, social icons
    marketing/         header, footer, course card, pricing card, search
  lib/
    supabase/          browser/server/admin clients, middleware helper, DB types
    queries/           data-access functions (graceful fallback when DB empty)
    auth.ts            server-side role guards (requireUser/requireAdmin/requireStaff)
    constants.ts, format.ts, sample-data.ts, validations/
  proxy.ts             Next 16 proxy (session refresh + route protection)
supabase/migrations/   0001–0009 schema, RLS, functions, storage, seed
```

## Security model

Every table has **Row Level Security** enabled. Access is enforced in the
database via policies and the `has_course_access()` / `is_admin()` helpers — the
app never trusts the client. The `service_role` key is used only in trusted
server code (`src/lib/supabase/admin.ts`) for admin actions.

---

## Roadmap (remaining MVP modules)

- [ ] Course player + lesson progress tracking
- [ ] Manual payment submission + admin approval workflow
- [ ] Membership checkout & access control
- [ ] Student dashboard + Admin dashboard
- [ ] Certificates, quizzes, assignments, reviews, notifications, blog
- [ ] Cloudinary upload widgets, Resend email templates

The database already supports all of the above (see `supabase/migrations`).
