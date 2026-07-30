import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OrderFormState } from "../types";

type ContactStepProps = {
  form: OrderFormState;
  onChange: <K extends keyof OrderFormState>(key: K, value: OrderFormState[K]) => void;
};

export function ContactStep({ form, onChange }: ContactStepProps) {
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
    </section>
  );
}
