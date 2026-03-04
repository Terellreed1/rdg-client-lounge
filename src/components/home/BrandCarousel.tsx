import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
import zourZop from "@/assets/brands/zour-zop.png";
import donMerfos from "@/assets/brands/don-merfos.png";

const brands = [
  { name: "Always Faded", slug: "always-faded", logo: alwaysFaded },
  { name: "Mameys", slug: "mameys", logo: mameys },
  { name: "Fumi", slug: "fumi", logo: fumi },
  { name: "Kandy Depo", slug: "kandy-depo", logo: kandyDepo },
  { name: "ESPN", slug: "espn", logo: espn },
  { name: "High Mart", slug: "high-mart", logo: highMart },
  { name: "Super Candy Bros", slug: "super-candy-bros", logo: superCandyBros },
  { name: "Highflix", slug: "highflix", logo: highflix },
  { name: "Frutaz", slug: "frutaz", logo: frutaz },
  { name: "Cups Strainz", slug: "cups-strainz", logo: cupsStrainz },
  { name: "Backpackboyz", slug: "backpackboyz", logo: backpackboyz },
  { name: "The Candy Shop", slug: "the-candy-shop", logo: theCandyShop },
  { name: "Grumpus", slug: "grumpus", logo: grumpus },
  { name: "HB", slug: "hb", logo: hb },
  { name: "Julato NYC", slug: "julato-nyc", logo: julatoNyc },
  { name: "Pain Network", slug: "pain-network", logo: painNetwork },
  { name: "High Monkey", slug: "high-monkey", logo: highMonkey },
  { name: "Zour Zop", slug: "zour-zop", logo: zourZop },
  { name: "Don Merfos", slug: "don-merfos", logo: donMerfos },
];

const BrandCarousel = () => {
  return (
    <section className="py-10 overflow-hidden bg-black">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-sans">
        Top Brands
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll items-center">
          {[...brands, ...brands].map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              to={`/shop?brand=${brand.slug}`}
              className="flex-shrink-0 px-6 sm:px-10 md:px-14 flex items-center justify-center group"
            >
              <motion.img
                src={brand.logo}
                alt={brand.name}
                className="h-16 sm:h-22 md:h-28 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300"
                whileHover={{ scale: 1.08 }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;
