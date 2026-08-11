import { createFileRoute, Link } from "@tanstack/react-router";
import heroCake from "@/assets/hero-cake.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow, Lead } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
import { GalleryRibbon } from "@/features/gallery/components/GalleryRibbon";
import { Cake, Leaf, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vanilla Valley — Bespoke Luxury Cakes, South Africa" },
      {
        name: "description",
        content:
          "Bespoke celebration and wedding cakes, crafted to order in South Africa. Design your cake in minutes and request a quotation on WhatsApp.",
      },
      { property: "og:title", content: "Vanilla Valley — Bespoke Luxury Cakes" },
      {
        property: "og:description",
        content: "Bespoke celebration and wedding cakes, crafted to order in South Africa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const craft = [
  {
    icon: Sparkles,
    title: "Made to order",
    copy: "Every cake is designed around your occasion — never off a shelf.",
  },
  {
    icon: Leaf,
    title: "Honest ingredients",
    copy: "Real butter, real vanilla, fresh produce and nothing artificial.",
  },
  {
    icon: Cake,
    title: "Bespoke craftsmanship",
    copy: "Hand-finished tiers, sculpted detail and considered proportion.",
  },
];

function Index() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="px-6 pt-10 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-elevated)]">
            <img
              src={heroCake}
              alt="Elegant tiered celebration cake finished by hand"
              width={1280}
              height={1280}
              className="h-[72vh] w-full object-cover"
            />
            <div className="hero-veil absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-center sm:p-14">
              <Eyebrow className="animate-rise-in text-primary">
                Bespoke cakes · South Africa
              </Eyebrow>
              <h1 className="animate-rise-in mt-5 text-balance">
                Crafted for the <span className="gold-text">moments</span> that matter
              </h1>
              <div className="gold-rule mx-auto mt-7 max-w-[10rem]" />
              <Lead className="animate-rise-in mx-auto mt-6 max-w-lg text-foreground/80">
                Tell us the occasion and we will design a cake around it — quietly luxurious,
                entirely yours.
              </Lead>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/order">
                  <Button
                    size="lg"
                    className="h-14 rounded-full px-10 text-sm tracking-[0.18em] uppercase"
                  >
                    Design your cake
                  </Button>
                </Link>
                <Link to="/gallery">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-full px-10 text-sm tracking-[0.18em] uppercase"
                  >
                    View the gallery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craft */}
      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {craft.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="surface-card lift-on-hover rounded-2xl p-7">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-5 text-sm tracking-[0.12em] uppercase">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Gallery ribbon — curated from the admin-managed gallery */}
      <GalleryRibbon />

      {/* CTA */}
      <section className="px-6 pb-4">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-[image:var(--gradient-warm)] p-12 text-center shadow-[var(--shadow-soft)]">
          <Eyebrow className="text-primary">Begin</Eyebrow>
          <h2 className="mt-4">Ready to design yours?</h2>
          <Lead className="mx-auto mt-4 max-w-md">
            Share the details and we will reply on WhatsApp with a quotation.
          </Lead>
          <Link to="/order" className="mt-8 inline-block">
            <Button
              size="lg"
              className="h-14 rounded-full px-12 text-sm tracking-[0.18em] uppercase"
            >
              Start your order
            </Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
