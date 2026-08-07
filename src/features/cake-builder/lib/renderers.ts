import type { ComponentType } from "react";
import type { CakeAsset, CakeDesign } from "../types";
import { SideElevationRenderer } from "../components/renderers/SideElevationRenderer";

/**
 * View-agnostic rendering contract.
 *
 * The cake data model (`CakeDesign`) never encodes how a cake is drawn, so new
 * views — top-down, isometric, photo-real — can be added by registering another
 * renderer here. Everything upstream keeps working unchanged.
 */
export type CakeRendererProps = {
  design: CakeDesign;
  assets: CakeAsset[];
  className?: string;
};

export type CakeView = "side";

export const CAKE_RENDERERS: Record<CakeView, ComponentType<CakeRendererProps>> = {
  side: SideElevationRenderer,
};

export const DEFAULT_CAKE_VIEW: CakeView = "side";

export const rendererFor = (view: CakeView = DEFAULT_CAKE_VIEW) =>
  CAKE_RENDERERS[view] ?? SideElevationRenderer;
