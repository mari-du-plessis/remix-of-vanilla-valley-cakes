import galleryFloral70 from "@/assets/gallery-floral70.jpg";
import galleryOhBaby from "@/assets/gallery-ohbaby.jpg";
import galleryCongrats from "@/assets/gallery-congrats.jpg";
import galleryMinnie from "@/assets/gallery-minnie.jpg";
import galleryPopart from "@/assets/gallery-popart.jpg";
import galleryConrad from "@/assets/gallery-conrad.jpg";

/**
 * Launch imagery shown in the homepage ribbon only while the managed gallery
 * is still empty. As soon as a photo is uploaded in Admin → Gallery, the
 * database becomes the single source of truth and this list is unused.
 */
export const RIBBON_FALLBACK = [
  { key: "floral70", src: galleryFloral70, alt: "Floral 70th birthday cake" },
  { key: "ohbaby", src: galleryOhBaby, alt: "Oh Baby baby shower cake" },
  { key: "congrats", src: galleryCongrats, alt: "Congratulations celebration cake" },
  { key: "minnie", src: galleryMinnie, alt: "Character themed birthday cake" },
  { key: "popart", src: galleryPopart, alt: "Pop-art styled celebration cake" },
  { key: "conrad", src: galleryConrad, alt: "Personalised named birthday cake" },
];
