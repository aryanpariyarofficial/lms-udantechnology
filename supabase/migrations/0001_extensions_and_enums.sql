-- ============================================================
--  0001 — Extensions & Enum Types
-- ============================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- Roles in the platform
do $$ begin
  create type public.user_role as enum ('super_admin', 'instructor', 'student', 'membership_user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_level as enum ('beginner', 'intermediate', 'advanced', 'all_levels');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lesson_type as enum ('video', 'pdf', 'assignment', 'quiz', 'file', 'text');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enrollment_source as enum ('purchase', 'membership', 'manual', 'free');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('esewa', 'khalti', 'bank_transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.purchase_kind as enum ('course', 'membership');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.membership_status as enum ('active', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.quiz_question_type as enum ('mcq', 'multiple', 'true_false');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.assignment_status as enum ('submitted', 'graded', 'returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.review_status as enum ('pending', 'approved', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;
