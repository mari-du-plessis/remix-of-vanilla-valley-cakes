import { rendererFor, type CakeRendererProps, type CakeView } from "../lib/renderers";

/**
 * CakePreview — the single entry point every screen uses to draw a cake.
 *
 * It picks a renderer from the registry rather than owning drawing logic, so
 * customer builder, admin preview lab and any future view all stay in sync.
 */
export function CakePreview({ view, ...props }: CakeRendererProps & { view?: CakeView }) {
  const Renderer = rendererFor(view);
  return <Renderer {...props} />;
}
