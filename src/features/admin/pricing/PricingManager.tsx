import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import {
  useCreatePriceList,
  useCreatePriceListItem,
  useCreatePricingRule,
  useDeletePriceList,
  useDeletePriceListItem,
  useDeletePricingRule,
  usePriceLists,
  usePricingSnapshot,
  useUpdatePriceList,
  useUpdatePriceListItem,
  useUpdatePricingRule,
} from "@/features/pricing/hooks/usePricing";
import { PriceItemsPanel } from "./PriceItemsPanel";
import { PriceListsPanel } from "./PriceListsPanel";
import { PricingRulesPanel } from "./PricingRulesPanel";

/**
 * Pricing admin module. All pricing is internal — customers never see it.
 * Everything here feeds the shared pricing engine that future quotations,
 * PDFs, invoices and payments will reuse.
 */
export function PricingManager() {
  const priceLists = usePriceLists();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Default to the bakery's default list once the lists load.
  useEffect(() => {
    if (selectedId || !priceLists.data?.length) return;
    const fallback = priceLists.data.find((list) => list.isDefault) ?? priceLists.data[0];
    setSelectedId(fallback?.id ?? null);
  }, [priceLists.data, selectedId]);

  const snapshot = usePricingSnapshot(selectedId);
  const currency = snapshot.data?.priceList.currency ?? "ZAR";
  const items = useMemo(() => snapshot.data?.items ?? [], [snapshot.data]);
  const rules = useMemo(() => snapshot.data?.rules ?? [], [snapshot.data]);
  const activeListId = snapshot.data?.priceList.id ?? null;

  const createList = useCreatePriceList();
  const updateList = useUpdatePriceList();
  const deleteList = useDeletePriceList();
  const createItem = useCreatePriceListItem();
  const updateItem = useUpdatePriceListItem();
  const deleteItem = useDeletePriceListItem();
  const createRule = useCreatePricingRule();
  const updateRule = useUpdatePricingRule();
  const deleteRule = useDeletePricingRule();

  return (
    <>
      <AdminPageHeader
        title="Pricing"
        description="Internal price lists, product and option prices, delivery and rush fees, and the rules that adjust them. Customers still request quotations — no prices are shown publicly."
      />

      <Tabs defaultValue="prices" className="mt-6">
        <TabsList>
          <TabsTrigger value="prices">Product &amp; option prices</TabsTrigger>
          <TabsTrigger value="delivery">Delivery &amp; rush</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="lists">Price lists</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="mt-6">
          {activeListId ? (
            <PriceItemsPanel
              title="Product, option and tier prices"
              description="Base prices per product or size, option adjustments and tier pricing. Amounts are stored in the price list's currency."
              priceListId={activeListId}
              currency={currency}
              items={items}
              loading={snapshot.isLoading}
              targetFilter={["product", "option", "tier", "service", "custom"]}
              onCreate={(values) => createItem.mutate(values)}
              onUpdate={(id, values) => updateItem.mutate({ id, values })}
              onDelete={(id) => deleteItem.mutate(id)}
            />
          ) : (
            <EmptyState loading={priceLists.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          {activeListId ? (
            <PriceItemsPanel
              title="Delivery and rush fees"
              description="Flat or per-kilometre delivery charges and rush fees. Rule-based surcharges live on the Rules tab."
              priceListId={activeListId}
              currency={currency}
              items={items}
              loading={snapshot.isLoading}
              targetFilter={["delivery", "rush"]}
              onCreate={(values) => createItem.mutate(values)}
              onUpdate={(id, values) => updateItem.mutate({ id, values })}
              onDelete={(id) => deleteItem.mutate(id)}
            />
          ) : (
            <EmptyState loading={priceLists.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          {activeListId ? (
            <PricingRulesPanel
              priceListId={activeListId}
              currency={currency}
              rules={rules}
              loading={snapshot.isLoading}
              onCreate={(values) => createRule.mutate(values)}
              onUpdate={(id, values) => updateRule.mutate({ id, values })}
              onDelete={(id) => deleteRule.mutate(id)}
            />
          ) : (
            <EmptyState loading={priceLists.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="lists" className="mt-6">
          <PriceListsPanel
            priceLists={priceLists.data ?? []}
            loading={priceLists.isLoading}
            selectedId={activeListId}
            totalItems={items.length}
            onSelect={setSelectedId}
            onCreate={(values) => createList.mutate(values)}
            onUpdate={(id, values) => updateList.mutate({ id, values })}
            onDelete={(id) => {
              deleteList.mutate(id);
              if (id === selectedId) setSelectedId(null);
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <p className="text-sm text-muted-foreground">
      {loading ? "Loading pricing…" : "Create a price list first on the Price lists tab."}
    </p>
  );
}
