import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";

const tiers = [
  { name: "Spark", threshold: 0, icon: "✦", perks: ["Welcome bonus", "Birthday reward"] },
  { name: "Ember", threshold: 250, icon: "✦✦", perks: ["5% off all orders", "Early drop access"] },
  { name: "Blaze", threshold: 500, icon: "✦✦✦", perks: ["10% off all orders", "Free delivery", "Exclusive strains"] },
  { name: "Inferno", threshold: 1000, icon: "✦✦✦✦", perks: ["15% off all orders", "Priority delivery", "VIP events", "Custom blends"] },
];

const Points = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const circumference = 2 * Math.PI * 90;

  return (
    <PageLayout>
      <div className="py-16 md:py-24 px-6" ref={ref}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-6">
              Rewards Program
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[6.5rem] text-foreground leading-[0.95] tracking-tight mb-6">
              The Smoke Ring
            </h1>
            <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto leading-relaxed">
              Every purchase earns points toward exclusive drops, early access, and premium rewards.
            </p>
          </div>

          {/* Smoke ring at 0 */}
          <div className="flex flex-col items-center gap-10 mb-20">
            <div className="relative w-56 h-56 md:w-72 md:h-72">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle
                  cx="100" cy="100" r="90"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="100" cy="100" r="90"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={isInView ? { strokeDashoffset: circumference } : {}}
                  transition={{ duration: 2, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="font-serif text-4xl md:text-5xl text-foreground"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  0
                </motion.span>
                <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground mt-1">
                  Points
                </span>
              </div>
            </div>

            {/* Sign up prompt */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-sans mb-4">
                Sign up or log in to start earning points
              </p>
              <Link
                to="/"
                className="inline-block border border-foreground px-8 py-3 text-xs font-sans uppercase editorial-spacing text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-12">
              Reward Tiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiers.map((tier, i) => (
                <motion.div
                  key={i}
                  className="border border-border/50 p-8 transition-all duration-300 hover:border-foreground/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="font-serif text-xl text-foreground">{tier.name}</h3>
                    <span className="text-xs font-sans text-muted-foreground">{tier.icon}</span>
                  </div>
                  <p className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground mb-4">
                    {tier.threshold}+ points
                  </p>
                  <ul className="space-y-2">
                    {tier.perks.map((perk, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-foreground/40 rounded-full" />
                        <span className="text-xs font-sans text-muted-foreground">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Shop", desc: "Earn 1 point for every dollar spent" },
                { step: "02", title: "Collect", desc: "Watch your points grow with every order" },
                { step: "03", title: "Redeem", desc: "Unlock exclusive rewards and discounts" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                >
                  <span className="font-serif text-3xl text-foreground/10 block mb-2">{item.step}</span>
                  <h3 className="font-serif text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground font-sans">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Points;
