import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroLogo from "@/assets/hero-logo.png";

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const AgeGate = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const [verified, setVerified] = useState(() => {
    if (isAdmin) return true;
    return sessionStorage.getItem("age-verified") === "true";
  });

  const handleVerify = () => {
    sessionStorage.setItem("age-verified", "true");
    setVerified(true);
  };

  if (verified) return <>{children}</>;

  return (
    <>
      {children}
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        style={{ width: "100vw", height: "100vh", backgroundColor: "#0a0a0a" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(197,163,85,0.12) 0%, rgba(30,25,15,0.6) 40%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: NOISE_BG, backgroundSize: "200px" }}
        />

        <div className="relative z-10 w-[92vw] max-w-lg text-center px-6 flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "0 0 150px 80px rgba(197,163,85,0.10)",
                  borderRadius: "50%",
                }}
              />
              <img
                src={heroLogo}
                alt="Luxury Courier Club"
                className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto"
                style={{ filter: "drop-shadow(0 0 40px rgba(201,168,76,0.12))" }}
              />
            </div>
          </motion.div>

          <div className="my-8" />

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl uppercase mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              color: "#F0EBE0",
              letterSpacing: "0.08em",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Hold Up
          </motion.h1>

          <motion.p
            className="text-xs sm:text-sm font-light mb-8 max-w-sm mx-auto"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              color: "rgba(160,144,112,0.6)",
              letterSpacing: "0.06em",
              lineHeight: 1.8,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            YOU MUST BE 21 OR OLDER TO ENTER THIS SITE.
            <br />
            ARE YOU OF LEGAL AGE?
          </motion.p>

          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button
              onClick={handleVerify}
              className="px-8 py-3 text-sm uppercase tracking-[0.15em] transition-all duration-300"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                color: "#0a0a0a",
                backgroundColor: "rgba(197,163,85,0.9)",
                border: "1px solid rgba(197,163,85,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(197,163,85,1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(197,163,85,0.9)";
              }}
            >
              Yes, I'm 21+
            </button>
            <button
              onClick={() => window.location.href = "https://google.com"}
              className="px-8 py-3 text-sm uppercase tracking-[0.15em] transition-all duration-300"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                color: "rgba(160,144,112,0.6)",
                backgroundColor: "transparent",
                border: "1px solid rgba(160,144,112,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(160,144,112,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(160,144,112,0.2)";
              }}
            >
              No
            </button>
          </motion.div>
        </div>

        <motion.p
          className="relative z-10 pb-8 text-[11px] font-sans font-light"
          style={{ color: "rgba(122,96,48,0.5)", letterSpacing: "0.08em" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          &copy; 2026 Luxury Courier Club. All rights reserved.
        </motion.p>
      </div>
    </>
  );
};

export default AgeGate;
