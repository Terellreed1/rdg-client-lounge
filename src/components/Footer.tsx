import { Link } from "react-router-dom";
import logo from "@/assets/hero-logo.png";

const shopLinks = [
  { label: "All Products", to: "/shop" },
  { label: "Delivery Info", to: "/delivery" },
  { label: "Merch", to: "https://www.luxurycourier.club/", external: true },
];

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

const connectLinks = [
  { label: "Instagram", href: "https://instagram.com/luxurycourierclub" },
  { label: "X (Twitter)", href: "https://x.com/luxurycourier" },
  { label: "admin@luxurycouriers.club", href: "mailto:admin@luxurycouriers.club" },
];

const linkStyle: React.CSSProperties = {
  color: "rgba(232,220,200,0.45)",
  letterSpacing: "0.02em",
};

const Footer = () => (
  <footer style={{ background: "#070A06" }}>
    <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent)" }} />

    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
      {/* Top row: Logo + columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
        {/* Brand */}
        <div className="md:col-span-1">
          <img src={logo} alt="Luxury Courier Club" className="h-20 w-20 object-contain mb-4 opacity-60" />
          <p
            className="text-lg mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8dcc8", fontWeight: 400 }}
          >
            Luxury Courier Club
          </p>
          <p className="text-xs font-sans font-light" style={{ color: "rgba(160,144,112,0.3)" }}>
            Premium flower delivered to your door.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4
            className="text-[11px] uppercase font-sans font-semibold mb-5"
            style={{ letterSpacing: "0.15em", color: "#C9A84C" }}
          >
            Shop
          </h4>
          <ul className="space-y-3">
            {shopLinks.map((link) =>
              link.external ? (
                <li key={link.label}>
                  <a
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-sans transition-colors duration-200 hover:text-[#C9A84C]"
                    style={linkStyle}
                  >
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm font-sans transition-colors duration-200 hover:text-[#C9A84C]"
                    style={linkStyle}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4
            className="text-[11px] uppercase font-sans font-semibold mb-5"
            style={{ letterSpacing: "0.15em", color: "#C9A84C" }}
          >
            Company
          </h4>
          <ul className="space-y-3">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm font-sans transition-colors duration-200 hover:text-[#C9A84C]"
                  style={linkStyle}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4
            className="text-[11px] uppercase font-sans font-semibold mb-5"
            style={{ letterSpacing: "0.15em", color: "#C9A84C" }}
          >
            Connect
          </h4>
          <ul className="space-y-3">
            {connectLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="text-sm font-sans transition-colors duration-200 hover:text-[#C9A84C]"
                  style={linkStyle}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legal */}
      <div className="h-px mb-8" style={{ background: "rgba(201,168,76,0.06)" }} />
      <div className="space-y-3 mb-8" style={{ color: "rgba(232,220,200,0.12)" }}>
        <p className="text-[9px] leading-relaxed">
          <span style={{ color: "rgba(232,220,200,0.22)" }} className="font-semibold">WARNING:</span> CANCER AND REPRODUCTIVE HARM.{" "}
          <a href="https://www.p65warnings.ca.gov" target="_blank" rel="noopener noreferrer" className="underline">www.p65warnings.ca.gov</a>
        </p>
        <p className="text-[9px] leading-relaxed">
          <span style={{ color: "rgba(232,220,200,0.22)" }} className="font-semibold">Legal Disclaimer:</span> This product contains less than 0.3% Δ9 THC and is compliant with the Industrial Hemp Farming Act Bill H.R. 525/S 359. Not available for shipment to: AK, AR, CA, CO, HI, ID, KS, LA, MI, MT, NM, OK, OR, PR, RI, TX, UT, VT, WA.
        </p>
        <p className="text-[9px] leading-relaxed">
          <span style={{ color: "rgba(232,220,200,0.22)" }} className="font-semibold">FDA Disclaimer:</span> These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure or prevent any disease. Must be 21+. Not for children, pregnant or lactating women. Consult physician before use. All trademarks are property of their respective owners. Products contain less than 0.3% Δ9-THC. Void where prohibited.
        </p>
      </div>

      <div className="h-px mb-6" style={{ background: "rgba(201,168,76,0.06)" }} />
      <p className="text-[10px] font-sans text-center" style={{ color: "rgba(232,220,200,0.15)" }}>
        © 2026 Luxury Courier Club. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
