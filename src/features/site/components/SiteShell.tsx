import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BRAND } from "@/config/brand";
import { PUBLIC_NAV } from "@/config/navigation";
import { DEFAULT_PUBLIC_THEME, type ThemeId } from "@/config/themes";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import logoSrc from "@/assets/logo.jpg";

/** Wordmark used across the customer-facing site. */
export function SiteWordmark({ className, align = "center" }: { className?: string; align?: "center" | "left" }) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-center gap-3",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      <img
        src={logoSrc}
        alt={`${BRAND.name} logo`}
        className="h-auto w-auto shrink-0 self-stretch rounded-md border border-border/60 object-cover"
      />
      <span className={cn("flex flex-col", align === "center" ? "items-center" : "items-start")}>
        <span className="display-heading text-lg leading-none sm:text-xl">{BRAND.name}</span>
        <span className="eyebrow mt-2 text-[0.6rem] text-muted-foreground">{BRAND.tagline}</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={cn("sticky top-0 z-40 surface-veil border-x-0 border-t-0", compact ? "py-3" : "py-4")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6">
        <SiteWordmark align="left" className="self-stretch text-left" />
        <nav className="flex items-center gap-5">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="eyebrow text-[0.65rem] transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 px-6 py-12">
      <div className="mx-auto max-w-6xl text-center">
        <SiteWordmark />
        <div className="gold-rule mx-auto mt-8 max-w-xs" />
        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.legalName} · {BRAND.country}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Bespoke cakes, made to order. We reply on WhatsApp within {BRAND.replyWindow}.
        </p>
        <p className="mt-6">
          <Link
            to="/login"
            className="eyebrow text-[0.6rem] text-muted-foreground/60 transition-opacity hover:text-primary"
          >
            Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}

type SiteShellProps = {
  children: ReactNode;
  theme?: ThemeId;
  /** Hide the sticky header (e.g. immersive landing hero). */
  header?: boolean;
  footer?: boolean;
  className?: string;
};

/**
 * Chrome for every customer-facing page: theme scope + navigation + footer.
 * Pages only supply content; swapping the theme prop restyles the whole site
 * without touching page code.
 */
export function SiteShell({
  children,
  theme = DEFAULT_PUBLIC_THEME,
  header = true,
  footer = true,
  className,
}: SiteShellProps) {
  return (
    <ThemeProvider theme={theme} className={cn("flex flex-col", className)}>
      {header && <SiteHeader />}
      <main className="flex-1">{children}</main>
      {footer && <SiteFooter />}
    </ThemeProvider>
  );
}
