import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, generateAssetSvg } from "./assets.server";
import { generateAssetSchema } from "./schema";

/**
 * Cake builder AI helpers. Thin wrappers only — the prompt, the gateway call
 * and the admin check live in `assets.server.ts`.
 */
export const generateCakeAssetSvg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => generateAssetSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    return { svg: await generateAssetSvg(data) };
  });
