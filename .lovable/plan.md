# Product-specific ordering workflows

Replace the single "generic enquiry" fallback with a real, database-driven workflow for each
product family: Cupcakes, Cheesecakes, Cookies/Biscuits, Rusks, Cake Cups and Tarts. The Custom
Cake workflow (SVG builder) is untouched.

## How it works

Each non-cake product gets a **Selections** stage between "Product" and "Details". That stage is
rendered by one shared component that reads the product's option groups from the database and
renders a picker per group:

- single-select group -> choice cards (e.g. Flavour, Size)
- multi-select group -> toggle pills (e.g. Decoration, Add-ons)
- quantity -> a stepper, shown for the families that are ordered by quantity

Nothing about which flavours, sizes or decorations exist is hard-coded. The bakery adds, renames,
reorders or deactivates them in Admin > Products > Options, and the wizard follows immediately.

## Per-family configuration

One small config table maps a product family to: the option groups it asks for, whether it asks
for a quantity (and the unit label: "dozen", "each", "boxes"), its WhatsApp emoji, and its
summary noun. Adding a future product family is one row plus its option groups in Admin.

| Family | Asks for |
|---|---|
| Cupcakes | Flavour, Size (mini/standard/jumbo), Decoration, Quantity (dozen) |
| Cheesecakes | Flavour, Size, Decoration |
| Cookies / Biscuits | Flavour, Decoration, Quantity |
| Rusks | Flavour, Quantity (packs) |
| Cake Cups | Flavour, Decoration, Quantity |
| Tarts | Flavour, Size, Quantity |

## Database

One migration that:
- creates per-family option groups (e.g. `cupcake-flavour`, `cupcake-size`, `cupcake-decoration`,
  `cheesecake-flavour`, `tart-size`, ...) so each family's list is independent of the cake lists,
- seeds each group with the values confirmed with the bakery as a starting point (fully editable
  in Admin afterwards),
- links each group to its product via the existing product-option-groups table.

No new tables, no schema changes — this uses the catalog model that is already in place, so the
existing admin screens manage all of it with no new admin work.

## Order records and WhatsApp

- Selections are stored as normal order-item option rows (group key/label + value), exactly like
  cake options, so orders, quotes and pricing keep working unchanged.
- Quantity is stored on the order item's quantity field.
- The WhatsApp message gets a per-family emoji and heading, then lists the selections in the same
  order the customer answered them. Cake-only sections stay gated behind the cake renderer check.

## Technical notes

- `src/config/product-builders.ts`: family -> emoji/noun/builder id (extended, not replaced).
- New `src/features/order/flows/product-requirements.ts`: family -> option group keys + quantity
  config.
- `registry.ts`: replaces `generic-enquiry` with a `product-selection` flow that includes the new
  `selections` stage; families without any configured group fall back to the current 4-step flow.
- New `src/features/order/components/SelectionsStep.tsx` + `QuantityField`, built from existing
  `OptionPill` / `SelectableCard` primitives.
- `OrderFormState` gains `quantity: number` and `selections: Record<string, string[]>`;
  `useOrderForm` validates required groups before allowing Continue.
- `buildOrderMessage` and `buildOrderPayload` read `selections` generically.
- Docs: ARCHITECTURE.md, ROADMAP.md, CHANGELOG.md updated.
