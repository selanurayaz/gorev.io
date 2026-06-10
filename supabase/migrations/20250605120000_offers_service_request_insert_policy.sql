-- Hizmet talebi akışı: müşteri (görev sahibi) kendi görevi için hizmet verene
-- teklif/talep kaydı ekleyebilir. Mevcut provider_id = auth.uid() politikasıyla birlikte çalışır (OR).
DROP POLICY IF EXISTS offers_insert_service_request_by_task_owner ON public.offers;

CREATE POLICY offers_insert_service_request_by_task_owner
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    task_id IS NOT NULL
    AND provider_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tasks t
      WHERE t.id = task_id
        AND t.customer_id = auth.uid()
    )
  );
