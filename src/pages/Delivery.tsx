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
  legal_status: string;
  can_ship: boolean;
  can_deliver: boolean;
  shipping_fee: number;
  estimated_days: number;
  min_age: number;
}

interface AreaInfo {
  name: string;
  delivery_fee: number;
  estimated_time_minutes: number;
}

const Delivery = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [states, setStates] = useState<StateInfo[]>([]);
  const [areas, setAreas] = useState<AreaInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [statesRes, areasRes] = await Promise.all([
        supabase.from("state_laws").select("state_name, state_code, legal_status, can_ship, can_deliver, shipping_fee, estimated_days, min_age").eq("active", true).order("state_name"),
        supabase.from("service_areas").select("name, delivery_fee, estimated_time_minutes").eq("is_active", true).order("name"),
      ]);
      if (statesRes.data) setStates(statesRes.data as StateInfo[]);
      if (areasRes.data) setAreas(areasRes.data as AreaInfo[]);
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

  const deliverableStates = states.filter(s => s.can_deliver);
  const shippableStates = states.filter(s => s.can_ship);

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

      {/* Interactive Earth Map */}
      <DeliveryMap />

      {/* How It Works */}
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
                desc: "Same-day delivery within our service areas. Orders placed before 2:00 PM ship same day.",
                detail: "Free on orders $115+",
              },
              {
                title: "Pickup",
                desc: "Pick up from one of our locations in DC, PG County, Springfield VA, or Baltimore.",
                detail: "Always free",
              },
              {
                title: "Postal",
                desc: "Mailed to you anywhere we legally can. Discreet packaging, tracked shipment.",
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

          {/* Same-day notice */}
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

      {/* Delivery Fee Breakdown */}
      <section className="py-16 px-6 border-t border-border/20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4 text-center">Local Delivery Fees</p>
            <h2 className="font-serif text-2xl md:text-4xl text-foreground text-center mb-12">Delivery Pricing</h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="space-y-4">
              {[
                { range: "Under $50", fee: "$15.00" },
                { range: "$50 – $114.99", fee: "$7.50" },
                { range: "$115+", fee: "FREE", highlight: true },
              ].map((tier) => (
                <div key={tier.range} className="flex justify-between items-center py-3 border-b border-border/20">
                  <span className="text-sm font-sans text-muted-foreground">{tier.range}</span>
                  <span className={`text-sm font-sans ${tier.highlight ? "text-gold font-medium" : "text-foreground"}`}>{tier.fee}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Service Areas */}
          {areas.length > 0 && (
            <ScrollReveal delay={0.2}>
              <div className="mt-16">
                <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-6 text-center">Service Areas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {areas.map((area) => (
                    <div key={area.name} className="border border-border/30 p-5">
                      <p className="font-serif text-base text-foreground">{area.name}</p>
                      <p className="text-xs text-muted-foreground/60 font-sans mt-1">
                        ~{area.estimated_time_minutes} min · ${area.delivery_fee.toFixed(2)} fee
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* State Availability */}
      <section className="py-16 px-6 border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-4 text-center">Where We Serve</p>
            <h2 className="font-serif text-2xl md:text-4xl text-foreground text-center mb-4">State Availability</h2>
            <p className="text-sm text-muted-foreground/60 font-sans text-center mb-12">
              We operate in compliance with each state's cannabis laws. Must be 21+ in all states.
            </p>
          </ScrollReveal>

          {/* Postal States */}
          {shippableStates.length > 0 && (
            <ScrollReveal delay={0.1}>
              <div className="mb-12">
                <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-4">Postal Available</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {shippableStates.map((s) => (
                    <div key={s.state_code} className="border border-border/30 p-3 hover:border-gold/30 transition-colors">
                      <p className="text-sm font-sans text-foreground">{s.state_name}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-sans mt-1">
                        ${s.shipping_fee} · ~{s.estimated_days} days
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Local Delivery States */}
          {deliverableStates.length > 0 && (
            <ScrollReveal delay={0.2}>
              <div>
                <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-4">Local Delivery Available</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {deliverableStates.map((s) => (
                    <div key={s.state_code} className="border border-gold/30 bg-gold/5 p-3">
                      <p className="text-sm font-sans text-foreground">{s.state_name}</p>
                      <p className="text-[10px] text-gold/70 font-sans mt-1">
                        {s.can_ship ? "Delivery & Postal" : "Delivery Only"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

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

          {/* Email */}
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
