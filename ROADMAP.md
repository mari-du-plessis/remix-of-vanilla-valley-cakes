# Vanilla Valley — Roadmap

Status legend: ✅ done · 🚧 in progress · ⬜ planned

| # | Module | Status |
| --- | --- | --- |
| 0 | Architecture refactor (features, config, shared primitives, admin shell) | ✅ |
| 1 | Orders (persistence, admin list + detail, WhatsApp flow) | ✅ |
| 2 | Products & catalog (categories, products, option groups, options, rules) | ✅ |
| 3 | Calendar & availability (events, blocks, capacity, workload) | ✅ |
| 4 | SVG cake builder (`features/cake-builder`, feeds the order wizard) | ✅ |
| 5 | Pricing (`price_lists`, `price_list_items`, `pricing_rules`) | ✅ |
| 5b | Customers (profiles, addresses, notes, tags, order history) | ✅ |
| 6a | Gallery improvements (masonry, lightbox, filters, inspiration hand-off) | ✅ |
| 6 | PDF quotations (`quotes` versions on `quoted` orders) | ✅ |
| 7 | Cake templates (`cake_templates`, start-from-template) | ⬜ |
| 8 | Staff (`staff_members` on profiles + roles) | ⬜ |
| 9 | Production workflows (`workflow_templates`, `order_tasks`) | ⬜ |
| 10 | Recipes, ingredients, inventory | ⬜ |
| 11 | Customer accounts (`_authenticated/account`) | ⬜ |
| 12 | Reviews, gift cards, payments | ⬜ |
| 13 | Analytics & AI cake inspiration | ⬜ |

## Pricing (module 5 — done)

Admin-only at `/admin/pricing`. Price lists carry effective dates and an
active/default flag; `price_list_items` price products, options, tiers,
delivery, rush and services; `pricing_rules` add conditional adjustments
(rush, delivery zone, weekend/holiday surcharge, seasonal promotion, minimum
order, custom). `features/pricing/lib/pricing-engine.ts` is pure and is the
single quote calculator for the coming quotation, PDF, invoice and payment
modules. Customers still see no prices.

## Customers (module 5b — done)

Admin-only at `/admin/customers`. `customers` carries status, tags, WhatsApp
number, preferred channel and marketing consent; `customer_addresses` stores
delivery addresses and `customer_notes` the internal note timeline. Order
counts, last order and next booking are derived from `orders` on read, so they
can never drift. `profile_id` is already in place for customer accounts, and
reviews, loyalty, gift cards and marketing all attach to `customers.id`
instead of copying contact details.

## Gallery (module 6a — done)

`/gallery` is an editorial masonry grid (natural aspect ratios, lazy loading
below the fold) with an accessible category filter driven by the shared
`GALLERY_CATEGORIES` config, and a keyboard-navigable lightbox showing image,
caption and category only. "Use as inspiration" parks a `GalleryInspiration`
reference in session storage; the order wizard adopts it on mount and keeps it
distinct from the customer's own upload in the WhatsApp enquiry, the saved
order and the AI concept brief. The homepage ribbon now renders the first
photos of the same admin-managed gallery — one source of truth.

Extension points left open: favourites / inspiration boards and Saved Designs
can attach to `GalleryInspiration.id`, and a curated `is_featured` flag can
replace the "first N photos" homepage rule without changing components.

## Cake builder (module 4 — complete)

The guided builder plugs into the order wizard's Cake step and reads the
database-backed catalog and SVG asset library. Renderer-enforced layer order,
six-tier support, side-elevation artwork, platform-aware WhatsApp hand-off and
the on-request AI Inspiration Preview are all in place.

Remaining extension points: persisting JSONB design state (`cake_designs`) for
saved templates, reusing the stored inspiration preview inside quote PDFs, and
adding top / isometric renderers behind `CakeDesign.view`.

## Enabling availability for customers

Everything is already wired. Set
`FEATURE_FLAGS.enforceOrderAvailability = true` in `src/config/features.ts` to
refuse blocked, fully booked and inside-lead-time dates in the order wizard.
The next UI step is surfacing the reason (`availability.unavailableReason`) and
a `min` date on the event-date input.

- [x] **Custom cake appearance model** — free-text colours, per-tier colours,
      ombre and fault-line treatments, independent decoration colours, topper
      style/colour/wording, and an appearance-aware AI concept brief.
