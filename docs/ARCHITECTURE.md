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

- Public: `/` landing (gallery ribbon reads `gallery_photos`), `/gallery`
  (category filtered, masonry, lightbox, "use as inspiration"), `/order`
  (4-step wizard → WhatsApp).
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

- Gallery images are served at their stored resolution (compressed to 1600px on
  upload). No per-breakpoint derivatives / `srcset` yet — storage image
  transformations would remove that gap without touching the feature code.
- The gallery lightbox does not preload the neighbouring image, so the first
  arrow press on a slow connection shows a brief blank.

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


## Product builders & cake rendering

Ordering is **product-family aware**. `src/config/product-builders.ts` is the
single registry mapping a catalog product slug to its builder experience, its
WhatsApp emoji and its noun.

```
custom-cake  → cake-svg   🎂   live SVG builder + AI concept
cupcakes     → cupcake    🧁   plain wizard (builder pending)
cheesecake   → cheesecake 🍰   plain wizard
biscuits     → cookie     🍪   plain wizard
tarts / cake cups / rusks   →   plain wizard
```

Only builders listed in `IMPLEMENTED_BUILDERS` mount a dedicated experience, so
a new family ships by adding its entry and its component — no order, message or
renderer code changes.

### Ordering workflows (generic vs Custom Cake)

The wizard frame is generic; the *workflow* is chosen per product family.

```
product slug → product-builders.ts (builder id) → flows/registry.ts (OrderFlow)
                                                        ↓
                                        wizard stages + optional design stage
```

- `features/order/flows/product-requirements.ts` — per family: which catalog
  option groups it asks for, its quantity rule, its heading and whether an
  inspiration photo is offered. Answers always come from the catalog.
- `features/order/lib/orderSummary.ts` — the one product-aware summary used by
  the customer review panel and the WhatsApp message.
- `features/order/flows/types.ts` — `OrderStepKey`, `OrderFlow`.
- `features/order/flows/registry.ts` — the only product-family → workflow map,
  plus stage labels.
- `features/order/flows/useOrderFlow.ts` — resolves flow, orderable products
  and the stage list (the Product stage is hidden when only one product is
  orderable).
- `features/order/flows/OrderDesignStep.tsx` — the single extension point for
  product-specific design stages.

Two workflows exist today:

| Workflow | Stages | Notes |
| --- | --- | --- |
| `custom-cake` | Occasion · Product · Cake · Details · Contact | Full SVG cake builder, per-tier design, appearance, AI concept, Saved Designs, Templates |
| `generic-enquiry` | Occasion · Product · Details · Contact | Cupcakes, cheesecakes, biscuits/cookies, rusks, cake cups, tarts. **Deliberately asks nothing product-specific** — their ordering requirements are still to be confirmed with the bakery |

Everything cake-specific (SVG renderer, tiers, per-tier appearance, appearance
controls, cake assets, AI concept, Saved Designs) is reachable only through the
`custom-cake` workflow. `buildOrderMessage` and `buildOrderPayload` both gate
those fields on `usesCakeRenderer(form.product)`, so a non-cake enquiry saves
and sends only the generic details. Shared pieces — occasion, product choice,
event date, inspiration upload, contact, validation, step navigation, order
persistence and the WhatsApp hand-off — stay in `features/order` and are reused
by every workflow. No database change was needed: enquiries keep using the
existing `orders` / `order_items` / `order_item_options` structure.

A future CupcakeOrderFlow is: add the flow to the registry, point the builder
id at it, and add one branch in `OrderDesignStep`. The Custom Cake workflow is
untouched.

### View-agnostic rendering

The cake data model (`CakeDesign`) never encodes *how* a cake is drawn.

```
lib/renderers.ts                  registry: view id → renderer component
components/CakePreview.tsx        thin dispatcher every screen uses
components/renderers/SideElevationRenderer.tsx   the current side view
```

A future top-down or isometric view registers beside the side elevation without
touching the builder, the admin preview lab or the order pipeline.

Painting order is enforced by the renderer, not by stored `z_index`:
**board → base → tiers 1-5 → icing → decorations → accessories → topper.** The
board is always the foundation and decorations are clamped above it. Sculpted
shapes (heart, number, sheet) are drawn as side elevations with visible height
and layers. `MAX_TIERS` (5) in `lib/geometry.ts` is the single source of truth,
shared by the step model, the order form, validation and the AI prompt.

### Submission pipeline

The AI concept is generated **ahead of** submission: `useInspirationConcept`
starts as soon as the customer reaches "Your details" (cake family only),
uploading the reference photo and calling the inspiration server function in
the background. The step shows a quiet loading line, then the artwork with an
"include in my WhatsApp enquiry" checkbox (ticked by default) — unticking it
only affects the message, never what is saved.

`useSubmitOrder` then runs one uninterrupted flow: validate → finish uploads →
save the order → build the message → open WhatsApp. It never waits for the
model: a concept still rendering is omitted from that message and attached to
the saved order afterwards through the public one-shot
`attachOrderAiPreview` server function (it only fills an empty
`ai_preview_url`). A manual WhatsApp link appears only if the browser genuinely
refuses to open it.

### Custom cake appearance model

Appearance is first-class data, not free text buried in notes:
`features/cake-builder/lib/appearance.ts` owns `CakeAppearance` —
colour treatment (solid / ombre / fault line), a colour per tier, colours for
each decoration that does not inherit the cake colour (drip, macarons, flowers,
sprinkles, metallic leaf, topper), and topper style plus wording.

There is **no fixed bakery palette**. Colours are captured in the customer's
own words and kept verbatim for the bakery, the WhatsApp enquiry and the AI
brief; a separate lookup maps common names to an illustrative hex only so the
SVG can approximate them. The inspiration photo stays the primary reference and
is presented as *recommended*, never required.

Priority when resolving a colour: stated per-tier colour → stated decoration
colour → inspiration photo → appearance notes. The AI prompt states this order
explicitly so a concept can never invent a scheme.

Storage adds no tables: `buildOrderPayload` writes appearance as
`order_item_options` rows under the `appearance` group key, so admin, quotes and
any future template read it back through the existing order structure. The
model applies to custom cakes only — other products have no builder and are
untouched.

