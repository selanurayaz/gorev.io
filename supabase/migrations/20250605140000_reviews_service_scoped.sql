-- Hizmet ve görev bazlı değerlendirmeler.
alter table public.reviews
  add column if not exists service_id uuid references public.services (id),
  add column if not exists task_id uuid references public.tasks (id);

create index if not exists reviews_service_id_idx
  on public.reviews (service_id)
  where service_id is not null;

create index if not exists reviews_task_id_idx
  on public.reviews (task_id)
  where task_id is not null;

-- Marketplace hizmet puanları: service_id dolu değerlendirmeler herkese okunabilir.
drop policy if exists "Service reviews are publicly readable" on public.reviews;

create policy "Service reviews are publicly readable"
  on public.reviews
  for select
  to anon, authenticated
  using (service_id is not null);
