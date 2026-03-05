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
  <section className="relative">
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(240,235,224,0.06) 0%, #0A0D09 40%)" }} />

    <div className="relative py-20 sm:py-28 overflow-hidden">
      <p
        className="text-center text-sm sm:text-base uppercase font-sans font-medium mb-14"
        style={{ letterSpacing: "0.3em", color: "rgba(160,144,112,0.5)", fontFamily: "'Montserrat', sans-serif" }}
      >
        Our Brands
      </p>

      <div className="relative">
        <div className="flex animate-scroll" style={{ width: "max-content" }}>
          {[...brands, ...brands].map((b, i) => (
            <div key={i} className="flex-shrink-0 px-10 sm:px-16 lg:px-20">
              <img
                src={b.src}
                alt={b.alt}
                className="h-24 sm:h-40 lg:h-56 w-auto object-contain transition-opacity duration-300 opacity-50 hover:opacity-90"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-40 pointer-events-none" style={{ background: "linear-gradient(90deg, #0A0D09, transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-40 pointer-events-none" style={{ background: "linear-gradient(270deg, #0A0D09, transparent)" }} />
      </div>
    </div>
  </section>
);

export default BrandCarousel;
