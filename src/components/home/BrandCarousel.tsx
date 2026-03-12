import backpackboyz from "@/assets/brands/backpackboyz-new.png";
import superCandyBros from "@/assets/brands/super-candy-bros-new.png";
import alwaysFaded from "@/assets/brands/always-faded.png";
import kushFactory from "@/assets/brands/kush-factory.png";
import highTolerance from "@/assets/brands/high-tolerance.png";
import zourZop from "@/assets/brands/zour-zop.png";
import frutaz from "@/assets/brands/frutaz.png";
import donMerfos from "@/assets/brands/don-merfos.png";
import fumi from "@/assets/brands/fumi.png";
import caliCloudsClub from "@/assets/brands/cali-clouds-club.png";
import cupsStrainz from "@/assets/brands/cups-strainz.png";
import julatoNyc from "@/assets/brands/julato-nyc.png";

const brands = [
  { src: backpackboyz, alt: "BackPackBoyz" },
  { src: superCandyBros, alt: "Super Candy Bros" },
  { src: alwaysFaded, alt: "Always Faded" },
  { src: kushFactory, alt: "Kush Factory" },
  { src: highTolerance, alt: "High Tolerance" },
  { src: zourZop, alt: "Zour Zop" },
  { src: frutaz, alt: "Frutaz" },
  { src: donMerfos, alt: "Don Merfos" },
  { src: fumi, alt: "Fumi" },
  { src: caliCloudsClub, alt: "Cali Clouds Club" },
  { src: cupsStrainz, alt: "Cups Strainz" },
  { src: julatoNyc, alt: "Julato NYC" },
];

const BrandCarousel = () => (
  <section className="relative bg-white py-[60px]">
    {/* Gold divider line */}
    <div className="flex justify-center mb-6">
      <div style={{ width: 100, height: 1, backgroundColor: "rgba(197, 163, 85, 0.3)" }} />
    </div>

    {/* Heading */}
    <p
      className="text-center font-sans font-medium mb-8 sm:mb-10"
      style={{
        fontSize: 14,
        letterSpacing: "0.3em",
        color: "#1a1a1a",
        fontFamily: "'Montserrat', sans-serif",
        textTransform: "uppercase",
      }}
    >
      Our Brands
    </p>

    {/* Logos row */}
    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 px-4 sm:px-8">
      {brands.map((b, i) => (
        <div
          key={i}
          className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
        >
          <img
            src={b.src}
            alt={b.alt}
            className="object-contain"
            style={{ height: 45, width: "auto", maxWidth: 120 }}
            loading="lazy"
            width="120"
            height="45"
          />
        </div>
      ))}
    </div>
  </section>
);

export default BrandCarousel;
