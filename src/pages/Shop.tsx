import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Clock, ChevronDown, SlidersHorizontal, X, ShoppingBag } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/home/ScrollReveal";
import TiltCard from "@/components/TiltCard";
import QuickView from "@/components/QuickView";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  qty: number;
  image_url: string | null;
  description: string;
  is_new: boolean;
  strain: string | null;
  product_type: string;
  active: boolean;
  sold_out: boolean;
  sort_order: number;
  created_at: string;
}

const STRAIN_OPTIONS = ["All", "Indica", "Sativa", "Hybrid"];
const COMING_SOON_CATS = ["Vapes", "Edibles", "Concentrates", "Pre-Rolls", "Accessories"];
const ALL_EXTRA_CATS = ["Vapes", "Edibles", "Concentrates", "Pre-Rolls", "Accessories"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];
const MIN_PRICE = 10;
const MAX_PRICE = 200;

const parsePrice = (p: string) => parseInt(p.replace(/[^0-9]/g, "")) || 0;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const category = searchParams.get("category") || "All";
  const strain = searchParams.get("strain") || "All";
  const brand = searchParams.get("brand") || "All";
  const sort = searchParams.get("sort") || "featured";
  const priceMin = parseInt(searchParams.get("minPrice") || String(MIN_PRICE));
  const priceMax = parseInt(searchParams.get("maxPrice") || String(MAX_PRICE));
  const saleFilter = searchParams.get("sale") === "true";

  useEffect(() => {
    supabase.from("products").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      setAllProducts((data as Product[]) || []);
      setLoading(false);
    });
  }, []);

  const setFilter = useCallback((key: string, value: string, defaultVal: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === defaultVal) next.delete(key); else next.set(key, value);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const availableCategories = useMemo(() => {
    const types = new Set(allProducts.filter(p => !p.sold_out).map(p => p.product_type));
    const cats = ["All", "Flower"];
    ALL_EXTRA_CATS.forEach(c => { if (types.has(c)) cats.push(c); });
    return cats;
  }, [allProducts]);

  const isComingSoonCategory = COMING_SOON_CATS.includes(category) && !availableCategories.includes(category);

  const brandOptions = useMemo(() => {
    const brands = new Set(allProducts.filter(p => !p.sold_out).map(p => p.brand).filter(Boolean));
    return ["All", ...Array.from(brands).sort()];
  }, [allProducts]);

  const filtered = useMemo(() => {
    let result = allProducts.filter(p => {
      if (p.sold_out) return false;
      if (category !== "All" && p.product_type !== category) return false;
      if (brand !== "All" && p.brand !== brand) return false;
      const pn = parsePrice(p.price);
      if (pn < priceMin || pn > priceMax) return false;
      if (strain !== "All" && p.strain !== strain) return false;
      if (saleFilter && !p.is_new) return false;
      return true;
    });
    switch (sort) {
      case "price-asc": result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case "price-desc": result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
      case "newest": result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: result.sort((a, b) => a.sort_order - b.sort_order); break;
    }
    return result;
  }, [allProducts, category, brand, priceMin, priceMax, strain, saleFilter, sort]);

  const activeFilterCount = [
    category !== "All", strain !== "All", brand !== "All",
    priceMin > MIN_PRICE || priceMax < MAX_PRICE, saleFilter,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const countLabel = useMemo(() => {
    const parts: string[] = [];
    if (strain !== "All") parts.push(strain);
    if (category !== "All") parts.push(category.toLowerCase());
    parts.push(filtered.length === 1 ? "product" : "products");
    return `Showing ${filtered.length} ${parts.join(" ")}`;
  }, [filtered.length, strain, category]);

  const FilterSidebar = ({ onDone }: { onDone?: () => void }) => (
    <div className="space-y-0">
      <FilterGroup
        label="Category"
        options={[...availableCategories, ...COMING_SOON_CATS.filter(c => !availableCategories.includes(c))]}
        value={category}
        onChange={(v) => setFilter("category", v, "All")}
        disabledOptions={COMING_SOON_CATS.filter(c => !availableCategories.includes(c))}
      />
      <GoldDivider />
      <FilterGroup label="Strain" options={STRAIN_OPTIONS} value={strain} onChange={(v) => setFilter("strain", v, "All")} disabled={isComingSoonCategory} />
      <GoldDivider />
      <FilterGroup label="Brand" options={brandOptions} value={brand} onChange={(v) => setFilter("brand", v, "All")} disabled={isComingSoonCategory} />
      <GoldDivider />
      <div className={cn(isComingSoonCategory && "opacity-40 pointer-events-none", "py-6")}>
        <h4 className="text-[10px] uppercase mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.18em", color: "rgba(201,168,76,0.6)", fontWeight: 500 }}>Price Range</h4>
        <DualRangeSlider min={MIN_PRICE} max={MAX_PRICE} valueMin={priceMin} valueMax={priceMax} onChangeMin={(v) => setFilter("minPrice", String(v), String(MIN_PRICE))} onChangeMax={(v) => setFilter("maxPrice", String(v), String(MAX_PRICE))} />
      </div>
      {hasActiveFilters && (
        <>
          <GoldDivider />
          <div className="py-6">
            <button onClick={() => { clearAllFilters(); onDone?.(); }} className="text-[10px] uppercase hover:text-foreground transition-colors underline underline-offset-4" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.15em", color: "rgba(201,168,76,0.5)" }}>
              Clear All Filters
            </button>
          </div>
        </>
      )}
      {onDone && (
        <div className="pt-4">
          <motion.button onClick={onDone} whileTap={{ scale: 0.97 }} className="w-full h-12 text-[10px] uppercase transition-colors" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.18em", background: "#C9A84C", color: "#0D110E", fontWeight: 600 }}>
            Apply Filters
          </motion.button>
        </div>
      )}
    </div>
  );

  return (
    <PageLayout>
      <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6" style={{ background: "#0D110E" }}>
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-[10px] uppercase mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.2em", color: "rgba(201,168,76,0.5)" }}>Curated Selection</p>
              <h1 className="text-4xl md:text-6xl mb-4" style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif", color: "#e8dcc8", fontWeight: 400 }}>The Shop</h1>
              <div className="mx-auto h-px w-24 mb-4" style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
              <p className="text-sm" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", color: "rgba(201,168,76,0.4)", fontWeight: 300 }}>Curated premium flower, concentrates & more</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-10">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block">
              <ScrollReveal delay={0.1} direction="left">
                <FilterSidebar />
              </ScrollReveal>
            </aside>

            {/* Main content */}
            <div>
              {!isComingSoonCategory && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", color: "rgba(232,220,200,0.5)", fontWeight: 300 }}>
                      {loading ? "Loading…" : countLabel}
                    </p>
                    <div className="relative">
                      <button
                        onClick={() => setSortOpen(!sortOpen)}
                        className="flex items-center gap-1.5 text-[10px] uppercase transition-colors px-3 py-1.5"
                        style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.15em", color: "#e8dcc8", border: "1px solid rgba(201,168,76,0.3)" }}
                      >
                        {SORT_OPTIONS.find(s => s.value === sort)?.label || "Featured"}
                        <ChevronDown size={12} className={cn("transition-transform", sortOpen && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {sortOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="absolute right-0 top-full mt-2 z-20 min-w-[180px] py-1"
                            style={{ background: "#161A14", border: "1px solid rgba(201,168,76,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                          >
                            {SORT_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => { setFilter("sort", opt.value, "featured"); setSortOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-[11px] transition-colors"
                                style={{
                                  fontFamily: "'Montserrat', 'DM Sans', sans-serif",
                                  color: sort === opt.value ? "#C9A84C" : "rgba(232,220,200,0.6)",
                                  background: sort === opt.value ? "rgba(201,168,76,0.08)" : "transparent",
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)" }} />
                </>
              )}

              {isComingSoonCategory ? (
                <motion.div className="flex flex-col items-center justify-center text-center py-20 sm:py-32" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <img src={logo} alt="LCC" className="h-24 w-24 object-contain mb-6 opacity-70" />
                  <h2 className="text-5xl italic mb-3" style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif", color: "#e8dcc8" }}>Coming Soon</h2>
                  <p className="text-sm max-w-sm" style={{ color: "rgba(201,168,76,0.4)" }}>We're curating the finest {category.toLowerCase()} for you. Check back soon.</p>
                </motion.div>
              ) : loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] animate-pulse" style={{ background: "#161A14" }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <motion.div className="flex flex-col items-center justify-center text-center py-20" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <img src={logo} alt="LCC" className="h-20 w-20 object-contain mb-5 opacity-60" />
                  <p className="text-2xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8" }}>No products match your filters</p>
                  <p className="text-xs mb-6" style={{ color: "rgba(201,168,76,0.4)" }}>Try adjusting your filters or clearing them.</p>
                  <button onClick={clearAllFilters} className="text-[10px] uppercase px-6 py-2.5 transition-all duration-300" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.15em", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filtered.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}>
                      <ProductCard product={product} onQuickView={setQuickViewId} />
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="aspect-[3/4] flex flex-col items-center justify-center text-center p-6" style={{ border: "1px dashed rgba(201,168,76,0.15)" }}>
                    <Clock size={32} strokeWidth={1} className="mb-3" style={{ color: "rgba(201,168,76,0.25)" }} />
                    <p className="text-lg mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8" }}>More Coming Soon</p>
                    <p className="text-[10px] max-w-[200px]" style={{ color: "rgba(201,168,76,0.3)" }}>New strains, vapes, edibles & more dropping soon.</p>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <motion.button onClick={() => setMobileFilterOpen(true)} whileTap={{ scale: 0.95 }} className="relative flex items-center gap-2 px-6 py-3.5 shadow-xl text-[10px] uppercase" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.15em", background: "#C9A84C", color: "#0D110E", fontWeight: 600 }}>
          <SlidersHorizontal size={16} />
          Filter
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full" style={{ background: "#0D110E", color: "#C9A84C", border: "1px solid #C9A84C" }}>
              {activeFilterCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFilterOpen(false)} style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
            <motion.div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto lg:hidden" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ background: "#0D110E", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-3" style={{ background: "#0D110E", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                <h3 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8" }}>Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1" style={{ color: "rgba(201,168,76,0.5)" }}><X size={20} /></button>
              </div>
              <div className="px-6 py-6">
                <FilterSidebar onDone={() => setMobileFilterOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <QuickView productId={quickViewId} onClose={() => setQuickViewId(null)} />
    </PageLayout>
  );
};

/* ── Gold Divider ── */
const GoldDivider = () => (
  <div className="h-px w-full" style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.25), transparent 80%)" }} />
);

/* ── Filter Group ── */
const FilterGroup = ({
  label, options, value, onChange, disabled, disabledOptions = [],
}: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
  disabled?: boolean; disabledOptions?: string[];
}) => (
  <div className={cn(disabled && "opacity-40 pointer-events-none", "py-6")}>
    <h4
      className="text-[10px] uppercase mb-3"
      style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.18em", color: "rgba(201,168,76,0.6)", fontWeight: 500 }}
    >
      {label}
    </h4>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isDisabled = disabledOptions.includes(opt);
        const isActive = value === opt;
        return (
          <button
            key={opt}
            onClick={() => !isDisabled && onChange(opt)}
            disabled={isDisabled}
            className="text-[11px] px-3.5 py-2 transition-all duration-300"
            style={{
              fontFamily: "'Montserrat', 'DM Sans', sans-serif",
              letterSpacing: "0.05em",
              border: "1px solid",
              borderColor: isDisabled ? "rgba(201,168,76,0.1)" : isActive ? "#C9A84C" : "rgba(232,220,200,0.15)",
              background: isDisabled ? "transparent" : isActive ? "#C9A84C" : "transparent",
              color: isDisabled ? "rgba(201,168,76,0.2)" : isActive ? "#0D110E" : "rgba(232,220,200,0.6)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontWeight: isActive ? 600 : 400,
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && !isActive) {
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
                e.currentTarget.style.color = "#C9A84C";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled && !isActive) {
                e.currentTarget.style.borderColor = "rgba(232,220,200,0.15)";
                e.currentTarget.style.color = "rgba(232,220,200,0.6)";
              }
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

/* ── Dual Range Slider ── */
const DualRangeSlider = ({
  min, max, valueMin, valueMax, onChangeMin, onChangeMax,
}: {
  min: number; max: number; valueMin: number; valueMax: number;
  onChangeMin: (v: number) => void; onChangeMax: (v: number) => void;
}) => {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full" style={{ background: "rgba(232,220,200,0.1)" }} />
        <div className="absolute h-1 rounded-full" style={{ left: `${pctMin}%`, right: `${100 - pctMax}%`, background: "#C9A84C" }} />
        <input type="range" min={min} max={max} step={5} value={valueMin} onChange={(e) => { const v = parseInt(e.target.value); if (v <= valueMax - 5) onChangeMin(v); }} className="dual-range-input absolute inset-x-0" style={{ zIndex: valueMin > max - 20 ? 5 : 3 }} />
        <input type="range" min={min} max={max} step={5} value={valueMax} onChange={(e) => { const v = parseInt(e.target.value); if (v >= valueMin + 5) onChangeMax(v); }} className="dual-range-input absolute inset-x-0" style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color: "#C9A84C", fontFamily: "'Montserrat', 'DM Sans', sans-serif", fontWeight: 500 }}>${valueMin}</span>
        <span style={{ color: "rgba(201,168,76,0.3)" }}>—</span>
        <span style={{ color: "#C9A84C", fontFamily: "'Montserrat', 'DM Sans', sans-serif", fontWeight: 500 }}>${valueMax}</span>
      </div>
    </div>
  );
};

/* ── Product Card ── */
const ProductCard = ({ product, onQuickView }: { product: Product; onQuickView: (id: string) => void }) => {
  const { addToCart } = useCart();

  return (
    <div
      className="group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#161A14",
        border: "1px solid rgba(201,168,76,0)",
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
      <Link to={`/shop/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          {product.image_url ? (
            <>
              <motion.img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.2)" }} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1e17" }}>
              <img src={logo} alt="LCC" className="w-16 h-16 object-contain opacity-20" />
            </div>
          )}
          {product.strain && (
            <span className="absolute top-2 left-2 z-10 text-[9px] uppercase px-2 py-0.5" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.12em", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.35)", background: "rgba(13,17,14,0.8)", backdropFilter: "blur(4px)" }}>
              {product.strain}
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product.id); }}
              className="flex items-center gap-1.5 text-[10px] uppercase px-4 py-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
              style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.15em", background: "rgba(201,168,76,0.9)", color: "#0a0a0a" }}
            >
              <Eye size={12} /> Quick View
            </button>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-light leading-snug mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8" }}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", color: "#C9A84C", fontWeight: 300 }}>{product.price}</p>
          </div>
        </div>
      </Link>
      {/* Add to Cart on hover */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <button
          onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 })}
          className="w-full flex items-center justify-center gap-2 py-2 text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ fontFamily: "'Montserrat', 'DM Sans', sans-serif", letterSpacing: "0.15em", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C", background: "transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}
        >
          <ShoppingBag size={12} /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Shop;
