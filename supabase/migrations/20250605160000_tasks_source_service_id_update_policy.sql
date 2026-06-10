-- Müşteri, kendi görevinde eksik source_service_id alanını güncelleyebilir.
drop policy if exists "Task owners can set source_service_id" on public.tasks;

create policy "Task owners can set source_service_id"
  on public.tasks
  for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
