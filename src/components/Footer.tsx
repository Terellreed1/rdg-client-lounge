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

const SocialIcon = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center transition-all duration-300"
    style={{ border: "1px solid rgba(201,168,76,0.3)", color: "rgba(201,168,76,0.6)" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(201,168,76,0.1)";
      e.currentTarget.style.borderColor = "#C9A84C";
      e.currentTarget.style.color = "#C9A84C";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
      e.currentTarget.style.color = "rgba(201,168,76,0.6)";
    }}
    aria-label={label}
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer style={{ background: "#0A0D09" }}>
      {/* Top gold divider */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        {/* Crest + Brand */}
        <div className="flex flex-col items-center text-center mb-12">
          <img src={logo} alt="Luxury Courier Club" className="h-32 w-32 sm:h-36 sm:w-36 object-contain mb-5 opacity-80" />
          <p
            className="text-2xl sm:text-3xl mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8" }}
          >
            Luxury Courier Club
          </p>
          <p
            className="text-sm font-sans font-light"
            style={{ color: "rgba(201,168,76,0.35)" }}
          >
            Premium flower delivered to your door.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3 mt-6">
            <SocialIcon href="https://instagram.com/luxurycourierclub" label="Instagram">
              <Instagram size={18} />
            </SocialIcon>
            <SocialIcon href="https://x.com/luxurycourier" label="Twitter / X">
              <Twitter size={18} />
            </SocialIcon>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 mb-12">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-sans uppercase transition-colors duration-300 relative"
                style={{ letterSpacing: "0.15em", color: "rgba(232,220,200,0.4)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(232,220,200,0.4)"; }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="text-[11px] font-sans uppercase transition-colors duration-300"
                style={{ letterSpacing: "0.15em", color: "rgba(232,220,200,0.4)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(232,220,200,0.4)"; }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Separator before legal */}
        <div className="h-px mb-8" style={{ background: "rgba(201,168,76,0.06)" }} />

        {/* Legal fine print */}
        <div className="space-y-3 mb-8" style={{ color: "rgba(232,220,200,0.12)" }}>
          <p className="text-[9px] leading-relaxed">
            <span style={{ color: "rgba(232,220,200,0.25)" }} className="font-semibold">WARNING:</span> CANCER AND REPRODUCTIVE HARM.{" "}
            <a href="https://www.p65warnings.ca.gov" target="_blank" rel="noopener noreferrer" className="underline">www.p65warnings.ca.gov</a>
          </p>
          <p className="text-[9px] leading-relaxed">
            <span style={{ color: "rgba(232,220,200,0.25)" }} className="font-semibold">Legal Disclaimer:</span> This product contains less than 0.3% Δ9 THC and is compliant with the Industrial Hemp Farming Act Bill H.R. 525/S 359. Not available for shipment to: AK, AR, CA, CO, HI, ID, KS, LA, MI, MT, NM, OK, OR, PR, RI, TX, UT, VT, WA.
          </p>
          <p className="text-[9px] leading-relaxed">
            <span style={{ color: "rgba(232,220,200,0.25)" }} className="font-semibold">FDA Disclaimer:</span> These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure or prevent any disease. Must be 21+. Not for children, pregnant or lactating women. Consult physician before use. All trademarks are property of their respective owners. Products contain less than 0.3% Δ9-THC. Void where prohibited.
          </p>
        </div>

        {/* Bottom divider */}
        <div className="h-px mb-6" style={{ background: "rgba(201,168,76,0.06)" }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-sans" style={{ color: "rgba(232,220,200,0.18)" }}>
            © 2026 Luxury Courier Club. All rights reserved.
          </p>
          <a
            href="mailto:admin@luxurycouriers.club"
            className="text-[10px] font-sans transition-colors"
            style={{ color: "rgba(232,220,200,0.18)" }}
          >
            admin@luxurycouriers.club
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
