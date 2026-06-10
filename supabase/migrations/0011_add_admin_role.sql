-- ============================================================
--  0011 — Add the 'admin' role  (RUN THIS ALONE, FIRST)
--  A new enum value must be committed before other statements can
--  use it, so this is kept in its own migration.
-- ============================================================

alter type public.user_role add value if not exists 'admin';
