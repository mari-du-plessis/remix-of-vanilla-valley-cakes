
CREATE TYPE public.cake_asset_category AS ENUM (
  'board','shape','icing','drip','flower','leaf','sprinkle','pearl','gold_leaf',
  'topper','text_plaque','border','pattern','decoration'
);

CREATE TYPE public.cake_asset_slot AS ENUM (
  'board','tier-body','tier-finish','drip','border','cluster','scatter','topper','text'
);

CREATE TABLE public.cake_builder_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  category public.cake_asset_category NOT NULL DEFAULT 'decoration',
  slot public.cake_asset_slot NOT NULL DEFAULT 'cluster',
  svg_content text NOT NULL,
  z_index integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cake_builder_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cake_builder_assets TO authenticated;
GRANT ALL ON public.cake_builder_assets TO service_role;
ALTER TABLE public.cake_builder_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active cake assets are viewable by everyone"
  ON public.cake_builder_assets FOR SELECT USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage cake assets"
  ON public.cake_builder_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER cake_builder_assets_updated_at
  BEFORE UPDATE ON public.cake_builder_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cake_builder_asset_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.cake_builder_assets(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asset_id, option_id)
);

GRANT SELECT ON public.cake_builder_asset_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cake_builder_asset_options TO authenticated;
GRANT ALL ON public.cake_builder_asset_options TO service_role;
ALTER TABLE public.cake_builder_asset_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cake asset links are viewable by everyone"
  ON public.cake_builder_asset_options FOR SELECT USING (true);
CREATE POLICY "Admins manage cake asset links"
  ON public.cake_builder_asset_options FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX cake_builder_asset_options_option_idx ON public.cake_builder_asset_options(option_id);

INSERT INTO public.cake_builder_assets (key, name, category, slot, z_index, notes, svg_content) VALUES
('board-wood','Wooden cake board','board','board',0,'Natural wood stand the cake sits on.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 46"><ellipse cx="100" cy="16" rx="98" ry="14" fill="var(--cake-wood-dark,#a8794b)"/><ellipse cx="100" cy="13" rx="98" ry="14" fill="var(--cake-wood,#c69a67)"/><rect x="82" y="16" width="36" height="20" rx="3" fill="var(--cake-wood-dark,#a8794b)"/><ellipse cx="100" cy="37" rx="42" ry="8" fill="var(--cake-wood,#c69a67)"/></svg>$svg$),

('shape-round','Round tier','shape','tier-body',10,'Stretched to each tier''s width and height.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 8 L0 88 A50 12 0 0 0 100 88 L100 8 Z" fill="var(--cake-icing,#f3e9dc)"/><path d="M70 8 L70 91 A50 12 0 0 0 100 88 L100 8 Z" fill="var(--cake-shade,#2a2320)" opacity="0.16"/><ellipse cx="50" cy="8" rx="50" ry="8" fill="var(--cake-icing,#f3e9dc)"/><ellipse cx="50" cy="8" rx="50" ry="8" fill="#ffffff" opacity="0.28"/></svg>$svg$),

('shape-square','Square tier','shape','tier-body',10,'Square / rectangular tier with a top face.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="0,10 8,2 100,2 92,10" fill="var(--cake-icing,#f3e9dc)"/><polygon points="0,10 8,2 100,2 92,10" fill="#ffffff" opacity="0.25"/><rect x="0" y="10" width="92" height="90" fill="var(--cake-icing,#f3e9dc)"/><rect x="72" y="10" width="20" height="90" fill="var(--cake-shade,#2a2320)" opacity="0.15"/><polygon points="92,10 100,2 100,92 92,100" fill="var(--cake-shade,#2a2320)" opacity="0.22"/></svg>$svg$),

('shape-heart','Heart tier','shape','tier-body',10,'Single-tier heart silhouette.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50 96 C10 66 2 44 2 32 C2 14 16 6 30 6 C40 6 47 12 50 20 C53 12 60 6 70 6 C84 6 98 14 98 32 C98 44 90 66 50 96 Z" fill="var(--cake-icing,#f3e9dc)"/><path d="M50 96 C74 78 88 58 94 40 C96 60 82 76 50 96 Z" fill="var(--cake-shade,#2a2320)" opacity="0.14"/><ellipse cx="30" cy="30" rx="12" ry="7" fill="#ffffff" opacity="0.25"/></svg>$svg$),

('shape-sheet','Sheet / slab tier','shape','tier-body',10,'Low, wide slab cake.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="0,14 6,4 100,4 94,14" fill="var(--cake-icing,#f3e9dc)"/><rect x="0" y="14" width="94" height="86" rx="3" fill="var(--cake-icing,#f3e9dc)"/><rect x="78" y="14" width="16" height="86" fill="var(--cake-shade,#2a2320)" opacity="0.13"/><polygon points="0,14 6,4 100,4 94,14" fill="#ffffff" opacity="0.22"/></svg>$svg$),

('shape-number','Number / sculpted tier','shape','tier-body',10,'Sculpted slab used for number and letter cakes.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="4" y="6" width="92" height="90" rx="14" fill="var(--cake-icing,#f3e9dc)"/><rect x="74" y="6" width="22" height="90" rx="12" fill="var(--cake-shade,#2a2320)" opacity="0.13"/><rect x="14" y="16" width="26" height="16" rx="8" fill="#ffffff" opacity="0.25"/></svg>$svg$),

('icing-smooth','Smooth buttercream','icing','tier-finish',20,'Soft sheen over the tier body.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="6" y="14" width="18" height="76" rx="9" fill="#ffffff" opacity="0.22"/></svg>$svg$),

('icing-textured','Textured buttercream','icing','tier-finish',20,'Vertical palette-knife strokes.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="var(--cake-shade,#2a2320)" opacity="0.10"><rect x="8" y="12" width="6" height="82" rx="3"/><rect x="26" y="12" width="6" height="82" rx="3"/><rect x="44" y="12" width="6" height="82" rx="3"/><rect x="62" y="12" width="6" height="82" rx="3"/><rect x="80" y="12" width="6" height="82" rx="3"/></g><g fill="#ffffff" opacity="0.20"><rect x="17" y="12" width="5" height="82" rx="3"/><rect x="35" y="12" width="5" height="82" rx="3"/><rect x="53" y="12" width="5" height="82" rx="3"/><rect x="71" y="12" width="5" height="82" rx="3"/></g></svg>$svg$),

('icing-fondant','Fondant','icing','tier-finish',20,'Crisp, matte fondant edge.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="0" y="10" width="100" height="4" fill="#ffffff" opacity="0.35"/><rect x="0" y="88" width="100" height="6" fill="var(--cake-shade,#2a2320)" opacity="0.10"/></svg>$svg$),

('icing-naked','Semi-naked','icing','tier-finish',20,'Exposed sponge layers with a thin coat.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="0" y="16" width="100" height="22" fill="var(--cake-sponge,#c99a63)" opacity="0.55"/><rect x="0" y="38" width="100" height="8" fill="var(--cake-filling,#f6e7d2)" opacity="0.75"/><rect x="0" y="46" width="100" height="22" fill="var(--cake-sponge,#c99a63)" opacity="0.55"/><rect x="0" y="68" width="100" height="8" fill="var(--cake-filling,#f6e7d2)" opacity="0.75"/><rect x="0" y="76" width="100" height="18" fill="var(--cake-sponge,#c99a63)" opacity="0.55"/></svg>$svg$),

('decor-drip','Ganache drip','drip','drip',30,'Sits over the top edge of each tier.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 0 H100 V8 C94 8 94 20 88 20 C82 20 82 8 76 8 C70 8 70 26 63 26 C56 26 56 8 50 8 C44 8 44 22 37 22 C30 22 30 8 24 8 C18 8 18 24 12 24 C6 24 6 8 0 8 Z" fill="var(--cake-drip,#54332a)"/></svg>$svg$),

('decor-gold-leaf','Gold leaf','gold_leaf','scatter',60,'Scattered gold flecks.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="var(--cake-gold,#c9a227)"><polygon points="18,30 27,26 31,34 22,39 15,36"/><polygon points="62,52 71,47 76,56 66,61 59,58"/><polygon points="38,72 45,69 48,75 41,79 35,77"/><polygon points="78,22 85,19 88,25 81,28"/></g></svg>$svg$),

('decor-fresh-flowers','Fresh flowers','flower','cluster',70,'Cluster of open blooms.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="var(--cake-leaf,#5f7a52)"><path d="M14 62 C30 56 44 58 56 66 C40 70 24 70 14 62 Z"/><path d="M62 70 C74 60 86 58 96 62 C88 72 74 76 62 70 Z"/></g><g><circle cx="34" cy="44" r="15" fill="var(--cake-flower,#e8d5cf)"/><circle cx="34" cy="44" r="6" fill="var(--cake-gold,#c9a227)"/><circle cx="62" cy="34" r="11" fill="var(--cake-flower-alt,#f2e2dd)"/><circle cx="62" cy="34" r="4.5" fill="var(--cake-gold,#c9a227)"/><circle cx="56" cy="58" r="9" fill="var(--cake-flower,#e8d5cf)"/><circle cx="56" cy="58" r="3.5" fill="var(--cake-gold,#c9a227)"/></g></svg>$svg$),

('decor-sugar-flowers','Sugar flowers','flower','cluster',70,'Piped sugar roses.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="var(--cake-flower,#e8d5cf)" stroke="var(--cake-shade,#2a2320)" stroke-opacity="0.10"><circle cx="36" cy="46" r="16"/><circle cx="66" cy="38" r="12"/><circle cx="58" cy="64" r="10"/></g><g fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.6"><circle cx="36" cy="46" r="10"/><circle cx="36" cy="46" r="5"/><circle cx="66" cy="38" r="7"/><circle cx="58" cy="64" r="5.5"/></g></svg>$svg$),

('decor-leaves','Foliage','leaf','cluster',68,'Eucalyptus-style leaf sprigs.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="var(--cake-leaf,#5f7a52)"><path d="M10 58 C26 44 46 42 62 50 C46 62 24 66 10 58 Z"/><path d="M50 76 C60 60 76 50 92 50 C86 68 68 80 50 76 Z"/><path d="M42 34 C52 22 68 18 82 22 C74 38 56 42 42 34 Z"/></g><g stroke="#ffffff" stroke-opacity="0.35" fill="none" stroke-width="1.4"><path d="M12 57 C30 52 48 51 60 50"/><path d="M52 74 C64 66 78 56 90 51"/></g></svg>$svg$),

('decor-macarons','Macarons','decoration','cluster',72,'Stacked macaron shells.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g><g transform="translate(22 54)"><path d="M-16 -2 A16 12 0 0 1 16 -2 Z" fill="var(--cake-flower,#e8d5cf)"/><rect x="-16" y="-2" width="32" height="5" fill="var(--cake-filling,#f6e7d2)"/><path d="M-16 3 A16 12 0 0 0 16 3 Z" fill="var(--cake-flower,#e8d5cf)"/></g><g transform="translate(56 44)"><path d="M-14 -2 A14 11 0 0 1 14 -2 Z" fill="var(--cake-gold,#c9a227)" opacity="0.75"/><rect x="-14" y="-2" width="28" height="4.5" fill="var(--cake-filling,#f6e7d2)"/><path d="M-14 2.5 A14 11 0 0 0 14 2.5 Z" fill="var(--cake-gold,#c9a227)" opacity="0.75"/></g><g transform="translate(72 68)"><path d="M-12 -2 A12 9 0 0 1 12 -2 Z" fill="var(--cake-flower-alt,#f2e2dd)"/><rect x="-12" y="-2" width="24" height="4" fill="var(--cake-filling,#f6e7d2)"/><path d="M-12 2 A12 9 0 0 0 12 2 Z" fill="var(--cake-flower-alt,#f2e2dd)"/></g></g></svg>$svg$),

('decor-berries','Fresh berries','decoration','cluster',72,'Berry cluster.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="var(--cake-berry,#7a2233)"><circle cx="34" cy="52" r="13"/><circle cx="58" cy="44" r="10"/><circle cx="54" cy="66" r="8"/></g><g fill="#ffffff" opacity="0.25"><circle cx="30" cy="47" r="4"/><circle cx="55" cy="40" r="3"/></g><path d="M20 68 C34 62 48 62 62 68 C48 74 32 74 20 68 Z" fill="var(--cake-leaf,#5f7a52)"/></svg>$svg$),

('decor-sprinkles','Sprinkles','sprinkle','scatter',62,'Fine scattered sprinkles.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="var(--cake-gold,#c9a227)" opacity="0.85"><rect x="14" y="24" width="8" height="2.6" rx="1.3" transform="rotate(24 18 25)"/><rect x="44" y="18" width="8" height="2.6" rx="1.3" transform="rotate(-32 48 19)"/><rect x="72" y="30" width="8" height="2.6" rx="1.3" transform="rotate(12 76 31)"/><rect x="24" y="52" width="8" height="2.6" rx="1.3" transform="rotate(-18 28 53)"/><rect x="56" y="60" width="8" height="2.6" rx="1.3" transform="rotate(40 60 61)"/><rect x="82" y="66" width="8" height="2.6" rx="1.3" transform="rotate(-8 86 67)"/><rect x="38" y="80" width="8" height="2.6" rx="1.3" transform="rotate(28 42 81)"/></g></svg>$svg$),

('decor-pearls','Pearl border','pearl','border',40,'Pearls piped along the base of a tier.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 12" preserveAspectRatio="none"><g fill="var(--cake-pearl,#efe6da)"><circle cx="6" cy="6" r="5"/><circle cx="18" cy="6" r="5"/><circle cx="30" cy="6" r="5"/><circle cx="42" cy="6" r="5"/><circle cx="54" cy="6" r="5"/><circle cx="66" cy="6" r="5"/><circle cx="78" cy="6" r="5"/><circle cx="90" cy="6" r="5"/></g></svg>$svg$),

('border-scallop','Scalloped border','border','border',40,'Soft piped scallops along the base.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M0 12 Q6 0 12 12 Q18 0 24 12 Q30 0 36 12 Q42 0 48 12 Q54 0 60 12 Q66 0 72 12 Q78 0 84 12 Q90 0 96 12 L100 12 Z" fill="var(--cake-icing,#f3e9dc)" stroke="var(--cake-shade,#2a2320)" stroke-opacity="0.08"/></svg>$svg$),

('pattern-dots','Dotted pattern','pattern','tier-finish',22,'Swiss-dot pattern across a tier.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#ffffff" opacity="0.5"><circle cx="16" cy="26" r="2.6"/><circle cx="42" cy="20" r="2.6"/><circle cx="68" cy="28" r="2.6"/><circle cx="88" cy="44" r="2.6"/><circle cx="28" cy="50" r="2.6"/><circle cx="54" cy="46" r="2.6"/><circle cx="18" cy="74" r="2.6"/><circle cx="46" cy="76" r="2.6"/><circle cx="74" cy="66" r="2.6"/></g></svg>$svg$),

('decor-bow','Ribbon bow','decoration','cluster',74,'Silk ribbon bow.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="var(--cake-accent,#b8895f)"><path d="M50 50 C34 30 10 32 12 50 C10 68 34 70 50 50 Z"/><path d="M50 50 C66 30 90 32 88 50 C90 68 66 70 50 50 Z"/><path d="M46 52 L30 88 L44 84 Z"/><path d="M54 52 L70 88 L56 84 Z"/><circle cx="50" cy="50" r="8"/></g><g fill="#ffffff" opacity="0.22"><path d="M50 50 C36 36 18 38 18 48 C26 42 38 44 50 50 Z"/></g></svg>$svg$),

('decor-candles','Candles','topper','topper',80,'Slim celebration candles.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g><rect x="24" y="40" width="7" height="56" rx="3" fill="var(--cake-pearl,#efe6da)"/><rect x="46" y="30" width="7" height="66" rx="3" fill="var(--cake-accent,#b8895f)"/><rect x="68" y="44" width="7" height="52" rx="3" fill="var(--cake-pearl,#efe6da)"/><g fill="var(--cake-gold,#c9a227)"><path d="M27.5 40 C22 32 27.5 26 27.5 22 C27.5 26 33 32 27.5 40 Z"/><path d="M49.5 30 C44 22 49.5 16 49.5 12 C49.5 16 55 22 49.5 30 Z"/><path d="M71.5 44 C66 36 71.5 30 71.5 26 C71.5 30 77 36 71.5 44 Z"/></g></g></svg>$svg$),

('decor-topper','Cake topper','topper','topper',82,'Gold arch topper with a script line.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="var(--cake-gold,#c9a227)" fill="none" stroke-width="3"><path d="M18 92 L18 52 A32 32 0 0 1 82 52 L82 92"/><path d="M30 92 L30 56 A20 20 0 0 1 70 56 L70 92"/></g><circle cx="50" cy="30" r="5" fill="var(--cake-gold,#c9a227)"/></svg>$svg$),

('text-plaque','Text plaque','text_plaque','text',84,'Plaque the personalised message is written on.',
$svg$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" preserveAspectRatio="none"><rect x="2" y="2" width="116" height="36" rx="18" fill="var(--cake-pearl,#efe6da)" opacity="0.92"/><rect x="6" y="6" width="108" height="28" rx="14" fill="none" stroke="var(--cake-gold,#c9a227)" stroke-width="1.4" opacity="0.8"/></svg>$svg$);
