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

const strainFilters = ["All", "Indica", "Sativa", "Hybrid"];

const ProductsPreview = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, brand, price, strain, image_url")
      .eq("active", true)
      .order("sort_order")
      .limit(12)
      .then(({ data }) => setProducts(data || []));
  }, []);

  const filtered = activeFilter === "All"
    ? products
    : products.filter((p) => p.strain?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
      style={{ background: "#0D110E" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-px" style={{ background: "#C9A84C" }} />
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8", letterSpacing: "0.05em" }}
          >
            Popular Flower
          </h2>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
          {strainFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-sans font-medium uppercase transition-all duration-300"
              style={{
                letterSpacing: "0.15em",
                border: "1px solid",
                borderColor: activeFilter === f ? "#C9A84C" : "rgba(201,168,76,0.3)",
                background: activeFilter === f ? "#C9A84C" : "transparent",
                color: activeFilter === f ? "#0D110E" : "#C9A84C",
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== f) {
                  e.currentTarget.style.background = "rgba(201,168,76,0.1)";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== f) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                }
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Gold divider */}
        <div className="h-px w-full mb-8" style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.4), transparent)" }} />

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
                  className="overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    background: "#161A14",
                    border: "1px solid rgba(201,168,76,0)",
                    boxShadow: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                    e.currentTarget.style.boxShadow = "0 8px 24px -8px rgba(0,0,0,0.5), 0 0 12px -4px rgba(201,168,76,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {product.image_url ? (
                      <>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Dark overlay to blend into card */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.15)" }} />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1e17" }}>
                        <img src={heroLogo} alt="" className="w-16 h-16 opacity-20" />
                      </div>
                    )}

                    {/* Strain badge top-left */}
                    {product.strain && (
                      <span
                        className="absolute top-2 left-2 z-10 text-[9px] font-sans uppercase px-2 py-0.5"
                        style={{
                          letterSpacing: "0.12em",
                          color: "#C9A84C",
                          border: "1px solid rgba(201,168,76,0.35)",
                          background: "rgba(13,17,14,0.8)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {product.strain}
                      </span>
                    )}

                    {/* Hover Quick View */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewId(product.id); }}
                        className="flex items-center gap-1.5 text-[10px] font-sans uppercase px-4 py-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        style={{
                          letterSpacing: "0.15em",
                          background: "rgba(201,168,76,0.9)",
                          color: "#0a0a0a",
                        }}
                      >
                        <Eye size={12} /> Quick View
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <h3
                      className="text-sm sm:text-base font-light leading-snug mb-1"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8" }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs font-sans font-light" style={{ color: "rgba(201,168,76,0.6)" }}>
                      {product.price}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Browse Full Menu CTA */}
        <div className="flex justify-center mt-10 sm:mt-14">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-xs font-sans font-medium uppercase transition-all duration-300"
            style={{
              letterSpacing: "0.15em",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#C9A84C",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201,168,76,0.08)";
              e.currentTarget.style.borderColor = "#C9A84C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
            }}
          >
            Browse Full Menu →
          </Link>
        </div>
      </div>

      <QuickView productId={quickViewId} onClose={() => setQuickViewId(null)} />
    </section>
  );
};

export default ProductsPreview;
