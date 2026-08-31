# Multi-Product Ordering Platform

Evolve the single-cake wizard into a cart-based ordering platform where the cake builder is one product type among many. Built on the existing catalog, orders, quotes, pricing, customers and WhatsApp systems — nothing is rewritten from scratch.

## What exists today (inspection findings)

- Orders already support multiple items: `orders → order_items → order_item_options`. The wizard just never creates more than one item.
- The wizard is one flat `OrderFormState` per order with a flow registry (`custom-cake`, `product-selection`, `generic-enquiry`).
- Flavour/filling pairing already comes from admin (`option_rules.pairs_with`) and auto-selects — it is simply not locked.
- **Tier inversion cause found:** `buildTierBoxes` builds index 0 = widest = bottom box, and the renderer maps `tiers[i]` to box `i`, but `tierLabel(0)` says "Top tier". Labels and geometry disagree. Fix at the model level with explicit positions.
- Sizes are catalog options in inches with free-text "serves" — needs a cm/servings model.

## Architecture

### Cart (new, client-side, one order on submit)
`src/features/cart/` — a `CartItem[]` in a provider persisted to localStorage:

```text
CartItem
├── id, type: "custom_cake" | "cupcakes" | "product"
├── quantity
└── config: CustomCakeConfig | CupcakeConfig | ProductRef  (discriminated union)
```

Submitting maps every cart item to one `order_items` row on a single order — reusing `buildOrderPayload`, extended to accept many items.

### Explicit tier positions
`CakeTier` gains `position: "bottom" | "middle" | "top"`, `sizeCm`, `servings`, plus per-tier `colour`, `finish`, `shape`. Tiers are stored bottom-first, and the renderer/labels both read `position` — never the array index. Vitest tests cover: colour change isolation, no inversion, per-tier independence, serving totals.

### Servings engine
`src/features/cake-builder/lib/servings.ts` — the cm chart (10→6 … 30→56) as admin-overridable config, plus a recommender that never returns fewer servings than requested, minimises overage, and orders larger tiers at the bottom.

### Custom cake flow (skippable)
What are we baking? → Inspiration (skip) → Occasion → Servings → Tiers → Recommended sizes + chart → Per-tier config → Finishing touches → Additional info → Add to cart.
Steps declare `optional: true` so Skip records "not provided" rather than empty-but-required.

### Other changes
- Homepage CTA → "Start Your Order".
- "What are we baking?" shows only Custom Cake and Cupcakes.
- Finishing touches on one screen; Personalised Message removed; candles become a free-text description; figurines added (required flag, description, quantity).
- Baby Shower occasion reveals gender-reveal prompts in Additional Information.
- Paired fillings render locked/read-only with an explanatory hint.
- Textured finish shows the "guide, not exact texture" subtext.
- `/products` client-facing section listing fixed-price products (rusks, cookies, tarts, cake cups) from the catalog with admin-managed prices, addable to the same cart.
- Order summary renders each tier separately with requested vs total servings; the same summary builder feeds the review panel and the WhatsApp message.

## Database changes

Additive only — no existing table or column is dropped.

- `products.base_price_cents` already exists; add `is_customer_visible` and `display_price` handling for the fixed-price products section.
- New `serving_sizes` table (cm, servings, sort order, active) seeded with the chart, so admin can edit it.
- `order_items.metadata` carries the typed per-item configuration (cake tiers, cupcake config) as structured JSON — no giant nullable column set.
- New `order_items.item_type` column to distinguish `custom_cake` / `cupcakes` / `product`.
- Occasions become catalog options per product type (admin-manageable) with the current list seeded.
- Figurines added as a priced catalog option so pricing stays admin-owned.

## Explicitly deferred

Quote/invoice/payment lifecycle beyond the existing quote module, AI inspiration analysis (data model and UI slots prepared only), staff roles/dashboards, inventory and accounting.

## Needed from you

The Vanilla Valley serving/cutting chart image — the only upload currently attached is a calendar screenshot, so please attach the chart and I will use it directly on the recommended-sizes screen (with a temporary text chart until then).
