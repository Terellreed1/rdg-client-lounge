import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ChevronDown, SlidersHorizontal, X, ShoppingBag, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
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
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    setSearchQuery("");
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
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc": result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case "price-desc": result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
      case "newest": result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: result.sort((a, b) => a.sort_order - b.sort_order); break;
    }
    return result;
  }, [allProducts, category, brand, priceMin, priceMax, strain, saleFilter, sort, searchQuery]);

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
    return `${filtered.length} ${parts.join(" ")}`;
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
      <div className="h-px my-1" style={{ background: "rgba(201,168,76,0.06)" }} />
      <FilterGroup label="Strain" options={STRAIN_OPTIONS} value={strain} onChange={(v) => setFilter("strain", v, "All")} disabled={isComingSoonCategory} />
      <div className="h-px my-1" style={{ background: "rgba(201,168,76,0.06)" }} />
      <FilterGroup label="Brand" options={brandOptions} value={brand} onChange={(v) => setFilter("brand", v, "All")} disabled={isComingSoonCategory} />
      <div className="h-px my-1" style={{ background: "rgba(201,168,76,0.06)" }} />
      <div className={cn(isComingSoonCategory && "opacity-40 pointer-events-none", "py-5")}>
        <h4 className="text-[9px] uppercase mb-4" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.2em", color: "rgba(201,168,76,0.45)", fontWeight: 500 }}>Price Range</h4>
        <DualRangeSlider min={MIN_PRICE} max={MAX_PRICE} valueMin={priceMin} valueMax={priceMax} onChangeMin={(v) => setFilter("minPrice", String(v), String(MIN_PRICE))} onChangeMax={(v) => setFilter("maxPrice", String(v), String(MAX_PRICE))} />
      </div>
      {hasActiveFilters && (
        <>
          <div className="h-px" style={{ background: "rgba(201,168,76,0.06)" }} />
          <div className="py-5">
            <button onClick={() => { clearAllFilters(); onDone?.(); }} className="text-[9px] uppercase transition-colors" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.15em", color: "rgba(201,168,76,0.4)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(201,168,76,0.4)"; }}
            >
              Clear All Filters
            </button>
          </div>
        </>
      )}
      {onDone && (
        <div className="pt-4">
          <button onClick={onDone} className="w-full h-11 text-[9px] uppercase transition-colors" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.2em", background: "#C9A84C", color: "#0D110E", fontWeight: 600 }}>
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <PageLayout>
      {/* ─── HERO BANNER — Culta shop style ─── */}
      <div className="relative w-full overflow-hidden" style={{ height: "360px", background: "#0A0D09" }}>
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source
            src="https://res.cloudinary.com/ddfe8uqth/video/upload/medium-vecteezy_camera-moves-along-medical-cannabis-plants-grown-under_7386213_medium_tgvc7r.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,13,9,0.4) 0%, rgba(10,13,9,0.8) 100%)" }} />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl uppercase mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              color: "#F0EBE0",
              letterSpacing: "0.06em",
            }}
          >
            Shop Premium Cannabis Online
          </h1>
          <p
            className="text-sm sm:text-base font-sans font-light max-w-lg"
            style={{ color: "rgba(160,144,112,0.6)", letterSpacing: "0.04em" }}
          >
            Browse our curated menu. Place an order for delivery.
          </p>
        </div>
      </div>

      {/* ─── BREADCRUMB ─── */}
      <div style={{ background: "#0D110E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em]" style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(232,220,200,0.3)" }}>
            <Link to="/" className="transition-colors hover:text-[#C9A84C]">Home</Link>
            <span style={{ color: "rgba(201,168,76,0.3)" }}>›</span>
            <span style={{ color: "rgba(232,220,200,0.5)" }}>Shop</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6" style={{ background: "#0D110E" }}>
        <div className="max-w-7xl mx-auto pb-20">
          {/* ─── SEARCH BAR + SORT + VIEW TOGGLE ─── */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(201,168,76,0.35)" }} />
              <input
                type="text"
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-xs outline-none transition-colors"
                style={{
                  background: "#141814",
                  border: "1px solid rgba(201,168,76,0.12)",
                  color: "#F0EBE0",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] transition-colors px-3 py-2 h-10"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "rgba(232,220,200,0.5)",
                    fontWeight: 400,
                    background: "#141814",
                    border: "1px solid rgba(201,168,76,0.12)",
                  }}
                >
                  {SORT_OPTIONS.find(s => s.value === sort)?.label || "Featured"}
                  <ChevronDown size={11} className={cn("transition-transform", sortOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-1 z-20 min-w-[160px] py-1"
                      style={{ background: "#141814", border: "1px solid rgba(201,168,76,0.1)", boxShadow: "0 12px 32px rgba(0,0,0,0.6)" }}
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setFilter("sort", opt.value, "featured"); setSortOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-[10px] transition-colors"
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            color: sort === opt.value ? "#C9A84C" : "rgba(232,220,200,0.5)",
                            background: sort === opt.value ? "rgba(201,168,76,0.05)" : "transparent",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View toggle — Culta style */}
              <div className="hidden sm:flex items-center h-10" style={{ border: "1px solid rgba(201,168,76,0.12)" }}>
                <button
                  onClick={() => setViewMode("grid")}
                  className="h-full px-3 flex items-center transition-colors"
                  style={{ background: viewMode === "grid" ? "rgba(201,168,76,0.15)" : "transparent" }}
                  aria-label="Grid view"
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-1.5 h-1.5" style={{ background: viewMode === "grid" ? "#C9A84C" : "rgba(232,220,200,0.3)" }} />
                    ))}
                  </div>
                </button>
                <div className="w-px h-5" style={{ background: "rgba(201,168,76,0.12)" }} />
                <button
                  onClick={() => setViewMode("list")}
                  className="h-full px-3 flex items-center transition-colors"
                  style={{ background: viewMode === "list" ? "rgba(201,168,76,0.15)" : "transparent" }}
                  aria-label="List view"
                >
                  <div className="flex flex-col gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-4 h-0.5" style={{ background: viewMode === "list" ? "#C9A84C" : "rgba(232,220,200,0.3)" }} />
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block">
              <FilterSidebar />
            </aside>

            {/* Main content */}
            <div>
              {!isComingSoonCategory && (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "rgba(232,220,200,0.35)", fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
                    {loading ? "Loading…" : countLabel}
                  </p>
                </div>
              )}

              {isComingSoonCategory ? (
                <motion.div className="flex flex-col items-center justify-center text-center py-24 sm:py-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                  <h2 className="text-4xl italic mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F0EBE0" }}>Coming Soon</h2>
                  <p className="text-xs max-w-xs" style={{ color: "rgba(201,168,76,0.35)", fontFamily: "'Montserrat', sans-serif" }}>We're curating the finest {category.toLowerCase()} for you.</p>
                </motion.div>
              ) : loading ? (
                <div className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12"
                    : "flex flex-col gap-4"
                )}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={cn("animate-pulse", viewMode === "grid" ? "aspect-square" : "h-28")} style={{ background: "#141814" }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <motion.div className="flex flex-col items-center justify-center text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-2xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F0EBE0" }}>No products found</p>
                  <p className="text-xs mb-6" style={{ color: "rgba(201,168,76,0.35)", fontFamily: "'Montserrat', sans-serif" }}>Try adjusting your filters.</p>
                  <button onClick={clearAllFilters} className="text-[9px] uppercase tracking-[0.15em] px-6 py-2.5 transition-all duration-300" style={{ fontFamily: "'Montserrat', sans-serif", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}>
                    Clear Filters
                  </button>
                </motion.div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
                  {filtered.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03, duration: 0.4 }}>
                      <ProductCard product={product} onQuickView={setQuickViewId} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02, duration: 0.3 }}>
                      <ProductListCard product={product} onQuickView={setQuickViewId} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button onClick={() => setMobileFilterOpen(true)} className="relative flex items-center gap-2 px-6 py-3 text-[9px] uppercase tracking-[0.15em]" style={{ fontFamily: "'Montserrat', sans-serif", background: "#C9A84C", color: "#0D110E", fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          <SlidersHorizontal size={14} />
          Filter
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[8px] font-bold flex items-center justify-center rounded-full" style={{ background: "#0D110E", color: "#C9A84C" }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFilterOpen(false)} style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
            <motion.div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto lg:hidden" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ background: "#0D110E", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-3" style={{ background: "#0D110E" }}>
                <h3 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F0EBE0" }}>Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1" style={{ color: "rgba(201,168,76,0.4)" }}><X size={18} /></button>
              </div>
              <div className="px-6 py-4">
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

/* ── Filter Group ── */
const FilterGroup = ({
  label, options, value, onChange, disabled, disabledOptions = [],
}: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
  disabled?: boolean; disabledOptions?: string[];
}) => (
  <div className={cn(disabled && "opacity-30 pointer-events-none", "py-5")}>
    <h4
      className="text-[9px] uppercase mb-3"
      style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.2em", color: "rgba(201,168,76,0.45)", fontWeight: 500 }}
    >
      {label}
    </h4>
    <div className="flex flex-col gap-0.5">
      {options.map((opt) => {
        const isDisabled = disabledOptions.includes(opt);
        const isActive = value === opt;
        return (
          <button
            key={opt}
            onClick={() => !isDisabled && onChange(opt)}
            disabled={isDisabled}
            className="text-left text-[11px] py-1.5 transition-colors duration-200"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: isDisabled ? "rgba(201,168,76,0.15)" : isActive ? "#C9A84C" : "rgba(232,220,200,0.45)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontWeight: isActive ? 500 : 400,
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && !isActive) e.currentTarget.style.color = "rgba(232,220,200,0.7)";
            }}
            onMouseLeave={(e) => {
              if (!isDisabled && !isActive) e.currentTarget.style.color = "rgba(232,220,200,0.45)";
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
        <div className="absolute inset-x-0 h-px" style={{ background: "rgba(232,220,200,0.1)" }} />
        <div className="absolute h-px" style={{ left: `${pctMin}%`, right: `${100 - pctMax}%`, background: "rgba(201,168,76,0.5)" }} />
        <input type="range" min={min} max={max} step={5} value={valueMin} onChange={(e) => { const v = parseInt(e.target.value); if (v <= valueMax - 5) onChangeMin(v); }} className="dual-range-input absolute inset-x-0" style={{ zIndex: valueMin > max - 20 ? 5 : 3 }} />
        <input type="range" min={min} max={max} step={5} value={valueMax} onChange={(e) => { const v = parseInt(e.target.value); if (v >= valueMin + 5) onChangeMax(v); }} className="dual-range-input absolute inset-x-0" style={{ zIndex: 4 }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'Montserrat', sans-serif" }}>${valueMin}</span>
        <span className="text-[10px]" style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'Montserrat', sans-serif" }}>${valueMax}</span>
      </div>
    </div>
  );
};

/* ── Product Card — Grid view, Culta style ── */
const ProductCard = ({ product, onQuickView }: { product: Product; onQuickView: (id: string) => void }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: parseInt(product.id) || Date.now(), name: product.name, brand: product.brand || "", price: product.price, image: product.image_url || "" });
  };

  return (
    <div className="group">
      <Link to={`/shop/${product.id}`} className="block">
        {/* Image with gold tint like homepage */}
        <div 
          className="relative aspect-square overflow-hidden mb-3"
          style={{
            background: "radial-gradient(ellipse at center, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.10) 40%, rgba(201,168,76,0.03) 70%, transparent 100%)",
          }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src={logo} alt="LCC" className="w-14 h-14 object-contain opacity-15" />
            </div>
          )}
          {product.strain && (
            <span className="absolute top-3 left-3 z-10 text-[8px] uppercase tracking-[0.15em] px-2 py-0.5" style={{ color: "rgba(201,168,76,0.7)", background: "rgba(13,17,14,0.85)", backdropFilter: "blur(8px)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
              {product.strain}
            </span>
          )}

        </div>

        {/* Text — Culta style: price, brand, name */}
        <p className="text-xs sm:text-sm mb-0.5" style={{ color: "#C9A84C", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
          {product.price}
        </p>
        <p className="text-[9px] uppercase tracking-[0.12em] mb-0.5" style={{ color: "rgba(160,144,112,0.4)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
          {product.brand}
        </p>
        <h3 className="text-sm sm:text-base" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "#F0EBE0", lineHeight: 1.3 }}>
          {product.name}
        </h3>
      </Link>
    </div>
  );
};

/* ── Product List Card — List view, Culta style ── */
const ProductListCard = ({ product, onQuickView }: { product: Product; onQuickView: (id: string) => void }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: parseInt(product.id) || Date.now(), name: product.name, brand: product.brand || "", price: product.price, image: product.image_url || "" });
  };

  return (
    <Link to={`/shop/${product.id}`} className="group flex items-center gap-4 sm:gap-6 py-4 transition-colors" style={{ borderBottom: "1px solid rgba(201,168,76,0.06)" }}>
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.10) 40%, transparent 100%)" }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src={logo} alt="LCC" className="w-8 h-8 object-contain opacity-15" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm mb-0.5" style={{ color: "#C9A84C", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
          {product.price}
        </p>
        <p className="text-[9px] uppercase tracking-[0.12em] mb-0.5" style={{ color: "rgba(160,144,112,0.4)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
          {product.brand}
        </p>
        <h3 className="text-sm sm:text-base truncate" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "#F0EBE0" }}>
          {product.name}
        </h3>
        {product.strain && (
          <span className="text-[8px] uppercase tracking-[0.12em] mt-1 inline-block" style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'Montserrat', sans-serif" }}>
            {product.strain}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Shop;
