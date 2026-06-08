-- ============================================================
--  0008 — Storage buckets & policies
--  Images/media live on Cloudinary. Supabase Storage is used only for
--  sensitive/gated files: payment proofs, gated course resources, certificates.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('payment-proofs',   'payment-proofs',   false),
  ('course-resources', 'course-resources', false),
  ('certificates',     'certificates',     true)
on conflict (id) do nothing;

-- ---------- payment-proofs (private) ----------
-- Files stored under  {user_id}/{filename}
create policy "payment_proofs_insert_own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "payment_proofs_select_own" on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ---------- course-resources (private, gated by access) ----------
-- Files stored under  {course_id}/{filename}
create policy "resources_select_access" on storage.objects for select to authenticated
  using (
    bucket_id = 'course-resources'
    and (
      public.is_admin()
      or public.has_course_access(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  );
create policy "resources_write_staff" on storage.objects for insert to authenticated
  with check (bucket_id = 'course-resources' and public.is_staff());
create policy "resources_update_staff" on storage.objects for update to authenticated
  using (bucket_id = 'course-resources' and public.is_staff());
create policy "resources_delete_staff" on storage.objects for delete to authenticated
  using (bucket_id = 'course-resources' and public.is_staff());

-- ---------- certificates (public read, admin/service write) ----------
create policy "certificates_public_read" on storage.objects for select
  using (bucket_id = 'certificates');
create policy "certificates_admin_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'certificates' and public.is_admin());
