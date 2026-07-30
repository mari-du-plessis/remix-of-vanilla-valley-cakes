## Goal

Restructure the existing code into a feature-modular architecture. No UI redesign, no new features, no database changes, no behaviour changes. Every current screen must look and work exactly as it does today when this is finished.

## What exists today (audited)

- 5 routes: `index.tsx` (145 lines), `order.tsx` (464), `admin.tsx` (276), `gallery.tsx` (116), `login.tsx` (117).
- `src/lib/order-config.ts` — occasions, sizes, flavours, fillings, extras, WhatsApp number.
- Database: `gallery_photos`, `user_roles` + `has_role()`; storage buckets `gallery-photos`, `inspiration-photos`.
- shadcn UI kit in `src/components/ui` (fully present, unused by most pages).
- Auth attacher + Supabase clients wired; no server functions yet.

## Technical debt found

1. **`order.tsx` is a 464-line monolith** — form state, tier logic, storage upload, WhatsApp message building and all four step UIs in one file.
2. **Duplicated `publicUrl()`** in `gallery.tsx` and `admin.tsx`; duplicated `Photo` type in both; duplicated photo-fetch query in both.
3. **Duplicated upload/filename logic** — `order.tsx` and `admin.tsx` each hand-roll `${Date.now()}-${random}.${ext}`.
4. **Auth logic inline in components** — `admin.tsx` does session + role check in a `useEffect`; `login.tsx` does its own session redirect. No `useAuth` hook, no `_authenticated` route group.
5. **No data layer** — raw `supabase.from(...)` calls inside `useEffect` with manual loading state, no TanStack Query, despite Query being installed and wired into the router.
6. **Hardcoded selection-button styling** repeated ~6 times across order/gallery as long inline class strings.
7. **`OCCASIONS` overloaded** — used simultaneously as order occasions and gallery categories; they will diverge.
8. **No admin shell** — `/admin` is a single page with no layout, nav, or room for orders/calendar/pricing.
9. **Business logic in the view** — WhatsApp message construction lives inside the submit handler; it will later need to be reused by quotations/PDF.

## Target structure

```text
src/
  config/            brand.ts, catalog.ts, navigation.ts, occasions.ts
  features/
    order/           components/ (steps), hooks/, lib/ (message builder, tiers)
    gallery/         components/, hooks/, lib/
    auth/            hooks/useAuth, useIsAdmin, components/
    admin/           components/ (AdminShell, AdminPageHeader), gallery/
  components/
    ui/              shadcn (unchanged)
    common/          SelectableCard, OptionPill, StepProgress, SectionHeading,
                     EmptyState, LoadingState, ImageUploadField
    layout/          SiteHeader, SiteFooter, PageContainer
  lib/
    supabase/        storage.ts (upload + publicUrl helpers)
    format/          whatsapp.ts
  routes/
    (public)         index, order, gallery, login
    _authenticated/  route.tsx (gate) + admin/* subtree
```

Rule going forward: **a route file only composes; all logic lives in `features/<domain>`**.

## Refactor steps

**1. Config layer**
Split `order-config.ts` into `config/brand.ts` (name, WhatsApp number, contact), `config/catalog.ts` (sizes, flavours, fillings, extras — typed, id-based, ready to be DB-backed later), `config/occasions.ts` (order occasions + gallery categories as separate exports, same values today so nothing changes), `config/navigation.ts` (public nav + admin nav arrays). Keep `src/lib/order-config.ts` as a thin re-export so nothing breaks.

**2. Shared primitives**
Extract the repeated selection markup into `SelectableCard`, `OptionPill`, `StepProgress`, `LoadingState`, `EmptyState`, `SectionHeading`, `ImageUploadField`. Same classNames as today — pure extraction.

**3. Storage + data layer**
One `lib/supabase/storage.ts` with `uploadToBucket(bucket, file)`, `bucketPublicUrl(bucket, path)`, `compressImage()` (moved out of `admin.tsx`). One `features/gallery/hooks/useGalleryPhotos.ts` using TanStack Query, consumed by both the public gallery and admin gallery manager; admin mutations invalidate the same query key. Single `GalleryPhoto` type.

**4. Order feature**
Break `order.tsx` into `useOrderForm` (state + validation + tier rules), `lib/buildOrderMessage.ts` (WhatsApp text, pure and unit-testable, reusable by future quotations), and four step components (`OccasionStep`, `CakeStep`, `DetailsStep`, `ContactStep`). Route becomes ~60 lines of composition. Identical output message.

**5. Auth**
Add `features/auth/hooks/useAuth.ts` and `useIsAdmin.ts`. Introduce the `_authenticated/` route group with the standard client-side gate, move admin under `routes/_authenticated/admin/`, keep `/admin` working via a redirect route so existing links and bookmarks don't break.

**6. Admin shell**
`AdminShell` with sidebar/topbar driven by `config/navigation.ts`, rendering `<Outlet />`. Today it contains exactly one item (Gallery) — Orders, Calendar, Pricing, Products, Analytics slot in later with zero restructuring.

**7. Cleanup**
Mount `<Toaster />` once in `__root.tsx` instead of inside `order.tsx`; add a shared `SiteHeader`/`SiteFooter`; ensure every route keeps its own `head()` metadata.

## Roadmap after the refactor

| Phase | Module | Depends on |
|---|---|---|
| 1 | Orders persisted to database + admin order list | auth group, admin shell |
| 2 | SVG cake builder (`features/cake-builder`, config-driven) | catalog config |
| 3 | Product & pricing management (catalog moves config → DB) | catalog config, admin shell |
| 4 | Calendar / availability | orders |
| 5 | PDF quotations | `buildOrderMessage` sibling: `buildQuotation` |
| 6 | Customer accounts | auth feature |
| 7 | Analytics, AI inspiration | orders |

## Technical notes

- No migrations, no schema changes, no RLS changes in this phase.
- The catalog config is typed with stable `id` fields specifically so a later migration to DB-backed products is a swap of the data source, not a rewrite of consumers.
- TanStack Query becomes the single read path; `useEffect`-fetch is removed everywhere.
- Verification: after each step, typecheck plus a browser pass over `/`, `/order` (full 4-step submit, message text compared to current output), `/gallery`, `/login`, `/admin`.
