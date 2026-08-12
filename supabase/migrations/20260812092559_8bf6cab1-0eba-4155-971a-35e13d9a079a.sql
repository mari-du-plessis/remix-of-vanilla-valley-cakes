CREATE TABLE public.saved_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_key text NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  profile_id uuid,
  name text NOT NULL,
  product_slug text,
  size_key text,
  tier_count integer NOT NULL DEFAULT 1,
  design jsonb NOT NULL DEFAULT '{}'::jsonb,
  gallery_photo_id uuid REFERENCES public.gallery_photos(id) ON DELETE SET NULL,
  inspiration_image_url text,
  ai_preview_url text,
  ai_preview_signature text,
  source_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  source_design_id uuid REFERENCES public.saved_designs(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_opened_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_designs_status_check CHECK (status IN ('active','archived'))
);

CREATE INDEX saved_designs_owner_key_idx ON public.saved_designs (owner_key, status, updated_at DESC);
CREATE INDEX saved_designs_customer_idx ON public.saved_designs (customer_id);

GRANT SELECT ON public.saved_designs TO authenticated;
GRANT ALL ON public.saved_designs TO service_role;

ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view saved designs"
  ON public.saved_designs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER saved_designs_updated_at
  BEFORE UPDATE ON public.saved_designs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();