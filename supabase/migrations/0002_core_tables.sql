-- ============================================================
--  0002 — Core Tables: profiles, categories, courses, modules, lessons
-- ============================================================

-- Profiles: 1:1 with auth.users. Holds role + public profile data.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  avatar_url   text,
  role         public.user_role not null default 'student',
  headline     text,                       -- instructor tagline
  bio          text,
  phone        text,
  is_suspended boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Course categories
create table if not exists public.course_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Courses
create table if not exists public.courses (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  subtitle         text,
  description      text,
  category_id      uuid references public.course_categories (id) on delete set null,
  instructor_id    uuid references public.profiles (id) on delete set null,
  thumbnail_url    text,
  trailer_url      text,
  level            public.course_level not null default 'all_levels',
  language         text not null default 'Nepali',
  price            numeric(10,2) not null default 0,
  discount_price   numeric(10,2),
  currency         text not null default 'NPR',
  what_you_learn   text[] not null default '{}',
  requirements     text[] not null default '{}',
  duration_minutes int not null default 0,
  status           public.course_status not null default 'draft',
  is_featured      boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists courses_category_idx on public.courses (category_id);
create index if not exists courses_status_idx on public.courses (status);
create index if not exists courses_instructor_idx on public.courses (instructor_id);

-- Per-course FAQs (shown on the course detail page)
create table if not exists public.course_faqs (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  question   text not null,
  answer     text not null,
  sort_order int not null default 0
);
create index if not exists course_faqs_course_idx on public.course_faqs (course_id);

-- Modules (curriculum sections)
create table if not exists public.modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  title      text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists modules_course_idx on public.modules (course_id);

-- Lessons
create table if not exists public.lessons (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references public.modules (id) on delete cascade,
  course_id        uuid not null references public.courses (id) on delete cascade,
  title            text not null,
  type             public.lesson_type not null default 'video',
  content          text,                 -- rich text / description
  video_provider   text default 'youtube',
  video_url        text,                 -- YouTube unlisted id/url (Phase 1)
  duration_seconds int not null default 0,
  attachment_url   text,                 -- downloadable resource (Cloudinary/Supabase)
  is_preview       boolean not null default false,  -- free preview lesson
  drip_days        int not null default 0,          -- unlock N days after enrollment
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists lessons_module_idx on public.lessons (module_id);
create index if not exists lessons_course_idx on public.lessons (course_id);
