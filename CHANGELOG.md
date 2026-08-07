# Changelog

All notable changes to the Vanilla Valley platform.

## Cake Builder refinements

### Added

- **AI Inspiration Preview** — an artistic, AI-generated PNG shown beside the
  SVG preview. Generated only on request (`Generate inspiration preview`), it is
  stored in the `inspiration-photos` bucket and saved against the order
  (`orders.ai_preview_url`). A "the design has changed since this preview was
  generated" notice plus a Regenerate action keeps the customer in control of
  AI spend.
  Files: `features/cake-builder/lib/inspiration.ts`,
  `api/inspiration.server.ts`, `api/inspiration.functions.ts`,
  `hooks/useInspirationPreview.ts`, `components/InspirationPreview.tsx`.
  The prompt contract accepts cake information only — no customer, contact,
  delivery, pricing, quote, calendar or internal data can reach the model.
- **Platform-aware WhatsApp hand-off** (`features/order/lib/whatsapp.ts`):
  mobile opens the installed app via `wa.me`, desktop opens WhatsApp Web in a
  new tab (handing over to WhatsApp Desktop when installed). No iframes, no
  dialogs, no embedded browsers.
- **Shared preview disclaimer** under both previews explaining what each shows.

### Changed

- **Renderer enforces painting order** rather than trusting per-asset z-index:
  board → base → tiers 1–6 → icing → decorations → accessories → topper.
  Decorations are clamped so nothing intersects or sits under the cake board.
- **Six tiers supported** end to end — geometry (`lib/geometry.ts`, `MAX_TIERS`),
  guided builder choices and the admin preview lab. Tall stacks scale to fit
  the canvas instead of clipping.
- **Heart and Number artwork** redrawn as realistic side elevations
  (height, tier proportions and decoration placement) instead of top-down
  silhouettes.
- **Animations**: layer groups now ease opacity and transform changes as well
  as animating in, and reduced-motion users get neither.
- WhatsApp summary includes tier count and the inspiration preview link.
- Admin order detail shows the AI inspiration preview and the uploaded
  inspiration photo side by side.

### Future extension points

- `CakeDesign.view` still drives a single side renderer; top and isometric
  viewpoints plug in as additional renderers with no data-model change.
- The stored inspiration preview URL is ready for reuse in quote PDFs.

## Theming — Luxury identity

### Added

- **Theme system**: design tokens are now scoped per theme via
  `[data-theme="…"]` blocks in `src/styles.css`, a registry in
  `src/config/themes.ts` and `ThemeProvider` (`src/features/theme/`).
  Two themes ship: **Classic** (the original warm/light identity, preserved
  verbatim and still used by the admin panel) and **Luxury** (the new default
  for the customer-facing website).
- **Luxury theme**: matte black canvas, rich wood browns, fresh natural greens
  and warm metallic gold, with deeper elevation shadows and gold hairlines.
- **`SiteShell`** (`src/features/site/components/SiteShell.tsx`): shared public
  chrome — theme scope, sticky navigation, wordmark and footer.
- **Presentation utilities**: `surface-card`, `surface-veil`, `gold-text`,
  `gold-rule`, `hero-veil`, `lift-on-hover` and the `rise-in` animation.

### Changed

- Home, Gallery and Order pages restyled on the Luxury theme (hero, nav,
  buttons, cards, forms, gallery grid, CTA, footer). No workflow, data or
  business-logic changes.
- `SelectableCard`, `OptionPill`, `CategoryTabs` and `GalleryGrid` now derive
  every colour from theme tokens instead of fixed palette classes.

## Phase 1 refinements

### Added

- **Shared date-range helpers** (`src/lib/date-range.ts`): `rangeEndMin`,
  `clampRangeEnd`, `isPastDate` and `todayIso`. Every "from → to" picker now
  disables and clamps end dates that fall before the start date — blocked
  dates, price list validity, pricing rule validity and quote validity.
- **Quote expiry warning**: accepting a quote past its `Valid until` date opens
  a confirmation dialog explaining the quoted prices may no longer be valid.
  It is a warning only — acceptance always remains possible.

### Changed

- **Accepting a quote confirms its order**: `updateQuoteSettings` moves the
  linked order from `enquiry`/`quoted` to `confirmed` automatically; orders
  further along the lifecycle are left untouched. `useSaveQuoteSettings`
  invalidates order queries and reports the change.
- `TextField` accepts `min`/`max` so date and numeric fields can be bounded.

## Quote management module

### Added

- **Quotes schema**: `quotes` (numbered `VVQ-YYYY-####`, revisioned per order,
  status, validity, deposit, totals, printed notes and terms),
  `quote_line_items`, `quote_notes` and an automatic `quote_status_history`.
  Admin-only RLS throughout; totals are always recalculated server-side.
- **Automatic generation**: `Generate quote` on an order runs
  `calculateQuote()` from the pricing engine against the active price list and
  stores the result as an editable draft, moving the order to `quoted`. Running
  it again creates the next revision.
- **Quote editor** (`/admin/quotes/$quoteId`): rename, re-price, re-quantify,
  retype, remove or add lines (including discounts and extra charges), edit
  deposit %, validity dates, printed notes/terms, internal notes and a dated
  note thread, plus status flow and history.
- **Quotes hub** (`/admin/quotes`): status filters, search and outstanding value.
- **Branded PDF**: `features/quotes/lib/quote-pdf.ts` renders preview and
  download, filed as `Vanilla-Valley-Quote-<number>-<customer>.pdf`.
- **Reusable components**: `QuoteStatusBadge`, `QuoteList`, `QuoteLineEditor`
  and `OrderQuotesPanel`.

## Phase 1 usability improvements

### Added

- **Manual order creation**: `New order` in the admin Orders header opens
  `ManualOrderDialog` — search an existing customer or capture a new one, pick
  the channel and opening status, add items with size, flavour, filling and
  quantity, plus customer and internal notes. Persisted through the new
  admin-only `createAdminOrder` server function which shares
  `createOrderRecord` with the public wizard.
- **`CustomerPickerField`**: reusable customer search/select control for any
  future intake surface.
- **Automatic slugs**: categories, products, options and price lists derive
  their slug from the name via `uniqueSlug`; the manual slug fields are gone.
- **Cake builder appearance mapping**: guided `AppearanceField` selector backed
  by `src/config/cake-builder.ts` tokens instead of free-text SVG tokens.
- **Pricing usability**: guided rule conditions (rush lead time, delivery zone)
  instead of raw JSON, catalog-driven size dropdowns on price items, and an
  "editing price list" switcher at the top of the Pricing screen.

### Security

- The public order intake schema cannot set `status`, `customerId` or
  `internalNotes`; those live only on the authenticated admin schema.

## Customer management module

### Added

- **Database**: extended `customers` with `status` (`customer_status` enum:
  lead / active / vip / inactive / blocked), `tags text[]`, `whatsapp_phone`,
  `preferred_channel` (`contact_channel` enum) and `marketing_opt_in`. New
  tables `customer_addresses` (delivery addresses, default flag, delivery
  notes) and `customer_notes` (internal note timeline), both admin-only RLS
  with GRANTs and `updated_at` triggers. Added the admin-guarded
  `customer_summary()` helper.
- **Feature layer** `src/features/customers/`: domain types, Zod contracts,
  `customers.server.ts` data access (order aggregates are always derived, never
  stored) and `customers.functions.ts` admin server functions.
- **Hooks** `useCustomers`, `useCustomer`, `useCustomerTags` plus create /
  update / delete mutations for customers, addresses and notes.
- **Components**: `CustomerStatusBadge`, `CustomerTagList`, `CustomerCard`,
  `CustomerList`, `CustomerFiltersBar`, `CustomerForm`,
  `CustomerAddressPanel`, `CustomerNotesPanel`, plus
  `lib/customer-meta.ts` as the single source of status/channel presentation.
- **Admin** `/admin/customers` (search, status/tag filters, four sort orders,
  add customer) and `/admin/customers/$customerId` — the customer hub with
  contact details, order history, upcoming bookings, delivery addresses,
  internal notes and a placeholder for the future customer account link.

### Changed

- `ADMIN_NAV` gained a Customers entry. The public order wizard, order
  persistence and WhatsApp flow are untouched.

## Pricing module & typography system

### Added

- **Database**: `price_lists`, `price_list_items`, `pricing_rules` with enums
  `price_target_type`, `price_unit`, `pricing_rule_type`,
  `pricing_adjustment_type`. Admin-only RLS — pricing is never exposed publicly.
  Seeded a default "Standard Price List".
- **Feature layer** `src/features/pricing/`: domain types, Zod contracts,
  `pricing.server.ts` data access, `pricing.functions.ts` admin server
  functions (including `getPricingSnapshot`), `lib/money.ts` and a pure
  `lib/pricing-engine.ts` (`calculateQuote`) that future quotations, PDFs,
  invoices and payments reuse without duplicating logic.
- **Hooks** `src/features/pricing/hooks/usePricing.ts`: `usePriceLists`,
  `usePricingSnapshot` and create/update/delete mutations for lists, items
  and rules.
- **Admin** `/admin/pricing`: tabs for product/option/tier prices, delivery &
  rush fees, pricing rules and price lists (`PricingManager`,
  `PriceListsPanel`, `PriceItemsPanel`, `PricingRulesPanel`).
- **Typography**: `src/components/common/Typography.tsx` (`PageTitle`,
  `SectionTitle`, `SubTitle`, `Eyebrow`, `Lead`, `Body`, `Muted`) plus
  `display-heading` and `eyebrow` utilities.

### Changed

- One heading font (`--font-heading`, the branding sans) now drives H1–H6 on
  both the public site and admin; H1/H2 use the uppercase wide-tracked
  treatment, H3–H6 continue with tighter tracking. Body copy, forms, nav,
  buttons and labels stay in the readable sans.
- Removed the decorative Cormorant Garamond display font (and its font
  request); the script logo asset is unchanged. `admin-heading` is kept as an
  alias of the shared treatment.

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
