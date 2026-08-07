GRANT SELECT ON public.cake_builder_assets TO anon, authenticated;
GRANT SELECT ON public.cake_builder_asset_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cake_builder_assets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cake_builder_asset_options TO authenticated;
GRANT ALL ON public.cake_builder_assets TO service_role;
GRANT ALL ON public.cake_builder_asset_options TO service_role;