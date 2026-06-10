-- Hizmet veren, kabul ettiği teklifin görevini devam ediyor yapabilir.
drop policy if exists "Providers can update accepted offer task status" on public.tasks;

create policy "Providers can update accepted offer task status"
  on public.tasks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.offers as o
      where o.task_id = tasks.id
        and o.provider_id = auth.uid()
        and o.status = 'accepted'
    )
  )
  with check (true);
