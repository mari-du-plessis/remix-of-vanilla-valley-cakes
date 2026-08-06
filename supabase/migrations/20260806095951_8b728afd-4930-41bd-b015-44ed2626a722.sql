DO $$ BEGIN
  CREATE TYPE public.customer_status AS ENUM ('lead','active','vip','inactive','blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contact_channel AS ENUM ('whatsapp','phone','email','instagram');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS status public.customer_status NOT NULL DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS whatsapp_phone text,
  ADD COLUMN IF NOT EXISTS preferred_channel public.contact_channel NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Delivery',
  recipient_name text,
  phone text,
  line1 text NOT NULL,
  line2 text,
  suburb text,
  city text,
  province text,
  postal_code text,
  country text NOT NULL DEFAULT 'South Africa',
  delivery_notes text,
  is_default boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_addresses TO authenticated;
GRANT ALL ON public.customer_addresses TO service_role;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage customer addresses" ON public.customer_addresses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notes TO authenticated;
GRANT ALL ON public.customer_notes TO service_role;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage customer notes" ON public.customer_notes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS customer_addresses_customer_idx ON public.customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS customer_notes_customer_idx ON public.customer_notes(customer_id);

CREATE TRIGGER customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER customer_notes_updated_at BEFORE UPDATE ON public.customer_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  GROUP BY c.id
$$;

REVOKE ALL ON FUNCTION public.customer_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.customer_summary() TO authenticated;