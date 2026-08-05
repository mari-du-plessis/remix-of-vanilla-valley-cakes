-- Enums
CREATE TYPE public.calendar_event_type AS ENUM ('production','collection','delivery','consultation','other');
CREATE TYPE public.availability_block_type AS ENUM ('closure','holiday','fully_booked','custom');

-- Calendar events
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type public.calendar_event_type NOT NULL DEFAULT 'other',
  title text NOT NULL,
  notes text,
  location text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  all_day boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage calendar events" ON public.calendar_events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE INDEX calendar_events_start_at_idx ON public.calendar_events (start_at);
CREATE INDEX calendar_events_order_id_idx ON public.calendar_events (order_id);
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Availability blocks
CREATE TABLE public.availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  block_type public.availability_block_type NOT NULL DEFAULT 'closure',
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_blocks_range_check CHECK (end_date >= start_date)
);
GRANT SELECT ON public.availability_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_blocks TO authenticated;
GRANT ALL ON public.availability_blocks TO service_role;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view availability blocks" ON public.availability_blocks
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage availability blocks" ON public.availability_blocks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE INDEX availability_blocks_dates_idx ON public.availability_blocks (start_date, end_date);
CREATE TRIGGER availability_blocks_updated_at BEFORE UPDATE ON public.availability_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Capacity settings (weekday NULL = default rule)
CREATE TABLE public.capacity_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint,
  max_orders_per_day integer NOT NULL DEFAULT 5,
  max_servings_per_day integer,
  lead_time_days integer NOT NULL DEFAULT 3,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT capacity_settings_weekday_check CHECK (weekday IS NULL OR (weekday BETWEEN 0 AND 6)),
  CONSTRAINT capacity_settings_max_orders_check CHECK (max_orders_per_day >= 0),
  CONSTRAINT capacity_settings_lead_time_check CHECK (lead_time_days >= 0)
);
CREATE UNIQUE INDEX capacity_settings_weekday_key ON public.capacity_settings (COALESCE(weekday, -1));
GRANT SELECT ON public.capacity_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capacity_settings TO authenticated;
GRANT ALL ON public.capacity_settings TO service_role;
ALTER TABLE public.capacity_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view capacity settings" ON public.capacity_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage capacity settings" ON public.capacity_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER capacity_settings_updated_at BEFORE UPDATE ON public.capacity_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.capacity_settings (weekday, max_orders_per_day, lead_time_days, notes)
VALUES (NULL, 5, 3, 'Default daily capacity and minimum notice');

-- Public, privacy-safe availability lookup
CREATE OR REPLACE FUNCTION public.day_availability(_from date, _to date)
RETURNS TABLE (
  day date,
  order_count integer,
  max_orders integer,
  lead_time_days integer,
  is_blocked boolean,
  block_reason text,
  is_available boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH days AS (
    SELECT generate_series(_from, LEAST(_to, _from + INTERVAL '366 days')::date, INTERVAL '1 day')::date AS day
  ),
  defaults AS (
    SELECT max_orders_per_day, lead_time_days
    FROM public.capacity_settings WHERE weekday IS NULL AND is_active LIMIT 1
  )
  SELECT
    d.day,
    COALESCE(o.cnt, 0)::integer AS order_count,
    COALESCE(cw.max_orders_per_day, def.max_orders_per_day, 5)::integer AS max_orders,
    COALESCE(def.lead_time_days, 0)::integer AS lead_time_days,
    (b.id IS NOT NULL) AS is_blocked,
    b.reason AS block_reason,
    (
      b.id IS NULL
      AND COALESCE(o.cnt, 0) < COALESCE(cw.max_orders_per_day, def.max_orders_per_day, 5)
      AND d.day >= (CURRENT_DATE + COALESCE(def.lead_time_days, 0))
    ) AS is_available
  FROM days d
  LEFT JOIN defaults def ON true
  LEFT JOIN LATERAL (
    SELECT cs.max_orders_per_day FROM public.capacity_settings cs
    WHERE cs.is_active AND cs.weekday = EXTRACT(DOW FROM d.day)::smallint LIMIT 1
  ) cw ON true
  LEFT JOIN LATERAL (
    SELECT ab.id, ab.reason FROM public.availability_blocks ab
    WHERE d.day BETWEEN ab.start_date AND ab.end_date LIMIT 1
  ) b ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt FROM public.orders ord
    WHERE ord.event_date = d.day AND ord.status NOT IN ('cancelled','completed')
  ) o ON true
$$;
GRANT EXECUTE ON FUNCTION public.day_availability(date, date) TO anon, authenticated, service_role;