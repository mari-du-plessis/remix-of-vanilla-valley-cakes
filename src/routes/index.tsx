import { createFileRoute, Link } from "@tanstack/react-router";
import heroCake from "@/assets/hero-cake.jpg";
import galleryCookie from "@/assets/gallery-cookie.jpg";
import galleryOhBaby from "@/assets/gallery-ohbaby.jpg";
import galleryGrinch from "@/assets/gallery-grinch.jpg";
import galleryFloral70 from "@/assets/gallery-floral70.jpg";
import galleryConrad from "@/assets/gallery-conrad.jpg";
import galleryPopArt from "@/assets/gallery-popart.jpg";
import galleryLoanco from "@/assets/gallery-loanco.jpg";
import galleryFastOne from "@/assets/gallery-fastone.jpg";
import galleryCongrats from "@/assets/gallery-congrats.jpg";
import galleryMinnie from "@/assets/gallery-minnie.jpg";
import galleryBoago from "@/assets/gallery-boago.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow, Lead } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
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

const gallery = [
  { src: galleryCookie, alt: "Cookies & milk first birthday cake" },
  { src: galleryOhBaby, alt: "Oh Baby teddy bear baby shower cake" },
  { src: galleryGrinch, alt: "Grinch Christmas themed cake" },
  { src: galleryFloral70, alt: "Pink floral 70th birthday cake with cupcakes" },
  { src: galleryConrad, alt: "Ferdinand the bull themed birthday cake" },
  { src: galleryPopArt, alt: "Pop art comic book I Love You cake" },
  { src: galleryLoanco, alt: "Blue puppy themed first birthday cake" },
  { src: galleryFastOne, alt: "Fast One race car themed first birthday cake" },
  { src: galleryCongrats, alt: "Black and gold graduation congrats cake" },
  { src: galleryMinnie, alt: "Pink Minnie Mouse second birthday cake" },
  { src: galleryBoago, alt: "Two-tier construction trucks themed birthday cake" },
];

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
                Tell us the occasion and we will design a cake around it — quietly
                luxurious, entirely yours.
              </Lead>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/order">
                  <Button size="lg" className="h-14 rounded-full px-10 text-sm tracking-[0.18em] uppercase">
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

      {/* Gallery ribbon */}
      <section className="overflow-hidden py-16">
        <div className="px-6 text-center">
          <Eyebrow className="text-primary">The portfolio</Eyebrow>
          <h2 className="mt-4">Recent creations</h2>
          <div className="gold-rule mx-auto mt-6 max-w-[8rem]" />
        </div>
        <div className="relative mt-10 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee gap-5">
            {[...gallery, ...gallery].map((img, i) => (
              <figure
                key={i}
                className="h-64 w-64 shrink-0 overflow-hidden rounded-2xl border border-border/60 shadow-[var(--shadow-soft)] sm:h-72 sm:w-72"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </figure>
            ))}
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/gallery"
            className="eyebrow text-[0.65rem] text-muted-foreground transition-colors hover:text-primary"
          >
            See the full gallery →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-4">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-[image:var(--gradient-warm)] p-12 text-center shadow-[var(--shadow-soft)]">
          <Eyebrow className="text-primary">Begin</Eyebrow>
          <h2 className="mt-4">Ready to design yours?</h2>
          <Lead className="mx-auto mt-4 max-w-md">
            Share the details and we will reply on WhatsApp with a quotation.
          </Lead>
          <Link to="/order" className="mt-8 inline-block">
            <Button size="lg" className="h-14 rounded-full px-12 text-sm tracking-[0.18em] uppercase">
              Start your order
            </Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
