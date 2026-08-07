import { memo } from "react";
import { parseSvgAsset, viewBoxRatio } from "../lib/svg";
import type { CakeAsset } from "../types";

/**
 * Places one stored asset inside the cake illustration.
 * Nested `<svg>` gives us free scaling: the asset keeps its own coordinate
 * system and is fitted (or stretched, for tier bodies) into the given box.
 *
 * Memoised because a single design change re-renders the whole stack while
 * most layers are unchanged.
 */
export const AssetLayer = memo(function AssetLayer({
  asset,
  x,
  y,
  width,
  height,
  stretch = false,
  opacity,
  className,
}: {
  asset: CakeAsset | undefined;
  x: number;
  y: number;
  width: number;
  height: number;
  stretch?: boolean;
  opacity?: number;
  className?: string;
}) {
  const parsed = asset ? parseSvgAsset(asset.svg_content) : null;
  if (!parsed) return null;
  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox={parsed.viewBox}
      preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
      opacity={opacity}
      overflow="visible"
      className={className}
      dangerouslySetInnerHTML={{ __html: parsed.inner }}
    />
  );
});


/** Standalone preview used by the admin asset library. */
export function AssetPreview({
  asset,
  className,
}: {
  asset: Pick<CakeAsset, "svg_content" | "name">;
  className?: string;
}) {
  const parsed = parseSvgAsset(asset.svg_content);
  if (!parsed) {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground">No valid SVG yet</p>
      </div>
    );
  }
  const ratio = viewBoxRatio(parsed.viewBox);
  return (
    <svg
      viewBox={parsed.viewBox}
      role="img"
      aria-label={asset.name}
      className={className}
      style={{ aspectRatio: `${ratio}` }}
      dangerouslySetInnerHTML={{ __html: parsed.inner }}
    />
  );
}
