import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import type { OrderFormState } from "@/features/order/types";
import { useCakeDesign } from "../hooks/useCakeBuilder";
import { CakePreview } from "./CakePreview";

/**
 * Drop-in live preview for any surface that owns an order form: the customer
 * wizard today, admin manual capture or a saved template later. It resolves
 * the design from the catalog itself so callers pass nothing but state.
 */
export function CakeBuilderPreview({
  form,
  catalog,
  className,
}: {
  form: OrderFormState;
  catalog: CakeCatalog;
  className?: string;
}) {
  const { design, assets } = useCakeDesign(form, catalog);
  if (assets.length === 0) return null;
  return <CakePreview design={design} assets={assets} className={className} />;
}
