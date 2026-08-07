REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

DROP POLICY IF EXISTS "Active cake assets are viewable by everyone" ON public.cake_builder_assets;

CREATE POLICY "Anyone can view active cake assets"
ON public.cake_builder_assets FOR SELECT TO anon
USING (is_active);

CREATE POLICY "Signed-in users view active cake assets"
ON public.cake_builder_assets FOR SELECT TO authenticated
USING (is_active OR public.has_role(auth.uid(), 'admin'::app_role));