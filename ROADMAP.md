# Vanilla Valley — Roadmap

Status legend: ✅ done · 🚧 in progress · ⬜ planned

| # | Module | Status |
| --- | --- | --- |
| 0 | Architecture refactor (features, config, shared primitives, admin shell) | ✅ |
| 1 | Orders (persistence, admin list + detail, WhatsApp flow) | ✅ |
| 2 | Products & catalog (categories, products, option groups, options, rules) | ✅ |
| 3 | Calendar & availability (events, blocks, capacity, workload) | ✅ |
| 4 | SVG cake builder (`features/cake-builder`, feeds the order wizard) | ⬜ |
| 5 | Pricing (`price_lists`, `price_list_items`, `pricing_rules`) | ✅ |
| 6 | PDF quotations (`quotes` versions on `quoted` orders) | ⬜ |
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

## Next up (module 4 — cake builder)

The builder plugs into the existing order wizard's Cake step and reads the
database-backed catalog. It stores JSONB design state (`cake_designs`), which
the quotation and template modules reuse without schema changes.

## Enabling availability for customers

Everything is already wired. Set
`FEATURE_FLAGS.enforceOrderAvailability = true` in `src/config/features.ts` to
refuse blocked, fully booked and inside-lead-time dates in the order wizard.
The next UI step is surfacing the reason (`availability.unavailableReason`) and
a `min` date on the event-date input.
