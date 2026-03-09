import { useState, useEffect } from "react";
import { X, Loader2, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Variant {
  id: number;
  title: string;
  price: number;
  is_enabled: boolean;
  options: number[];
}

interface Option {
  id: number;
  title: string;
  type: string;
  values: { id: number; title: string; colors?: string[] }[];
}

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: { src: string; variant_ids: number[]; is_default: boolean }[];
  variants: Variant[];
  options: Option[];
}

interface MerchQuickViewProps {
  product: PrintifyProduct | null;
  shopId: string;
  onClose: () => void;
}

const MerchQuickView = ({ product, shopId, onClose }: MerchQuickViewProps) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (product?.variants) {
      const enabledVariant = product.variants.find(v => v.is_enabled);
      if (enabledVariant) {
        setSelectedVariant(enabledVariant);
        // Set initial options based on first enabled variant
        if (product.options) {
          const initialOptions: Record<string, number> = {};
          product.options.forEach((opt, idx) => {
            if (enabledVariant.options[idx] !== undefined) {
              initialOptions[opt.title] = enabledVariant.options[idx];
            }
          });
          setSelectedOptions(initialOptions);
        }
      }
    }
  }, [product]);

  useEffect(() => {
    // Find matching variant when options change
    if (product?.variants && product?.options && Object.keys(selectedOptions).length > 0) {
      const matchingVariant = product.variants.find(v => {
        if (!v.is_enabled) return false;
        return product.options.every((opt, idx) => {
          const selectedValue = selectedOptions[opt.title];
          return v.options[idx] === selectedValue;
        });
      });
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      }
    }
  }, [selectedOptions, product]);

  const getVariantImage = () => {
    if (!product?.images || !selectedVariant) {
      return product?.images?.[0]?.src;
    }
    const variantImage = product.images.find(img => 
      img.variant_ids?.includes(selectedVariant.id)
    );
    return variantImage?.src || product.images[0]?.src;
  };

  const handleCheckout = async () => {
    if (!selectedVariant || !product) {
      toast.error("Please select all options");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/merch-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop_id: shopId,
            product_id: product.id,
            variant_id: selectedVariant.id,
            quantity,
            product_title: product.title,
            variant_title: selectedVariant.title,
            price: selectedVariant.price,
            image: getVariantImage(),
          }),
        }
      );

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (!product) return null;

  const allImages = product.images?.filter(img => img.src) || [];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          style={{ background: "#0A0D09" }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 transition-colors"
            style={{ color: "rgba(160,144,112,0.6)" }}
          >
            <X size={24} />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden">
                <img
                  src={allImages[currentImageIndex]?.src || getVariantImage()}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.slice(0, 6).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className="flex-shrink-0 w-16 h-16 overflow-hidden transition-opacity"
                      style={{
                        opacity: currentImageIndex === idx ? 1 : 0.5,
                        border: currentImageIndex === idx ? "1px solid #C9A84C" : "1px solid transparent",
                      }}
                    >
                      <img
                        src={img.src}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <h2
                  className="text-2xl md:text-3xl mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    color: "#F0EBE0",
                  }}
                >
                  {product.title}
                </h2>
                {selectedVariant && (
                  <p
                    className="text-xl"
                    style={{ color: "#C9A84C", fontWeight: 500 }}
                  >
                    {formatPrice(selectedVariant.price)}
                  </p>
                )}
              </div>

              {/* Options */}
              {product.options?.map((option) => (
                <div key={option.id} className="space-y-3">
                  <label
                    className="block text-xs uppercase"
                    style={{
                      letterSpacing: "0.15em",
                      color: "rgba(160,144,112,0.7)",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {option.title}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.title] === value.id;
                      const isColor = option.type === 'color' && value.colors;
                      
                      return (
                        <button
                          key={value.id}
                          onClick={() => setSelectedOptions(prev => ({
                            ...prev,
                            [option.title]: value.id
                          }))}
                          className="px-4 py-2 text-sm transition-all"
                          style={{
                            border: isSelected 
                              ? "1px solid #C9A84C" 
                              : "1px solid rgba(160,144,112,0.3)",
                            background: isSelected 
                              ? "rgba(201,168,76,0.1)" 
                              : "transparent",
                            color: isSelected ? "#C9A84C" : "#F0EBE0",
                            fontFamily: "'Montserrat', sans-serif",
                          }}
                        >
                          {isColor && value.colors?.[0] && (
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ background: value.colors[0] }}
                            />
                          )}
                          {value.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="space-y-3">
                <label
                  className="block text-xs uppercase"
                  style={{
                    letterSpacing: "0.15em",
                    color: "rgba(160,144,112,0.7)",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 transition-colors"
                    style={{ 
                      border: "1px solid rgba(160,144,112,0.3)",
                      color: "#F0EBE0" 
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span
                    className="w-12 text-center text-lg"
                    style={{ color: "#F0EBE0" }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-2 transition-colors"
                    style={{ 
                      border: "1px solid rgba(160,144,112,0.3)",
                      color: "#F0EBE0" 
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || !selectedVariant}
                className="w-full py-4 text-xs uppercase font-medium transition-all disabled:opacity-50"
                style={{
                  letterSpacing: "0.2em",
                  background: "#C9A84C",
                  color: "#0A0D09",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  `Buy Now — ${selectedVariant ? formatPrice(selectedVariant.price * quantity) : ''}`
                )}
              </button>

              {/* Description */}
              {product.description && (
                <div
                  className="pt-6 text-sm leading-relaxed"
                  style={{
                    borderTop: "1px solid rgba(160,144,112,0.15)",
                    color: "rgba(160,144,112,0.7)",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MerchQuickView;
