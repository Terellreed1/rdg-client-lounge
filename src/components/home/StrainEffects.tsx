import { motion } from "framer-motion";
import ScrollReveal, { StaggerContainer } from "./ScrollReveal";

const strains = [
  {
    name: "Dirty Fantasy Slushie",
    brand: "JoJo Exotics",
    type: "Hybrid" as const,
    effects: { Relaxed: 85, Euphoric: 90, Creative: 70, Energetic: 60, Focused: 50 },
  },
  {
    name: "Verzaza",
    brand: "Frutaz",
    type: "Sativa" as const,
    effects: { Relaxed: 40, Euphoric: 80, Creative: 95, Energetic: 85, Focused: 75 },
  },
  {
    name: "Cotton Candy Clouds",
    brand: "Always Faded",
    type: "Indica" as const,
    effects: { Relaxed: 95, Euphoric: 70, Creative: 45, Energetic: 20, Focused: 35 },
  },
  {
    name: "Empire State",
    brand: "Super Candy Bros",
    type: "Sativa" as const,
    effects: { Relaxed: 50, Euphoric: 85, Creative: 80, Energetic: 90, Focused: 70 },
  },
];

const typeColors: Record<string, string> = {
  Indica: "from-purple-500 to-purple-400",
  Sativa: "from-emerald-500 to-emerald-400",
  Hybrid: "from-amber-500 to-amber-400",
};

const typeBadgeColors: Record<string, string> = {
  Indica: "text-purple-400 border-purple-400/30",
  Sativa: "text-emerald-400 border-emerald-400/30",
  Hybrid: "text-amber-400 border-amber-400/30",
};

const EffectBar = ({ label, value, gradient, delay }: { label: string; value: number; gradient: string; delay: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground w-20 text-right shrink-0">
      {label}
    </span>
    <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: [0.25, 0.4, 0.25, 1] }}
      />
    </div>
    <span className="text-[10px] font-sans text-muted-foreground w-8">{value}%</span>
  </div>
);

const StrainEffects = () => {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-4">
              Know Your Strain
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground">Effect Profiles</h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-10" staggerDelay={0.15}>
          {strains.map((strain) => (
            <motion.div
              key={strain.name}
              className="p-6 hover:bg-foreground/[0.02] transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl text-foreground">{strain.name}</h3>
                  <p className="text-xs font-sans text-muted-foreground mt-1">{strain.brand}</p>
                </div>
                <span className={`text-[10px] font-sans uppercase editorial-spacing border px-3 py-1 ${typeBadgeColors[strain.type]}`}>
                  {strain.type}
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(strain.effects).map(([effect, value], i) => (
                  <EffectBar
                    key={effect}
                    label={effect}
                    value={value}
                    gradient={typeColors[strain.type]}
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default StrainEffects;
