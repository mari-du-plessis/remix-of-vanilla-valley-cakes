CREATE OR REPLACE FUNCTION public.customer_summary()
RETURNS TABLE(customer_id uuid, order_count integer, last_order_at timestamptz, next_event_date date)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT c.id,
         COUNT(o.id)::integer,
         MAX(o.created_at),
         MIN(o.event_date) FILTER (WHERE o.event_date >= CURRENT_DATE AND o.status NOT IN ('cancelled','completed'))
  FROM public.customers c
  LEFT JOIN public.orders o ON o.customer_id = c.id
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY c.id
$$;