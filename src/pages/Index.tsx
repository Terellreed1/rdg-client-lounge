import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import BrandCarousel from "@/components/home/BrandCarousel";
import ProductsPreview from "@/components/home/ProductsPreview";
import ReferralDialog from "@/components/ReferralDialog";

const Index = () => {
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("lsc-popup-dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setPopupOpen(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleClosePopup = () => {
    setPopupOpen(false);
    sessionStorage.setItem("lsc-popup-dismissed", "true");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <BrandCarousel />
        <ProductsPreview />
      </main>
      <Footer />
      <ReferralDialog open={popupOpen} onClose={handleClosePopup} initialTab="join" />
    </div>
  );
};

export default Index;
