import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const infoItems = [
  { title: "Luxury", description: "Curated top-shelf selections for the refined palate." },
  { title: "Culture", description: "Rooted in the community we serve, every day." },
  { title: "Quality", description: "Lab-tested, hand-picked, never compromised." },
  { title: "Service", description: "White-glove delivery across the East Coast." },
];

const StoreInfo = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-foreground text-center mb-3">
            Why Choose Us
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-10 font-sans max-w-lg mx-auto">
            More than a brand — a lifestyle.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 mb-12">
          {infoItems.map((item, i) => (
            <motion.div
              key={item.title}
              className="text-center"
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              whileHover={{ y: -4 }}
            >
              <h3 className="font-serif text-sm sm:text-base text-foreground mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/delivery"
                className="inline-block text-xs font-sans uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                View Full Delivery Map →
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default StoreInfo;
