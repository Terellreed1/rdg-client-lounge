import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import QuickView from "@/components/QuickView";
import heroLogo from "@/assets/hero-logo.png";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  strain: string | null;
  image_url: string | null;
}

const strainFilters = ["All Flower", "Indica", "Sativa", "Hybrid"];

const ProductsPreview = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Flower");

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, brand, price, strain, image_url")
      .eq("active", true)
      .order("sort_order")
      .limit(12)
      .then(({ data }) => setProducts(data || []));
  }, []);

  const filtered = activeFilter === "All Flower"
    ? products
    : products.filter((p) => p.strain?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <>
      {/* Filter bar */}
      <div
        style={{
          background: "rgba(19,24,16,0.8)",
          borderTop: "1px solid rgba(201,168,76,0.15)",
          borderBottom: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto scrollbar-hide">
          {strainFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-4 sm:px-6 py-3.5 text-[10px] sm:text-[11px] font-sans font-semibold uppercase whitespace-nowrap transition-all duration-200"
              style={{
                letterSpacing: "0.2em",
                color: activeFilter === f ? "#C9A84C" : "rgba(160,144,112,0.6)",
                borderBottom: activeFilter === f ? "2px solid #C9A84C" : "2px solid transparent",
                background: "none",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: "#0D110E" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-8">
            <p
              className="text-[11px] font-sans font-semibold uppercase mb-3"
              style={{ letterSpacing: "0.3em", color: "#C9A84C" }}
            >
              Curated Selection
            </p>
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
              >
                Popular Flower
              </h2>
              <Link
                to="/shop"
                className="hidden sm:inline-flex text-[11px] font-sans font-semibold uppercase transition-colors duration-200"
                style={{ letterSpacing: "0.15em", color: "#C9A84C" }}
              >
                View All →
              </Link>
            </div>
            <div className="h-px w-12 mt-4" style={{ background: "#C9A84C" }} />
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                className="group"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              >
                <Link to={`/shop/${product.id}`} className="block">
                  <div
                    className="overflow-hidden transition-colors duration-300"
                    style={{
                      background: "#131810",
                      border: "1px solid rgba(201,168,76,0.08)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(201,168,76,0.08)";
                    }}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #1a2a1a 0%, #0f1a0f 100%)" }}
                        >
                          <img src={heroLogo} alt="" className="w-16 h-16 opacity-15" />
                        </div>
                      )}

                      {/* Strain badge */}
                      {product.strain && (
                        <span
                          className="absolute top-3 left-3 z-10 text-[9px] sm:text-[10px] font-sans font-semibold uppercase px-2.5 py-1"
                          style={{
                            letterSpacing: "0.18em",
                            color: "#C9A84C",
                            border: "1px solid #C9A84C",
                            background: "rgba(13,17,14,0.85)",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          {product.strain}
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-3 sm:p-4">
                      <h3
                        className="text-sm sm:text-base mb-0.5"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: "#F0EBE0" }}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="text-[10px] font-sans uppercase mb-3"
                        style={{ letterSpacing: "0.12em", color: "rgba(160,144,112,0.6)" }}
                      >
                        {product.brand}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-sans font-medium"
                          style={{ color: "#C9A84C", letterSpacing: "0.05em" }}
                        >
                          {product.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="text-[10px] font-sans font-semibold uppercase px-3 py-1.5 transition-all duration-250 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                          style={{
                            letterSpacing: "0.15em",
                            color: "#C9A84C",
                            border: "1px solid rgba(201,168,76,0.4)",
                            background: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#C9A84C";
                            e.currentTarget.style.color = "#0D110E";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#C9A84C";
                          }}
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Browse Full Menu */}
          <div className="flex justify-center mt-12 sm:mt-16">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 text-[11px] font-sans font-semibold uppercase transition-all duration-300"
              style={{
                letterSpacing: "0.2em",
                border: "1px solid #C9A84C",
                color: "#C9A84C",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#C9A84C";
                e.currentTarget.style.color = "#0D110E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#C9A84C";
              }}
            >
              Browse Full Menu →
            </Link>
          </div>
        </div>

        <QuickView productId={quickViewId} onClose={() => setQuickViewId(null)} />
      </section>
    </>
  );
};

export default ProductsPreview;
