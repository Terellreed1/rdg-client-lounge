import { Link } from "react-router-dom";

import alwaysFaded from "@/assets/brands/always-faded.png";
import mameys from "@/assets/brands/mameys.png";
import fumi from "@/assets/brands/fumi.png";
import kandyDepo from "@/assets/brands/kandy-depo.png";
import espn from "@/assets/brands/espn.png";
import highMart from "@/assets/brands/high-mart.png";
import superCandyBros from "@/assets/brands/super-candy-bros-new.png";
import highflix from "@/assets/brands/highflix.png";
import frutaz from "@/assets/brands/frutaz.png";
import cupsStrainz from "@/assets/brands/cups-strainz.png";
import backpackboyz from "@/assets/brands/backpackboyz-new.png";
import theCandyShop from "@/assets/brands/the-candy-shop.png";
import grumpus from "@/assets/brands/grumpus.png";
import hb from "@/assets/brands/hb.png";
import julatoNyc from "@/assets/brands/julato-nyc.png";
import painNetwork from "@/assets/brands/pain-network.png";
import highMonkey from "@/assets/brands/high-monkey.png";
import donMerfos from "@/assets/brands/don-merfos.png";

const brands = [
  { name: "The Candy Shop", slug: "the-candy-shop", logo: theCandyShop },
  { name: "Pain Network", slug: "pain-network", logo: painNetwork },
  { name: "Grumpus", slug: "grumpus", logo: grumpus },
  { name: "Cupz Strainz", slug: "cupz-strainz", logo: cupsStrainz },
  { name: "Julato NYC", slug: "julato-nyc", logo: julatoNyc },
  { name: "High Mart", slug: "high-mart", logo: highMart },
  { name: "Highflix", slug: "highflix", logo: highflix },
  { name: "High Monkey", slug: "high-monkey", logo: highMonkey },
  { name: "Mameys", slug: "mameys", logo: mameys },
  { name: "ESPN", slug: "espn", logo: espn },
  { name: "MB", slug: "mb", logo: hb },
  { name: "Fumi", slug: "fumi", logo: fumi },
  { name: "Frutaz LA", slug: "frutaz-la", logo: frutaz },
  { name: "Don Merfos", slug: "don-merfos", logo: donMerfos },
  { name: "Kandy Depo", slug: "kandy-depo", logo: kandyDepo },
  { name: "Always Faded", slug: "always-faded", logo: alwaysFaded },
  { name: "FS", slug: "fs", logo: superCandyBros },
  { name: "Super Candy Bros", slug: "super-candy-bros", logo: superCandyBros },
  { name: "Backpack Boyz", slug: "backpack-boyz", logo: backpackboyz },
];

const BrandCarousel = () => {
  return (
    <section
      className="py-12 overflow-hidden"
      style={{
        background: "#090C09",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
      }}
    >
      {/* Heading */}
      <div className="text-center mb-8">
        <p
          className="text-[11px] font-sans font-semibold uppercase"
          style={{ letterSpacing: "0.35em", color: "#C9A84C" }}
        >
          Top Brands
        </p>
      </div>

      <div className="relative">
        {/* Gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #090C09, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #090C09, transparent)" }} />

        <div className="flex animate-scroll items-center">
          {[...brands, ...brands].map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              to={`/shop?brand=${brand.slug}`}
              className="flex-shrink-0 px-6 sm:px-10 md:px-14 flex items-center justify-center group"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-14 sm:h-20 md:h-24 w-auto object-contain opacity-50 group-hover:opacity-100 transition-all duration-300"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;
