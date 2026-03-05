import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
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

const ProductsPreview = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

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
      {/* Thin gold divider */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Section header — centered, bold like Culta */}
        <div className="text-center mb-14 sm:mb-20">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-4"
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
            className="text-sm font-sans font-light max-w-md mx-auto"
            style={{ color: "rgba(160,144,112,0.5)", letterSpacing: "0.04em" }}
          >
            Browse our curated selection. Place an order for delivery.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-12 lg:gap-x-6 lg:gap-y-14">
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
                {/* Image */}
                <div className="relative aspect-square overflow-hidden mb-3 sm:mb-4" style={{ background: "#111610" }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
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
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {product.strain}
                    </span>
                  )}

                  {/* Quick add overlay */}
                  <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                          id: parseInt(product.id) || Date.now(),
                          name: product.name,
                          brand: product.brand,
                          price: product.price,
                          image: product.image_url || "",
                        });
                      }}
                      className="flex items-center gap-1.5 text-[9px] uppercase px-4 py-2 transition-all duration-200"
                      style={{
                        letterSpacing: "0.12em",
                        background: "#C9A84C",
                        color: "#0A0D09",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      <ShoppingBag size={11} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Text */}
                <p
                  className="text-[9px] uppercase mb-0.5"
                  style={{
                    letterSpacing: "0.12em",
                    color: "rgba(160,144,112,0.35)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {product.brand}
                </p>
                <h3
                  className="text-sm sm:text-[15px] mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    color: "#F0EBE0",
                    lineHeight: 1.3,
                  }}
                >
                  {product.name}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "#C9A84C", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
                >
                  {product.price}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all */}
        <div className="flex justify-center mt-14 sm:mt-20">
          <Link
            to="/shop"
            className="text-[10px] uppercase px-10 py-4 font-sans font-medium transition-all duration-300"
            style={{
              letterSpacing: "0.2em",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#C9A84C",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#C9A84C";
              e.currentTarget.style.color = "#0A0D09";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#C9A84C";
            }}
          >
            Shop All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;
