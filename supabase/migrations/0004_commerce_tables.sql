-- ============================================================
--  0004 — Commerce: payments, membership plans, memberships, wishlist
-- ============================================================

-- Membership plans (1 month / 3 / 6 / 1 year ...)
create table if not exists public.membership_plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  price         numeric(10,2) not null default 0,
  currency      text not null default 'NPR',
  duration_days int not null,            -- 30, 90, 180, 365
  features      text[] not null default '{}',
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- Which courses a plan grants access to
create table if not exists public.membership_plan_courses (
  plan_id   uuid not null references public.membership_plans (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  primary key (plan_id, course_id)
);

-- Active/expired user memberships
create table if not exists public.memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  plan_id    uuid not null references public.membership_plans (id) on delete restrict,
  status     public.membership_status not null default 'active',
  starts_at  timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists memberships_user_idx on public.memberships (user_id, status);

-- Manual payments submitted by students (course purchase OR membership)
create table if not exists public.payments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  kind               public.purchase_kind not null default 'course',
  course_id          uuid references public.courses (id) on delete set null,
  membership_plan_id uuid references public.membership_plans (id) on delete set null,
  method             public.payment_method not null,
  amount             numeric(10,2) not null,
  currency           text not null default 'NPR',
  transaction_id     text,
  screenshot_url     text,                 -- Supabase private bucket
  remarks            text,
  status             public.payment_status not null default 'pending',
  review_note        text,                 -- rejection reason / admin note
  reviewed_by        uuid references public.profiles (id) on delete set null,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now(),
  -- a course payment must reference a course; a membership payment a plan
  constraint payment_target_chk check (
    (kind = 'course' and course_id is not null) or
    (kind = 'membership' and membership_plan_id is not null)
  )
);
create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_status_idx on public.payments (status);

-- Wishlist
create table if not exists public.wishlists (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
