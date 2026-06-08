# UDAN Technology LMS — Full Setup Guide

Everything you need to create accounts and wire up the app, in order.
Domain: **lms.udantechnology.com** · Hosting: **Vercel**

When you finish each service, copy the values into `.env.local` (for local dev)
and into **Vercel → Project → Settings → Environment Variables** (for production).

---

## A. Supabase (database + auth + storage)

### A1. Create the project
1. Go to <https://supabase.com> → **Start your project** → sign in with GitHub/Google.
2. **New project** → Organization → name it `udan-lms` → set a strong **database
   password** (save it) → Region: **Singapore** (closest to Nepal) → **Create**.
3. Wait ~2 minutes for it to provision.

### A2. Get the API keys
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy these into your env:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`  ⚠️ secret — server only.

### A3. Run the database migrations
1. Left sidebar → **SQL Editor** → **New query**.
2. Open each file in `supabase/migrations/` **in order** and run them one by one:
   `0001` → `0002` → … → `0009`. (Paste the file, press **Run**, repeat.)
   - This creates every table, all RLS policies, helper functions, storage
     buckets, and seed data (categories, membership plans, settings).
3. Confirm: **Table Editor** should now show `profiles`, `courses`, `payments`, etc.
   **Storage** should show buckets `payment-proofs`, `course-resources`, `certificates`.

### A4. Configure Auth URLs
1. **Authentication → URL Configuration**:
   - **Site URL**: `https://lms.udantechnology.com`
   - **Redirect URLs** — add all of these:
     - `http://localhost:3000/**`
     - `https://lms.udantechnology.com/**`
2. **Authentication → Providers → Email**: keep **Confirm email** ON
   (this is the email-verification flow the app already handles at `/auth/confirm`).

### A5. (Optional) Branded auth emails
**Authentication → Email Templates** — you can edit the confirmation / reset
emails to say "UDAN Technology LMS". Optional; defaults work.

### A6. Make yourself the Super Admin
After you sign up once in the app, run this in **SQL Editor**:
```sql
update public.profiles set role = 'super_admin'
where id = (select id from auth.users where email = 'YOUR-EMAIL@gmail.com');
```

---

## B. Google Login (optional but recommended)

### B1. Google Cloud OAuth credentials
1. Go to <https://console.cloud.google.com> → create a project `udan-lms`.
2. **APIs & Services → OAuth consent screen** → External → fill app name
   "UDAN Technology LMS", support email, your domain → Save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URI** — paste your Supabase callback (from A2 URL):
     `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`
   - Create → copy **Client ID** and **Client secret**.

### B2. Enable it in Supabase
1. **Authentication → Providers → Google** → enable.
2. Paste the **Client ID** and **Client secret** → Save.

(That's it — the app's "Continue with Google" button already works.)

---

## C. Cloudinary (images / media)

### C1. Create the account
1. Go to <https://cloudinary.com> → **Sign up free**.
2. After signup, open the **Dashboard** (Programmable Media). You'll see your
   **Product environment credentials**.

### C2. Get the keys → env
- **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **API Key** → `CLOUDINARY_API_KEY`
- **API Secret** → `CLOUDINARY_API_SECRET` (click "reveal")

### C3. Create an upload preset (for admin image uploads)
1. **Settings (gear) → Upload → Upload presets → Add upload preset**.
2. **Signing mode**: choose **Unsigned** (simplest) → name it `udan_unsigned`.
3. Optionally set **Folder** = `udan-lms`.
4. Save → put the preset name in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

> Course thumbnails, banners, and blog images will be stored here — keeping your
> hosting/Supabase storage light.

---

## D. Resend (transactional email)

### D1. Create the account
1. Go to <https://resend.com> → **Sign up** (GitHub/Google).

### D2. Add & verify your domain
1. **Domains → Add Domain** → enter `udantechnology.com`.
2. Resend shows **DNS records** (SPF, DKIM, and a return-path/MX). Add these to
   your domain's DNS (in Hostinger → Domains → DNS Zone for udantechnology.com):
   - Add each **TXT / CNAME / MX** record exactly as shown.
3. Back in Resend → **Verify**. (DNS can take 5–30 min.)
   Once verified you can send from `noreply@udantechnology.com`.

### D3. Get the API key → env
1. **API Keys → Create API Key** → name `udan-lms` → **Full access** (or Sending).
2. Copy it → `RESEND_API_KEY`.
3. Set:
   - `EMAIL_FROM="UDAN Technology LMS <noreply@udantechnology.com>"`
   - `EMAIL_REPLY_TO=support@udantechnology.com`

> Note: Resend handles *app* notifications (payment approved, certificate, etc.).
> Supabase sends its own *auth* emails (verification, password reset) separately.

---

## E. Manual payment details (shown to students)

Fill these in env so they appear on the checkout page:
- `NEXT_PUBLIC_ESEWA_NUMBER` — your eSewa ID/number
- `NEXT_PUBLIC_KHALTI_NUMBER` — your Khalti number
- `NEXT_PUBLIC_BANK_NAME`, `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER`,
  `NEXT_PUBLIC_BANK_ACCOUNT_HOLDER`

---

## F. Deploy to Vercel + custom domain

### F1. Push to GitHub
1. Create a GitHub repo and push this project.

### F2. Import to Vercel
1. <https://vercel.com> → **Add New → Project** → import the repo.
2. Framework preset auto-detects **Next.js**. Leave defaults.
3. **Environment Variables** — add every variable from your `.env.local`
   (Supabase, Cloudinary, Resend, payment numbers) and set
   `NEXT_PUBLIC_SITE_URL=https://lms.udantechnology.com`.
4. **Deploy**.

### F3. Connect the domain
1. Vercel → Project → **Settings → Domains → Add** → `lms.udantechnology.com`.
2. Vercel shows a **CNAME** target (e.g. `cname.vercel-dns.com`).
3. In **Hostinger → Domains → DNS Zone** for `udantechnology.com`, add a record:
   - Type **CNAME**, Name **lms**, Value = the Vercel CNAME target.
4. Wait for it to verify → your site is live at **lms.udantechnology.com**.
5. Go back to **Supabase A4** and make sure the production URL is in Site URL +
   Redirect URLs (it should already be).

---

## G. Env checklist

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...               # secret
NEXT_PUBLIC_SITE_URL=https://lms.udantechnology.com
NEXT_PUBLIC_SITE_NAME="UDAN Technology LMS"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=udan_unsigned
CLOUDINARY_API_KEY=...                       # secret
CLOUDINARY_API_SECRET=...                    # secret
RESEND_API_KEY=...                           # secret
EMAIL_FROM="UDAN Technology LMS <noreply@udantechnology.com>"
EMAIL_REPLY_TO=support@udantechnology.com
NEXT_PUBLIC_ESEWA_NUMBER=...
NEXT_PUBLIC_KHALTI_NUMBER=...
NEXT_PUBLIC_BANK_NAME=...
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=...
NEXT_PUBLIC_BANK_ACCOUNT_HOLDER=...
```

Local: put these in `.env.local`. Production: paste into Vercel env settings.

---

## Quick order to do it in
1. **Supabase** (A) — most important; the app needs it to run.
2. **Cloudinary** (C) and **Resend** (D) — can be done anytime.
3. **Google login** (B) — optional.
4. **Deploy + domain** (F) — when you're ready to go live.
