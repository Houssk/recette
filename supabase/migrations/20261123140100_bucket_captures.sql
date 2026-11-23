-- Bucket privé « captures » : 5 Mo max, images uniquement
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('captures', 'captures', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Dépôt : chemin <uuid anomalie>/<uuid fichier>.<ext>, pas d'écrasement
create policy "v1 depot captures" on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'captures'
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
  );
-- Lecture nécessaire pour générer des URL signées (bucket reste privé)
create policy "v1 lecture captures" on storage.objects for select to anon, authenticated
  using (bucket_id = 'captures');
