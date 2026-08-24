INSERT INTO public.option_groups (key, name, description, select_type, is_required, is_active, sort_order)
VALUES ('cake-cup-size', 'Cake Cup Sizes', 'Provisional — edit in Admin → Products → Options.', 'single', true, true, 20)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.options (group_id, key, name, description, is_active, sort_order)
SELECT og.id, 'standard', 'Standard', 'Our standard cake cup size.', true, 0
FROM public.option_groups og WHERE og.key = 'cake-cup-size'
AND NOT EXISTS (SELECT 1 FROM public.options o WHERE o.group_id = og.id AND o.key = 'standard');

INSERT INTO public.product_option_groups (product_id, option_group_id, is_required, sort_order)
SELECT p.id, og.id, true, 20
FROM public.products p, public.option_groups og
WHERE p.slug = 'cake-cups' AND og.key = 'cake-cup-size'
AND NOT EXISTS (
  SELECT 1 FROM public.product_option_groups pog
  WHERE pog.product_id = p.id AND pog.option_group_id = og.id
);