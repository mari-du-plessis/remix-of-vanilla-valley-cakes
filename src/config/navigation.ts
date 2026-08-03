import type { LucideIcon } from "lucide-react";
import { ClipboardList, Images, LayoutDashboard } from "lucide-react";


export type NavItem = {
  label: string;
  to: string;
  icon?: LucideIcon;
  /** Not yet built — rendered as disabled in the admin shell. */
  comingSoon?: boolean;
};

/** Public customer-facing navigation. */
export const PUBLIC_NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Gallery", to: "/gallery" },
  { label: "Order", to: "/order" },
];

/**
 * Admin panel navigation. New modules (orders, calendar, pricing, products,
 * analytics) get added here and rendered automatically by the AdminShell.
 */
export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Gallery", to: "/admin/gallery", icon: Images },
];

