CREATE TABLE public.cake_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  product_slug text NOT NULL DEFAULT 'custom-cake',
  size_key text,
  tier_count integer NOT NULL DEFAULT 1,
  design jsonb NOT NULL DEFAULT '{}'::jsonb,
  gallery_photo_id uuid REFERENCES public.gallery_photos(id) ON DELETE SET NULL,
  inspiration_image_url text,
  ai_preview_url text,
  ai_preview_signature text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cake_templates_status_check CHECK (status IN ('active','archived')),
  CONSTRAINT cake_templates_tier_count_check CHECK (tier_count BETWEEN 1 AND 10)
);

GRANT SELECT ON public.cake_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cake_templates TO authenticated;
GRANT ALL ON public.cake_templates TO service_role;

ALTER TABLE public.cake_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published templates"
ON public.cake_templates FOR SELECT
TO anon, authenticated
USING (is_active AND status = 'active');

CREATE POLICY "Admins can manage templates"
ON public.cake_templates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX cake_templates_public_idx
  ON public.cake_templates (is_active, status, sort_order, created_at DESC);
CREATE INDEX cake_templates_category_idx ON public.cake_templates (category);

CREATE TRIGGER update_cake_templates_updated_at
BEFORE UPDATE ON public.cake_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.saved_designs
  ADD COLUMN IF NOT EXISTS source_template_id uuid
  REFERENCES public.cake_templates(id) ON DELETE SET NULL;