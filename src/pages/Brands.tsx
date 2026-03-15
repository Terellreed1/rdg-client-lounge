import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

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
import highMonkey from "@/assets/brands/high-monkey.png";
import highMart from "@/assets/brands/high-mart.png";
import kandyDepo from "@/assets/brands/kandy-depo.png";
import mameys from "@/assets/brands/mameys.png";
import painNetwork from "@/assets/brands/pain-network.png";
import theCandyShop from "@/assets/brands/the-candy-shop.png";
import grumpus from "@/assets/brands/grumpus.png";
import hb from "@/assets/brands/hb.png";

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
  { src: highMonkey, alt: "High Monkey" },
  { src: highMart, alt: "High Mart" },
  { src: kandyDepo, alt: "Kandy Depo" },
  { src: mameys, alt: "Mameys" },
  { src: painNetwork, alt: "Pain Network" },
  { src: theCandyShop, alt: "The Candy Shop" },
  { src: grumpus, alt: "Grumpus" },
  { src: hb, alt: "HB" },
];

const Brands = () => (
  <PageLayout>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Gold divider */}
      <div className="flex justify-center mb-8">
        <div style={{ width: 100, height: 1, backgroundColor: "rgba(197, 163, 85, 0.3)" }} />
      </div>

      <div className="text-center mb-14">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            color: "#F0EBE0",
            letterSpacing: "0.06em",
          }}
        >
          Our Brands
        </h1>
        <p
          className="text-sm font-sans font-light max-w-lg mx-auto"
          style={{ color: "rgba(160,144,112,0.5)", letterSpacing: "0.04em" }}
        >
          We partner with the best names in the industry to bring you premium quality.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((brand, i) => (
          <motion.div
            key={brand.alt}
            className="flex items-center justify-center transition-all duration-300"
            style={{
              height: 140,
              backgroundColor: "#141414",
              border: "1px solid rgba(197, 163, 85, 0.15)",
              borderRadius: 12,
            }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            whileHover={{
              borderColor: "#D4AF37",
              backgroundColor: "rgba(197, 163, 85, 0.05)",
              y: -4,
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.15)",
            }}
          >
            <img
              src={brand.src}
              alt={brand.alt}
              className="object-contain"
              style={{ height: 50, width: "auto", maxWidth: 120 }}
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  </PageLayout>
);

export default Brands;
