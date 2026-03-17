import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const methods = [
  {
    title: "Local Delivery",
    desc: "Same-day delivery across the DMV. Free on orders over $115.",
  },
  {
    title: "Postal Shipping",
    desc: "Discreet, tracked packages mailed to all legal states.",
  },
  {
    title: "In-Store Pickup",
    desc: "Grab your order from any of our four locations — always free.",
  },
];

const ConvenienceSection = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs font-sans uppercase editorial-spacing text-gold mb-3 text-center">
            We Value Convenience
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center mb-4">
            Three Ways to Get Your Order
          </h2>
          <p className="text-sm text-muted-foreground/60 font-sans text-center mb-12 max-w-lg mx-auto">
            However you want it — we make it easy.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {methods.map((m, i) => (
            <motion.div
              key={m.title}
              className="border border-border/30 p-7 hover:border-gold/30 transition-all duration-500 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              whileHover={{ y: -3 }}
            >
              <h3 className="font-serif text-lg text-foreground mb-2">{m.title}</h3>
              <p className="text-xs text-muted-foreground/70 font-sans leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/delivery"
                className="inline-block text-xs font-sans uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors border-b border-border pb-0.5"
              >
                View Delivery Details →
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ConvenienceSection;
