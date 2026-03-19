import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveBrands, type BrandLogo } from "@/components/home/BrandCarousel";

const Brands = () => {
  const [viewImage, setViewImage] = useState<BrandLogo | null>(null);
  const brands = useActiveBrands();

  return (
    <div className="min-h-screen" style={{ background: "#0A0D09" }}>
      <PageLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-sans uppercase mb-6" style={{ letterSpacing: "0.25em", color: "rgba(240,235,224,0.4)" }}>
              Partners
            </p>
            <h1
              className="text-5xl md:text-7xl lg:text-[6.5rem] uppercase leading-[0.95] tracking-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "#F0EBE0" }}
            >
              Our Brands
            </h1>
            <p className="text-sm font-sans font-light max-w-lg mx-auto" style={{ color: "rgba(240,235,224,0.4)", letterSpacing: "0.04em" }}>
              We partner with the best names in the industry to bring you premium quality.
            </p>
          </div>

          {/* Logo marquee carousel */}
          <div className="relative w-full overflow-hidden mb-16">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #0A0D09, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #0A0D09, transparent)" }} />
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
