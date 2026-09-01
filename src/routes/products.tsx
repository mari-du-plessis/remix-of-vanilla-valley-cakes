import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/common";
import { Eyebrow, Muted } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
import { fetchProducts } from "@/features/catalog/api";
import { catalogKeys } from "@/features/catalog/types";
import { useCart } from "@/features/cart/CartProvider";
import { formatMoney } from "@/features/pricing/lib/money";

/**
 * Ready-made treats.
 *
 * Fixed-price products the bakery sells as-is — no design conversation needed.
 * Everything on this page comes from the catalog: the bakery decides what is
 * customer-visible and what it costs from the admin panel, and adding a new
 * treat never needs a developer.
 */
export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Treats & Ready-Made Products — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "Browse Vanilla Valley's ready-made treats — rusks, biscuits, cake cups and more — and add them to your order alongside a custom cake.",
      },
      { property: "og:title", content: "Treats & Ready-Made Products — Vanilla Valley" },
      {
        property: "og:description",
        content: "Ready-made rusks, biscuits, cake cups and more, added straight to your order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const cart = useCart();
  const { data, isPending } = useQuery({
    queryKey: catalogKeys.products,
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Only products the bakery has marked customer-visible *and* priced appear
   * here: an unpriced product belongs in the enquiry flow, not the shelf.
   */
  const products = useMemo(
    () =>
      (data ?? [])
        .filter(
          (product) =>
            product.is_active &&
            (product as { is_customer_visible?: boolean }).is_customer_visible !== false &&
            product.base_price_cents != null,
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [data],
  );

  const add = (product: (typeof products)[number]) => {
    cart.addItem({
      type: "product",
      productSlug: product.slug,
      label: product.name,
      quantity: 1,
      config: {
        kind: "product",
        productId: product.id,
        slug: product.slug,
        unitPriceCents: product.base_price_cents,
        notes: "",
      },
    });
    toast.success(`${product.name} added to your order`);
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-10 text-center">
          <Eyebrow className="text-primary">The shelf</Eyebrow>
          <h1 className="mt-4 text-2xl sm:text-3xl">Ready-made treats</h1>
          <div className="gold-rule mx-auto mt-5 max-w-[7rem]" />
          <Muted className="mx-auto mt-5 max-w-lg">
            Baked fresh and ready to collect. Add them to the same order as your custom cake.
          </Muted>
        </header>

        {isPending ? (
          <LoadingState label="Loading our treats…" />
        ) : products.length === 0 ? (
          <EmptyState
            message="Our ready-made treats are being updated. Send us an enquiry and we'll help."
            action={
              <Button asChild className="h-12 rounded-full px-8">
                <Link to="/order">Start an enquiry</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="surface-card lift-on-hover flex flex-col rounded-2xl p-6"
              >
                <h2 className="text-base">{product.name}</h2>
                {product.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}
                <p className="mt-4 text-sm tracking-[0.12em] text-primary uppercase">
                  {formatMoney(product.base_price_cents ?? 0)}
                </p>
                <Button
                  onClick={() => add(product)}
                  className="mt-5 h-11 w-full rounded-full"
                  aria-label={`Add ${product.name} to your order`}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add to order
                </Button>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <Button asChild variant="outline" className="h-12 rounded-full px-8">
            <Link to="/cart">
              <ShoppingBag className="mr-2 h-4 w-4" /> View your order
            </Link>
          </Button>
          <Link
            to="/"
            className="eyebrow inline-flex items-center gap-1 text-[0.6rem] text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" /> Back home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
