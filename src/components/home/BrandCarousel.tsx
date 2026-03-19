import { Link } from "react-router-dom";

import alwaysFaded from "@/assets/brands/always-faded.png";
import backpackboyz from "@/assets/brands/backpackboyz-new.png";
import caliClouds from "@/assets/brands/cali-clouds-club.png";
import cupsStrainz from "@/assets/brands/cups-strainz.png";
import donMerfos from "@/assets/brands/don-merfos.png";
import friday from "@/assets/brands/friday.png";
import frutaz from "@/assets/brands/frutaz.png";
import fumi from "@/assets/brands/fumi.png";
import grumpus from "@/assets/brands/grumpus.png";
import hb from "@/assets/brands/hb.png";
import highMart from "@/assets/brands/high-mart.png";
import highMonkey from "@/assets/brands/high-monkey.png";
import highTolerance from "@/assets/brands/high-tolerance.png";
import highflix from "@/assets/brands/highflix.png";
import julatoNyc from "@/assets/brands/julato-nyc.png";
import kandyDepo from "@/assets/brands/kandy-depo.png";
import kushFactory from "@/assets/brands/kush-factory.png";
import mameys from "@/assets/brands/mameys.png";
import painNetwork from "@/assets/brands/pain-network.png";
import superCandyBros from "@/assets/brands/super-candy-bros-new.png";
import theCandyShop from "@/assets/brands/the-candy-shop.png";
import zourZop from "@/assets/brands/zour-zop.png";

const LOGOS = [
  { src: alwaysFaded, alt: "Always Faded" },
  { src: backpackboyz, alt: "BackPackBoyz" },
  { src: caliClouds, alt: "Cali Clouds Club" },
  { src: cupsStrainz, alt: "Cups Strainz" },
  { src: donMerfos, alt: "Don Merfos" },
  { src: friday, alt: "Friday" },
  { src: frutaz, alt: "Frutaz" },
  { src: fumi, alt: "Fumi" },
  { src: grumpus, alt: "Grumpus" },
  { src: hb, alt: "HB" },
  { src: highMart, alt: "High Mart" },
  { src: highMonkey, alt: "High Monkey" },
  { src: highTolerance, alt: "High Tolerance" },
  { src: highflix, alt: "Highflix" },
  { src: julatoNyc, alt: "Julato NYC" },
  { src: kandyDepo, alt: "Kandy Depo" },
  { src: kushFactory, alt: "Kush Factory" },
  { src: mameys, alt: "Mameys" },
  { src: painNetwork, alt: "Pain Network" },
  { src: superCandyBros, alt: "Super Candy Bros" },
  { src: theCandyShop, alt: "The Candy Shop" },
  { src: zourZop, alt: "Zour Zop" },
];

export { LOGOS };

const BrandCarousel = () => {
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <section className="relative py-12 overflow-hidden" style={{ background: "#0A0D09" }}>
      <div className="text-center mb-8">
        <p
          className="font-sans font-medium mb-4"
          style={{
            fontSize: 14,
            letterSpacing: "0.3em",
            color: "#F0EBE0",
            fontFamily: "'Montserrat', sans-serif",
            textTransform: "uppercase",
          }}
        >
          Our Brands
        </p>
        <Link
          to="/brands"
          className="inline-block text-[11px] uppercase px-8 py-3 font-sans font-semibold transition-all duration-300"
          style={{
            letterSpacing: "0.15em",
            background: "linear-gradient(135deg, #B8962E 0%, #D4AF37 100%)",
            color: "#FFFFFF",
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(212, 175, 55, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 20px rgba(212, 175, 55, 0.3)";
          }}
        >
          View All Brands
        </Link>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0A0D09, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #0A0D09, transparent)" }} />

        <div className="flex items-center gap-14 animate-marquee">
          {doubled.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className="h-16 sm:h-20 w-auto object-contain shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;
