import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const DROP_DATE = new Date("2026-03-01T12:00:00");

const DropAlert = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = DROP_DATE.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-serif text-4xl md:text-6xl text-foreground tabular-nums"
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <p className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground mt-2">{label}</p>
    </div>
  );

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Subtle accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold)) 0%, transparent 70%)" }}
      />

      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <motion.div
            className="inline-block mb-6 px-4 py-1.5 border border-foreground/20"
            animate={{ boxShadow: ["0 0 20px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.06)", "0 0 20px rgba(255,255,255,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-[10px] font-sans uppercase editorial-spacing text-gold">Incoming Drop</span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-3">
            Something Special is Coming
          </h2>
          <p className="text-sm font-sans text-muted-foreground mb-16 max-w-md mx-auto">
            A new exclusive collection drops soon. Be the first to cop.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex justify-center gap-8 md:gap-16">
            <TimeBlock value={timeLeft.days} label="Days" />
            <div className="font-serif text-3xl md:text-5xl text-muted-foreground/30 self-start mt-1">:</div>
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <div className="font-serif text-3xl md:text-5xl text-muted-foreground/30 self-start mt-1">:</div>
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <div className="font-serif text-3xl md:text-5xl text-muted-foreground/30 self-start mt-1">:</div>
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <motion.button
            className="mt-16 px-10 py-3.5 text-xs font-sans uppercase editorial-spacing border border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-all duration-500"
            whileHover={{ scale: 1.05, letterSpacing: "0.3em" }}
            whileTap={{ scale: 0.95 }}
          >
            Notify Me
          </motion.button>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DropAlert;
