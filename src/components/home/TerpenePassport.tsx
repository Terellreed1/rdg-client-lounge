import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const terpenes = [
  {
    id: "myrcene",
    name: "Myrcene",
    aroma: "Earthy, Musky, Herbal",
    effect: "Deeply relaxing, sedative",
    found: "Mangoes, Lemongrass, Thyme",
    color: "#22c55e",
    icon: "M",
    unlocked: true,
  },
  {
    id: "limonene",
    name: "Limonene",
    aroma: "Citrus, Lemon, Orange",
    effect: "Mood elevation, stress relief",
    found: "Citrus rinds, Juniper",
    color: "#facc15",
    icon: "L",
    unlocked: true,
  },
  {
    id: "caryophyllene",
    name: "Caryophyllene",
    aroma: "Spicy, Peppery, Woody",
    effect: "Anti-inflammatory, calming",
    found: "Black Pepper, Cloves, Cinnamon",
    color: "#f97316",
    icon: "C",
    unlocked: true,
  },
  {
    id: "linalool",
    name: "Linalool",
    aroma: "Floral, Lavender, Sweet",
    effect: "Anxiety relief, sedation",
    found: "Lavender, Coriander, Birch bark",
    color: "#a78bfa",
    icon: "💜",
    unlocked: false,
  },
  {
    id: "pinene",
    name: "Pinene",
    aroma: "Pine, Fresh, Sharp",
    effect: "Alertness, memory retention",
    found: "Pine needles, Rosemary, Basil",
    color: "#10b981",
    icon: "🌲",
    unlocked: false,
  },
  {
    id: "terpinolene",
    name: "Terpinolene",
    aroma: "Floral, Piney, Herbal",
    effect: "Uplifting, creative",
    found: "Lilacs, Nutmeg, Cumin",
    color: "#ec4899",
    icon: "🌸",
    unlocked: false,
  },
  {
    id: "humulene",
    name: "Humulene",
    aroma: "Earthy, Woody, Hoppy",
    effect: "Appetite suppressant, anti-inflammatory",
    found: "Hops, Sage, Ginseng",
    color: "#78716c",
    icon: "🍂",
    unlocked: false,
  },
  {
    id: "ocimene",
    name: "Ocimene",
    aroma: "Sweet, Tropical, Woody",
    effect: "Energizing, decongestant",
    found: "Mint, Parsley, Orchids",
    color: "#06b6d4",
    icon: "🌊",
    unlocked: false,
  },
];

const TerpenePassport = () => {
  const [selectedTerpene, setSelectedTerpene] = useState<string | null>(null);
  const unlockedCount = terpenes.filter((t) => t.unlocked).length;

  const selected = terpenes.find((t) => t.id === selectedTerpene);

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-4">
            Collector's Edition
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground">
            Terpene Passport
          </h2>
          <p className="text-sm text-muted-foreground font-sans mt-4 max-w-md mx-auto">
            Discover the building blocks of flavor and effect. Unlock terpene cards as you explore our collection.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-[2px] w-24 bg-border/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / terpenes.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">
              {unlockedCount} / {terpenes.length} collected
            </span>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-10">
            {terpenes.map((terpene, i) => (
              <motion.button
                key={terpene.id}
                onClick={() =>
                  setSelectedTerpene(selectedTerpene === terpene.id ? null : terpene.id)
                }
                className={`relative text-left p-5 border transition-all duration-500 group ${
                  selectedTerpene === terpene.id
                    ? "border-foreground/40 bg-foreground/5"
                    : terpene.unlocked
                    ? "border-border/30 hover:border-foreground/20"
                    : "border-border/15 opacity-50"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: terpene.unlocked ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                whileHover={terpene.unlocked ? { scale: 1.02 } : {}}
              >
                {/* Lock overlay */}
                {!terpene.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
                    <span className="text-lg">🔒</span>
                  </div>
                )}

                {/* Color accent line */}
                <div
                  className="w-6 h-[2px] mb-4 transition-all duration-300"
                  style={{ backgroundColor: terpene.unlocked ? terpene.color : "hsl(var(--border))" }}
                />

                <span className="text-2xl block mb-3">{terpene.icon}</span>

                <h3 className="font-serif text-sm text-foreground mb-1">{terpene.name}</h3>
                <p className="text-[9px] font-sans text-muted-foreground/60 uppercase editorial-spacing">
                  {terpene.unlocked ? terpene.aroma : "???"}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {selected && selected.unlocked && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="border border-border/30 p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-8">
                    <div className="flex-shrink-0 text-center">
                      <div
                        className="w-20 h-20 flex items-center justify-center text-4xl mx-auto mb-3"
                        style={{
                          background: `radial-gradient(circle, ${selected.color}15 0%, transparent 70%)`,
                        }}
                      >
                        {selected.icon}
                      </div>
                      <div
                        className="w-12 h-[2px] mx-auto"
                        style={{ backgroundColor: selected.color }}
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-serif text-2xl text-foreground mb-1">{selected.name}</h3>
                        <p className="text-xs font-sans text-muted-foreground/60 uppercase editorial-spacing">
                          Stamp #{terpenes.indexOf(selected) + 1}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[9px] font-sans uppercase editorial-spacing text-muted-foreground mb-1">
                            Aroma
                          </p>
                          <p className="text-xs font-sans text-foreground/80">{selected.aroma}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-sans uppercase editorial-spacing text-muted-foreground mb-1">
                            Effect
                          </p>
                          <p className="text-xs font-sans text-foreground/80">{selected.effect}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-sans uppercase editorial-spacing text-muted-foreground mb-1">
                            Also Found In
                          </p>
                          <p className="text-xs font-sans text-foreground/80">{selected.found}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <div className="text-center mt-10">
            <p className="text-xs text-muted-foreground/40 font-sans italic">
              Purchase products to unlock new terpene stamps in your passport
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TerpenePassport;
