
insert into storage.buckets (id, name, public)
values ('inspiration-photos', 'inspiration-photos', true)
on conflict (id) do nothing;

create policy "Public can upload inspiration photos"
on storage.objects for insert
to public
with check (bucket_id = 'inspiration-photos');

create policy "Public can view inspiration photos"
on storage.objects for select
to public
using (bucket_id = 'inspiration-photos');
