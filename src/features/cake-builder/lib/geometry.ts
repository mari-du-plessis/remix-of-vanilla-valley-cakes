/**
 * Pure tier geometry for the cake illustration.
 *
 * Nothing here knows about assets or the catalog: given a tier count and a
 * shape it returns where each tier sits on the canvas. Keeping it pure means
 * the same maths drives the customer preview, the admin preview lab and any
 * future thumbnail or PDF renderer.
 */

export const CANVAS = { width: 420, height: 480, baseY: 392 } as const;

export type TierBox = {
  cx: number;
  width: number;
  height: number;
  /** Y of the tier's top edge. */
  top: number;
};

/** Shapes that only ever make sense as a single tier. */
const SINGLE_TIER_SHAPES = new Set(["shape-heart", "shape-number", "shape-sheet"]);

/** The tallest cake the builder, the catalog and the renderer all support. */
export const MAX_TIERS = 6;

export function buildTierBoxes(tierCount: number, shapeKey: string): TierBox[] {
  const single = SINGLE_TIER_SHAPES.has(shapeKey);
  const count = single ? 1 : Math.min(MAX_TIERS, Math.max(1, tierCount));

  const baseWidth = shapeKey === "shape-sheet" ? 268 : shapeKey === "shape-number" ? 210 : 224;
  const baseHeight = shapeKey === "shape-sheet" ? 92 : shapeKey === "shape-number" ? 170 : 82;

  /**
   * Tall cakes are scaled down rather than clipped: the stack always fits the
   * canvas, so six tiers read as a statement cake instead of running off frame.
   */
  const inset = count > 4 ? 26 : 42;
  const heightScale = count > 4 ? 0.62 : count > 3 ? 0.82 : 1;
  const widthScale = count > 4 ? 0.9 : 1;

  const boxes: TierBox[] = [];
  let y = CANVAS.baseY;

  for (let i = 0; i < count; i += 1) {
    const width = (baseWidth - inset * i) * widthScale;
    const height = Math.max(34, (baseHeight - i * 8) * heightScale);
    y -= height;
    boxes.push({ cx: CANVAS.width / 2, width, height, top: y });
  }
  return boxes;
}

/** Where decorative clusters are tucked in for a given tier. */
export function clusterAnchors(box: TierBox, index: number, total: number) {
  const size = Math.max(64, box.width * 0.46);
  const anchors = [
    { x: box.cx - box.width / 2 - size * 0.18, y: box.top - size * 0.36, size },
  ];
  if (index === total - 1) {
    anchors.push({
      x: box.cx + box.width / 2 - size * 0.62,
      y: box.top - size * 0.5,
      size: size * 0.82,
    });
  } else {
    anchors.push({
      x: box.cx + box.width / 2 - size * 0.5,
      y: box.top - size * 0.22,
      size: size * 0.7,
    });
  }
  return anchors;
}
