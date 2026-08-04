import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { CategoriesPanel } from "./CategoriesPanel";
import { OptionsPanel } from "./OptionsPanel";
import { ProductsPanel } from "./ProductsPanel";

/**
 * Products admin module: categories, products and the option catalogue the
 * order wizard reads. The route only mounts this component.
 */
export function ProductsManager() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Manage everything the bakery offers and the choices customers can make — no developer needed."
      />
      <Tabs defaultValue="products" className="mt-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <ProductsPanel />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <CategoriesPanel />
        </TabsContent>
        <TabsContent value="options" className="mt-6">
          <OptionsPanel />
        </TabsContent>
      </Tabs>
    </>
  );
}
