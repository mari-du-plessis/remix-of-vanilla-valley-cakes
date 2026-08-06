-- Pricing module ---------------------------------------------------------

CREATE TYPE public.price_target_type AS ENUM (
  'product', 'option', 'tier', 'delivery', 'rush', 'service', 'custom'
);

CREATE TYPE public.price_unit AS ENUM (
  'flat', 'per_serving', 'per_tier', 'per_km', 'per_hour', 'percentage'
);

CREATE TYPE public.pricing_rule_type AS ENUM (
  'rush_order', 'delivery_zone', 'weekend_surcharge', 'holiday_surcharge',
  'seasonal_promotion', 'minimum_order', 'custom'
);

CREATE TYPE public.pricing_adjustment_type AS ENUM ('fixed', 'percentage');

-- Price lists -------------------------------------------------------------
CREATE TABLE public.price_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  currency text NOT NULL DEFAULT 'ZAR',
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  effective_from date,
  effective_to date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT price_lists_effective_range CHECK (
    effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from
  )
);

CREATE UNIQUE INDEX price_lists_single_default
  ON public.price_lists (is_default) WHERE is_default;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_lists TO authenticated;
GRANT ALL ON public.price_lists TO service_role;
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage price lists" ON public.price_lists
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER price_lists_updated_at BEFORE UPDATE ON public.price_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Price list items --------------------------------------------------------
CREATE TABLE public.price_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id uuid NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
  target_type public.price_target_type NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.options(id) ON DELETE CASCADE,
  size_key text,
  tier_count integer,
  label text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  unit public.price_unit NOT NULL DEFAULT 'flat',
  min_quantity integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX price_list_items_list_idx ON public.price_list_items (price_list_id);
CREATE INDEX price_list_items_product_idx ON public.price_list_items (product_id);
CREATE INDEX price_list_items_option_idx ON public.price_list_items (option_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_list_items TO authenticated;
GRANT ALL ON public.price_list_items TO service_role;
ALTER TABLE public.price_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage price list items" ON public.price_list_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER price_list_items_updated_at BEFORE UPDATE ON public.price_list_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pricing rules -----------------------------------------------------------
CREATE TABLE public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id uuid REFERENCES public.price_lists(id) ON DELETE CASCADE,
  rule_type public.pricing_rule_type NOT NULL,
  name text NOT NULL,
  description text,
  adjustment_type public.pricing_adjustment_type NOT NULL DEFAULT 'fixed',
  adjustment_value integer NOT NULL DEFAULT 0,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  effective_from date,
  effective_to date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pricing_rules_effective_range CHECK (
    effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from
  )
);

CREATE INDEX pricing_rules_list_idx ON public.pricing_rules (price_list_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_rules TO authenticated;
GRANT ALL ON public.pricing_rules TO service_role;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage pricing rules" ON public.pricing_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Default price list ------------------------------------------------------
INSERT INTO public.price_lists (slug, name, description, is_default, is_active)
VALUES ('standard', 'Standard Price List', 'Internal baseline pricing used for quotations.', true, true);
