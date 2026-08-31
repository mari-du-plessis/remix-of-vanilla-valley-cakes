-- 1. Serving chart -----------------------------------------------------------
CREATE TABLE public.serving_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  size_cm numeric(5,1) NOT NULL UNIQUE,
  servings integer NOT NULL,
  label text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.serving_sizes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.serving_sizes TO authenticated;
GRANT ALL ON public.serving_sizes TO service_role;

ALTER TABLE public.serving_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Serving sizes are publicly readable"
  ON public.serving_sizes FOR SELECT USING (true);

CREATE POLICY "Admins manage serving sizes"
  ON public.serving_sizes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER serving_sizes_updated_at
  BEFORE UPDATE ON public.serving_sizes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.serving_sizes (size_cm, servings, label, sort_order) VALUES
  (10,   6,  '10 cm',   10),
  (12.5, 8,  '12.5 cm', 20),
  (15,   12, '15 cm',   30),
  (18,   16, '18 cm',   40),
  (20,   24, '20 cm',   50),
  (23,   32, '23 cm',   60),
  (25,   38, '25 cm',   70),
  (28,   46, '28 cm',   80),
  (30,   56, '30 cm',   90);

-- 2. Order items know what kind of item they are ------------------------------
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'custom_cake';

-- 3. Customer-facing fixed-price products -------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_customer_visible boolean NOT NULL DEFAULT false;

-- 4. Occasions become catalog options -----------------------------------------
INSERT INTO public.option_groups (key, name, description, select_type, is_required, is_active, sort_order)
VALUES ('occasion', 'Occasion', 'What the cake or treat is being made for', 'single', false, true, 5)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.options (group_id, key, name, is_active, sort_order)
SELECT g.id, v.key, v.name, true, v.sort_order
FROM public.option_groups g
CROSS JOIN (VALUES
  ('birthday',      'Birthday',      10),
  ('wedding',       'Wedding',       20),
  ('anniversary',   'Anniversary',   30),
  ('baby-shower',   'Baby Shower',   40),
  ('bridal-shower', 'Bridal Shower', 50),
  ('graduation',    'Graduation',    60),
  ('corporate',     'Corporate',     70),
  ('other',         'Other',         80)
) AS v(key, name, sort_order)
WHERE g.key = 'occasion'
ON CONFLICT DO NOTHING;

-- 5. Handmade figurines as a priceable option ---------------------------------
INSERT INTO public.option_groups (key, name, description, select_type, is_required, is_active, sort_order)
VALUES ('figurines', 'Handmade figurines', 'Hand-sculpted fondant figurines', 'single', false, true, 60)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.options (group_id, key, name, description, is_active, sort_order)
SELECT g.id, 'figurine', 'Handmade fondant figurine', 'Priced per figurine', true, 10
FROM public.option_groups g
WHERE g.key = 'figurines'
ON CONFLICT DO NOTHING;