import type { LucideIcon } from "lucide-react";
import {
  Cake,
  CalendarDays,
  ClipboardList,
  FileText,
  Images,
  LayoutTemplate,
  LayoutDashboard,
  Palette,
  Tags,
  Users,
} from "lucide-react";

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
  { label: "Templates", to: "/cake-templates" },
  { label: "Treats", to: "/products" },
  { label: "Order", to: "/order" },
  { label: "Saved designs", to: "/saved-designs" },
];

/**
 * Admin panel navigation. New modules (orders, calendar, pricing, products,
 * analytics) get added here and rendered automatically by the AdminShell.
 */
export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Calendar", to: "/admin/calendar", icon: CalendarDays },
  { label: "Products", to: "/admin/products", icon: Cake },
  { label: "Cake builder", to: "/admin/cake-builder", icon: Palette },
  { label: "Cake templates", to: "/admin/cake-templates", icon: LayoutTemplate },

  { label: "Quotes", to: "/admin/quotes", icon: FileText },

  { label: "Pricing", to: "/admin/pricing", icon: Tags },

  { label: "Gallery", to: "/admin/gallery", icon: Images },
];
