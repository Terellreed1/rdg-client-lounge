import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import logo from "@/assets/hero-logo.png";

const Footer = () => {
  return (
    <footer style={{ background: "#0A0D0A", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        {/* Top — Logo & tagline centered */}
        <div className="flex flex-col items-center text-center mb-14">
          <img src={logo} alt="Luxury Courier Club" className="h-28 w-28 object-contain mb-4 opacity-80" />
          <p className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8" }}>
            Luxury Courier Club
          </p>
          <p className="text-sm font-sans font-light" style={{ color: "rgba(201,168,76,0.4)" }}>
            Premium flower delivered to your door.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <a href="https://instagram.com/luxurycourierclub" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(201,168,76,0.4)" }} className="hover:opacity-100 transition-opacity" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://x.com/luxurycourier" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(201,168,76,0.4)" }} className="hover:opacity-100 transition-opacity" aria-label="Twitter / X">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Gold divider */}
        <div className="h-px mb-10 mx-auto max-w-xs" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />

        {/* Links row */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-12">
          {[
            { label: "Shop", to: "/shop" },
            { label: "About", to: "/about" },
            { label: "Delivery", to: "/delivery" },
            { label: "FAQ", to: "/faq" },
            { label: "Merch", to: "https://www.luxurycourier.club/", external: true },
            { label: "Privacy", to: "/privacy" },
            { label: "Terms", to: "/terms" },
            { label: "Admin", to: "/admin" },
          ].map((link) =>
            link.external ? (
              <a key={link.label} href={link.to} target="_blank" rel="noopener noreferrer" className="text-sm font-sans transition-colors" style={{ color: "rgba(232,220,200,0.4)" }}>{link.label}</a>
            ) : (
              <Link key={link.label} to={link.to} className="text-sm font-sans transition-colors" style={{ color: "rgba(232,220,200,0.4)" }}>{link.label}</Link>
            )
          )}
        </div>

        {/* Legal Disclaimers */}
        <div className="text-[10px] leading-relaxed space-y-4 mb-8" style={{ color: "rgba(232,220,200,0.2)" }}>
          <p>
            <span style={{ color: "rgba(232,220,200,0.4)" }} className="font-bold">WARNING:</span> CANCER AND REPRODUCTIVE HARM.{" "}
            <a href="https://www.p65warnings.ca.gov" target="_blank" rel="noopener noreferrer" className="underline">www.p65warnings.ca.gov</a>
          </p>
          <p>
            <span style={{ color: "rgba(232,220,200,0.4)" }} className="font-bold">Legal Disclaimer:</span> This product contains less than 0.3% Δ9 THC and is compliant with the Industrial Hemp Farming Act Bill H.R. 525/S 359. This product is not available for shipment to the following states: Alaska, Arkansas, California, Colorado, Hawaii, Idaho, Kansas, Louisiana, Michigan, Montana, New Mexico, Oklahoma, Oregon, Puerto Rico, Rhode Island, Texas, Utah, Vermont and Washington. Products with total THC content above 0.3% must not be shipped to these states.
          </p>
          <p>
            <span style={{ color: "rgba(232,220,200,0.4)" }} className="font-bold">FDA Disclaimer:</span> These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease. Must be 21 years or older to purchase from this website. This product is not intended for children, or pregnant or lactating women. Consult with a physician before use if you have a serious medical condition or use prescription medications. A Doctor's advice should be sought before using this and any dietary supplement product. All trademarks and copyrights are property of their respective owners and are not affiliated with nor do they endorse this product. By using this site, you agree to follow the Privacy Policy and all Terms &amp; Conditions printed on this site. Void Where Prohibited by Law. Products on this site contain less than 0.3% Δ9-THC. We do not ship/sell to states where Delta 8 is illegal.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px mb-8" style={{ background: "rgba(201,168,76,0.08)" }} />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans" style={{ color: "rgba(232,220,200,0.25)" }}>
            © 2026 Luxury Courier Club. All rights reserved.
          </p>
          <a href="mailto:admin@luxurycouriers.club" className="text-xs font-sans transition-colors" style={{ color: "rgba(232,220,200,0.25)" }}>
            admin@luxurycouriers.club
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
