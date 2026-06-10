-- Müşteri görev oluştururken source_service_id yazabilsin (hizmet talebi).
drop policy if exists "Customers can insert tasks with source service" on public.tasks;

create policy "Customers can insert tasks with source service"
  on public.tasks
  for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and (
      source_service_id is null
      or exists (
        select 1
        from public.services as s
        where s.id = source_service_id
      )
    )
  );
