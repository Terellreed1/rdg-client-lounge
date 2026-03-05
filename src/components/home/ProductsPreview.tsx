import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import heroLogo from "@/assets/hero-logo.png";

import flowerImg from "@/assets/products/big-bag-buds.png";
import vapeImg from "@/assets/products/blue-guava-pops.png";
import prerollImg from "@/assets/products/el-jefe.png";
import concentrateImg from "@/assets/products/black-label.png";
import edibleImg from "@/assets/products/marshmallow-milk.png";

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
  { name: "Flower", image: flowerImg, to: "/shop?category=Flower" },
  { name: "Pre-Rolls", image: prerollImg, to: "/shop?category=Pre-Roll" },
  { name: "Vapes", image: vapeImg, to: "/shop?category=Vape" },
  { name: "Edibles", image: edibleImg, to: "/shop?category=Edible" },
  { name: "Concentrates", image: concentrateImg, to: "/shop?category=Concentrate" },
];

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
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)" }} />

      {/* ─── SHOP BY CATEGORY — Culta style ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20">
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

        {/* Category grid — round images with labels like Culta */}
        <div className="flex justify-center gap-6 sm:gap-8 lg:gap-12 flex-wrap mb-0">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link to={cat.to} className="group flex flex-col items-center">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden mb-3 sm:mb-4 transition-transform duration-500 group-hover:scale-105"
                  style={{ background: "#131810" }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain p-5 sm:p-6"
                    loading="lazy"
                  />
                </div>
                <span
                  className="text-[10px] sm:text-xs uppercase tracking-[0.15em] transition-colors duration-300"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: "rgba(232,220,200,0.5)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(232,220,200,0.5)"; }}
                >
                  Shop {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:mt-10">
          <Link
            to="/shop"
            className="text-[10px] uppercase px-10 py-3.5 font-sans font-medium transition-all duration-300"
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

      {/* ─── FEATURED PRODUCTS — grid like Culta ─── */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-14">
          <p
            className="text-[10px] uppercase mb-3"
            style={{ letterSpacing: "0.3em", color: "rgba(160,144,112,0.35)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
          >
            Featured
          </p>
          <h3
            className="text-2xl sm:text-3xl lg:text-4xl uppercase"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              color: "#F0EBE0",
              letterSpacing: "0.04em",
            }}
          >
            Staff Picks
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
                        fontFamily: "'Montserrat', sans-serif",
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
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      <ShoppingBag size={11} />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product info — Culta style: price first, then brand, then name */}
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
