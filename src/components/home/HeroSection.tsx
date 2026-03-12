import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    eyebrow: "Premium Flower",
    headline: "Curated Selections.\nLegendary Quality.",
    sub: "Hand-picked from the world's top cultivators.",
    cta: { label: "Shop Now", to: "/shop" },
  },
  {
    eyebrow: "East Coast Delivery",
    headline: "Same-Day Delivery.\nDiscreet & Reliable.",
    sub: "Premium flower delivered straight to your door.",
    cta: { label: "Delivery Info", to: "/delivery" },
  },
  {
    eyebrow: "Join the Club",
    headline: "Where Loyalty\nPays Off.",
    sub: "Earn points on every order. Enjoy exclusive perks.",
    cta: { label: "Learn More", to: "/about" },
  },
];

const VIDEO_SRC =
  "https://res.cloudinary.com/ddfe8uqth/video/upload/medium-vecteezy_camera-moves-along-medical-cannabis-plants-grown-under_7386213_medium_tgvc7r.mp4";

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Expose hero element for navbar transparency
  useEffect(() => {
    if (heroRef.current) {
      window.__lccHeroEl = heroRef.current;
      window.dispatchEvent(new Event("lcc-hero-mounted"));
    }
    return () => { delete window.__lccHeroEl; };
  }, []);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const go = (dir: 1 | -1) => {
    clearInterval(timerRef.current);
    setCurrent((p) => (p + dir + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[current];

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ background: "#0A0D09", minHeight: "100svh" }}
    >
      {/* Video bg */}
      <video
        autoPlay muted loop playsInline
        onCanPlayThrough={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-25" : "opacity-0"}`}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,13,9,0.6) 0%, rgba(10,13,9,0.3) 40%, rgba(10,13,9,0.7) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(10,13,9,0.8) 100%)" }} />

      {/* Content — centered like Culta */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-10 max-w-4xl mx-auto" style={{ marginTop: 40 }}>
        <motion.p
          key={`ey-${current}`}
          className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase mb-6"
          style={{ letterSpacing: "0.35em", color: "#C9A84C" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {slide.eyebrow}
        </motion.p>

        <motion.h1
          key={`h-${current}`}
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.0] mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            color: "#F0EBE0",
            whiteSpace: "pre-line",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {slide.headline}
        </motion.h1>

        <motion.p
          key={`sub-${current}`}
          className="text-sm sm:text-base font-sans font-light mb-10 max-w-lg leading-relaxed"
          style={{ color: "rgba(160,144,112,0.7)", letterSpacing: "0.04em" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {slide.sub}
        </motion.p>

        <motion.div
          key={`cta-${current}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Link
            to={slide.cta.to}
            className="inline-flex items-center justify-center px-10 py-4 text-[11px] font-sans font-semibold uppercase transition-all duration-300"
            style={{
              letterSpacing: "0.2em",
              background: "#C9A84C",
              color: "#0A0D09",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#E8D08A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#C9A84C"; }}
          >
            {slide.cta.label}
          </Link>
        </motion.div>

        {/* Slide indicators — horizontal lines */}
        <div className="flex items-center gap-2 mt-14">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(timerRef.current); setCurrent(i); }}
              className="transition-all duration-300 rounded-none"
              style={{
                width: i === current ? 24 : 16,
                height: 2,
                background: i === current ? "#D4AF37" : "rgba(255,255,255,0.3)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Arrow nav — minimal thin arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center transition-all duration-300"
        style={{ color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", outline: "none", boxShadow: "none" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={2} />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center transition-all duration-300"
        style={{ color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", outline: "none", boxShadow: "none" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={2} />
      </button>
    </section>
  );
};

declare global {
  interface Window {
    __lccHeroEl?: HTMLElement;
  }
}

export default HeroSection;
