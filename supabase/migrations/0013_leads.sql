-- ============================================================
--  0013 — Lead capture (popup form submissions)
-- ============================================================

create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  email             text not null,
  phone             text,
  city              text,
  course_id         uuid references public.courses (id) on delete set null,
  interested_course text,            -- denormalized course title for convenience
  is_read           boolean not null default false,
  created_at        timestamptz not null default now()
);
create index if not exists leads_created_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Anyone (even logged-out visitors) can submit a lead; only admins can read/manage.
create policy "leads_insert_any" on public.leads for insert with check (true);
create policy "leads_admin_select" on public.leads for select using (public.is_admin());
create policy "leads_admin_update" on public.leads for update
  using (public.is_admin()) with check (public.is_admin());
create policy "leads_admin_delete" on public.leads for delete using (public.is_admin());
