import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { GenerateAssetInput } from "./schema";

type Client = SupabaseClient<Database>;

/**
 * AI bootstrap for the SVG asset library.
 *
 * When an appearance token has no artwork yet, the bakery should still see a
 * sensible illustration rather than a gap. This helper asks the AI gateway for
 * a single, clean vector piece in the established cake-builder style and hands
 * the raw SVG back; storing it stays with the existing admin write path so
 * there is one place assets are created.
 */

const SLOT_GUIDANCE: Record<string, string> = {
  "tier-body": "a side elevation of one cake tier, filling the whole viewBox edge to edge",
  "tier-finish": "an icing/finish overlay that sits on top of a tier, edge to edge",
  drip: "a drip running down from the top edge, anchored to the top of the viewBox",
  border: "a thin repeating border strip that runs along the base of a tier",
  cluster: "a compact decorative cluster that tucks into the side of a tier",
  scatter: "small elements scattered loosely across a tier face",
  topper: "a single decorative topper standing above the cake",
  text: "a plain plaque shape for a short message",
  board: "a cake board seen from the side",
};

const STYLE = [
  "Flat, elegant vector illustration in a luxury South African patisserie style.",
  "Matte black, cream, warm gold, natural wood and soft green palette.",
  "No photorealism, no gradients meshes, no text, no drop shadows, no background.",
  "Use the CSS variables var(--cake-icing), var(--cake-sponge), var(--cake-gold),",
  "var(--cake-leaf), var(--cake-flower), var(--cake-shade) for fills where sensible.",
].join(" ");

const SVG_RE = /<svg[\s\S]*<\/svg>/i;

export async function generateAssetSvg(input: GenerateAssetInput): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project yet.");

  const guidance = SLOT_GUIDANCE[input.slot] ?? "a single reusable decorative element";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        {
          role: "system",
          content:
            "You output a single standalone SVG document and nothing else. " +
            "No markdown fences, no commentary. The SVG must have a viewBox, " +
            "a transparent background and must not contain script or event attributes.",
        },
        {
          role: "user",
          content: `Draw "${input.label}" for a cake builder illustration: ${guidance}. ${STYLE}`,
        },
      ],
    }),
  });

  if (response.status === 429) throw new Error("AI is busy right now — please retry shortly.");
  if (response.status === 402) throw new Error("AI credits are exhausted for this workspace.");
  if (!response.ok) throw new Error(`AI request failed (${response.status})`);

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content ?? "";
  const svg = SVG_RE.exec(content)?.[0];
  if (!svg) throw new Error("The AI did not return usable SVG artwork.");

  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .trim();
}

/** Generation is an admin-only tool, never something a visitor can trigger. */
export async function assertAdmin(supabase: Client, userId: string): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Admin access required.");
}
