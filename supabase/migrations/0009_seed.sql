-- ============================================================
--  0009 — Seed data (idempotent)
-- ============================================================

insert into public.course_categories (name, slug, icon, sort_order) values
  ('Web Development', 'web-development', 'Code',        1),
  ('AI',              'ai',              'Brain',       2),
  ('Graphic Design',  'graphic-design',  'Palette',     3),
  ('Video Editing',   'video-editing',   'Clapperboard',4),
  ('Digital Marketing','digital-marketing','Megaphone',  5),
  ('Business',        'business',        'Briefcase',   6),
  ('Programming',     'programming',     'Terminal',    7)
on conflict (slug) do nothing;

insert into public.membership_plans (name, slug, description, price, duration_days, features, sort_order) values
  ('1 Month',  '1-month',  'Monthly access to membership courses',          999,   30,
    array['All membership courses','New courses','Premium community','Downloads & resources'], 1),
  ('3 Months', '3-months', 'Quarterly access — save more',                  2499,  90,
    array['Everything in 1 Month','Priority support'], 2),
  ('6 Months', '6-months', 'Half-yearly access — best for serious learners',4499,  180,
    array['Everything in 3 Months','Early access to new content'], 3),
  ('1 Year',   '1-year',   'Full year of unlimited learning',               7999,  365,
    array['Everything in 6 Months','Free certificate priority','Exclusive workshops'], 4)
on conflict (slug) do nothing;

insert into public.settings (key, value) values
  ('site', jsonb_build_object(
      'name', 'UDAN Technology LMS',
      'tagline', 'Learn skills that help you take off',
      'description', 'Nepal''s practical online learning platform — courses, memberships, and certificates.',
      'support_email', 'support@yourdomain.com'
   )),
  ('hero', jsonb_build_object(
      'heading', 'Grow your skills, grow your future',
      'subheading', 'Practical, project-based courses in Nepali — web development, AI, design, marketing and more.',
      'cta_primary', 'Browse Courses',
      'cta_secondary', 'View Memberships'
   )),
  ('payment', jsonb_build_object(
      'esewa_number', '',
      'khalti_number', '',
      'bank_name', '',
      'bank_account_number', '',
      'bank_account_holder', '',
      'instructions', 'Pay using any method below, then upload your payment screenshot and transaction ID. Access is granted after admin approval (usually within a few hours).'
   ))
on conflict (key) do nothing;
