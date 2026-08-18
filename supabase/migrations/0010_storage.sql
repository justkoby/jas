-- ============================================================
-- 0010_storage.sql
-- Storage buckets and policies.
-- Product/category/site images are publicly readable but only
-- staff may upload, update or delete them. Avatars are written
-- only under the owner's own folder.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('site-content', 'site-content', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Public read access
-- ------------------------------------------------------------

create policy "storage_public_read_product_images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "storage_public_read_category_images"
  on storage.objects for select
  to public
  using (bucket_id = 'category-images');

create policy "storage_public_read_site_content"
  on storage.objects for select
  to public
  using (bucket_id = 'site-content');

create policy "storage_public_read_avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- ------------------------------------------------------------
-- Staff-only writes for catalogue/site buckets
-- ------------------------------------------------------------

create policy "storage_staff_insert_catalogue"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('product-images', 'category-images', 'site-content')
    and public.is_staff()
  );

create policy "storage_staff_update_catalogue"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('product-images', 'category-images', 'site-content')
    and public.is_staff()
  )
  with check (
    bucket_id in ('product-images', 'category-images', 'site-content')
    and public.is_staff()
  );

create policy "storage_staff_delete_catalogue"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('product-images', 'category-images', 'site-content')
    and public.is_staff()
  );

-- ------------------------------------------------------------
-- Avatars: users manage only files under their own uid folder
-- ------------------------------------------------------------

create policy "storage_users_insert_own_avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_users_update_own_avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_users_delete_own_avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
