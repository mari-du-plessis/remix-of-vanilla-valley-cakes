import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CANVAS, buildTierBoxes, clusterAnchors } from "../../lib/geometry";
import type { CakeAsset, CakeDesign } from "../../types";
import { AssetLayer } from "../AssetLayer";

/**
 * SideElevationRenderer — the permanent side-elevation view of a cake.
 *
 * It is one implementation of the view-agnostic rendering contract in
 * `lib/renderers.ts`; a future top or isometric renderer plugs in beside it
 * without changing the cake data model.
 *
 * Painting order is enforced here rather than by the z-index stored on each
 * asset, so an asset saved with the wrong number can never end up in front of
 * the topper or behind the board:
 *
 *   board → base → tier 1…5 → icing → decorations → accessories → topper
 *
 * The board is always the foundation: it is drawn first and every decoration
 * is clamped to sit above it, so nothing ever overlaps the board.
 */
export function SideElevationRenderer({
  design,
  assets,
  className,
}: {
  design: CakeDesign;
  assets: CakeAsset[];
  className?: string;
}) {
  const index = useMemo(() => new Map(assets.map((a) => [a.key, a])), [assets]);

  const selected = useMemo(
    () =>
      design.assetKeys
        .map((key) => index.get(key))
        .filter((a): a is CakeAsset => !!a && a.is_active)
        .sort((a, b) => a.z_index - b.z_index),
    [design.assetKeys, index],
  );

  const bySlot = (slot: CakeAsset["slot"]) => selected.filter((a) => a.slot === slot);

  const shape = index.get(design.shapeKey) ?? bySlot("tier-body")[0];
  const boxes = useMemo(
    () => buildTierBoxes(design.tierCount, design.shapeKey),
    [design.tierCount, design.shapeKey],
  );

  const board = bySlot("board")[0];
  const finishes = bySlot("tier-finish");
  const borders = bySlot("border");
  const drips = bySlot("drip");
  const scatters = bySlot("scatter");
  const clusters = bySlot("cluster");
  const toppers = bySlot("topper");
  const plaque = bySlot("text")[0];

  const topBox = boxes[boxes.length - 1]!;
  const bottomBox = boxes[0]!;

  /** The board only supports the cake — nothing decorative may dip into it. */
  const boardTop = CANVAS.baseY - 4;
  const aboveBoard = (y: number, height: number) => Math.min(y, boardTop - height);

  return (
    <svg
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      role="img"
      aria-label={`Live side-elevation preview of a ${design.tierCount} tier cake`}
      className={cn("h-full w-full", className)}
      style={design.colors as React.CSSProperties}
    >
      <defs>
        <filter id="vv-cake-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* 1 — board (always the lowest visual layer) */}
      <g className="cake-board">
        <ellipse
          cx={CANVAS.width / 2}
          cy={CANVAS.baseY + 26}
          rx={150}
          ry={16}
          fill="var(--cake-shade)"
          opacity={0.14}
          filter="url(#vv-cake-soft)"
        />
        <AssetLayer
          asset={board}
          x={CANVAS.width / 2 - 155}
          y={CANVAS.baseY - 12}
          width={310}
          height={72}
        />
      </g>

      {/* 2 — cake base + tier bodies, keyed so a shape or tier change re-animates */}
      <g className="cake-stack" key={`stack-${design.shapeKey}-${design.tierCount}`}>
        {boxes.map((box, i) => {
          const tier = design.tiers[Math.min(i, design.tiers.length - 1)];
          const style = {
            "--cake-sponge": tier?.spongeColor,
            "--cake-filling": tier?.fillingColor,
            "--cake-tier-index": i,
          } as React.CSSProperties;
          const bodyHeight = box.height + box.width * 0.12;

          return (
            <g key={`tier-${i}`} className="cake-tier" style={style}>
              <AssetLayer
                asset={shape}
                x={box.cx - box.width / 2}
                y={box.top}
                width={box.width}
                height={bodyHeight}
                stretch
              />
            </g>
          );
        })}
      </g>

      {/* 3 — icing / finish overlays */}
      <g className="cake-icing">
        {boxes.map((box, i) =>
          finishes.map((asset) => (
            <AssetLayer
              key={`${asset.key}-${i}`}
              className="cake-layer"
              asset={asset}
              x={box.cx - box.width / 2}
              y={box.top}
              width={box.width}
              height={box.height}
              stretch
            />
          )),
        )}
      </g>

      {/* 4 — decorations (scatters, borders, drips, clusters), fading in after the cake */}
      <g className="cake-decorations">
        {boxes.map((box, i) => (
          <g key={`decor-${i}`}>
            {scatters.map((asset) => (
              <AssetLayer
                key={`${asset.key}-${i}`}
                className="cake-layer"
                asset={asset}
                x={box.cx - box.width / 2}
                y={box.top + box.height * 0.12}
                width={box.width}
                height={box.height * 0.8}
              />
            ))}

            {borders.map((asset) => (
              <AssetLayer
                key={`${asset.key}-${i}`}
                className="cake-layer"
                asset={asset}
                x={box.cx - box.width / 2}
                y={Math.min(box.top + box.height - 6, boardTop - 13)}
                width={box.width}
                height={13}
                stretch
              />
            ))}

            {drips.map((asset) => (
              <AssetLayer
                key={`${asset.key}-${i}`}
                className="cake-layer"
                asset={asset}
                x={box.cx - box.width / 2}
                y={box.top + 2}
                width={box.width}
                height={Math.min(52, box.height * 0.55)}
                stretch
              />
            ))}

            {clusters.length > 0 &&
              clusterAnchors(box, i, boxes.length).map((anchor, ai) => (
                <g key={`cluster-${i}-${ai}`}>
                  {clusters.map((asset) => (
                    <AssetLayer
                      key={`${asset.key}-${i}-${ai}`}
                      className="cake-layer"
                      asset={asset}
                      x={anchor.x}
                      y={aboveBoard(anchor.y, anchor.size)}
                      width={anchor.size}
                      height={anchor.size}
                    />
                  ))}
                </g>
              ))}
          </g>
        ))}
      </g>

      {/* 5 — accessories (plaque + message, sculpted number), settling in last */}
      <g className="cake-accessories">
        {design.shapeKey === "shape-number" && (
          <text
            x={bottomBox.cx}
            y={bottomBox.top + bottomBox.height * 0.68}
            textAnchor="middle"
            fontSize={84}
            fontWeight={600}
            fill="var(--cake-gold)"
            opacity={0.9}
          >
            {design.text.slice(0, 3) || "18"}
          </text>
        )}

        {design.text && design.shapeKey !== "shape-number" && (
          <g className="cake-layer">
            {plaque && (
              <AssetLayer
                asset={plaque}
                x={bottomBox.cx - 78}
                y={bottomBox.top + bottomBox.height * 0.32}
                width={156}
                height={44}
                stretch
              />
            )}
            <text
              x={bottomBox.cx}
              y={bottomBox.top + bottomBox.height * 0.32 + 29}
              textAnchor="middle"
              fontSize={19}
              fill="var(--cake-shade)"
              opacity={0.85}
            >
              {design.text.slice(0, 18)}
            </text>
          </g>
        )}
      </g>

      {/* 6 — topper, always the highest layer */}
      <g className="cake-topper">
        {toppers.map((asset, i) => (
          <AssetLayer
            key={asset.key}
            className="cake-layer"
            asset={asset}
            x={topBox.cx - 42 + i * 6}
            y={topBox.top - 88}
            width={84}
            height={84}
          />
        ))}
      </g>
    </svg>
  );
}
