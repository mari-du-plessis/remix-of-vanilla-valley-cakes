import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared typography primitives. Every page — public or admin — should use
 * these instead of hand-rolled font classes so the hierarchy stays consistent
 * as new modules are added.
 *
 * Hierarchy:
 *  - PageTitle   : one per page (H1), branding font, uppercase, wide tracking
 *  - SectionTitle: section headings (H2)
 *  - SubTitle    : card / group headings (H3)
 *  - Eyebrow     : small uppercase label above a title
 *  - Lead / Body / Muted: readable sans body copy
 */

type HeadingProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function PageTitle({ children, className, as: Tag = "h1" }: HeadingProps) {
  return (
    <Tag className={cn("display-heading text-2xl sm:text-3xl", className)}>{children}</Tag>
  );
}

export function SectionTitle({ children, className, as: Tag = "h2" }: HeadingProps) {
  return (
    <Tag className={cn("display-heading text-lg sm:text-xl", className)}>{children}</Tag>
  );
}

export function SubTitle({ children, className, as: Tag = "h3" }: HeadingProps) {
  return (
    <Tag className={cn("font-semibold tracking-[0.04em] text-base", className)}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow text-muted-foreground", className)}>{children}</p>;
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-base leading-relaxed text-muted-foreground sm:text-lg", className)}>
      {children}
    </p>
  );
}

export function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm leading-relaxed", className)}>{children}</p>;
}

export function Muted({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}
