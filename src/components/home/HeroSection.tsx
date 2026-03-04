import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FALLBACK_IMAGE = "https://res.cloudinary.com/ddfe8uqth/image/upload/q_auto,f_auto/cannabis-hero-fallback_placeholder.jpg";

const HeroSection = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      window.__lccHeroEl = heroRef.current;
      window.dispatchEvent(new Event("lcc-hero-mounted"));
    }
    return () => { delete window.__lccHeroEl; };
  }, []);

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden min-h-[100svh] flex items-center" style={{ background: "#0D110E" }}>
      {/* Layered background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(105deg, rgba(13,17,14,0.92) 0%, rgba(13,17,14,0.6) 55%, rgba(13,17,14,0.3) 100%), radial-gradient(ellipse 80% 80% at 70% 50%, #1B3325 0%, transparent 70%), linear-gradient(180deg, #0D110E 0%, #162418 50%, #0D110E 100%)",
        }}
      />

      {/* Static fallback image */}
      <img
        src={FALLBACK_IMAGE}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-0' : 'opacity-30'}`}
      />
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        onCanPlayThrough={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`}
      >
        <source src="https://res.cloudinary.com/ddfe8uqth/video/upload/medium-vecteezy_camera-moves-along-medical-cannabis-plants-grown-under_7386213_medium_tgvc7r.mp4" type="video/mp4" />
      </video>

      {/* Animated botanical orbs */}
      <div
        className="absolute hero-orb"
        style={{
          width: 600,
          height: 600,
          top: -100,
          right: -100,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,51,37,0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-orb 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute hero-orb"
        style={{
          width: 400,
          height: 400,
          bottom: 50,
          left: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-orb 10s ease-in-out infinite reverse",
        }}
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      {/* Top/bottom vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 flex items-center" style={{ marginTop: 80 }}>
        <motion.div
          className="w-full max-w-2xl z-10 text-center lg:text-left"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Gold rule */}
          <motion.div
            className="h-px w-16 mb-8 mx-auto lg:mx-0"
            style={{ background: "#C9A84C" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* Eyebrow */}
          <motion.p
            className="text-[11px] sm:text-xs font-sans font-semibold uppercase mb-5"
            style={{ letterSpacing: "0.3em", color: "#C9A84C" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            East Coast Delivery
          </motion.p>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.0] mb-5 sm:mb-6"
            style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif", fontWeight: 300, color: "#F0EBE0" }}
          >
            Premium{" "}
            <br className="hidden sm:block" />
            Flower,{" "}
            <br />
            <em style={{ color: "#E8D08A" }}>Delivered.</em>
          </h1>

          <motion.p
            className="text-sm sm:text-base font-sans font-light mb-8 sm:mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed"
            style={{ color: "rgba(160,144,112,0.8)", letterSpacing: "0.06em" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            Curated luxury flower from the world's top brands. Same-day delivery across the East Coast — discreet, reliable, exceptional.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Link
              to="/shop"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 min-h-[48px] text-[11px] font-sans font-semibold uppercase transition-all duration-300"
              style={{
                letterSpacing: "0.2em",
                background: "#C9A84C",
                color: "#0D110E",
                border: "1px solid #C9A84C",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#E8D08A";
                e.currentTarget.style.borderColor = "#E8D08A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#C9A84C";
                e.currentTarget.style.borderColor = "#C9A84C";
              }}
            >
              Shop Now
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/delivery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 min-h-[48px] text-[11px] font-sans font-semibold uppercase transition-all duration-300"
              style={{
                letterSpacing: "0.2em",
                border: "1px solid rgba(240,235,224,0.3)",
                color: "#F0EBE0",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C9A84C";
                e.currentTarget.style.color = "#C9A84C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(240,235,224,0.3)";
                e.currentTarget.style.color = "#F0EBE0";
              }}
            >
              Delivery Info
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

declare global {
  interface Window {
    __lccHeroEl?: HTMLElement;
  }
}

export default HeroSection;
