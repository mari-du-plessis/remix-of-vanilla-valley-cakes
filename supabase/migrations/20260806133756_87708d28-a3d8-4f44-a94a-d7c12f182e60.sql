GRANT EXECUTE ON FUNCTION public.next_quote_number() TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.quote_number_seq TO authenticated, service_role;