-- Hizmet talebi kabulü: teklif + görev güncellemesi RLS dışında güvenli RPC ile.
drop function if exists public.accept_service_request(uuid);

create or replace function public.accept_service_request(p_offer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider_id uuid := auth.uid();
  v_offer public.offers%rowtype;
  v_task public.tasks%rowtype;
begin
  if v_provider_id is null then
    raise exception 'Oturum bulunamadı.';
  end if;

  select *
  into v_offer
  from public.offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Talep bulunamadı.';
  end if;

  if v_offer.provider_id is distinct from v_provider_id then
    raise exception 'Bu talebi yönetme yetkiniz yok.';
  end if;

  if v_offer.status is distinct from 'pending' then
    raise exception 'Yalnızca beklemedeki talepler yanıtlanabilir.';
  end if;

  if v_offer.task_id is null then
    raise exception 'Görev bulunamadı.';
  end if;

  select *
  into v_task
  from public.tasks
  where id = v_offer.task_id
  for update;

  if not found then
    raise exception 'Görev bulunamadı.';
  end if;

  if v_task.source_service_id is null then
    raise exception 'Bu kayıt bir hizmet talebi değil.';
  end if;

  update public.offers
  set status = 'accepted'
  where id = p_offer_id;

  update public.tasks
  set status = 'in_progress'
  where id = v_offer.task_id;

  update public.offers
  set status = 'rejected'
  where task_id = v_offer.task_id
    and id <> p_offer_id
    and status = 'pending';

  return jsonb_build_object(
    'offer_id', p_offer_id,
    'task_id', v_offer.task_id,
    'customer_id', v_task.customer_id
  );
end;
$$;

revoke all on function public.accept_service_request(uuid) from public;
grant execute on function public.accept_service_request(uuid) to authenticated;
