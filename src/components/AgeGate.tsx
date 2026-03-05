import { useState, useEffect, useMemo } from "react";
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

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

const DarkShell = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden" style={{ background: "#090C09" }}>
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: NOISE_BG, backgroundSize: "256px" }} />
    {children}
  </div>
);

const selectStyle: React.CSSProperties = {
  appearance: "none",
  background: "rgba(201,168,76,0.06)",
  border: "1px solid rgba(201,168,76,0.2)",
  color: "#F0EBE0",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "12px",
  letterSpacing: "0.05em",
  padding: "12px 32px 12px 14px",
  width: "100%",
  outline: "none",
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

const optionStyle: React.CSSProperties = {
  background: "#141814",
  color: "#F0EBE0",
};

/* ── Access Denied Screen ── */
const AccessDenied = () => (
  <DarkShell>
    <div className="relative z-10 w-[92vw] max-w-md text-center px-6 flex-1 flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <img src={heroLogo} alt="Luxury Courier Club" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
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

  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const cookie = getCookie("lcc_age_verified");
    if (cookie === "denied") {
      setDenied(true);
      setVerified(false);
    } else {
      setVerified(cookie === "true");
    }
  }, []);

  const daysInMonth = useMemo(() => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  }, [month, year]);

  const dayOptions = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const handleSubmit = () => {
    setError("");
    if (!month || !day || !year) {
      setError("Please enter your full date of birth.");
      return;
    }
    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

    if (age >= 21) {
      setCookie("lcc_age_verified", "true", 30);
      setExiting(true);
      setTimeout(() => setVerified(true), 600);
    } else {
      setCookie("lcc_age_verified", "denied", 1);
      setDenied(true);
    }
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
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <img src={heroLogo} alt="Luxury Courier Club" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
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
                  Enter Your Date of Birth
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className="text-xs sm:text-sm font-light mb-8"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "rgba(160,144,112,0.6)",
                    letterSpacing: "0.1em",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  YOU MUST BE 21 OR OLDER TO ENTER
                </motion.p>

                {/* DOB Dropdowns */}
                <motion.div
                  className="w-full max-w-sm mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      style={selectStyle}
                      aria-label="Month"
                    >
                      <option value="" style={optionStyle}>Month</option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1)} style={optionStyle}>{m}</option>
                      ))}
                    </select>

                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      style={selectStyle}
                      aria-label="Day"
                    >
                      <option value="" style={optionStyle}>Day</option>
                      {dayOptions.map((d) => (
                        <option key={d} value={String(d)} style={optionStyle}>{d}</option>
                      ))}
                    </select>

                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={selectStyle}
                      aria-label="Year"
                    >
                      <option value="" style={optionStyle}>Year</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)} style={optionStyle}>{y}</option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <p className="text-[11px] mb-4" style={{ color: "#e55", fontFamily: "'Montserrat', sans-serif" }}>
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 text-xs font-sans font-semibold uppercase transition-all duration-300 active:scale-95"
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
                    Enter Site
                  </button>
                </motion.div>
              </div>

              {/* Footer */}
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
