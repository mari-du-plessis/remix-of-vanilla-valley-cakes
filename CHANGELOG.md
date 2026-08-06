# Changelog

All notable changes to the Vanilla Valley platform.

## Week View production schedule

### Changed
- Week view is now a Sunday → Saturday list of full-width collapsible day rows
  (`WeekSchedule`) instead of narrow columns. Each row header shows the weekday,
  date, capacity meter and availability signal; expanding reveals horizontal
  `ProductionCard` entries for orders and manual events with quick actions.
- Calendar toolbar gained global "Expand all" / "Collapse all" controls (week
  view only) and uses the admin heading style for the range title.
- Admin shell content width widened to `max-w-6xl` so the schedule stays legible.
- Calendar weeks now start on Sunday; admin typography unified via the
  `admin-heading` utility, customer headings use Cormorant Garamond.

### Added
- `src/features/calendar/lib/workload.ts` — availability signal mapping
  (Available, Busy, Nearly full, Fully booked, Closed).
- `src/features/calendar/components/CapacityMeter.tsx`,
  `ProductionCard.tsx`, `WeekSchedule.tsx`.



## Calendar & Availability module

### Added
- **Database**: `calendar_events`, `availability_blocks`, `capacity_settings`,
  enums `calendar_event_type` / `availability_block_type`, and the privacy-safe
  `day_availability(from, to)` lookup.
- **Feature**: `src/features/calendar/` — types, Zod schemas, server data layer,
  server functions, range/day-index helpers, hooks and view components.
- **Admin**: `/admin/calendar` with Month / Week / Day views, order-derived
  events, manual events, blocked dates, capacity and lead-time editing, and a
  per-day workload meter. Added to `ADMIN_NAV`.
- **Availability integration**: public `getDayAvailability` server function and
  `useAvailabilityWindow` hook, consumed by `useOrderForm` behind
  `FEATURE_FLAGS.enforceOrderAvailability` (off — customer UI unchanged).
- `src/config/features.ts` for build-but-not-enabled behaviour.

## Products module
- `product_categories`, `products`, `option_groups`, `options`,
  `product_option_groups`, `option_rules`; catalog moved from config to the
  database; `/admin/products`.

## Orders module
- `customers`, `orders`, `order_items`, `order_item_options`,
  `order_status_history`; order persistence on the public wizard;
  `/admin/orders` list and detail.

## Architecture refactor
- Feature-based structure (`src/features/*`), `src/config/*`, shared primitives
  in `src/components/common`, thin routes, admin shell.
