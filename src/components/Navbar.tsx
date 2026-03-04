import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavCartIcon from "@/components/NavCartIcon";
import ReferralDialog from "@/components/ReferralDialog";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/hero-logo.png";

const categories = [
  { label: "All Flower", to: "/shop" },
  { label: "Indica", to: "/shop?strain=Indica" },
  { label: "Sativa", to: "/shop?strain=Sativa" },
  { label: "Hybrid", to: "/shop?strain=Hybrid" },
  { label: "Sale", to: "/shop?sale=true" },
];

interface NavLinkType {
  label: string;
  to: string;
  external?: boolean;
}

const navLinks: NavLinkType[] = [
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Merch", to: "https://www.luxurycourier.club/", external: true },
  { label: "Wholesale", to: "/wholesale" },
  { label: "Delivery", to: "/delivery" },
  { label: "FAQ", to: "/faq" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inHero, setInHero] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const location = useLocation();
  const { totalItems, justAdded } = useCart();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isHome = location.pathname === "/";

  // IntersectionObserver for hero section
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const transparent = isHome && inHero;

  return (
    <>
      {/* Main Nav */}
      <nav
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          transparent
            ? "bg-transparent shadow-none"
            : "bg-background shadow-md"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Luxury Courier Club" className="h-14 w-14 sm:h-20 sm:w-20 object-contain transition-all duration-300" />
            <span className={cn("hidden sm:inline font-serif text-lg font-bold transition-colors duration-300", transparent ? "text-white" : "text-foreground")}>
              Luxury Courier Club
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("text-sm font-medium transition-colors", transparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-primary")}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    transparent
                      ? (location.pathname === link.to ? "text-white" : "text-white/80 hover:text-white")
                      : (location.pathname === link.to ? "text-primary" : "text-muted-foreground hover:text-primary")
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReferralOpen(true)}
              className={cn(
                "hidden sm:block px-3 py-1.5 text-[10px] font-sans uppercase wide-spacing border rounded-full transition-all duration-300",
                transparent
                  ? "text-white/80 hover:text-white border-white/30 hover:border-white"
                  : "text-muted-foreground hover:text-foreground border-border hover:border-foreground"
              )}
              aria-label="Share referral"
            >
              Refer
            </button>
            <button
              onClick={() => setReferralOpen(true)}
              className={cn("sm:hidden p-2 transition-colors", transparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground")}
              aria-label="Share referral"
            >
              <span className="text-xs font-sans uppercase wide-spacing">Refer</span>
            </button>

            <Link
              to="/cart"
              className={cn("relative p-2 transition-colors", transparent ? "text-white hover:text-white/80" : "text-foreground hover:text-primary")}
              aria-label="Shopping cart"
            >
              <NavCartIcon size={22} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full"
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
              className={cn("lg:hidden p-2", transparent ? "text-white" : "text-foreground")}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Category bar — desktop */}
        <div className={cn(
          "hidden lg:block border-t transition-colors duration-300",
          transparent ? "border-white/10 bg-transparent" : "border-border bg-background"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 h-11">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.to}
                className={cn("text-sm font-medium transition-colors", transparent ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-primary")}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-foreground/60 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm bg-background flex flex-col lg:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Close + Logo */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <img src={logo} alt="Luxury Courier Club" className="h-14 w-14 object-contain" />
                  <button onClick={() => setMobileOpen(false)} className="p-2 text-foreground" aria-label="Close menu">
                    <X size={24} />
                  </button>
                </div>

                {/* Nav links */}
                <div className="flex-1 px-6 py-4 flex flex-col gap-1">
                  {navLinks.map((link) =>
                    link.external ? (
                      <a
                        key={link.label}
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileOpen(false)}
                        className="py-3 font-serif text-[28px] text-muted-foreground"
                        style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif" }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "py-3 font-serif text-[28px] transition-colors",
                          location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                        )}
                        style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif" }}
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>

                {/* Bottom: Refer + Cart */}
                <div className="px-6 py-6 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => { setMobileOpen(false); setReferralOpen(true); }}
                    className="px-5 py-2.5 text-xs font-sans uppercase wide-spacing text-foreground border border-foreground rounded-full hover:bg-foreground hover:text-background transition-all"
                  >
                    Refer a Friend
                  </button>
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="relative p-2 text-foreground"
                    aria-label="Shopping cart"
                  >
                    <NavCartIcon size={24} />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
      <ReferralDialog open={referralOpen} onClose={() => setReferralOpen(false)} initialTab="share" />
    </>
  );
};

export default Navbar;
