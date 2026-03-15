import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ImageOff, ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/home/ScrollReveal";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

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
}

interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  sort_order: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("products").select("*").eq("id", id).eq("active", true).single(),
      supabase.from("reviews").select("id, author_name, rating, body").eq("product_id", id).eq("active", true).order("created_at", { ascending: false }).limit(10),
      supabase.from("product_images").select("id, image_url, sort_order").eq("product_id", id).order("sort_order"),
    ]).then(([{ data: prod }, { data: revs }, { data: imgs }]) => {
      setProduct(prod);
      setReviews(revs || []);
      setImages(imgs || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="py-32 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto" />
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="py-32 text-center">
          <h1 className="font-serif text-4xl text-foreground mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-primary text-sm font-sans uppercase editorial-spacing">Back to Shop</Link>
        </div>
      </PageLayout>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addItem({ id: product.id as unknown as number, name: product.name, brand: product.brand, price: product.price, image: product.image_url || "/placeholder.svg" });
    }
    setTimeout(() => setIsAdding(false), 600);
    setQuantity(1);
  };

  return (
    <PageLayout>
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-sans uppercase editorial-spacing text-primary mb-12 hover:text-foreground transition-colors">
              <ArrowLeft size={14} /> Back to Shop
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            <ScrollReveal direction="left">
              <div className="space-y-3">
                {/* Main image */}
                <div className="aspect-[3/4] overflow-hidden relative rounded-2xl">
                  <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                      <motion.img
                        key={images[selectedImg]?.id}
                        src={images[selectedImg]?.image_url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : product.image_url ? (
                      <motion.img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-contain"
                        initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
                        <ImageOff size={64} strokeWidth={1} />
                        <span className="text-xs mt-3 uppercase tracking-wider">No Photo Yet</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImg(i)}
                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImg === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="flex flex-col justify-center">
                {product.is_new && <span className="text-xs font-sans uppercase editorial-spacing text-primary mb-4">New Drop</span>}
                <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">{product.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{product.price}</p>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>
                )}

                <div className="flex items-center gap-6 mb-12">
                  <div className="flex items-center border border-border/50">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Decrease quantity"><Minus size={14} /></button>
                    <span className="px-5 text-sm font-sans text-foreground min-w-[40px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.qty || 99, quantity + 1))} className="p-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Increase quantity"><Plus size={14} /></button>
                  </div>
                  <motion.button onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-3 text-xs font-sans uppercase editorial-spacing border border-foreground text-foreground hover:bg-foreground hover:text-background px-8 py-4 transition-all duration-500"
                    whileHover={{ scale: 1.03, letterSpacing: "0.3em" }} whileTap={{ scale: 0.97 }}
                    animate={isAdding ? { scale: [1, 1.05, 1], transition: { duration: 0.4 } } : {}}
                  >
                    {isAdding ? "Added!" : "Add to Cart"}
                  </motion.button>
                </div>

                <div className="border-t border-border/50 pt-8 space-y-4">
                  <p className="text-[10px] text-muted-foreground/60 font-sans leading-relaxed">
                    <strong className="text-muted-foreground/80">FDA Disclaimer:</strong> These statements have not been evaluated by the Food and Drug Administration.
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-sans leading-relaxed">
                    <strong className="text-muted-foreground/80">Cannabis Warning:</strong> This product contains THC. For use only by adults 21 and older.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-20 border-t border-border/50 pt-12">
              <h2 className="font-serif text-2xl text-foreground mb-8">Customer Reviews</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-border/50 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < r.rating ? "opacity-100" : "opacity-20"}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-sans">{r.author_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductDetail;
