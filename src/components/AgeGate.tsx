import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* SVG Crest matching the reference */
const LCCCrest = ({ size = 90 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" fill="none" width={size} height={size}>
    <circle cx="50" cy="50" r="45" stroke="#C9A84C" strokeWidth="0.7" opacity="0.4" />
    <circle cx="50" cy="50" r="38" stroke="#C9A84C" strokeWidth="0.5" opacity="0.25" />
    <text x="50" y="48" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="16" fill="#C9A84C" fontWeight="300" letterSpacing="3">
      LCC
    </text>
    <text x="50" y="62" textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontSize="4" fill="#C9A84C" fontWeight="500" letterSpacing="2.5" opacity="0.7">
      LUXURY COURIER CLUB
    </text>
  </svg>
);

const DarkShell = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden" style={{ background: "#090C09" }}>
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: NOISE_BG, backgroundSize: "256px" }} />
    {children}
  </div>
);

/* ── Access Denied Screen ── */
const AccessDenied = () => (
  <DarkShell>
    <div className="relative z-10 w-[92vw] max-w-md text-center px-6 flex-1 flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <LCCCrest size={80} />
      </motion.div>

      <motion.div
        className="mx-auto my-8 h-px w-16"
        style={{ background: "#C9A84C" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />

      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl uppercase mb-4"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0", letterSpacing: "0.15em" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        Come Back When You're Ready.
      </motion.h1>

      <motion.p
        className="text-xs sm:text-sm font-light leading-relaxed max-w-sm mx-auto"
        style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(160,144,112,0.6)", letterSpacing: "0.1em" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        You must be 21 or older to access Luxury Courier Club.
        <br />We'll be here when the time is right.
      </motion.p>
    </div>

    <motion.p
      className="relative z-10 pb-8 text-[11px] font-sans font-light"
      style={{ color: "rgba(122,96,48,0.6)", letterSpacing: "0.08em" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1 }}
    >
      © 2026 Luxury Courier Club. All rights reserved.
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
            className="fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DarkShell>
              <div className="relative z-10 w-[92vw] max-w-lg text-center px-6 flex-1 flex flex-col items-center justify-center">
                {/* Crest */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <LCCCrest size={90} />
                </motion.div>

                {/* Gold rule */}
                <motion.div
                  className="mx-auto my-8 h-px w-16"
                  style={{ background: "#C9A84C" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />

                {/* Headline */}
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl uppercase mb-4"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    color: "#F0EBE0",
                    letterSpacing: "0.15em",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.6 }}
                >
                  Are You of Legal Age?
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className="text-xs sm:text-sm font-light mb-10"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "rgba(160,144,112,0.6)",
                    letterSpacing: "0.1em",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  YOU MUST BE 21 OR OLDER TO ENTER LUXURY COURIER CLUB
                </motion.p>

                {/* Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  {/* Primary: filled gold */}
                  <button
                    onClick={handleYes}
                    className="w-52 py-4 text-xs font-sans font-semibold uppercase transition-all duration-300 active:scale-95"
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
                    I Am 21+
                  </button>

                  {/* Secondary: outline */}
                  <button
                    onClick={handleNo}
                    className="w-52 py-4 text-xs font-sans font-semibold uppercase transition-all duration-300 active:scale-95"
                    style={{
                      letterSpacing: "0.2em",
                      border: "1px solid rgba(201,168,76,0.4)",
                      color: "rgba(201,168,76,0.6)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(201,168,76,0.1)";
                      e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
                    }}
                  >
                    I Am Under 21
                  </button>
                </motion.div>
              </div>

              {/* Footer line + copyright */}
              <div className="relative z-10 w-full max-w-2xl mx-auto px-8 pb-8">
                <motion.div
                  className="h-px w-full mb-8"
                  style={{ background: "rgba(201,168,76,0.15)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                />
                <motion.p
                  className="text-center text-[11px] font-sans font-light"
                  style={{ color: "rgba(122,96,48,0.5)", letterSpacing: "0.08em" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  © 2026 Luxury Courier Club. All rights reserved. Must be 21+ to purchase.
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
