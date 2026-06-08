-- ============================================================
--  0005 — Content: reviews, notifications, blog, settings
-- ============================================================

-- Course reviews / ratings
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  rating     int not null check (rating between 1 and 5),
  comment    text,
  status     public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index if not exists reviews_course_idx on public.reviews (course_id, status);

-- In-app notifications
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text not null,
  body       text,
  type       text not null default 'general',
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, is_read);

-- Blog
create table if not exists public.blog_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text,
  cover_url    text,
  author_id    uuid references public.profiles (id) on delete set null,
  category_id  uuid references public.blog_categories (id) on delete set null,
  tags         text[] not null default '{}',
  status       public.content_status not null default 'draft',
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists blogs_status_idx on public.blogs (status);

-- Singleton-ish key/value site settings (hero text, social links, etc.)
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Contact form submissions
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
