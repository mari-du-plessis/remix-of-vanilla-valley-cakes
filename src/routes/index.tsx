import { createFileRoute, Link } from "@tanstack/react-router";
import heroCake from "@/assets/hero-cake.jpg";
import logo from "@/assets/logo.jpg";
import galleryCookie from "@/assets/gallery-cookie.jpg";
import galleryOhBaby from "@/assets/gallery-ohbaby.jpg";
import galleryGrinch from "@/assets/gallery-grinch.jpg";
import galleryFloral70 from "@/assets/gallery-floral70.jpg";
import galleryConrad from "@/assets/gallery-conrad.jpg";
import galleryPopArt from "@/assets/gallery-popart.jpg";
import galleryLoanco from "@/assets/gallery-loanco.jpg";
import { Button } from "@/components/ui/button";
import { Cake, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
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
];

function Index() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
        <img
          src={logo}
          alt="Vanilla Valley bakery logo"
          width={160}
          height={160}
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
        />
        <p className="text-xs text-muted-foreground mt-1">Artisan Bakery · South Africa</p>
      </header>

      {/* Hero */}
      <section className="px-6 pt-4 pb-10">
        <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-soft)]">
          <img
            src={heroCake}
            alt="Elegant tiered cake with blush florals"
            width={1280}
            height={1280}
            className="w-full h-[60vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        </div>

        <div className="text-center mt-8">
          <h1 className="text-4xl sm:text-5xl leading-[1.1] text-foreground">
            Cakes baked with<br /><em className="text-primary not-italic">love &amp; vanilla</em>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Custom cakes for life's sweetest moments. Tell us your dream — we'll bring it to the table.
          </p>
          <Link to="/order" className="block mt-7">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-10 h-14 text-base shadow-[var(--shadow-soft)]">
              <Cake className="mr-2 h-5 w-5" />
              Start Your Order
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-8">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Heart, label: "Made to order" },
            { icon: Sparkles, label: "Premium ingredients" },
            { icon: Cake, label: "Bespoke designs" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-card rounded-2xl p-4 border border-border/60">
              <Icon className="h-5 w-5 mx-auto text-primary" />
              <p className="text-xs mt-2 text-muted-foreground leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery — moving ribbon */}
      <section className="py-10 overflow-hidden">
        <h2 className="text-3xl text-center mb-6 px-6">Recent creations</h2>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max gap-4 animate-marquee">
            {[...gallery, ...gallery].map((img, i) => (
              <div
                key={i}
                className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] shrink-0"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-12 text-center">
        <h2 className="text-3xl">Ready to design yours?</h2>
        <p className="mt-3 text-muted-foreground">Send us your details — we reply on WhatsApp within 24 hours.</p>
        <Link to="/order" className="block mt-6">
          <Button size="lg" className="w-full rounded-full h-14">Start Your Order</Button>
        </Link>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground border-t border-border/60">
        <p>© {new Date().getFullYear()} Vanilla Valley Bakery</p>
        <p className="mt-1">Made with love in South Africa</p>
      </footer>
    </main>
  );
}
