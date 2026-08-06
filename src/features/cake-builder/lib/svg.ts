/**
 * Helpers for inlining a stored SVG asset into the live illustration.
 *
 * Assets are stored as complete, standalone `<svg>` documents so a developer or
 * designer can open, preview and edit them anywhere. The renderer only needs
 * the viewBox and the inner markup, which it places inside a nested `<svg>`.
 */

export type ParsedSvg = { viewBox: string; inner: string };

const SVG_RE = /<svg[^>]*viewBox=["']([^"']+)["'][^>]*>([\s\S]*)<\/svg>/i;

/** Defensive clean-up: stored artwork is admin-authored, never customer input. */
const sanitize = (markup: string) =>
  markup
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

export function parseSvgAsset(content: string): ParsedSvg | null {
  const match = SVG_RE.exec(content ?? "");
  if (!match) return null;
  return { viewBox: match[1]!.trim(), inner: sanitize(match[2]!) };
}

/** Ratio helper so the library grid can preview assets at their natural shape. */
export function viewBoxRatio(viewBox: string): number {
  const [, , w, h] = viewBox.split(/[\s,]+/).map(Number);
  return w && h ? w / h : 1;
}
