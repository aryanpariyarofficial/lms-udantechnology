-- ============================================================
--  0012 — Video content (tutorials + streams) & comments
--  RUN THIS AFTER 0011 (which adds the 'admin' role) has committed.
-- ============================================================

do $$ begin
  create type public.video_kind as enum ('tutorial', 'stream');
exception when duplicate_object then null; end $$;

create table if not exists public.videos (
  id               uuid primary key default gen_random_uuid(),
  kind             public.video_kind not null,
  title            text not null,
  slug             text not null unique,
  description      text,
  youtube_url      text not null,
  thumbnail_url    text,                 -- optional override; else derived from YouTube
  category         text,
  tags             text[] not null default '{}',
  duration_minutes int not null default 0,
  author_id        uuid references public.profiles (id) on delete set null,
  status           public.content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists videos_kind_status_idx on public.videos (kind, status, published_at desc);

alter table public.videos enable row level security;

create policy "videos_select" on public.videos for select
  using (status = 'published' or public.is_staff());
create policy "videos_write" on public.videos for all
  using (public.is_admin() or author_id = auth.uid())
  with check (public.is_admin() or author_id = auth.uid());

drop trigger if exists set_videos_updated_at on public.videos;
create trigger set_videos_updated_at before update on public.videos
  for each row execute function public.set_updated_at();

-- Include the new 'admin' role in the staff/admin helper checks.
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = uid and role in ('super_admin', 'admin')
  );
$$;

create or replace function public.is_staff(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('super_admin', 'admin', 'instructor')
  );
$$;

-- ---------- Comments on tutorials / streams ----------
create table if not exists public.video_comments (
  id         uuid primary key default gen_random_uuid(),
  video_id   uuid not null references public.videos (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists video_comments_video_idx on public.video_comments (video_id, created_at);

alter table public.video_comments enable row level security;
create policy "vcomments_select" on public.video_comments for select using (true);
create policy "vcomments_insert_own" on public.video_comments for insert
  with check (user_id = auth.uid());
create policy "vcomments_delete" on public.video_comments for delete
  using (user_id = auth.uid() or public.is_admin());
