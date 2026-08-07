# Vanilla Valley — Architecture & Roadmap

## Structure

```
src/
  config/          Business configuration (brand, catalog, occasions, navigation)
  components/
    common/        Design-system primitives (SelectableCard, OptionPill, StepProgress,
                   FileDropField, SelectField, LoadingState, EmptyState)
    ui/            shadcn primitives
  features/
    order/         Customer order wizard (types, lib, hooks, components)
    gallery/       Gallery domain (types, api, hooks, components) — shared by public + admin
    calendar/      Calendar & availability (types, api, lib, hooks, views)
    pricing/       Internal pricing (types, api, hooks, money + pricing engine)
    auth/          useAuth, useIsAdmin, useSignOut
    admin/         Admin shell, page header, per-module managers
  lib/
    supabase/      storage helpers (buckets, upload, public URL, remove)
    media/         image compression
  routes/          Thin route files only — SEO head + composition
```

Rule: routes compose, features own logic, config owns data, `components/common` owns visuals.

## What exists

- Public: `/` landing, `/gallery` (category filtered, DB-backed), `/order` (4-step wizard → WhatsApp).
- Auth: `/login` (email/password), `_authenticated` gate, admin role check via `user_roles`.
- Admin: `/admin` overview, `/admin/gallery` (upload, caption, category, reorder, delete).
- Admin: `/admin/orders`, `/admin/products`, `/admin/calendar` (month/week/day,
  availability blocks, capacity & lead time).
- Data: `gallery_photos`, orders tables, catalog tables, `calendar_events`,
  `availability_blocks`, `capacity_settings`, `day_availability()` lookup, plus
  `gallery-photos` + `inspiration-photos` buckets.

## What was refactored

| Before | After |
| --- | --- |
| 464-line `order.tsx` | `useOrderForm` + 4 step components + pure `buildOrderMessage` |
| Duplicated storage/compression in admin & gallery | `lib/supabase/storage.ts`, `lib/media/compress-image.ts` |
| Raw Supabase calls in components | `features/*/api.ts` + TanStack Query hooks |
| Hardcoded constants in one flat file | Typed `config/` modules with stable ids |
| Single `/admin` page | `AdminShell` + nav-driven module routes |
| Ad-hoc button/pill markup | `components/common` primitives |

## Remaining technical debt

- Homepage gallery strip uses bundled static images instead of `gallery_photos`.
- Calendar availability/capacity tabs reuse the range query with a wide window;
  a dedicated list endpoint would be leaner once blocks grow.
- `day_availability()` is a public SECURITY DEFINER function by design — it
  returns counts and flags only, never customer or order data.
- `GALLERY_CATEGORIES` duplicates order occasions; will diverge, so it stays a separate export.
- Login has no Google sign-in and no password reset.
- No PDF/quotation layer yet (message builder is already pure, ready to reuse).

## Guiding principle

Every major database entity eventually gets an admin management screen. A new
entity ships with: `features/<module>/{types,api,hooks,components}`, a route
under `_authenticated/admin/`, and an `ADMIN_NAV` entry. Nothing else changes.

Full schema design: `docs/DATA-MODEL.md`.

## Roadmap (each plugs in without rewrites)

1. **Orders module** — `orders` + `order_items` + `order_status_history`; admin list at `/admin/orders`. `useSubmitOrder` is the single write point.
2. **SVG cake builder** — `features/cake-builder`, driven by catalog ids; renders into the order wizard's Cake step. The renderer enforces the painting order (board → tiers 1–6 → icing → decorations → accessories → topper) rather than trusting per-asset z-index, and `CakeDesign.view` leaves room for future top/isometric renderers. A second, on-request **AI Inspiration Preview** (`api/inspiration.*`) generates a PNG from cake-only data and stores it against the order.
3. **Products & pricing** — move `config/catalog` into `products` / `option_groups` / `options` / `price_lists`; consumers keep the same getters. Products cover cakes, baked goods, gift cards, delivery and services.
4. **Cake templates** — `cake_templates` (same JSONB shape as `cake_designs`): save, duplicate, categorise, start-from-template in the builder. Admin at `/admin/templates`.
6. ~~**Pricing**~~ — done. `/admin/pricing`; `features/pricing/lib/pricing-engine.ts`
   is the shared, side-effect-free quote calculator. Typography is centralised in
   `src/components/common/Typography.tsx` + the `display-heading` utility.

5b. ~~**Customers**~~ — done. `/admin/customers` + `/admin/customers/$customerId`;
   `customers` (status, tags, WhatsApp, preferred channel, marketing consent),
   `customer_addresses`, `customer_notes`. Order stats are derived from
   `orders`, never stored. Reviews, loyalty, gift cards, marketing and customer
   accounts all reference `customers.id` (and `profile_id`) rather than
   duplicating contact details.

5. ~~**Calendar / availability**~~ — done. `/admin/calendar`; the wizard's date
   gating is wired behind `FEATURE_FLAGS.enforceOrderAvailability`.
6. ~~**Quotes / PDF quotations**~~ — done. `/admin/quotes` + `/admin/quotes/$quoteId`;
   `quotes` (revisioned per order) + `quote_line_items` + `quote_notes` +
   `quote_status_history`. Drafts are generated by `calculateQuote()` from the
   pricing engine, then edited freely; totals are recalculated server-side.
   `features/quotes/lib/quote-pdf.ts` is the shared document renderer that
   invoices and order confirmations will reuse.
7. **Staff** — `staff_members` on top of `profiles` + `user_roles`; `/admin/staff`.
8. **Production workflows** — configurable `workflow_templates` per product; `order_tasks` + assignments hang off orders without changing them. `/admin/workflows`, `/admin/production`.
9. **Recipes** — ingredients, quantities, units, instructions, yield, prep/bake time, notes, linked products and flavour options. `/admin/recipes`.
10. **Ingredients & inventory** — suppliers, stock levels, movements, waste, shopping lists; costing and profit derived from recipes. `/admin/ingredients`, `/admin/inventory`.
11. **Customer accounts** — routes under `_authenticated/account`, gate already in place; link `customers.profile_id` to the signed-in profile (the admin hub already surfaces this link).
12. **Reviews, gift cards, payments** — gift cards are products; payments provider-agnostic.
13. **Analytics & AI inspiration** — new `ADMIN_NAV` entries; shell renders them automatically.


## Theming

Themes are **presentation only** — no business logic, data access or routing
depends on them.

```
src/config/themes.ts              theme registry (id, label, colour scheme, defaults)
src/styles.css                    [data-theme="classic"], [data-theme="luxury"] token blocks
src/features/theme/ThemeProvider  scopes tokens to a subtree + useTheme()
src/features/site/SiteShell       public chrome (theme + nav + footer)
```

- `:root` holds the Classic tokens, so any surface rendered outside a
  `ThemeProvider` (the admin panel) keeps its current look.
- The customer-facing site wraps its pages in `SiteShell`, which applies
  `DEFAULT_PUBLIC_THEME` (`luxury`).
- Components must only use semantic tokens (`bg-card`, `text-primary`,
  `border-border`) or the shared utilities (`surface-card`, `gold-rule`,
  `hero-veil`, `lift-on-hover`). Never hardcode colours.

**Adding a theme**: add a `[data-theme="<id>"]` block in `src/styles.css`, then
register it in `src/config/themes.ts`. Nothing else changes.

**Future extension points**: persist a theme choice per bakery tenant or per
admin user, expose a theme switcher in the admin panel, seasonal campaign
themes, and per-section theme nesting (`<ThemeProvider bare>`).
