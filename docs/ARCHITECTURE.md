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
- Data: `gallery_photos` table, `gallery-photos` + `inspiration-photos` buckets.

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
- Orders are not persisted — WhatsApp only.
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
2. **SVG cake builder** — `features/cake-builder`, driven by catalog ids; renders into the order wizard's Cake step.
3. **Products & pricing** — move `config/catalog` into `products` / `option_groups` / `options` / `price_lists`; consumers keep the same getters. Products cover cakes, baked goods, gift cards, delivery and services.
4. **Cake templates** — `cake_templates` (same JSONB shape as `cake_designs`): save, duplicate, categorise, start-from-template in the builder. Admin at `/admin/templates`.
5. **Calendar / availability** — `/admin/calendar`, blocks dates in the order wizard's Details step.
6. **PDF quotations** — quotes are orders in `quoted` status; `quotes` stores versioned documents only. Reuses `buildOrderMessage` as the shared quote model.
7. **Staff** — `staff_members` on top of `profiles` + `user_roles`; `/admin/staff`.
8. **Production workflows** — configurable `workflow_templates` per product; `order_tasks` + assignments hang off orders without changing them. `/admin/workflows`, `/admin/production`.
9. **Recipes** — ingredients, quantities, units, instructions, yield, prep/bake time, notes, linked products and flavour options. `/admin/recipes`.
10. **Ingredients & inventory** — suppliers, stock levels, movements, waste, shopping lists; costing and profit derived from recipes. `/admin/ingredients`, `/admin/inventory`.
11. **Customer accounts** — routes under `_authenticated/account`, gate already in place.
12. **Reviews, gift cards, payments** — gift cards are products; payments provider-agnostic.
13. **Analytics & AI inspiration** — new `ADMIN_NAV` entries; shell renders them automatically.

