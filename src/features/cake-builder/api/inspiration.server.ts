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

/**
 * Deliberately illustrative. The concept must communicate a design idea, never
 * read as a photograph the finished handcrafted cake could be measured against.
 */
const STYLE = [
  "A premium isometric 3D concept illustration of a single celebration cake,",
  "stylised digital design artwork for a luxury bakery design tool.",
  "Clean vector-like rendering, soft flat shading, gentle ambient occlusion, slightly simplified",
  "geometry, elegant matte finish, warm neutral studio-free backdrop, natural wood cake board,",
  "generous negative space, centred composition.",
  "It must NOT be a photograph, photorealistic food photography, a studio product shot or a",
  "hyper-realistic render. No shallow depth of field, no lens blur, no camera grain, no",
  "photographic textures. No text, no lettering, no watermarks, no people, no hands.",
].join(" ");

const TREATMENTS: Record<string, string> = {
  solid: "Solid colour per tier",
  ombre: "Ombre — colours blending progressively between shades, not one flat colour",
  "fault-line": "Fault line — a revealed decorative band running around the cake",
};

function buildPrompt(input: InspirationRequest): string {
  const tierColours = input.tierColours
    .map((colour, i) => (colour ? `tier ${i + 1} (bottom-up): ${colour}` : null))
    .filter(Boolean);

  const lines = [
    `Product: ${input.product || "celebration cake"}`,
    input.shape ? `Shape: ${input.shape}` : null,
    input.size ? `Size: ${input.size}` : null,
    `Tiers: ${input.tierCount}`,
    input.flavours.length ? `Sponge flavours: ${input.flavours.join(", ")}` : null,
    input.fillings.length ? `Fillings: ${input.fillings.join(", ")}` : null,
    input.icing ? `Finish: ${input.icing}` : null,
    `Colour treatment: ${TREATMENTS[input.colourTreatment] ?? TREATMENTS["solid"]}`,
    tierColours.length ? `Per-tier colours: ${tierColours.join("; ")}` : null,
    input.decorations.length ? `Decorations: ${input.decorations.join(", ")}` : null,
    input.decorationColours.length
      ? `Decoration colours (independent of the cake colour): ${input.decorationColours
          .map((c) => `${c.label}: ${c.value}`)
          .join("; ")}`
      : null,
    input.topperStyle ? `Topper style: ${input.topperStyle}` : null,
    input.topperColour ? `Topper colour: ${input.topperColour}` : null,
    input.topperWording
      ? `Topper wording (show as an approximate, unreadable stylised topper only): "${input.topperWording}"`
      : null,
    input.message ? `Short message piped on the cake: "${input.message}"` : null,
    input.notes ? `Additional appearance notes from the customer: ${input.notes}` : null,
  ].filter(Boolean);

  /**
   * Colour source priority. Stated colours win over the photo, so the concept
   * can never invent a scheme the customer did not ask for.
   */
  const priority = [
    "Colour rules, in strict priority order:",
    "1. Use the stated per-tier colours exactly where they are given.",
    "2. Use the stated decoration colours exactly; decorations never inherit the cake colour.",
    "3. Where a colour is not stated, take it from the attached inspiration photo.",
    "4. Otherwise follow the customer's appearance notes.",
    "Never invent a different colour scheme from the one described.",
  ].join("\n");

  return `${STYLE}\n\nCake to illustrate:\n${lines.join("\n")}\n\n${priority}`;
}

/**
 * Message content for the model. When the customer uploaded a reference photo
 * it is passed alongside the written brief, so the concept follows the style
 * they had in mind rather than the words alone.
 */
function buildContent(input: InspirationRequest) {
  const text = buildPrompt(input);
  if (!input.inspirationImageUrl) return text;
  return [
    {
      type: "text",
      text: `${text}\n\nUse the attached photo as a colour and styling reference for anything the brief does not state. Keep the result a stylised isometric concept illustration — do not copy it photographically.`,
    },
    { type: "image_url", image_url: { url: input.inspirationImageUrl } },
  ];
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
      messages: [{ role: "user", content: buildContent(input) }],
      modalities: ["image", "text"],
    }),
  });

  if (response.status === 429)
    throw new Error("The inspiration studio is busy — please try again shortly.");
  if (response.status === 402) throw new Error("AI credits are exhausted for this workspace.");
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
