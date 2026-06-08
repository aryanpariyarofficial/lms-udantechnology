-- ============================================================
--  0007 — Row Level Security: enable + policies for every table
-- ============================================================

-- ---------- Guard triggers (prevent privilege escalation) ----------

-- Non-admins cannot change their own role or suspension status.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.is_suspended := old.is_suspended;
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Non-admins cannot self-approve their reviews.
create or replace function public.guard_review_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then
    new.status := coalesce(old.status, 'pending');
  end if;
  return new;
end $$;
drop trigger if exists guard_review_status on public.reviews;
create trigger guard_review_status before update on public.reviews
  for each row execute function public.guard_review_status();

-- ---------- Enable RLS ----------
alter table public.profiles               enable row level security;
alter table public.course_categories      enable row level security;
alter table public.courses                enable row level security;
alter table public.course_faqs            enable row level security;
alter table public.modules                enable row level security;
alter table public.lessons                enable row level security;
alter table public.enrollments            enable row level security;
alter table public.lesson_progress        enable row level security;
alter table public.certificates           enable row level security;
alter table public.quizzes                enable row level security;
alter table public.quiz_questions         enable row level security;
alter table public.quiz_attempts          enable row level security;
alter table public.assignments            enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.membership_plans       enable row level security;
alter table public.membership_plan_courses enable row level security;
alter table public.memberships            enable row level security;
alter table public.payments               enable row level security;
alter table public.wishlists              enable row level security;
alter table public.reviews                enable row level security;
alter table public.notifications          enable row level security;
alter table public.blog_categories        enable row level security;
alter table public.blogs                  enable row level security;
alter table public.settings               enable row level security;
alter table public.contact_messages       enable row level security;

-- ---------- profiles ----------
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy "profiles_insert_own" on public.profiles for insert
  with check (id = auth.uid() or public.is_admin());

-- ---------- course_categories ----------
create policy "categories_select_all" on public.course_categories for select using (true);
create policy "categories_admin_write" on public.course_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- courses ----------
create policy "courses_select" on public.courses for select
  using (status = 'published' or public.is_admin() or instructor_id = auth.uid());
create policy "courses_insert" on public.courses for insert
  with check (public.is_admin() or (public.is_staff() and instructor_id = auth.uid()));
create policy "courses_update" on public.courses for update
  using (public.is_admin() or instructor_id = auth.uid())
  with check (public.is_admin() or instructor_id = auth.uid());
create policy "courses_delete" on public.courses for delete
  using (public.is_admin() or instructor_id = auth.uid());

-- Helper predicate reused below: caller can manage this course
--   (admin or the course's instructor)
-- ---------- course_faqs ----------
create policy "faqs_select" on public.course_faqs for select using (
  public.is_staff() or exists (
    select 1 from public.courses c where c.id = course_id and c.status = 'published'
  )
);
create policy "faqs_write" on public.course_faqs for all using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- ---------- modules ----------
create policy "modules_select" on public.modules for select using (
  public.is_staff() or exists (
    select 1 from public.courses c where c.id = course_id and c.status = 'published'
  )
);
create policy "modules_write" on public.modules for all using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- ---------- lessons ----------
create policy "lessons_select" on public.lessons for select using (
  public.is_admin()
  or exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid())
  or (is_preview and exists (
        select 1 from public.courses c where c.id = course_id and c.status = 'published'))
  or public.has_course_access(auth.uid(), course_id)
);
create policy "lessons_write" on public.lessons for all using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- ---------- enrollments (admin/service manages; users read own) ----------
create policy "enrollments_select" on public.enrollments for select
  using (user_id = auth.uid() or public.is_admin());
create policy "enrollments_admin_write" on public.enrollments for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- lesson_progress (user owns their progress) ----------
create policy "progress_select" on public.lesson_progress for select
  using (user_id = auth.uid() or public.is_admin());
create policy "progress_insert" on public.lesson_progress for insert
  with check (user_id = auth.uid() and public.has_course_access(auth.uid(), course_id));
create policy "progress_update" on public.lesson_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- certificates (publicly verifiable; admin/service issues) ----------
create policy "certificates_select_all" on public.certificates for select using (true);
create policy "certificates_admin_write" on public.certificates for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- quizzes ----------
create policy "quizzes_select" on public.quizzes for select using (
  public.is_staff() or public.has_course_access(auth.uid(), course_id)
);
create policy "quizzes_write" on public.quizzes for all using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- ---------- quiz_questions (answers hidden; students use get_quiz_questions RPC) ----------
create policy "quiz_questions_staff_select" on public.quiz_questions for select
  using (public.is_staff());
create policy "quiz_questions_write" on public.quiz_questions for all using (
  public.is_admin() or exists (
    select 1 from public.quizzes qz join public.courses c on c.id = qz.course_id
    where qz.id = quiz_id and c.instructor_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.quizzes qz join public.courses c on c.id = qz.course_id
    where qz.id = quiz_id and c.instructor_id = auth.uid()
  )
);

-- ---------- quiz_attempts ----------
create policy "quiz_attempts_select" on public.quiz_attempts for select
  using (user_id = auth.uid() or public.is_staff());
create policy "quiz_attempts_insert" on public.quiz_attempts for insert
  with check (user_id = auth.uid());

-- ---------- assignments ----------
create policy "assignments_select" on public.assignments for select using (
  public.is_staff() or public.has_course_access(auth.uid(), course_id)
);
create policy "assignments_write" on public.assignments for all using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- ---------- assignment_submissions ----------
create policy "submissions_select" on public.assignment_submissions for select
  using (user_id = auth.uid() or public.is_staff());
create policy "submissions_insert" on public.assignment_submissions for insert
  with check (user_id = auth.uid());
create policy "submissions_update_own" on public.assignment_submissions for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "submissions_grade_staff" on public.assignment_submissions for update
  using (public.is_staff()) with check (public.is_staff());
create policy "submissions_delete_own" on public.assignment_submissions for delete
  using (user_id = auth.uid() or public.is_admin());

-- ---------- membership_plans ----------
create policy "plans_select" on public.membership_plans for select
  using (is_active or public.is_admin());
create policy "plans_admin_write" on public.membership_plans for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- membership_plan_courses ----------
create policy "plan_courses_select" on public.membership_plan_courses for select using (true);
create policy "plan_courses_admin_write" on public.membership_plan_courses for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- memberships ----------
create policy "memberships_select" on public.memberships for select
  using (user_id = auth.uid() or public.is_admin());
create policy "memberships_admin_write" on public.memberships for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- payments ----------
create policy "payments_select" on public.payments for select
  using (user_id = auth.uid() or public.is_admin());
create policy "payments_insert_own" on public.payments for insert
  with check (user_id = auth.uid() and status = 'pending');
create policy "payments_admin_update" on public.payments for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------- wishlists ----------
create policy "wishlists_own" on public.wishlists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- reviews ----------
create policy "reviews_select" on public.reviews for select using (
  status = 'approved' or user_id = auth.uid() or public.is_admin()
);
create policy "reviews_insert_own" on public.reviews for insert
  with check (user_id = auth.uid() and public.has_course_access(auth.uid(), course_id));
create policy "reviews_update_own" on public.reviews for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "reviews_delete" on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

-- ---------- notifications ----------
create policy "notifications_select_own" on public.notifications for select
  using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_admin_insert" on public.notifications for insert
  with check (public.is_admin());
create policy "notifications_delete_own" on public.notifications for delete
  using (user_id = auth.uid());

-- ---------- blog_categories ----------
create policy "blog_categories_select" on public.blog_categories for select using (true);
create policy "blog_categories_admin_write" on public.blog_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- blogs ----------
create policy "blogs_select" on public.blogs for select
  using (status = 'published' or public.is_staff());
create policy "blogs_write" on public.blogs for all
  using (public.is_admin() or author_id = auth.uid())
  with check (public.is_admin() or author_id = auth.uid());

-- ---------- settings ----------
create policy "settings_select" on public.settings for select using (true);
create policy "settings_admin_write" on public.settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- contact_messages ----------
create policy "contact_insert_any" on public.contact_messages for insert with check (true);
create policy "contact_admin_select" on public.contact_messages for select using (public.is_admin());
create policy "contact_admin_update" on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());
