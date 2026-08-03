REVOKE ALL ON FUNCTION public.log_order_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_admin_to_owner() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.next_order_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;