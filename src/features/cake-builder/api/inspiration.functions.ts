import { createServerFn } from "@tanstack/react-start";
import { createInspirationPreview } from "./inspiration.server";
import { inspirationSchema } from "./schema";

/**
 * Public endpoint: the customer builder is used before anyone signs in.
 * The validator accepts cake information only, so nothing personal can be
 * sent to the model even by a hand-crafted request.
 */
export const generateInspirationPreview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inspirationSchema.parse(data))
  .handler(async ({ data }) => ({ url: await createInspirationPreview(data) }));
