import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import DeliveryMap from "@/components/home/DeliveryMap";
import ScrollReveal from "@/components/home/ScrollReveal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StateInfo {
  state_name: string;
  state_code: string;
  can_ship: boolean;
  can_deliver: boolean;
}

interface AreaInfo {
  name: string;
}

const PICKUP_LOCATIONS = [
  { name: "Washington D.C.", address: "5300 Connecticut Ave NW" },
  { name: "PG County", address: "14718 Baltimore Ave, Laurel, MD 20707" },
  { name: "Virginia", address: "6500 Springfield Mall, Springfield, VA 22150" },
  { name: "Baltimore", address: "3559 Boston St, MD 21224" },
];

const Delivery = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [postalStates, setPostalStates] = useState<StateInfo[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<AreaInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [statesRes, areasRes] = await Promise.all([
        supabase.from("state_laws").select("state_name, state_code, can_ship, can_deliver").eq("active", true).order("state_name"),
        supabase.from("service_areas").select("name").eq("is_active", true).order("name"),
      ]);
      if (statesRes.data) setPostalStates((statesRes.data as StateInfo[]).filter(s => s.can_ship));
      if (areasRes.data) setDeliveryAreas(areasRes.data as AreaInfo[]);
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    toast.success("Message sent! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
  };

  const inputClasses = (field: string) =>
    `w-full bg-transparent border-b py-3 text-foreground font-sans text-sm outline-none transition-all duration-500 placeholder:text-muted-foreground/40 ${
      focused === field ? "border-gold" : "border-border/50"
    }`;

  return (
    <PageLayout>
      {/* Header */}
      <div className="pt-16 md:pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4">
              Service & Contact
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground">
              Delivery & Contact
            </h1>
          </ScrollReveal>
        </div>
      </div>

      {/* Interactive Globe */}
      <DeliveryMap />

      {/* Three Methods */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4 text-center">How It Works</p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center mb-16">Three Ways to Get Your Order</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Local Delivery",
                desc: "Same-day delivery within our service areas. Orders before 2 PM go out same day.",
                detail: "Free on orders $115+",
              },
              {
                title: "Pickup",
                desc: "Pick up from any of our four locations across the DMV and Baltimore.",
                detail: "Always free",
              },
              {
                title: "Postal",
                desc: "Mailed anywhere we legally can. Discreet packaging, fully tracked.",
                detail: "Flat rate per state",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="border border-border/30 p-8 hover:border-gold/30 transition-all duration-500">
                  <p className="font-serif text-xl text-foreground mb-3">{item.title}</p>
                  <p className="text-sm text-muted-foreground/70 font-sans leading-relaxed mb-4">{item.desc}</p>
                  <p className="text-xs text-gold font-sans uppercase editorial-spacing">{item.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="mt-12 text-center border border-gold/30 bg-gold/5 p-6">
              <p className="text-sm font-sans text-foreground">
                Orders placed before <span className="text-gold font-medium">2:00 PM</span> are sent out the same day.
              </p>
              <p className="text-xs text-muted-foreground/60 font-sans mt-2">Time slots are limited to 5 orders each.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Where We Deliver */}
      {deliveryAreas.length > 0 && (
        <section className="py-16 px-6 border-t border-border/20">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4 text-center">Local Delivery</p>
              <h2 className="font-serif text-2xl md:text-4xl text-foreground text-center mb-4">Where We Deliver</h2>
              <p className="text-sm text-muted-foreground/60 font-sans text-center mb-10">
                Same-day delivery available in these areas. Free on orders over $115.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-3">
                {deliveryAreas.map((area) => (
                  <span key={area.name} className="border border-border/30 px-5 py-2.5 text-sm font-sans text-foreground">
                    {area.name}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Pickup Locations */}
      <section className="py-16 px-6 border-t border-border/20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4 text-center">Pickup</p>
            <h2 className="font-serif text-2xl md:text-4xl text-foreground text-center mb-10">Pickup Locations</h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PICKUP_LOCATIONS.map((loc) => (
                <div key={loc.name} className="border border-border/30 p-5 hover:border-gold/30 transition-colors">
                  <p className="font-serif text-base text-foreground">{loc.name}</p>
                  <p className="text-xs text-muted-foreground/60 font-sans mt-1">{loc.address}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Postal States */}
      {postalStates.length > 0 && (
        <section className="py-16 px-6 border-t border-border/20">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4 text-center">Postal</p>
              <h2 className="font-serif text-2xl md:text-4xl text-foreground text-center mb-4">Where We Ship</h2>
              <p className="text-sm text-muted-foreground/60 font-sans text-center mb-10">
                Discreet, tracked postal service to all legal states. Must be 21+.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2">
                {postalStates.map((s) => (
                  <span key={s.state_code} className="border border-border/30 px-4 py-2 text-sm font-sans text-foreground hover:border-gold/30 transition-colors">
                    {s.state_name}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section className="py-24 md:py-32 px-6 border-t border-border/20">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4 text-center">
              Reach Out
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center mb-16">
              Send Us a Message
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <form onSubmit={handleSubmit} className="space-y-10">
              {[
                { field: "name", label: "Name", type: "text", value: name, onChange: setName, placeholder: "Your name" },
                { field: "email", label: "Email", type: "email", value: email, onChange: setEmail, placeholder: "your@email.com" },
              ].map(({ field, label, type, value, onChange, placeholder }) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <label className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-3 block">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(field)}
                    onBlur={() => setFocused(null)}
                    required
                    maxLength={field === "email" ? 255 : 100}
                    className={inputClasses(field)}
                    placeholder={placeholder}
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <label className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-3 block">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  required
                  maxLength={1000}
                  rows={4}
                  className={`${inputClasses("message")} resize-none`}
                  placeholder="How can we help?"
                />
              </motion.div>

              <div className="text-center pt-4">
                <motion.button
                  type="submit"
                  className="text-xs font-sans uppercase editorial-spacing border border-foreground text-foreground px-12 py-4 hover:bg-foreground hover:text-background transition-all duration-500"
                  whileHover={{ scale: 1.04, letterSpacing: "0.3em" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Send Message
                </motion.button>
              </div>
            </form>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-20">
              <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-2">
                Or email us directly
              </p>
              <motion.a
                href="mailto:admin@luxurycouriers.club"
                className="font-serif text-xl text-gold hover:text-gold/80 transition-colors duration-300 inline-block"
                whileHover={{ scale: 1.05 }}
              >
                admin@luxurycouriers.club
              </motion.a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageLayout>
  );
};

export default Delivery;
