-- ============================================================
--  0006 — Functions, Triggers & Views
--  These run as SECURITY DEFINER with a pinned search_path so RLS
--  policies can call them without recursion.
-- ============================================================

-- Is the user a super admin?
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'super_admin'
  );
$$;

-- Is the user staff (admin or instructor)?
create or replace function public.is_staff(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('super_admin', 'instructor')
  );
$$;

-- Does the user have access to a course?
--   admin  OR  active enrollment  OR  active membership granting it  OR  owns it
create or replace function public.has_course_access(uid uuid, cid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select
    public.is_admin(uid)
    or exists (
      select 1 from public.enrollments e
      where e.user_id = uid and e.course_id = cid
        and (e.expires_at is null or e.expires_at > now())
    )
    or exists (
      select 1
      from public.memberships m
      join public.membership_plan_courses mpc on mpc.plan_id = m.plan_id
      where m.user_id = uid
        and m.status = 'active'
        and m.expires_at > now()
        and mpc.course_id = cid
    )
    or exists (
      select 1 from public.courses c where c.id = cid and c.instructor_id = uid
    );
$$;

-- Course completion percentage (0–100)
create or replace function public.course_progress(uid uuid, cid uuid)
returns numeric
language sql stable security definer set search_path = public as $$
  select case
    when (select count(*) from public.lessons where course_id = cid) = 0 then 0
    else round(
      100.0 * (
        select count(*) from public.lesson_progress lp
        where lp.user_id = uid and lp.course_id = cid and lp.completed
      ) / (select count(*) from public.lessons where course_id = cid), 2)
  end;
$$;

-- ---------- Auth trigger: create a profile for each new user ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- updated_at maintenance ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

drop trigger if exists set_blogs_updated_at on public.blogs;
create trigger set_blogs_updated_at before update on public.blogs
  for each row execute function public.set_updated_at();

-- ---------- Public curriculum outline (safe columns only) ----------
-- security_invoker = off → runs as owner, bypassing RLS, exposing only
-- non-sensitive columns (no video_url / content) for published courses.
create or replace view public.course_outline
with (security_invoker = off) as
select
  l.id,
  l.course_id,
  l.module_id,
  m.title       as module_title,
  m.sort_order  as module_order,
  l.title,
  l.type,
  l.duration_seconds,
  l.is_preview,
  l.sort_order
from public.lessons l
join public.modules m on m.id = l.module_id
join public.courses c on c.id = l.course_id
where c.status = 'published';

grant select on public.course_outline to anon, authenticated;

-- ---------- Quiz: fetch questions WITHOUT correct answers ----------
create or replace function public.get_quiz_questions(p_quiz_id uuid)
returns table (
  id uuid, question text, type public.quiz_question_type,
  options jsonb, points int, sort_order int
)
language sql stable security definer set search_path = public as $$
  select q.id, q.question, q.type, q.options, q.points, q.sort_order
  from public.quiz_questions q
  join public.quizzes qz on qz.id = q.quiz_id
  where q.quiz_id = p_quiz_id
    and public.has_course_access(auth.uid(), qz.course_id)
  order by q.sort_order;
$$;

-- ---------- Quiz: grade & record an attempt server-side ----------
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns public.quiz_attempts
language plpgsql security definer set search_path = public as $$
declare
  v_course uuid;
  v_pass   int;
  v_total  int := 0;
  v_earned int := 0;
  q record;
  v_user_ans jsonb;
  v_score numeric;
  v_passed boolean;
  v_attempt public.quiz_attempts;
begin
  select course_id, pass_percentage into v_course, v_pass
  from public.quizzes where id = p_quiz_id;

  if v_course is null then raise exception 'Quiz not found'; end if;
  if not public.has_course_access(auth.uid(), v_course) then
    raise exception 'No access to this course';
  end if;

  for q in select id, correct_answers, points from public.quiz_questions where quiz_id = p_quiz_id loop
    v_total := v_total + q.points;
    v_user_ans := p_answers -> (q.id::text);
    if v_user_ans is not null
       and (select coalesce(array_agg(value order by value), '{}')
              from jsonb_array_elements_text(v_user_ans) as value)
         = (select coalesce(array_agg(value order by value), '{}')
              from jsonb_array_elements_text(q.correct_answers) as value)
    then
      v_earned := v_earned + q.points;
    end if;
  end loop;

  v_score := case when v_total = 0 then 0 else round(100.0 * v_earned / v_total, 2) end;
  v_passed := v_score >= v_pass;

  insert into public.quiz_attempts (quiz_id, user_id, score, passed, answers)
  values (p_quiz_id, auth.uid(), v_score, v_passed, p_answers)
  returning * into v_attempt;

  return v_attempt;
end;
$$;

grant execute on function public.get_quiz_questions(uuid) to authenticated;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
grant execute on function public.course_progress(uuid, uuid) to authenticated;
grant execute on function public.has_course_access(uuid, uuid) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;
