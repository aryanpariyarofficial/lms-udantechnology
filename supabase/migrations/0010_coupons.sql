-- ============================================================
--  0010 — Coupons / discount codes
-- ============================================================

do $$ begin
  create type public.coupon_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,                 -- stored UPPERCASE
  type        public.coupon_type not null default 'percentage',
  value       numeric(10,2) not null default 0,     -- percent (0-100) OR fixed Rs
  applies_to  text not null default 'all',          -- 'all' | 'course' | 'membership'
  course_id   uuid references public.courses (id) on delete cascade,
  max_uses    int not null default 0,               -- 0 = unlimited
  used_count  int not null default 0,
  expires_at  timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Link a payment to the coupon used (for tracking / increment on approval)
alter table public.payments
  add column if not exists coupon_id uuid references public.coupons (id) on delete set null;

alter table public.coupons enable row level security;

-- Admins manage coupons. Validation/redemption happens in trusted server code
-- via the service role (which bypasses RLS), so no public SELECT is exposed.
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());
