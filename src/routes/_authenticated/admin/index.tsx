import { createFileRoute, Link } from "@tanstack/react-router";
import { ADMIN_NAV } from "@/config/navigation";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const modules = ADMIN_NAV.filter((item) => item.to !== "/admin");

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Manage your bakery from one place."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {modules.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-primary" />}
              <p className="text-sm font-medium">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
