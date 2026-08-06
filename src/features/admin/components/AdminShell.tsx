import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { ADMIN_NAV } from "@/config/navigation";
import { BRAND } from "@/config/brand";
import { useSignOut } from "@/features/auth/hooks/useSignOut";

/**
 * Admin panel chrome. New admin modules are added to ADMIN_NAV and appear
 * here automatically — no layout changes required.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const signOut = useSignOut();

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-4 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground shrink-0">
            {BRAND.name}
          </span>
          <nav className="flex gap-3 overflow-x-auto">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-foreground font-medium" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="text-sm whitespace-nowrap hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/gallery" className="text-sm text-muted-foreground hidden sm:inline">
            View public gallery
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
