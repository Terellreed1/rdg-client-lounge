import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const JoinClubPopup = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Capture ref param from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("lcc_referral_ref", ref.toUpperCase());
    }
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("lsc-popup-dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("lsc-popup-dismissed", "true");
  };

  const handleJoin = () => {
    handleClose();
    navigate("/auth");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
          >
            <div className="relative bg-background w-full max-w-md shadow-2xl rounded-2xl mx-4">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div className="px-5 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center">
                <img src={logo} alt="Luxury Courier Club" className="h-40 w-40 object-contain mx-auto mb-6" />
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-4 uppercase tracking-wide">
                  Join the Club
                </h2>
                <p className="font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed mb-8 uppercase tracking-wide">
                  Create an account to receive 15% off your first order,
                  <br />
                  plus exclusive drops &amp; members-only deals.
                </p>

                <button
                  onClick={handleJoin}
                  className="w-full bg-foreground text-background py-3.5 text-xs font-sans uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                >
                  Create Account
                </button>

                <button
                  onClick={() => { handleClose(); navigate("/auth"); }}
                  className="w-full mt-3 py-3 text-xs font-sans uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Already have an account? Sign in
                </button>

                <p className="text-[10px] text-muted-foreground/50 font-sans mt-4">
                  By signing up, you agree to receive marketing emails from Luxury Courier Club.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JoinClubPopup;
