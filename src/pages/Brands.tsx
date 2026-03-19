import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// Static fallback brands
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

const staticBrands = [
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

interface BrandItem {
  src: string;
  alt: string;
}

const Brands = () => {
  const [viewImage, setViewImage] = useState<BrandItem | null>(null);
  const [brands, setBrands] = useState<BrandItem[]>(staticBrands);

  useEffect(() => {
    supabase
      .from("brands")
      .select("name, logo_url")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const withLogos = data.filter(b => b.logo_url).map(b => ({ src: b.logo_url!, alt: b.name }));
          if (withLogos.length > 0) setBrands(withLogos);
        }
      });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
      <PageLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" style={{ background: "#FFFFFF" }}>
          <div className="text-center mb-14">
            <p className="text-xs font-sans uppercase mb-6" style={{ letterSpacing: "0.25em", color: "rgba(0,0,0,0.35)" }}>
              Partners
            </p>
            <h1
              className="text-5xl md:text-7xl lg:text-[6.5rem] uppercase leading-[0.95] tracking-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "#1a1a1a" }}
            >
              Our Brands
            </h1>
            <p className="text-sm font-sans font-light max-w-lg mx-auto" style={{ color: "rgba(0,0,0,0.4)", letterSpacing: "0.04em" }}>
              We partner with the best names in the industry to bring you premium quality.
            </p>
          </div>

          {/* Logo marquee carousel */}
          <div className="relative w-full overflow-hidden mb-16">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #FFFFFF, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #FFFFFF, transparent)" }} />
            <div className="flex items-center gap-14 animate-marquee">
              {[...brands, ...brands].map((brand, i) => (
                <img
                  key={i}
                  src={brand.src}
                  alt={brand.alt}
                  className="h-16 sm:h-20 w-auto object-contain shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  loading="lazy"
                  onClick={() => setViewImage(brand)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.alt}
                className="flex items-center justify-center py-8 cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                onClick={() => setViewImage(brand)}
              >
                <img
                  src={brand.src}
                  alt={brand.alt}
                  className="object-contain transition-transform duration-300 hover:scale-110"
                  style={{ height: 240, width: "auto", maxWidth: 320 }}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </PageLayout>

      <AnimatePresence>
        {viewImage && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewImage(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setViewImage(null)}
            >
              <img src={viewImage.src} alt={viewImage.alt} className="max-w-full max-h-[80vh] object-contain" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Brands;
