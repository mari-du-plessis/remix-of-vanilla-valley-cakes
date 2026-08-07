import type { InspirationRequest } from "./schema";

/**
 * AI Inspiration Preview.
 *
 * A second, deliberately different preview: where the SVG renderer shows the
 * exact configuration, this asks the AI gateway for an elegant artistic
 * interpretation of the same cake. Only cake information reaches the prompt —
 * the request contract has no customer, contact, delivery, pricing, quote or
 * calendar fields at all.
 *
 * The generated PNG is uploaded to storage and only its URL travels back to
 * the browser, so the image can be saved against the order and reused later by
 * quote PDFs.
 */

const STYLE = [
  "Elegant, luxury, minimal editorial illustration of a single handcrafted celebration cake.",
  "Handmade artisan patisserie feel, soft natural light, matte black and warm neutral backdrop,",
  "natural wood cake board, subtle warm gold accents, soft green foliage where flowers are used.",
  "Centred product composition, generous negative space, no text, no lettering, no watermarks,",
  "no people, no hands, no cartoon styling, no bright saturated colours.",
].join(" ");

function buildPrompt(input: InspirationRequest): string {
  const lines = [
    `Product: ${input.product || "celebration cake"}`,
    input.shape ? `Shape: ${input.shape}` : null,
    input.size ? `Size: ${input.size}` : null,
    `Tiers: ${input.tierCount}`,
    input.flavours.length ? `Sponge flavours: ${input.flavours.join(", ")}` : null,
    input.fillings.length ? `Fillings: ${input.fillings.join(", ")}` : null,
    input.icing ? `Finish: ${input.icing}` : null,
    input.decorations.length ? `Decorations: ${input.decorations.join(", ")}` : null,
    input.message ? `Short message piped on the cake: "${input.message}"` : null,
    input.notes ? `Additional cake notes: ${input.notes}` : null,
  ].filter(Boolean);

  return `${STYLE}\n\nCake to illustrate:\n${lines.join("\n")}`;
}

/** Calls the gateway and returns the raw PNG bytes. */
async function renderPng(input: InspirationRequest): Promise<Uint8Array> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project yet.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
      messages: [{ role: "user", content: buildPrompt(input) }],
      modalities: ["image", "text"],
    }),
  });

  if (response.status === 429)
    throw new Error("The inspiration studio is busy — please try again shortly.");
  if (response.status === 402)
    throw new Error("AI credits are exhausted for this workspace.");
  if (!response.ok) throw new Error(`Inspiration preview failed (${response.status})`);

  const payload = (await response.json()) as { data?: { b64_json?: string }[] };
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) throw new Error("The AI did not return an illustration.");

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Generates the illustration and stores it, returning its public URL. */
export async function createInspirationPreview(input: InspirationRequest): Promise<string> {
  const bytes = await renderPng(input);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const path = `ai/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const { error } = await supabaseAdmin.storage
    .from("inspiration-photos")
    .upload(path, bytes, { contentType: "image/png", upsert: false });
  if (error) throw new Error("We couldn't save the inspiration preview.");

  return supabaseAdmin.storage.from("inspiration-photos").getPublicUrl(path).data.publicUrl;
}
