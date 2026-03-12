import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import heroLogo from "@/assets/hero-logo.png";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  strain: string | null;
  image_url: string | null;
  qty: number;
}

const categories = [
  { name: "Flower", to: "/shop?category=Flower" },
  { name: "Pre-Rolls", to: "/shop?category=Pre-Roll" },
  { name: "Vapes", to: "/shop?category=Vape" },
  { name: "Edibles", to: "/shop?category=Edible" },
  { name: "Concentrates", to: "/shop?category=Concentrate" },
];

const ProductsPreview = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, brand, price, strain, image_url, qty")
      .eq("active", true)
      .order("sort_order")
      .limit(8)
      .then(({ data }) => setProducts(data || []));
  }, []);

  return (
    <section style={{ background: "#0A0D09" }}>
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)" }} />

      {/* ─── SHOP BY CATEGORY ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20">
        {/* Gold divider line */}
        <div className="flex justify-center mb-8">
          <div style={{ width: 100, height: 1, backgroundColor: "rgba(197, 163, 85, 0.3)" }} />
        </div>

        <div className="text-center mb-10 sm:mb-14">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              color: "#F0EBE0",
              letterSpacing: "0.06em",
            }}
          >
            Shop Online
          </h2>
          <p
            className="text-sm font-sans font-light max-w-lg mx-auto"
            style={{ color: "rgba(160,144,112,0.5)", letterSpacing: "0.04em" }}
          >
            Browse your favorite flower, vapes, edibles, and more. Place an order for delivery.
          </p>
        </div>

        {/* Category cards — typography only */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                to={cat.to}
                className="flex items-center justify-center transition-all duration-300"
                style={{
                  height: 140,
                  backgroundColor: "#141414",
                  border: "1px solid rgba(197, 163, 85, 0.15)",
                  borderRadius: 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.backgroundColor = "rgba(197, 163, 85, 0.05)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(212, 175, 55, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(197, 163, 85, 0.15)";
                  e.currentTarget.style.backgroundColor = "#141414";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  className="uppercase font-sans"
                  style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.15em", color: "#FFFFFF" }}
                >
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/shop"
            className="text-[10px] uppercase px-10 py-3.5 font-sans font-semibold rounded-full transition-all duration-300"
            style={{
              letterSpacing: "0.2em",
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
            Shop All
          </Link>
        </div>
      </div>

      {/* ─── FEATURED PRODUCTS ─── */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-14">
          <h3
            className="text-2xl sm:text-3xl lg:text-4xl uppercase"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              color: "#F0EBE0",
              letterSpacing: "0.04em",
            }}
          >
            Featured
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className="group"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04, duration: 0.45 }}
            >
              <Link to={`/shop/${product.id}`} className="block">
                {/* Image with subtle gold gradient background */}
                <div 
                  className="relative aspect-square overflow-hidden mb-3 sm:mb-4 rounded-sm"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.10) 40%, rgba(201,168,76,0.03) 70%, transparent 100%)",
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      width="400"
                      height="400"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={heroLogo} alt="" className="w-10 h-10 opacity-10" />
                    </div>
                  )}

                  {/* Strain badge */}
                  {product.strain && (
                    <span
                      className="absolute top-2.5 left-2.5 text-[7px] sm:text-[8px] uppercase px-2 py-0.5"
                      style={{
                        letterSpacing: "0.12em",
                        color: "#C9A84C",
                        background: "rgba(10,13,9,0.85)",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {product.strain}
                    </span>
                  )}
                </div>

                {/* Product info */}
                <p
                  className="text-xs sm:text-sm mb-0.5"
                  style={{ color: "#C9A84C", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
                >
                  {product.price}
                </p>
                <p
                  className="text-[9px] uppercase mb-0.5"
                  style={{
                    letterSpacing: "0.12em",
                    color: "rgba(160,144,112,0.35)",
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {product.brand}
                </p>
                <h3
                  className="text-sm sm:text-[15px]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                    color: "#F0EBE0",
                    lineHeight: 1.3,
                  }}
                >
                  {product.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;
