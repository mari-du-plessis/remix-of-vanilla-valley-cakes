import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { GalleryManager } from "@/features/admin/gallery/GalleryManager";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: AdminGalleryPage,
});

function AdminGalleryPage() {
  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Upload, reorder and remove public gallery photos."
      />
      <GalleryManager />
    </>
  );
}
