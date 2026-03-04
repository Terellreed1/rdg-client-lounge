import { ExternalLink } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const Merch = () => {
  return (
    <PageLayout>
      <div className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-xs font-sans uppercase mb-4"
            style={{ letterSpacing: "0.3em", color: "#C9A84C" }}
          >
            Lifestyle
          </p>
          <h1
            className="text-4xl md:text-6xl mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
          >
            Official Merch
          </h1>
          <div className="mx-auto h-px w-16 mb-8" style={{ background: "#C9A84C" }} />
          <p
            className="text-sm md:text-base font-light max-w-md mx-auto mb-12 leading-relaxed"
            style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(160,144,112,0.7)" }}
          >
            Explore our full collection of premium apparel, accessories, and lifestyle essentials on our official merch store.
          </p>

          {/* Preview card */}
          <a
            href="https://www.luxurysmokersclub.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block max-w-xl mx-auto overflow-hidden transition-all duration-500"
            style={{ border: "1px solid rgba(201,168,76,0.15)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.4)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.15)"; }}
          >
            {/* Screenshot preview */}
            <div
              className="w-full aspect-video relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1a2a1a 0%, #0f1a0f 100%)" }}
            >
              <img
                src="https://api.microlink.io/?url=https://www.luxurysmokersclub.com&screenshot=true&meta=false&embed=screenshot.url&type=jpeg&overlay.browser=dark"
                alt="Luxury Smokers Club Store"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "rgba(13,17,14,0.6)" }}
              >
                <span
                  className="flex items-center gap-2 px-6 py-3 text-xs font-sans font-semibold uppercase"
                  style={{ letterSpacing: "0.2em", background: "#C9A84C", color: "#0D110E" }}
                >
                  Visit Store <ExternalLink size={14} />
                </span>
              </div>
            </div>

            {/* Card footer */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "#131810" }}>
              <div className="text-left">
                <p className="text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F0EBE0" }}>
                  luxurysmokersclub.com
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(160,144,112,0.5)", letterSpacing: "0.1em" }}>
                  OFFICIAL MERCH STORE
                </p>
              </div>
              <ExternalLink size={16} style={{ color: "rgba(201,168,76,0.4)" }} className="group-hover:text-gold transition-colors" />
            </div>
          </a>
        </div>
      </div>
    </PageLayout>
  );
};

export default Merch;
