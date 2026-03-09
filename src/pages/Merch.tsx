import { useState, useEffect } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";

// Fallback images for local display
import hatImg from "@/assets/merch/hat.png";
import socksImg from "@/assets/merch/socks.png";
import blanketHandsImg from "@/assets/merch/blanket-hands.png";
import teeCreamImg from "@/assets/merch/tee-cream.png";
import teeWhiteImg from "@/assets/merch/tee-white.png";
import teeAngelImg from "@/assets/merch/tee-angel.png";
import blanketLscImg from "@/assets/merch/blanket-lsc.jpg";
import teeWreathImg from "@/assets/merch/tee-wreath.png";
import mugImg from "@/assets/merch/mug.png";

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: { src: string }[];
  variants: {
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
  }[];
}

// Static fallback items (shown while loading or if API fails)
const fallbackItems = [
  { name: "LSC Trucker Hat", image: hatImg, category: "Headwear" },
  { name: "LSC Logo Socks", image: socksImg, category: "Accessories" },
  { name: "Creation Blanket", image: blanketHandsImg, category: "Home" },
  { name: "Vintage Club Tee", image: teeCreamImg, category: "Apparel" },
  { name: "Classic Logo Tee", image: teeWhiteImg, category: "Apparel" },
  { name: "Higher Standard Tee", image: teeAngelImg, category: "Apparel" },
  { name: "LSC Crest Blanket", image: blanketLscImg, category: "Home" },
  { name: "Wreath Logo Tee", image: teeWreathImg, category: "Apparel" },
  { name: "LSC Coffee Mug", image: mugImg, category: "Accessories" },
];

const Merch = () => {
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('printify', {
        body: null,
        method: 'GET',
      });

      // Use URL params approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printify?action=products`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();
      
      if (result.products?.data) {
        setProducts(result.products.data);
        setShopId(result.shop_id);
      } else if (result.data) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Error fetching Printify products:', err);
      setError('Unable to load products from store');
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: PrintifyProduct) => {
    const enabledVariant = product.variants?.find(v => v.is_enabled);
    if (enabledVariant) {
      return `$${(enabledVariant.price / 100).toFixed(2)}`;
    }
    return null;
  };

  const getProductImage = (product: PrintifyProduct) => {
    return product.images?.[0]?.src || null;
  };

  // Show Printify products if available, otherwise show fallback
  const displayProducts = products.length > 0;

  return (
    <PageLayout>
      <div className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p
              className="text-xs font-sans uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: "#C9A84C" }}
            >
              Lifestyle
            </p>
            <h1
              className="text-4xl md:text-6xl mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
            >
              Official Merch
            </h1>
            <div className="mx-auto h-px w-16 mb-8" style={{ background: "#C9A84C" }} />
            <p
              className="text-sm md:text-base font-light max-w-md mx-auto leading-relaxed"
              style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(160,144,112,0.7)" }}
            >
              Premium apparel and accessories for the elevated lifestyle.
            </p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#C9A84C" }} />
            </div>
          )}

          {!loading && displayProducts && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 mb-16">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  className="group"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.05, duration: 0.45 }}
                >
                  <a
                    href="https://www.luxurysmokersclub.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div
                      className="relative aspect-square overflow-hidden mb-3 sm:mb-4 rounded-sm"
                      style={{
                        background: "radial-gradient(ellipse at center, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.06) 40%, rgba(201,168,76,0.02) 70%, transparent 100%)",
                      }}
                    >
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)!}
                          alt={product.title}
                          className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,13,9,0.3) 100%)",
                        }}
                      />
                    </div>

                    {getProductPrice(product) && (
                      <p
                        className="text-xs sm:text-sm mb-1"
                        style={{ color: "#C9A84C", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
                      >
                        {getProductPrice(product)}
                      </p>
                    )}
                    <h3
                      className="text-sm sm:text-[15px] group-hover:text-gold transition-colors"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                        color: "#F0EBE0",
                        lineHeight: 1.3,
                      }}
                    >
                      {product.title}
                    </h3>
                  </a>
                </motion.div>
              ))}
            </div>
          )}

          {/* Fallback grid when API fails or no products */}
          {!loading && !displayProducts && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 mb-16">
              {fallbackItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  className="group"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.05, duration: 0.45 }}
                >
                  <a
                    href="https://www.luxurysmokersclub.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div
                      className="relative aspect-square overflow-hidden mb-3 sm:mb-4 rounded-sm"
                      style={{
                        background: "radial-gradient(ellipse at center, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.06) 40%, rgba(201,168,76,0.02) 70%, transparent 100%)",
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                        style={{
                          mixBlendMode: "multiply",
                          filter: "contrast(1.02)",
                        }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,13,9,0.3) 100%)",
                        }}
                      />
                    </div>

                    <p
                      className="text-[9px] uppercase mb-1"
                      style={{
                        letterSpacing: "0.12em",
                        color: "rgba(160,144,112,0.4)",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {item.category}
                    </p>
                    <h3
                      className="text-sm sm:text-[15px] group-hover:text-gold transition-colors"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                        color: "#F0EBE0",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </h3>
                  </a>
                </motion.div>
              ))}
            </div>
          )}

          {/* Shop button */}
          <div className="text-center">
            <a
              href="https://www.luxurysmokersclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] uppercase px-10 py-3.5 font-sans font-medium transition-all duration-300"
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
              Shop Full Collection <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Merch;
