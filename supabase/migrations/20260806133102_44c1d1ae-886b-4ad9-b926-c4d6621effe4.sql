-- Enums
CREATE TYPE public.quote_status AS ENUM ('draft','finalised','sent','accepted','declined','expired','archived');
CREATE TYPE public.quote_line_kind AS ENUM ('product','option','tier','service','delivery','rush','rule','discount','charge','custom');

-- Quote numbering
CREATE SEQUENCE IF NOT EXISTS public.quote_number_seq;

CREATE OR REPLACE FUNCTION public.next_quote_number()
RETURNS text
LANGUAGE sql
SET search_path TO 'public'
AS $$
  SELECT 'VVQ-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.quote_number_seq')::text, 4, '0');
$$;

-- Quotes
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  quote_number text NOT NULL UNIQUE DEFAULT public.next_quote_number(),
  revision integer NOT NULL DEFAULT 1,
  status public.quote_status NOT NULL DEFAULT 'draft',
  price_list_id uuid REFERENCES public.price_lists(id) ON DELETE SET NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  deposit_percent integer NOT NULL DEFAULT 50,
  deposit_cents integer NOT NULL DEFAULT 0,
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  notes text,
  terms text,
  internal_notes text,
  finalised_at timestamptz,
  archived_at timestamptz,
  created_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, revision)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage quotes" ON public.quotes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX quotes_order_id_idx ON public.quotes(order_id);
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Line items
CREATE TABLE public.quote_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  kind public.quote_line_kind NOT NULL DEFAULT 'product',
  price_list_item_id uuid REFERENCES public.price_list_items(id) ON DELETE SET NULL,
  pricing_rule_id uuid REFERENCES public.pricing_rules(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  option_id uuid REFERENCES public.options(id) ON DELETE SET NULL,
  label text NOT NULL,
  detail text,
  quantity integer NOT NULL DEFAULT 1,
  unit_cents integer NOT NULL DEFAULT 0,
  amount_cents integer NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_line_items TO authenticated;
GRANT ALL ON public.quote_line_items TO service_role;
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage quote line items" ON public.quote_line_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX quote_line_items_quote_id_idx ON public.quote_line_items(quote_id);
CREATE TRIGGER quote_line_items_updated_at BEFORE UPDATE ON public.quote_line_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notes
CREATE TABLE public.quote_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_notes TO authenticated;
GRANT ALL ON public.quote_notes TO service_role;
ALTER TABLE public.quote_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage quote notes" ON public.quote_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX quote_notes_quote_id_idx ON public.quote_notes(quote_id);
CREATE TRIGGER quote_notes_updated_at BEFORE UPDATE ON public.quote_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Status history
CREATE TABLE public.quote_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  from_status public.quote_status,
  to_status public.quote_status NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.quote_status_history TO authenticated;
GRANT ALL ON public.quote_status_history TO service_role;
ALTER TABLE public.quote_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read quote history" ON public.quote_status_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert quote history" ON public.quote_status_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX quote_status_history_quote_id_idx ON public.quote_status_history(quote_id);

CREATE OR REPLACE FUNCTION public.log_quote_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.quote_status_history (quote_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.quote_status_history (quote_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quotes_status_history AFTER INSERT OR UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.log_quote_status_change();