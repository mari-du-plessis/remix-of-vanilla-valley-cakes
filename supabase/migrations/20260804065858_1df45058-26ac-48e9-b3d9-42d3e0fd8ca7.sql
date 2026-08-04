-- ENUMS
CREATE TYPE public.product_kind AS ENUM ('cake','baked_good','gift_card','service','delivery');
CREATE TYPE public.option_select_type AS ENUM ('single','multi');
CREATE TYPE public.option_rule_type AS ENUM ('pairs_with','requires','excludes');

-- CATEGORIES
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active categories" ON public.product_categories
  FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins manage categories" ON public.product_categories
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  kind public.product_kind NOT NULL DEFAULT 'cake',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  base_price_cents integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- OPTION GROUPS
CREATE TABLE public.option_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  select_type public.option_select_type NOT NULL DEFAULT 'single',
  is_required boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.option_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.option_groups TO authenticated;
GRANT ALL ON public.option_groups TO service_role;
ALTER TABLE public.option_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active option groups" ON public.option_groups
  FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins manage option groups" ON public.option_groups
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- OPTIONS
CREATE TABLE public.options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  price_adjustment_cents integer NOT NULL DEFAULT 0,
  svg_token text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, key)
);
GRANT SELECT ON public.options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.options TO authenticated;
GRANT ALL ON public.options TO service_role;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active options" ON public.options
  FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins manage options" ON public.options
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- PRODUCT ↔ OPTION GROUP LINK
CREATE TABLE public.product_option_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_group_id uuid NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
  is_required boolean,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, option_group_id)
);
GRANT SELECT ON public.product_option_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_option_groups TO authenticated;
GRANT ALL ON public.product_option_groups TO service_role;
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view product option groups" ON public.product_option_groups
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage product option groups" ON public.product_option_groups
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- OPTION RULES
CREATE TABLE public.option_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
  rule_type public.option_rule_type NOT NULL,
  target_option_id uuid REFERENCES public.options(id) ON DELETE CASCADE,
  target_label text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.option_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.option_rules TO authenticated;
GRANT ALL ON public.option_rules TO service_role;
ALTER TABLE public.option_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view option rules" ON public.option_rules
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage option rules" ON public.option_rules
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- updated_at triggers
CREATE TRIGGER product_categories_updated_at BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER option_groups_updated_at BEFORE UPDATE ON public.option_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER options_updated_at BEFORE UPDATE ON public.options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER product_option_groups_updated_at BEFORE UPDATE ON public.product_option_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER option_rules_updated_at BEFORE UPDATE ON public.option_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED ============
INSERT INTO public.product_categories (slug, name, description, sort_order) VALUES
  ('custom-cakes','Custom Cakes','Bespoke celebration cakes designed with the customer',1),
  ('cupcakes','Cupcakes','Cupcakes by the dozen',2),
  ('cheesecakes','Cheesecakes','Baked and chilled cheesecakes',3),
  ('biscuits','Biscuits','Decorated and plain biscuits',4),
  ('rusks','Rusks','Traditional buttermilk rusks',5),
  ('cake-cups','Cake Cups','Layered cake in a cup',6),
  ('tarts','Tarts','Sweet tarts and pies',7),
  ('gift-cards','Gift Cards','Prepaid gift cards',8),
  ('services','Services','Tastings and consultations',9),
  ('delivery','Delivery','Delivery and collection options',10);

INSERT INTO public.products (category_id, slug, name, description, kind, sort_order)
SELECT c.id, v.slug, v.name, v.description, v.kind::public.product_kind, v.sort_order
FROM (VALUES
  ('custom-cakes','custom-cake','Custom Cake','A bespoke cake designed for the occasion','cake',1),
  ('cupcakes','cupcakes','Cupcakes','Cupcakes sold per dozen','baked_good',2),
  ('cheesecakes','cheesecake','Cheesecake','Baked or chilled cheesecake','baked_good',3),
  ('biscuits','biscuits','Biscuits','Decorated or plain biscuits','baked_good',4),
  ('rusks','rusks','Rusks','Buttermilk rusks','baked_good',5),
  ('cake-cups','cake-cups','Cake Cups','Layered cake served in a cup','baked_good',6),
  ('tarts','tarts','Tarts','Sweet tarts','baked_good',7),
  ('gift-cards','gift-card','Gift Card','Prepaid gift card','gift_card',8),
  ('services','cake-tasting','Cake Tasting','In-person tasting and consultation','service',9),
  ('delivery','delivery','Delivery','Delivery to the event address','delivery',10)
) AS v(category_slug, slug, name, description, kind, sort_order)
JOIN public.product_categories c ON c.slug = v.category_slug;

INSERT INTO public.option_groups (key, name, description, select_type, is_required, sort_order) VALUES
  ('shape','Shapes','Cake shape','single',false,1),
  ('size','Sizes','Cake size and serving guide','single',true,2),
  ('layers','Layers','Number of sponge layers','single',false,3),
  ('tiers','Tiers','Number of tiers','single',false,4),
  ('flavour','Flavours','Sponge flavour','single',true,5),
  ('filling','Fillings','Filling between layers','single',true,6),
  ('icing','Icings','Outer icing finish','single',false,7),
  ('decoration','Decorations','Decorative extras','multi',false,8),
  ('flowers','Flowers','Floral finishes','multi',false,9),
  ('drip','Drips','Drip effects','single',false,10),
  ('sprinkles','Sprinkles','Sprinkle finishes','multi',false,11),
  ('topper','Toppers','Cake toppers','single',false,12);

INSERT INTO public.options (group_id, key, name, sort_order, metadata)
SELECT g.id, v.key, v.name, v.sort_order, v.metadata::jsonb
FROM (VALUES
  ('6','6" Round',1,'{"serves":"Serves 8–10","tiers":0}'),
  ('8','8" Round',2,'{"serves":"Serves 12–15","tiers":0}'),
  ('10','10" Round',3,'{"serves":"Serves 20–25","tiers":0}'),
  ('tier2','2 Tier',4,'{"serves":"Serves 30–40","tiers":2}'),
  ('tier3','3 Tier',5,'{"serves":"Serves 60–80","tiers":3}'),
  ('cupcakes','Cupcakes',6,'{"serves":"Per dozen","tiers":0}')
) AS v(key, name, sort_order, metadata)
CROSS JOIN (SELECT id FROM public.option_groups WHERE key='size') g;

INSERT INTO public.options (group_id, key, name, sort_order)
SELECT g.id, v.key, v.name, v.sort_order
FROM (VALUES
  ('vanilla-buttercream','Vanilla Buttercream',1),
  ('chocolate-ganache','Chocolate Ganache',2),
  ('salted-caramel','Salted Caramel',3),
  ('fresh-cream','Fresh Cream',4),
  ('fresh-cream-berries','Fresh Cream & Berries',5),
  ('cream-cheese','Cream Cheese',6),
  ('cream-cheese-salted-caramel','Cream Cheese and Salted Caramel',7),
  ('amarula-chocolate-ganache','Amarula Chocolate Ganache',8)
) AS v(key, name, sort_order)
CROSS JOIN (SELECT id FROM public.option_groups WHERE key='filling') g;

INSERT INTO public.options (group_id, key, name, sort_order)
SELECT g.id, v.key, v.name, v.sort_order
FROM (VALUES
  ('vanilla','Vanilla',1),
  ('chocolate','Chocolate',2),
  ('red-velvet','Red Velvet',3),
  ('carrot','Carrot',4),
  ('spicy-pumpkin','Spicy Pumpkin',5),
  ('funfetti','Funfetti',6),
  ('lemon','Lemon',7),
  ('lemon-poppy','Lemon Poppy',8),
  ('coffee','Coffee',9),
  ('amarula','Amarula',10),
  ('hummingbird','Hummingbird',11)
) AS v(key, name, sort_order)
CROSS JOIN (SELECT id FROM public.option_groups WHERE key='flavour') g;

INSERT INTO public.options (group_id, key, name, sort_order)
SELECT g.id, v.key, v.name, v.sort_order
FROM (VALUES
  ('fresh-flowers','Fresh flowers',1),
  ('edible-gold-leaf','Edible gold leaf',2),
  ('custom-topper','Custom topper',3),
  ('personalised-message','Personalised message',4),
  ('macarons-on-top','Macarons on top',5),
  ('drip-effect','Drip effect',6),
  ('candles-included','Candles included',7)
) AS v(key, name, sort_order)
CROSS JOIN (SELECT id FROM public.option_groups WHERE key='decoration') g;

-- Signature flavour → filling pairings
INSERT INTO public.option_rules (option_id, rule_type, target_option_id)
SELECT f.id, 'pairs_with'::public.option_rule_type, fi.id
FROM (VALUES
  ('red-velvet','cream-cheese'),
  ('carrot','cream-cheese'),
  ('spicy-pumpkin','cream-cheese-salted-caramel'),
  ('lemon','cream-cheese'),
  ('lemon-poppy','cream-cheese'),
  ('amarula','amarula-chocolate-ganache'),
  ('hummingbird','cream-cheese')
) AS v(flavour_key, filling_key)
JOIN public.options f ON f.key = v.flavour_key
  AND f.group_id = (SELECT id FROM public.option_groups WHERE key='flavour')
JOIN public.options fi ON fi.key = v.filling_key
  AND fi.group_id = (SELECT id FROM public.option_groups WHERE key='filling');

-- Custom Cake uses every cake option group
INSERT INTO public.product_option_groups (product_id, option_group_id, sort_order)
SELECT p.id, g.id, g.sort_order
FROM public.products p
CROSS JOIN public.option_groups g
WHERE p.slug = 'custom-cake';