import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavCartIcon from "@/components/NavCartIcon";
import ReferralDialog from "@/components/ReferralDialog";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/hero-logo.png";

const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Merch", to: "/merch" },
  { label: "Delivery", to: "/delivery" },
  { label: "FAQ", to: "/faq" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inHero, setInHero] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();
  const { totalItems, justAdded } = useCart();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) { setInHero(false); return; }
    const setupObserver = () => {
      const heroEl = window.__lccHeroEl;
      if (!heroEl) return;
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        ([entry]) => setInHero(entry.isIntersecting),
        { threshold: 0.1 }
      );
      observerRef.current.observe(heroEl);
    };
    setupObserver();
    window.addEventListener("lcc-hero-mounted", setupObserver);
    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("lcc-hero-mounted", setupObserver);
    };
  }, [isHome, location.pathname]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const transparent = isHome && inHero;

  // Dark nav always — transparent only over hero
  const navBg = transparent ? "bg-transparent" : "";
  const navStyle = transparent ? {} : { background: "#0D110E", borderBottom: "1px solid rgba(201,168,76,0.08)" };

  return (
    <>
      <nav
        className={cn(
          "z-50 transition-all duration-300 w-full",
          transparent ? "absolute top-0 left-0 right-0" : "sticky top-0",
          navBg
        )}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Luxury Courier Club" className="h-14 w-14 sm:h-20 sm:w-20 object-contain transition-all duration-300" />
            <span className="hidden sm:inline font-serif text-lg font-bold transition-colors duration-300" style={{ color: "#e8dcc8" }}>
              Luxury Courier Club
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="relative text-[11px] font-sans font-medium uppercase transition-colors group"
                style={{ letterSpacing: "0.15em", color: location.pathname === link.to ? "#C9A84C" : "rgba(160,144,112,0.6)" }}
                onMouseEnter={(e) => { if (location.pathname !== link.to) e.currentTarget.style.color = "#C9A84C"; }}
                onMouseLeave={(e) => { if (location.pathname !== link.to) e.currentTarget.style.color = "rgba(160,144,112,0.6)"; }}
              >
                {link.label}
                <span className="absolute bottom-[-3px] left-0 h-px transition-all duration-300" style={{ width: location.pathname === link.to ? "100%" : "0%", background: "#C9A84C" }} />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReferralOpen(true)}
              className="hidden sm:block px-3 py-1.5 text-[10px] font-sans uppercase transition-all duration-300"
              style={{ letterSpacing: "0.15em", color: "rgba(201,168,76,0.6)", border: "1px solid rgba(201,168,76,0.25)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.borderColor = "#C9A84C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(201,168,76,0.6)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)"; }}
              aria-label="Share referral"
            >
              Refer
            </button>
            <button
              onClick={() => setReferralOpen(true)}
              className="sm:hidden p-2 transition-colors"
              style={{ color: "rgba(201,168,76,0.6)" }}
              aria-label="Share referral"
            >
              <span className="text-xs font-sans uppercase" style={{ letterSpacing: "0.15em" }}>Refer</span>
            </button>

            <Link
              to="/cart"
              className="relative p-2 transition-colors"
              style={{ color: "#e8dcc8" }}
              aria-label="Shopping cart"
            >
              <NavCartIcon size={22} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full"
                    style={{ background: "#C9A84C", color: "#0D110E" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: justAdded ? [1, 1.4, 1] : 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    key={totalItems}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2"
              style={{ color: "#e8dcc8" }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm flex flex-col lg:hidden"
              style={{ background: "#0D110E", borderLeft: "1px solid rgba(201,168,76,0.1)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <img src={logo} alt="Luxury Courier Club" className="h-14 w-14 object-contain" />
                <button onClick={() => setMobileOpen(false)} className="p-2" style={{ color: "#e8dcc8" }} aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-[28px] transition-colors"
                    style={{
                      fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif",
                      color: location.pathname === link.to ? "#C9A84C" : "rgba(232,220,200,0.5)",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="px-6 py-6 flex items-center justify-between" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                <button
                  onClick={() => { setMobileOpen(false); setReferralOpen(true); }}
                  className="px-5 py-2.5 text-xs font-sans uppercase transition-all"
                  style={{ letterSpacing: "0.15em", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
                >
                  Refer a Friend
                </button>
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="relative p-2"
                  style={{ color: "#e8dcc8" }}
                  aria-label="Shopping cart"
                >
                  <NavCartIcon size={24} />
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full"
                      style={{ background: "#C9A84C", color: "#0D110E" }}
                    >
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <ReferralDialog open={referralOpen} onClose={() => setReferralOpen(false)} initialTab="share" />
    </>
  );
};

export default Navbar;
