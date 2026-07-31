# Vanilla Valley — Long-Term Data Model (approved direction + refinements)

Status: design only. Nothing here is implemented yet.

## Principles

1. **Products are the core concept.** Everything the bakery sells is a product row: custom cakes, cupcakes, cheesecakes, rusks, biscuits, tarts, cake cups, gift cards, delivery, tastings, future services.
2. **Configuration is data, not code.** Sizes, flavours, fillings, decorations, categories, workflows are rows editable in admin.
3. **Every major entity gets an admin module.** If a table exists and the owner cares about its contents, it earns a screen in `ADMIN_NAV`.
4. **Additive growth.** New modules attach via foreign keys to existing tables; no module requires reshaping `orders`, `products` or `customers`.
5. **No premature tables.** Future modules are designed, not created. They are listed here so today's tables leave the right seams.

---

## Phase 1 — Core (build first)

### Identity
| Table | Purpose | Key fields | Relations |
| --- | --- | --- | --- |
| `profiles` | App-facing user record | `id` (= auth user), `full_name`, `phone` | 1:1 auth user |
| `user_roles` | Role assignment, never on profile | `user_id`, `role` (enum) | → profiles |
| `customers` | Buyer record, may exist without login | `id`, `profile_id?`, `name`, `phone`, `email` | → profiles (nullable) |

Customers are decoupled from auth so WhatsApp-only buyers work today and customer accounts plug in later by setting `profile_id`.

### Catalog
| Table | Purpose | Key fields |
| --- | --- | --- |
| `product_categories` | Grouping + storefront nav | `slug`, `name`, `sort_order` |
| `products` | Anything sellable | `category_id`, `name`, `kind` (`cake`/`baked_good`/`gift_card`/`service`/`delivery`), `is_active`, `metadata` jsonb |
| `option_groups` | A choice set (Size, Flavour, Filling, Decoration) | `product_id?` (null = global), `name`, `select_type` (`single`/`multi`), `is_required` |
| `options` | A choice value | `group_id`, `name`, `metadata` jsonb, `sort_order` |
| `option_rules` | Compatibility/pairing (e.g. Red Velvet ⇒ Cream Cheese) | `option_id`, `rule_type`, `target_option_id` |

This replaces `src/config/catalog.ts` with identical getter shapes, so existing consumers survive the move.

### Pricing (internal only — never rendered to customers)
| Table | Purpose |
| --- | --- |
| `price_lists` | Versioned, effective-dated price sets |
| `price_list_items` | Price per product/option within a list |
| `pricing_rules` | Modifiers: tier count, rush fee, delivery distance, minimums |

### Orders & Quotes
| Table | Purpose |
| --- | --- |
| `orders` | One row per enquiry → quote → confirmed order. `status` includes `quoted`. Holds customer, event date, channel, totals |
| `order_items` | Line items → product |
| `order_item_options` | Chosen options per line, price snapshotted |
| `order_status_history` | Audit trail of status transitions |
| `quotes` | **Versioned quote documents only** (`order_id`, `version`, `document_url`, `sent_at`, `accepted_at`) |
| `payments` | Deposits and balances, provider-agnostic |

Confirmed: quotations are orders in `quoted` status; `quotes` stores v1/v2/v3 PDFs, nothing else.

### Cake builder
| Table | Purpose |
| --- | --- |
| `cake_designs` | JSONB snapshot of builder state + `order_item_id?` |
| `cake_design_options` | Normalised chosen options for reporting |
| `cake_templates` | Saved reusable designs: `name`, `category_id`, `design` jsonb, `is_active`, `source_design_id?` |

`cake_templates` is deliberately the same JSONB shape as `cake_designs`, so "save as template" and "start from template" are copies, and duplication/categorisation are trivial.

### Content
| Table | Purpose |
| --- | --- |
| `gallery_photos` | Exists today |
| `media` | Polymorphic attachments (`owner_type`, `owner_id`, `bucket`, `path`) |
| `settings` | Key/value business settings editable in admin |

---

## Phase 2 — Operations

| Table | Purpose |
| --- | --- |
| `availability_blocks` | Blocked dates/date ranges |
| `capacity_settings` | Max orders or max tiers per day |
| `calendar_events` | Bakes, collections, deliveries, consultations |

---

## Phase 3 — Staff, workflows and production

**Staff.** Staff are `profiles` + `user_roles` extended with a `staff` enum set (`owner`, `baker`, `decorator`, `assistant`). A thin `staff_members` table adds bakery-specific fields (`display_name`, `skills`, `is_active`, `hourly_cost`). Assignment lives in `order_task_assignments`, not on `orders`, so orders need no schema change.

**Workflows.** Configurable, product-driven:

| Table | Purpose |
| --- | --- |
| `workflow_templates` | Named workflow (Wedding Cake, Cupcakes, Corporate) |
| `workflow_template_steps` | Ordered steps with `name`, `position`, `default_duration`, `required_role` |
| `product_workflow_templates` | Which template applies to which product/category |
| `order_tasks` | Instantiated steps for an order, with `status`, `due_at`, `completed_at` |
| `order_task_assignments` | `order_task_id` → `staff_member_id` |

Orders remain untouched: tasks hang off orders, and the order's production progress is derived from its tasks.

---

## Phase 4 — Recipes, ingredients, inventory

| Table | Purpose |
| --- | --- |
| `recipes` | `name`, `yield_quantity`, `yield_unit`, `prep_minutes`, `bake_minutes`, `instructions`, `notes` |
| `recipe_ingredients` | `recipe_id`, `ingredient_id`, `quantity`, `unit` |
| `recipe_products` | Many-to-many link recipes ↔ products/options (a flavour option can carry its own recipe) |
| `ingredients` | `name`, `default_unit`, `current_cost`, `supplier_id?` |
| `suppliers` | Supplier contact and lead times |
| `inventory_items` | Stock level per ingredient, reorder point |
| `stock_movements` | Purchases, usage, waste — the source of truth for stock and waste tracking |
| `shopping_lists` / `shopping_list_items` | Generated from upcoming orders vs stock |

Costing and profit analysis are **derived** (recipe cost → product cost → order margin), not stored, so they never need a redesign.

---

## Phase 5 — Engagement & growth

`reviews`, `gift_cards` + `gift_card_transactions` (gift cards are also products), `analytics_events`, `ai_inspirations`.

---

## Why this avoids redesigns

- New sellable thing → a `products` row, not a table.
- New cake choice → an `options` row.
- New workflow → a `workflow_templates` row.
- New pricing behaviour → a `pricing_rules` row or a new price list version.
- Builder UI changes → JSONB shape changes, no migration.
- Every future module attaches by foreign key to `products`, `orders` or `profiles`; none of them mutate those tables.

## Recommended deviations

1. **No separate `staff` identity system.** Reusing `profiles` + `user_roles` avoids a parallel user model; `staff_members` only adds bakery fields.
2. **Recipes link to products *and* options.** A recipe is usually per flavour, not per product; linking only to products would force a redesign later.
3. **Costing/profit stay derived, not tables.** Storing them invites stale data.
4. **Postpone `media` generalisation** until a second attachment type exists; `gallery_photos` stays as-is for now.
