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

## Roadmap (each plugs in without rewrites)

1. **Orders module** — `orders` table + `features/orders` api/hooks; admin list at `/admin/orders`. `useSubmitOrder` is the single write point.
2. **SVG cake builder** — `features/cake-builder`, driven by `config/catalog` ids; renders into the order wizard's Cake step.
3. **Products & pricing** — move `config/catalog` into DB tables; consumers keep the same shape via the same getters.
4. **Calendar / availability** — `/admin/calendar`, blocks dates in the order wizard's Details step.
5. **PDF quotations** — reuse `buildOrderMessage` structure as a shared quote model.
6. **Customer accounts** — new routes under `_authenticated/account`, gate already in place.
7. **Analytics & AI inspiration** — new `ADMIN_NAV` entries; shell renders them automatically.
