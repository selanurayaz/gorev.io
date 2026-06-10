-- Hizmet puanları: RLS'den bağımsız, yalnızca service_id dolu kayıtlar.
create or replace function public.get_service_rating_summaries(p_service_ids uuid[])
returns table (
  service_id uuid,
  average_rating numeric,
  review_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.service_id,
    avg(r.rating)::numeric as average_rating,
    count(*)::bigint as review_count
  from public.reviews as r
  where r.service_id is not null
    and r.service_id = any (p_service_ids)
  group by r.service_id;
$$;

create or replace function public.get_service_review_rows(
  p_service_id uuid,
  p_limit integer default 10
)
returns table (
  id uuid,
  task_id uuid,
  service_id uuid,
  reviewer_id uuid,
  reviewed_user_id uuid,
  rating smallint,
  comment text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.task_id,
    r.service_id,
    r.reviewer_id,
    r.reviewed_user_id,
    r.rating,
    r.comment,
    r.created_at
  from public.reviews as r
  where r.service_id = p_service_id
  order by r.created_at desc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

grant execute on function public.get_service_rating_summaries(uuid[]) to anon, authenticated;
grant execute on function public.get_service_review_rows(uuid, integer) to anon, authenticated;
