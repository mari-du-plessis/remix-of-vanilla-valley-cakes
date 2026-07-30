import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useIsAdmin } from "@/features/auth/hooks/useIsAdmin";
import { useSignOut } from "@/features/auth/hooks/useSignOut";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Bakery Admin — Vanilla Valley" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading } = useAuth();
  const { data: isAdmin, isPending } = useIsAdmin(user?.id);
  const signOut = useSignOut();

  if (loading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-xl font-semibold">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account exists but isn't an admin yet.
          </p>
          <button onClick={signOut} className="mt-4 text-sm underline">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
