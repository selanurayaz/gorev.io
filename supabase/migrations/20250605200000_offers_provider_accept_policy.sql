-- Hizmet veren kendi teklif/talep kaydını kabul veya reddedebilir.
drop policy if exists offers_update_response_by_provider on public.offers;

create policy offers_update_response_by_provider
  on public.offers
  for update
  to authenticated
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

-- Görev sahibi kendi görevindeki teklifleri yönetebilir (klasik teklif kabul akışı).
drop policy if exists offers_update_response_by_task_owner on public.offers;

create policy offers_update_response_by_task_owner
  on public.offers
  for update
  to authenticated
  using (
    task_id is not null
    and exists (
      select 1
      from public.tasks as t
      where t.id = task_id
        and t.customer_id = auth.uid()
    )
  )
  with check (
    task_id is not null
    and exists (
      select 1
      from public.tasks as t
      where t.id = task_id
        and t.customer_id = auth.uid()
    )
  );

-- Hizmet veren, bekleyen veya kabul edilmiş teklifiyle görev durumunu güncelleyebilir.
drop policy if exists "Providers can update accepted offer task status" on public.tasks;

create policy "Providers can update offer task status"
  on public.tasks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.offers as o
      where o.task_id = tasks.id
        and o.provider_id = auth.uid()
        and o.status in ('pending', 'accepted')
    )
  )
  with check (true);

-- Görev sahibi kendi görevinin durumunu güncelleyebilir (teklif kabulü).
drop policy if exists "Task owners can update task status" on public.tasks;

create policy "Task owners can update task status"
  on public.tasks
  for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
