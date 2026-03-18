import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { checkAddress, type ComplianceCheckResult } from "@/lib/compliance";

const PICKUP_LOCATIONS = [
  { id: "dc", label: "Washington, DC", address: "5300 Connecticut Ave NW, Washington, DC" },
  { id: "pg", label: "PG County / Laurel, MD", address: "14718 Baltimore Ave, Laurel, MD 20707" },
  { id: "va", label: "Springfield, VA", address: "6500 Springfield Mall, Springfield, VA 22150" },
  { id: "baltimore", label: "Baltimore, MD", address: "3559 Boston St, Baltimore, MD 21224" },
];

const TIME_SLOTS = [
  "8:00 AM - 11:00 AM",
  "2:00 PM - 5:00 PM",
  "8:00 PM - 10:30 PM",
];

const MAX_SLOT_ORDERS = 5;

function getDeliveryFee(subtotal: number): number {
  if (subtotal >= 115) return 0;
  if (subtotal >= 50) return 7.5;
  return 15;
}

const inputCls = "w-full bg-transparent text-foreground placeholder-muted-foreground/40 px-0 py-3 text-sm font-sans focus:outline-none transition-colors";

const Checkout = () => {
  const { items, totalItems } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"delivery" | "pickup" | "postal" | "">("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compliance, setCompliance] = useState<ComplianceCheckResult | null>(null);
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});

  // Fetch today's order counts per time slot
  useEffect(() => {
    const fetchSlotCounts = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("orders")
        .select("time_slot")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((order) => {
          if (order.time_slot) counts[order.time_slot] = (counts[order.time_slot] || 0) + 1;
        });
        setSlotCounts(counts);
      }
    };
    fetchSlotCounts();
  }, []);

  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + parseFloat(item.price.replace("$", "")) * item.quantity, 0),
    [items]
  );

  // Run compliance check when state/zip changes
  useEffect(() => {
    const state = form.state.trim();
    if (!state || state.length < 2) { setCompliance(null); return; }
    const timer = setTimeout(async () => {
      setCheckingCompliance(true);
      try {
        const result = await checkAddress(state, form.zip.trim() || undefined);
        setCompliance(result);
      } catch { setCompliance(null); }
      setCheckingCompliance(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [form.state, form.zip]);

  const postalFee = compliance?.shipping?.fee ?? 9.99;
  const deliveryFee = method === "delivery" ? getDeliveryFee(subtotal) : method === "postal" ? postalFee : 0;
  const total = subtotal + deliveryFee;

  // Validate method based on compliance
  const methodError = useMemo(() => {
    if (!method || !compliance) return "";
    if (method === "delivery" && !compliance.local?.available && !compliance.stateCompliance?.can_deliver) {
      return "Local delivery is not available in your area. Please select Postal.";
    }
    if (method === "postal" && !compliance.shipping?.available) {
      return "Shipping is not available in your state.";
    }
    if (!compliance.canServe) {
      return compliance.restrictions.join(". ");
    }
    return "";
  }, [method, compliance]);

  const canSubmit = method && !methodError && form.name && form.email && form.phone && timeSlot &&
    (method === "pickup" ? pickupLocation : (form.address && form.city && form.state && form.zip));

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      const checkoutItems = items.map((item) => ({
        name: item.name,
        price: parseFloat(item.price.replace("$", "")),
        quantity: item.quantity,
        image: item.image,
      }));

      // Add delivery fee as a line item if applicable
      const allItems = [...checkoutItems];
      if (deliveryFee > 0) {
        allItems.push({ name: method === "postal" ? "Postal Shipping" : "Delivery Fee", price: deliveryFee, quantity: 1, image: "" });
      }

      const orderMeta = {
        delivery_method: method,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        delivery_address: method === "pickup" ? PICKUP_LOCATIONS.find(l => l.id === pickupLocation)?.address || "" : form.address,
        delivery_city: form.city,
        delivery_state: form.state,
        delivery_zip: form.zip,
        pickup_location: method === "pickup" ? pickupLocation : null,
        time_slot: timeSlot,
        delivery_fee: deliveryFee,
        subtotal,
        total,
        items: checkoutItems,
      };

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { items: allItems, orderMeta },
      });

      if (error) throw error;
      if (data?.url) {
        // Store order meta in sessionStorage so webhook/success page can use it
        sessionStorage.setItem("pending_order", JSON.stringify(orderMeta));
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error("Checkout failed", { description: err.message || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-xs font-sans uppercase editorial-spacing text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Cart
          </button>

          <div className="text-center mb-12">
            <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4">Checkout</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">How Would You Like Your Order?</h1>
          </div>

          {/* Step 1: Contact Info */}
          <div className="mb-12">
            <h2 className="font-serif text-xl text-foreground mb-6">Contact Information</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Method */}
          <div className="mb-12">
            <h2 className="font-serif text-xl text-foreground mb-6">Delivery Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "delivery" as const, label: "Delivery", desc: "We drive to you", sub: compliance?.local?.serviceArea ? `Available in ${compliance.local.serviceArea}` : "DMV & Baltimore area" },
                { id: "pickup" as const, label: "Pickup", desc: "Pick up from a location", sub: "DMV & Baltimore area" },
                { id: "postal" as const, label: "Postal", desc: "Mailed to you", sub: compliance?.shipping ? `$${compliance.shipping.fee} / ~${compliance.shipping.days} days` : "Available in legal states" },
              ].map((opt) => (
                <motion.button
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  className={`p-6 border text-left transition-all duration-300 ${
                    method === opt.id
                      ? "border-foreground/30 bg-foreground/5"
                      : "border-border/30 hover:border-border/60"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-serif text-lg text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground/60 font-sans mt-1">{opt.desc}</p>
                  <p className="text-[10px] text-muted-foreground/40 font-sans mt-1">{opt.sub}</p>
                </motion.button>
              ))}
            </div>
            {methodError && <p className="text-xs text-destructive mt-3 font-sans">{methodError}</p>}
          </div>

          {/* Step 3: Address (delivery/postal) or Pickup location */}
          {method === "pickup" && (
            <div className="mb-12">
              <h2 className="font-serif text-xl text-foreground mb-6">Select Pickup Location</h2>
              <RadioGroup value={pickupLocation} onValueChange={setPickupLocation} className="space-y-3">
                {PICKUP_LOCATIONS.map((loc) => (
                  <label key={loc.id} className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${pickupLocation === loc.id ? "border-foreground/30 bg-foreground/5" : "border-border/30 hover:border-border/60"}`}>
                    <RadioGroupItem value={loc.id} className="mt-1" />
                    <div>
                      <p className="font-serif text-sm text-foreground">{loc.label}</p>
                      <p className="text-xs text-muted-foreground/60 font-sans mt-0.5">{loc.address}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {(method === "delivery" || method === "postal") && (
            <div className="mb-12">
              <h2 className="font-serif text-xl text-foreground mb-6">
                {method === "delivery" ? "Delivery Address" : "Postal Address"}
              </h2>
              <div className="space-y-4">
                <input type="text" placeholder="Street Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
                  <input type="text" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls} />
                  <input type="text" placeholder="ZIP Code" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className={inputCls} />
                </div>
                {/* Compliance indicator */}
                {checkingCompliance && <p className="text-xs text-muted-foreground/60 font-sans mt-2">Checking availability...</p>}
                {compliance && !checkingCompliance && (
                  <div className={`mt-3 p-3 border text-xs font-sans ${compliance.canServe ? "border-foreground/20 bg-foreground/5 text-foreground" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>
                    {compliance.canServe ? (
                      <span>Service available — {compliance.method === "both" ? "Delivery & Postal" : compliance.method === "local" ? "Local Delivery" : "Postal"}</span>
                    ) : (
                      <span>{compliance.restrictions.join(". ")}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Same-day notice */}
          {method && method !== "pickup" && (
            <div className="mb-8 p-4 border border-foreground/20 bg-foreground/5 text-xs font-sans text-foreground">
              Orders placed before <span className="text-gold font-medium">2:00 PM</span> are sent out the same day.
            </div>
          )}

          {/* Step 4: Time Slot */}
          {method && (
            <div className="mb-12">
              <h2 className="font-serif text-xl text-foreground mb-6">
                <Clock size={18} className="inline mr-2" />
                {method === "pickup" ? "Pickup Time" : method === "delivery" ? "Delivery Time" : "Preferred Processing Time"}
              </h2>
              <RadioGroup value={timeSlot} onValueChange={setTimeSlot} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const count = slotCounts[slot] || 0;
                  const isFull = count >= MAX_SLOT_ORDERS;
                  return (
                    <label key={slot} className={`flex items-center gap-3 p-3 border transition-all ${isFull ? "opacity-40 cursor-not-allowed border-border/20" : timeSlot === slot ? "border-foreground/30 bg-foreground/5 cursor-pointer" : "border-border/30 hover:border-border/60 cursor-pointer"}`}>
                      <RadioGroupItem value={slot} disabled={isFull} />
                      <div>
                        <span className="text-sm font-sans text-foreground">{slot}</span>
                        {isFull && <p className="text-[10px] text-destructive font-sans">Fully booked</p>}
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* Order Summary */}
          {method && (
            <div className="pt-8 mb-8">
              <h2 className="font-serif text-xl text-foreground mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm font-sans">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border/20 pt-2 flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {method !== "pickup" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{method === "delivery" ? "Delivery Fee" : "Postal Shipping"}</span>
                    <span>{deliveryFee === 0 ? <span className="text-gold">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                )}
                {method === "delivery" && deliveryFee > 0 && subtotal < 115 && (
                  <p className="text-[10px] text-gold/70">
                    Add ${(115 - subtotal).toFixed(2)} more for free delivery!
                  </p>
                )}
                <div className="border-t border-border/30 pt-2 flex justify-between text-foreground font-serif text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full text-xs font-sans uppercase editorial-spacing border border-foreground text-foreground px-10 py-4 hover:bg-foreground hover:text-background transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={canSubmit ? { scale: 1.01 } : {}}
            whileTap={canSubmit ? { scale: 0.99 } : {}}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? "Processing..." : "Proceed to Payment"}
          </motion.button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Checkout;
