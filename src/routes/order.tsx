import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check, Upload, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  WHATSAPP_NUMBER, BAKERY_NAME, OCCASIONS, SIZES, FLAVOURS, FILLINGS, EXTRAS, getPairing,
} from "@/lib/order-config";

export const Route = createFileRoute("/order")({
  component: OrderPage,
});

type Tier = { flavour: string; filling: string };

type FormState = {
  occasion: string;
  size: string;
  flavour: string;
  filling: string;
  tiers: Tier[];
  extras: string[];
  inspirationFile: File | null;
  inspirationPreview: string;
  eventDate: string;
  budget: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

const initial: FormState = {
  occasion: "", size: "", flavour: "", filling: "", tiers: [], extras: [],
  inspirationFile: null, inspirationPreview: "",
  eventDate: "", budget: "", name: "", phone: "", email: "", notes: "",
};

const tierCount = (sizeId: string) => (sizeId === "tier2" ? 2 : sizeId === "tier3" ? 3 : 0);
const tierLabel = (i: number, total: number) => {
  if (total === 2) return i === 0 ? "Top tier" : "Bottom tier";
  if (total === 3) return ["Top tier", "Middle tier", "Bottom tier"][i];
  return `Tier ${i + 1}`;
};

const STEPS = ["Occasion", "Cake", "Details", "Contact"];

function OrderPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleExtra = (e: string) =>
    update("extras", form.extras.includes(e) ? form.extras.filter(x => x !== e) : [...form.extras, e]);

  const handleInspirationChange = (file: File | null) => {
    setForm((f) => {
      if (f.inspirationPreview) URL.revokeObjectURL(f.inspirationPreview);
      return {
        ...f,
        inspirationFile: file,
        inspirationPreview: file ? URL.createObjectURL(file) : "",
      };
    });
  };

  const setSize = (id: string) => {
    const n = tierCount(id);
    setForm((f) => ({
      ...f,
      size: id,
      tiers: n > 0
        ? Array.from({ length: n }, (_, i) => f.tiers[i] ?? { flavour: "", filling: "" })
        : [],
    }));
  };

  const setTier = (i: number, key: keyof Tier, v: string) =>
    setForm((f) => ({
      ...f,
      tiers: f.tiers.map((t, idx) => (idx === i ? { ...t, [key]: v } : t)),
    }));

  const setTierFlavour = (i: number, name: string) => {
    const pairing = getPairing(name);
    setForm((f) => ({
      ...f,
      tiers: f.tiers.map((t, idx) =>
        idx === i ? { flavour: name, filling: pairing ?? "" } : t,
      ),
    }));
  };

  const setFlavour = (name: string) => {
    const pairing = getPairing(name);
    setForm((f) => ({ ...f, flavour: name, filling: pairing ?? "" }));
  };

  const canNext = () => {
    if (step === 0) return !!form.occasion;
    if (step === 1) {
      if (!form.size) return false;
      if (tierCount(form.size) > 0) {
        return form.tiers.length === tierCount(form.size) &&
          form.tiers.every((t) => t.flavour && t.filling);
      }
      return !!form.flavour && !!form.filling;
    }
    if (step === 2) return !!form.eventDate;
    return !!form.name && !!form.phone;
  };

  const uploadInspiration = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("inspiration-photos")
      .upload(safeName, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("Inspiration upload failed", error);
      return null;
    }
    const { data } = supabase.storage.from("inspiration-photos").getPublicUrl(safeName);
    return data.publicUrl;
  };

  const submit = async () => {
    if (!form.name || !form.phone) {
      toast.error("Please add your name and phone number");
      return;
    }
    setSubmitting(true);

    let photoLine: string | null = null;
    if (form.inspirationFile) {
      const t = toast.loading("Uploading inspiration photo…");
      const url = await uploadInspiration(form.inspirationFile);
      toast.dismiss(t);
      photoLine = url
        ? `*Inspiration photo:* ${url}`
        : `*Inspiration photo:* ${form.inspirationFile.name} (upload failed — please send on WhatsApp)`;
    }

    const lines = [
      `🎂 *New Cake Order — ${BAKERY_NAME}*`,
      ``,
      `*Occasion:* ${form.occasion}`,
      `*Size:* ${SIZES.find(s => s.id === form.size)?.label ?? form.size}`,
      ...(form.tiers.length > 0
        ? form.tiers.map((t, i) => `*${tierLabel(i, form.tiers.length)}:* ${t.flavour} with ${t.filling}`)
        : [`*Flavour:* ${form.flavour}`, `*Filling:* ${form.filling}`]),
      form.extras.length ? `*Extras:* ${form.extras.join(", ")}` : null,
      photoLine,
      `*Event date:* ${form.eventDate}`,
      form.budget ? `*Budget:* R${form.budget}` : null,
      ``,
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      form.email ? `*Email:* ${form.email}` : null,
      form.notes ? `\n*Notes:* ${form.notes}` : null,
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp…");
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen px-6 py-8 max-w-xl mx-auto">
      <Toaster />
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="text-muted-foreground inline-flex items-center text-sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Home
        </Link>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">{BAKERY_NAME}</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            <p className={`text-[10px] mt-2 tracking-wider uppercase ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-3xl p-6 border border-border/60 shadow-[var(--shadow-soft)]">
        {step === 0 && (
          <section className="space-y-5">
            <h2 className="text-3xl">What's the occasion?</h2>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => update("occasion", o)}
                  className={`p-4 rounded-2xl border text-sm text-left transition-all ${
                    form.occasion === o
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-6">
            <h2 className="text-3xl">Design your cake</h2>

            <div>
              <Label className="mb-3 block">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSize(s.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      form.size === s.id
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.serves}</p>
                  </button>
                ))}
              </div>
            </div>

            {form.tiers.length > 0 ? (
              <div className="space-y-5">
                {form.tiers.map((t, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-border/70 bg-background/50 space-y-4">
                    <p className="text-sm font-medium tracking-wide uppercase text-primary">
                      {tierLabel(i, form.tiers.length)}
                    </p>
                    <div>
                      <Label className="mb-2 block text-xs">Flavour</Label>
                      <div className="flex flex-wrap gap-2">
                        {FLAVOURS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setTier(i, "flavour", f)}
                            className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                              t.flavour === f
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/40"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block text-xs">Filling</Label>
                      <div className="flex flex-wrap gap-2">
                        {FILLINGS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setTier(i, "filling", f)}
                            className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                              t.filling === f
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/40"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div>
                  <Label className="mb-3 block">Flavour</Label>
                  <div className="flex flex-wrap gap-2">
                    {FLAVOURS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => update("flavour", f)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                          form.flavour === f
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Filling</Label>
                  <div className="flex flex-wrap gap-2">
                    {FILLINGS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => update("filling", f)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                          form.filling === f
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <Label className="mb-3 block">Extras (optional)</Label>
              <div className="space-y-2">
                {EXTRAS.map((e) => (
                  <label
                    key={e}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer"
                  >
                    <Checkbox
                      checked={form.extras.includes(e)}
                      onCheckedChange={() => toggleExtra(e)}
                    />
                    <span className="text-sm">{e}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <h2 className="text-3xl">The details</h2>

            <div>
              <Label htmlFor="inspiration" className="mb-2 block">Inspiration photo (optional)</Label>
              <label
                htmlFor="inspiration"
                className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/60 transition-colors text-sm text-muted-foreground"
              >
                <Upload className="h-4 w-4" />
                {form.inspirationFile?.name || "Tap to upload an image"}
              </label>
              <input
                id="inspiration"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleInspirationChange(e.target.files?.[0] ?? null)}
              />
              {form.inspirationPreview && (
                <div className="mt-3">
                  <img
                    src={form.inspirationPreview}
                    alt="Inspiration preview"
                    className="h-32 w-32 object-cover rounded-xl border border-border"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="date" className="mb-2 block">Event date</Label>
              <Input
                id="date"
                type="date"
                value={form.eventDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => update("eventDate", e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="budget" className="mb-2 block">Budget (ZAR)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                <Input
                  id="budget"
                  type="number"
                  inputMode="numeric"
                  placeholder="800"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="h-12 rounded-xl pl-8"
                />
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-5">
            <h2 className="text-3xl">Your details</h2>

            <div>
              <Label htmlFor="name" className="mb-2 block">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12 rounded-xl" placeholder="Lerato Dlamini" />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2 block">Phone (WhatsApp)</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-12 rounded-xl" placeholder="082 123 4567" />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block">Email (optional)</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12 rounded-xl" placeholder="you@example.co.za" />
            </div>
            <div>
              <Label htmlFor="notes" className="mb-2 block">Anything else?</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} className="rounded-xl min-h-24" placeholder="Allergies, colour palette, delivery area…" />
            </div>
          </section>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-12 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => canNext() ? setStep(step + 1) : toast.error("Please complete this step")}
            className="flex-1 h-12 rounded-full"
            disabled={!canNext()}
          >
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={submit} className="flex-1 h-12 rounded-full" disabled={!canNext() || submitting}>
            <MessageCircle className="h-4 w-4 mr-2" /> {submitting ? "Sending…" : "Send via WhatsApp"}
          </Button>
        )}
      </div>

      {step === STEPS.length - 1 && (
        <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
          <Check className="h-3 w-3" /> We'll reply within 24 hours to confirm
        </p>
      )}
    </main>
  );
}
