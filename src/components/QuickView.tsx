import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ImageOff, ExternalLink } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface QuickViewProps {
  productId: string | null;
  onClose: () => void;
}

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

interface ProductImage {
  id: string;
  image_url: string;
  sort_order: number;
}

const QuickView = ({ productId, onClose }: QuickViewProps) => {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setQuantity(1);
    setSelectedImg(0);
    Promise.all([
      supabase.from("products").select("*").eq("id", productId).eq("active", true).single(),
      supabase.from("product_images").select("id, image_url, sort_order").eq("product_id", productId).order("sort_order"),
    ]).then(([{ data: prod }, { data: imgs }]) => {
      setProduct(prod);
      setImages(imgs || []);
      setLoading(false);
    });
  }, [productId]);

  useEffect(() => {
    if (productId) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addItem({ id: product.id as unknown as number, name: product.name, brand: product.brand, price: product.price, image: product.image_url || "/placeholder.svg" });
    }
    setTimeout(() => { setIsAdding(false); onClose(); }, 600);
  };

  const displayImage = images.length > 0 ? images[selectedImg]?.image_url : product?.image_url;

  return (
    <AnimatePresence>
      {productId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Panel */}
          <motion.div
            className="relative z-10 bg-background w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close quick view"
            >
              <X size={18} />
            </button>

            {loading ? (
              <div className="py-24 flex justify-center">
                <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
              </div>
            ) : product ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6">
                {/* Image */}
                <div className="p-4 sm:p-6">
                  <div className="aspect-square rounded-xl overflow-hidden relative bg-muted/10">
                    <AnimatePresence mode="wait">
                      {displayImage ? (
                        <motion.img
                          key={displayImage}
                          src={displayImage}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-contain"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30">
                          <ImageOff size={40} strokeWidth={1} />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImg(i)}
                          className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImg === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-6 sm:pl-0 flex flex-col justify-between">
                  <div>
                    {product.is_new && (
                      <span className="text-[10px] font-sans uppercase editorial-spacing text-primary mb-2 inline-block">New Drop</span>
                    )}
                    <h2 className="font-serif text-2xl text-foreground mb-1">{product.name}</h2>
                    <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                    <p className="text-lg font-medium text-foreground mb-4">{product.price}</p>

                    {product.strain && (
                      <span className="inline-block text-[10px] font-sans uppercase editorial-spacing text-muted-foreground border border-border/50 px-3 py-1 rounded-full mb-4">
                        {product.strain}
                      </span>
                    )}

                    {product.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-6 line-clamp-4">{product.description}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Quantity + Add to Cart */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border/50 rounded-lg">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-sans text-foreground min-w-[32px] text-center">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(product.qty || 99, quantity + 1))} className="p-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <motion.button
                        onClick={handleAddToCart}
                        className="flex-1 flex items-center justify-center gap-2 text-xs font-sans uppercase editorial-spacing bg-foreground text-background px-6 py-3.5 rounded-lg transition-all duration-300 hover:opacity-90"
                        whileTap={{ scale: 0.97 }}
                        animate={isAdding ? { scale: [1, 1.03, 1] } : {}}
                      >
                        {isAdding ? "Added!" : "Add to Cart"}
                      </motion.button>
                    </div>

                    {/* View full details link */}
                    <Link
                      to={`/shop/${product.id}`}
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 text-xs font-sans uppercase editorial-spacing text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <ExternalLink size={12} /> View Full Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">Product not found</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
