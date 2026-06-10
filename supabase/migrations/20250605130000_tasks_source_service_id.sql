-- Hizmet talebinden türeyen görevleri kaynak hizmete bağlar.
alter table public.tasks
  add column if not exists source_service_id uuid references public.services (id);

create index if not exists tasks_source_service_id_idx
  on public.tasks (source_service_id)
  where source_service_id is not null;
