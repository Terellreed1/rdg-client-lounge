import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroLogo from "@/assets/hero-logo.png";

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: 0.3 + i * 0.18, ease: [0.25, 0.4, 0.25, 1] as const },
});

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

const DarkShell = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden">
    <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0a0f0a 0%, #0d1a0d 30%, #0a0a0a 70%, #111 100%)" }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(30,60,30,0.35) 0%, transparent 70%)" }} />
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: NOISE_BG, backgroundSize: "128px 128px" }} />
    {children}
  </div>
);

/* ── Access Denied Screen ── */
const AccessDenied = () => (
  <DarkShell>
    <div className="relative z-10 w-[92vw] max-w-md text-center px-6 flex-1 flex flex-col items-center justify-center">
      {/* Top gold rule */}
      <motion.div className="mx-auto mb-10 h-px w-48" style={{ background: "linear-gradient(90deg, transparent, #B8972E, transparent)" }} {...stagger(0)} />

      {/* Logo */}
      <motion.div className="mb-6" {...stagger(0)}>
        <img src={heroLogo} alt="Luxury Courier Club" className="mx-auto w-24 h-24 sm:w-32 sm:h-32 object-contain" />
      </motion.div>

      {/* Diamond divider */}
      <motion.div className="flex items-center justify-center gap-3 mb-10" {...stagger(1)}>
        <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(90deg, transparent, #B8972E)" }} />
        <div className="w-2 h-2 rotate-45" style={{ background: "#B8972E" }} />
        <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(270deg, transparent, #B8972E)" }} />
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-light mb-6"
        style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif", color: "#e8dcc8", letterSpacing: "0.08em", fontStyle: "italic" }}
        {...stagger(2)}
      >
        This Club Has Standards.
      </motion.h1>

      {/* Ornamental rule */}
      <motion.div className="flex items-center justify-center gap-2 mb-6" {...stagger(2.5)}>
        <div className="h-px w-6" style={{ background: "rgba(184,151,46,0.3)" }} />
        <div className="w-1 h-1 rounded-full" style={{ background: "rgba(184,151,46,0.4)" }} />
        <div className="h-px w-6" style={{ background: "rgba(184,151,46,0.3)" }} />
      </motion.div>

      {/* Subtext */}
      <motion.p
        className="text-xs sm:text-sm font-light leading-relaxed max-w-sm mx-auto"
        style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(184,151,46,0.45)", fontWeight: 300 }}
        {...stagger(3)}
      >
        You must be 21 or older to access Luxury Courier Club. We'll be here when the time is right.
      </motion.p>

      {/* Bottom gold rule */}
      <motion.div className="mx-auto mt-10 h-px w-48" style={{ background: "linear-gradient(90deg, transparent, #B8972E, transparent)" }} {...stagger(4)} />
    </div>

    {/* Footer pinned to bottom */}
    <motion.p
      className="relative z-10 pb-8 text-[10px] font-sans font-light"
      style={{ color: "rgba(184,151,46,0.2)" }}
      {...stagger(4)}
    >
      © 2025 Luxury Courier Club. All rights reserved.
    </motion.p>
  </DarkShell>
);

/* ── Main Age Gate ── */
const AgeGate = ({ children }: { children: React.ReactNode }) => {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const cookie = getCookie("lcc_age_verified");
    if (cookie === "denied") {
      setDenied(true);
      setVerified(false);
    } else {
      setVerified(cookie === "true");
    }
  }, []);

  const handleYes = () => {
    setCookie("lcc_age_verified", "true", 30);
    setExiting(true);
    setTimeout(() => setVerified(true), 600);
  };

  const handleNo = () => {
    setCookie("lcc_age_verified", "denied", 1);
    setDenied(true);
  };

  if (verified === null) return null;
  if (denied) return <AccessDenied />;
  if (verified) return <>{children}</>;

  return (
    <>
      {children}
      <AnimatePresence>
        {!exiting && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6 }}
          >
            <DarkShell>
              <div className="relative z-10 w-[92vw] max-w-md text-center px-6">
                <motion.div className="mx-auto mb-10 h-px w-48" style={{ background: "linear-gradient(90deg, transparent, #B8972E, transparent)" }} {...stagger(0)} />

                <motion.div className="relative mb-6" {...stagger(0)}>
                  <img src={heroLogo} alt="Luxury Courier Club" className="mx-auto w-28 h-28 sm:w-36 sm:h-36 object-contain" />
                </motion.div>

                <motion.div className="flex items-center justify-center gap-3 mb-10" {...stagger(1)}>
                  <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(90deg, transparent, #B8972E)" }} />
                  <div className="w-2 h-2 rotate-45" style={{ background: "#B8972E" }} />
                  <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(270deg, transparent, #B8972E)" }} />
                </motion.div>

                <motion.h1
                  className="text-2xl sm:text-3xl md:text-4xl font-light uppercase mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif", color: "#e8dcc8", letterSpacing: "0.2em" }}
                  {...stagger(2)}
                >
                  Are You of Legal Age?
                </motion.h1>

                <motion.p
                  className="text-xs sm:text-sm font-light leading-relaxed mb-10 max-w-xs mx-auto"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(184,151,46,0.5)", fontWeight: 300 }}
                  {...stagger(3)}
                >
                  You must be 21 or older to enter the Luxury Courier Club. By continuing, you agree to our Terms of Use.
                </motion.p>

                <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" {...stagger(4)}>
                  <button
                    onClick={handleYes}
                    className="w-52 py-3.5 text-xs font-sans font-medium uppercase transition-all duration-300 active:scale-95"
                    style={{ letterSpacing: "0.18em", border: "1px solid #B8972E", color: "#B8972E", background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#B8972E"; e.currentTarget.style.color = "#0a0a0a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#B8972E"; }}
                  >
                    I Am 21+
                  </button>
                  <button
                    onClick={handleNo}
                    className="w-52 py-3.5 text-xs font-sans font-medium uppercase transition-all duration-300 active:scale-95"
                    style={{ letterSpacing: "0.18em", border: "1px solid rgba(184,151,46,0.25)", color: "rgba(184,151,46,0.4)", background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(184,151,46,0.5)"; e.currentTarget.style.color = "rgba(184,151,46,0.7)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(184,151,46,0.25)"; e.currentTarget.style.color = "rgba(184,151,46,0.4)"; }}
                  >
                    I Am Under 21
                  </button>
                </motion.div>

                <motion.div className="mx-auto mt-10 h-px w-48" style={{ background: "linear-gradient(90deg, transparent, #B8972E, transparent)" }} {...stagger(5)} />

                <motion.p className="mt-8 text-[10px] font-sans font-light" style={{ color: "rgba(184,151,46,0.25)" }} {...stagger(5)}>
                  © 2025 Luxury Courier Club. All rights reserved. For use by persons 21 and older only.
                </motion.p>
              </div>
            </DarkShell>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgeGate;
