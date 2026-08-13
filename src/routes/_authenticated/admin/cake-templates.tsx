import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { TemplatesManager } from "@/features/admin/cake-templates/TemplatesManager";

export const Route = createFileRoute("/_authenticated/admin/cake-templates")({
  component: AdminCakeTemplatesPage,
});

function AdminCakeTemplatesPage() {
  return (
    <>
      <AdminPageHeader
        title="Cake templates"
        description="Curated starting designs customers can browse and customise into their own cake."
      />
      <div className="mt-6">
        <TemplatesManager />
      </div>
    </>
  );
}
