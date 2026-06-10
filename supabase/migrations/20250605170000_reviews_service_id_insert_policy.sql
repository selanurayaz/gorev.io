-- Değerlendirme kaydında service_id yazılabilsin (görev sahibi).
drop policy if exists "Task owners can insert service-linked reviews" on public.reviews;

create policy "Task owners can insert service-linked reviews"
  on public.reviews
  for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and (
      service_id is null
      or exists (
        select 1
        from public.tasks as t
        where t.id = reviews.task_id
          and t.customer_id = auth.uid()
      )
    )
  );

drop policy if exists "Task owners can update service-linked reviews" on public.reviews;

create policy "Task owners can update service-linked reviews"
  on public.reviews
  for update
  to authenticated
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());
