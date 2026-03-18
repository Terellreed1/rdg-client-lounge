import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/home/ScrollReveal";

const sections = [
  {
    heading: "Born from the culture.",
    body: "Luxury Couriers was founded with a simple belief: cannabis is more than a product — it's a lifestyle, a community, and a movement. We emerged from the streets with a vision to elevate the experience, bringing together premium quality and authentic culture under one roof.",
  },
  {
    heading: "Curated with intention.",
    body: "Every product in our collection is hand-selected from the most respected brands in the industry. We partner with cultivators and extractors who share our commitment to quality, potency, and purity. From seed to shelf, excellence is non-negotiable.",
  },
  {
    heading: "For the community, always.",
    body: "We believe in giving back. Through education, charitable involvement, and community-driven initiatives, we're building a future where cannabis is understood, respected, and accessible. Our doors are open to everyone — whether you're a connoisseur or just curious.",
  },
];

const About = () => {
  return (
    <PageLayout>
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-6">Our Story</p>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-[6.5rem] text-foreground leading-[0.95] tracking-tight">About Us</h1>
            </div>
          </ScrollReveal>

          {/* Story Sections */}
          <div className="space-y-24">
            {sections.map((section, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                <motion.div
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-serif text-2xl md:text-4xl text-foreground mb-8 italic">
                    {section.heading}
                  </h2>
                  <p className="text-base text-muted-foreground leading-loose font-sans">
                    {section.body}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;
