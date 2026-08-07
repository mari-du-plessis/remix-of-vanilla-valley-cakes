import { Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Muted } from "@/components/common/Typography";
import type { InspirationConcept } from "../hooks/useInspirationConcept";
import type { OrderFormState } from "../types";

type ContactStepProps = {
  form: OrderFormState;
  onChange: <K extends keyof OrderFormState>(key: K, value: OrderFormState[K]) => void;
  /** Background AI concept, generated while this step is on screen. */
  concept?: InspirationConcept;
};

export function ContactStep({ form, onChange, concept }: ContactStepProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-3xl">Your details</h2>

      <div>
        <Label htmlFor="name" className="mb-2 block">Full name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="h-12 rounded-xl"
          placeholder="Lerato Dlamini"
        />
      </div>
      <div>
        <Label htmlFor="phone" className="mb-2 block">Phone (WhatsApp)</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          className="h-12 rounded-xl"
          placeholder="082 123 4567"
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-2 block">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="h-12 rounded-xl"
          placeholder="you@example.co.za"
        />
      </div>
      <div>
        <Label htmlFor="notes" className="mb-2 block">Anything else?</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          className="rounded-xl min-h-24"
          placeholder="Allergies, colour palette, delivery area…"
        />
      </div>

      {concept && concept.status !== "idle" && (
        <ConceptPanel concept={concept} />
      )}
    </section>
  );
}

/**
 * Subtle in-step presentation of the AI concept: a quiet loading line while it
 * renders, then the artwork with an opt-out for the WhatsApp message. The image
 * is always saved to the order, whether or not it is shared.
 */
function ConceptPanel({ concept }: { concept: InspirationConcept }) {
  return (
    <div className="surface-card rounded-2xl border border-border/60 p-4">
      <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-primary">
        <Sparkles className="h-3 w-3" aria-hidden="true" /> AI concept
      </p>

      {concept.status === "pending" && (
        <Muted className="mt-3 flex items-center gap-2 text-[11px]">
          <Loader2 className="h-3 w-3 animate-spin text-primary" aria-hidden="true" />
          Creating an artistic concept of your cake while you finish up…
        </Muted>
      )}

      {concept.status === "failed" && (
        <Muted className="mt-3 text-[11px]">
          We couldn't create the concept this time — your request can still be sent.
        </Muted>
      )}

      {concept.status === "ready" && concept.url && (
        <div className="mt-3 space-y-3 animate-in fade-in duration-500">
          <img
            src={concept.url}
            alt="AI generated artistic interpretation of your cake design"
            className="w-full rounded-xl border border-border/50 object-cover"
            loading="lazy"
          />
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={concept.include}
              onCheckedChange={(v) => concept.setInclude(v === true)}
              className="mt-0.5"
            />
            <span className="leading-snug">
              Include Inspiration Preview in my WhatsApp enquiry
              <Muted className="mt-0.5 block text-[11px]">
                It stays saved with your order either way — this is an artistic guide, not the
                final cake.
              </Muted>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
