import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import logo from "@/assets/hero-logo.png";

const footerLinks = [
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Delivery", to: "/delivery" },
  { label: "FAQ", to: "/faq" },
  { label: "Merch", to: "https://www.luxurycourier.club/", external: true },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

const Footer = () => (
  <footer style={{ background: "#070A06" }}>
    <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)" }} />

    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
      {/* Brand mark */}
      <div className="flex flex-col items-center text-center mb-12">
        <img src={logo} alt="Luxury Courier Club" className="h-28 w-28 sm:h-32 sm:w-32 object-contain mb-4 opacity-70" />
        <p
          className="text-xl sm:text-2xl mb-1.5"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8", fontWeight: 400 }}
        >
          Luxury Courier Club
        </p>
        <p className="text-xs font-sans font-light" style={{ color: "rgba(160,144,112,0.3)" }}>
          Premium flower delivered to your door.
        </p>

        {/* Social */}
        <div className="flex items-center gap-3 mt-5">
          {[
            { href: "https://instagram.com/luxurycourierclub", label: "Instagram", icon: <Instagram size={16} /> },
            { href: "https://x.com/luxurycourier", label: "X", icon: <Twitter size={16} /> },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center transition-all duration-300"
              style={{ border: "1px solid rgba(201,168,76,0.2)", color: "rgba(201,168,76,0.5)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.color = "rgba(201,168,76,0.5)"; }}
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 mb-12">
        {footerLinks.map((link) =>
          link.external ? (
            <a
              key={link.label}
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-sans uppercase transition-colors duration-300"
              style={{ letterSpacing: "0.15em", color: "rgba(232,220,200,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(232,220,200,0.3)"; }}
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              to={link.to}
              className="text-[10px] font-sans uppercase transition-colors duration-300"
              style={{ letterSpacing: "0.15em", color: "rgba(232,220,200,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(232,220,200,0.3)"; }}
            >
              {link.label}
            </Link>
          )
        )}
      </div>

      {/* Legal */}
      <div className="h-px mb-8" style={{ background: "rgba(201,168,76,0.06)" }} />
      <div className="space-y-3 mb-8" style={{ color: "rgba(232,220,200,0.1)" }}>
        <p className="text-[9px] leading-relaxed">
          <span style={{ color: "rgba(232,220,200,0.2)" }} className="font-semibold">WARNING:</span> CANCER AND REPRODUCTIVE HARM.{" "}
          <a href="https://www.p65warnings.ca.gov" target="_blank" rel="noopener noreferrer" className="underline">www.p65warnings.ca.gov</a>
        </p>
        <p className="text-[9px] leading-relaxed">
          <span style={{ color: "rgba(232,220,200,0.2)" }} className="font-semibold">Legal Disclaimer:</span> This product contains less than 0.3% Δ9 THC and is compliant with the Industrial Hemp Farming Act Bill H.R. 525/S 359. Not available for shipment to: AK, AR, CA, CO, HI, ID, KS, LA, MI, MT, NM, OK, OR, PR, RI, TX, UT, VT, WA.
        </p>
        <p className="text-[9px] leading-relaxed">
          <span style={{ color: "rgba(232,220,200,0.2)" }} className="font-semibold">FDA Disclaimer:</span> These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure or prevent any disease. Must be 21+. Not for children, pregnant or lactating women. Consult physician before use. All trademarks are property of their respective owners. Products contain less than 0.3% Δ9-THC. Void where prohibited.
        </p>
      </div>

      <div className="h-px mb-6" style={{ background: "rgba(201,168,76,0.06)" }} />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] font-sans" style={{ color: "rgba(232,220,200,0.15)" }}>
          © 2026 Luxury Courier Club. All rights reserved.
        </p>
        <a href="mailto:admin@luxurycouriers.club" className="text-[10px] font-sans transition-colors" style={{ color: "rgba(232,220,200,0.15)" }}>
          admin@luxurycouriers.club
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
