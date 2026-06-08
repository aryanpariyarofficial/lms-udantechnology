-- ============================================================
--  0003 — Learning: enrollments, progress, certificates, quizzes, assignments
-- ============================================================

-- Enrollments — grants a user access to a course
create table if not exists public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  source     public.enrollment_source not null default 'purchase',
  expires_at timestamptz,                 -- null = lifetime access
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index if not exists enrollments_user_idx on public.enrollments (user_id);
create index if not exists enrollments_course_idx on public.enrollments (course_id);

-- Per-lesson progress
create table if not exists public.lesson_progress (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  lesson_id             uuid not null references public.lessons (id) on delete cascade,
  course_id             uuid not null references public.courses (id) on delete cascade,
  completed             boolean not null default false,
  completed_at          timestamptz,
  last_position_seconds int not null default 0,
  updated_at            timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index if not exists lesson_progress_user_course_idx on public.lesson_progress (user_id, course_id);

-- Certificates (auto-issued on 100% completion)
create table if not exists public.certificates (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  course_id        uuid not null references public.courses (id) on delete cascade,
  certificate_code text not null unique,  -- printed on cert + QR verification
  issued_at        timestamptz not null default now(),
  unique (user_id, course_id)
);

-- Quizzes (attached to a lesson)
create table if not exists public.quizzes (
  id                uuid primary key default gen_random_uuid(),
  lesson_id         uuid not null references public.lessons (id) on delete cascade,
  course_id         uuid not null references public.courses (id) on delete cascade,
  title             text not null,
  pass_percentage   int not null default 60,
  time_limit_minutes int,
  max_attempts      int not null default 0,  -- 0 = unlimited
  created_at        timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes (id) on delete cascade,
  question        text not null,
  type            public.quiz_question_type not null default 'mcq',
  options         jsonb not null default '[]'::jsonb,        -- [{id,text}]
  correct_answers jsonb not null default '[]'::jsonb,        -- [optionId,...]
  points          int not null default 1,
  sort_order      int not null default 0
);
create index if not exists quiz_questions_quiz_idx on public.quiz_questions (quiz_id);

create table if not exists public.quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  quiz_id    uuid not null references public.quizzes (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  score      numeric(5,2) not null default 0,   -- percentage
  passed     boolean not null default false,
  answers    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts (user_id, quiz_id);

-- Assignments
create table if not exists public.assignments (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  course_id    uuid not null references public.courses (id) on delete cascade,
  title        text not null,
  instructions text,
  max_points   int not null default 100,
  created_at   timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  content       text,
  file_url      text,
  link_url      text,
  status        public.assignment_status not null default 'submitted',
  grade         numeric(5,2),
  feedback      text,
  graded_by     uuid references public.profiles (id) on delete set null,
  graded_at     timestamptz,
  created_at    timestamptz not null default now(),
  unique (assignment_id, user_id)
);
create index if not exists assignment_subs_user_idx on public.assignment_submissions (user_id);
