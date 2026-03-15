import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const RitualAnimation = () => {
  const [playing, setPlaying] = useState(false);
  const [stage, setStage] = useState(0);

  const stages = [
    { label: "Selected", icon: "✦" },
    { label: "Inspected", icon: "◉" },
    { label: "Wrapped", icon: "▣" },
    { label: "Sealed", icon: "◆" },
    { label: "Yours", icon: "✓" },
  ];

  const startRitual = () => {
    setPlaying(true);
    setStage(0);
    // Progress through stages
    for (let i = 1; i < stages.length; i++) {
      setTimeout(() => setStage(i), i * 800);
    }
    // Reset after completion
    setTimeout(() => {
      setPlaying(false);
      setStage(0);
    }, stages.length * 800 + 1500);
  };

  return (
    <section className="py-24 md:py-32 px-6 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-4">
            The Experience
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground italic">
            The Ritual
          </h2>
          <p className="text-sm text-muted-foreground font-sans mt-4 max-w-md mx-auto">
            Every order is a ceremony. Watch how we prepare your selection with luxury care.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="flex flex-col items-center">
            {/* Product card mock */}
            <div className="relative w-56 h-72 mb-12">
              <motion.div
                className="absolute inset-0 border border-border/50 bg-background flex flex-col items-center justify-center"
                animate={
                  playing
                    ? {
                        scale: [1, 0.95, 1.02, 0.98, 1],
                        rotateY: [0, 0, 180, 360, 360],
                      }
                    : {}
                }
                transition={{ duration: 3.2, ease: [0.25, 0.4, 0.25, 1] }}
                style={{ perspective: 1000, transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <span className="font-serif text-5xl text-foreground/10 mb-4">✦</span>
                <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground">
                  Premium Flower
                </p>
                <p className="text-[10px] font-sans text-muted-foreground/50 mt-1">
                  Indica · 3.5g
                </p>
              </motion.div>

              {/* Wrapping overlay */}
              <AnimatePresence>
                {playing && stage >= 2 && (
                  <motion.div
                    className="absolute inset-0 z-10"
                    initial={{ clipPath: "inset(100% 0 0 0)" }}
                    animate={{ clipPath: "inset(0% 0 0 0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    <div className="w-full h-full bg-foreground flex items-center justify-center">
                      <motion.span
                        className="font-serif text-2xl text-background italic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {stage >= 4 ? "Yours." : "Wrapping..."}
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Seal stamp */}
              <AnimatePresence>
                {playing && stage >= 3 && (
                  <motion.div
                    className="absolute -bottom-4 -right-4 z-20 w-16 h-16 rounded-full bg-foreground flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                  >
                    <span className="text-background font-serif text-xs italic">LC</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stage progress */}
            <div className="flex items-center gap-1 md:gap-2 mb-10">
              {stages.map((s, i) => (
                <div key={i} className="flex items-center">
                  <motion.div
                    className={`flex flex-col items-center gap-1.5 px-2 md:px-4 transition-all duration-500`}
                    animate={{
                      opacity: playing ? (i <= stage ? 1 : 0.2) : 0.4,
                    }}
                  >
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-[8px] md:text-[9px] font-sans uppercase editorial-spacing text-muted-foreground whitespace-nowrap">
                      {s.label}
                    </span>
                  </motion.div>
                  {i < stages.length - 1 && (
                    <motion.div
                      className="w-4 md:w-8 h-[1px] bg-border/30"
                      animate={{
                        backgroundColor:
                          playing && i < stage
                            ? "hsl(var(--foreground))"
                            : "hsl(var(--border) / 0.3)",
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Trigger button */}
            <motion.button
              onClick={startRitual}
              disabled={playing}
              className="px-10 py-3.5 border border-foreground text-foreground text-xs font-sans uppercase editorial-spacing hover:bg-foreground hover:text-background transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={!playing ? { scale: 1.02 } : {}}
              whileTap={!playing ? { scale: 0.98 } : {}}
            >
              {playing ? "Preparing..." : "Experience The Ritual"}
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default RitualAnimation;
