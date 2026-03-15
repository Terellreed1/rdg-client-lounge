import { Link } from "react-router-dom";

const BrandCarousel = () => (
  <section className="relative bg-white py-14 overflow-hidden">
    {/* Gold divider line */}
    <div className="flex justify-center mb-6">
      <div style={{ width: 100, height: 1, backgroundColor: "rgba(197, 163, 85, 0.3)" }} />
    </div>

    <div className="text-center">
      <p
        className="font-sans font-medium mb-4"
        style={{
          fontSize: 14,
          letterSpacing: "0.3em",
          color: "#1a1a1a",
          fontFamily: "'Montserrat', sans-serif",
          textTransform: "uppercase",
        }}
      >
        Our Brands
      </p>
      <Link
        to="/brands"
        className="inline-block text-[11px] uppercase px-8 py-3 font-sans font-semibold transition-all duration-300"
        style={{
          letterSpacing: "0.15em",
          background: "linear-gradient(135deg, #B8962E 0%, #D4AF37 100%)",
          color: "#FFFFFF",
          boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 30px rgba(212, 175, 55, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 20px rgba(212, 175, 55, 0.3)";
        }}
      >
        View All Brands
      </Link>
    </div>
  </section>
);

export default BrandCarousel;
