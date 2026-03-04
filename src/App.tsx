import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "./contexts/CartContext";
import AgeGate from "./components/AgeGate";
import MusicPlayer from "./components/MusicPlayer";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Merch from "./pages/Merch";
import FAQ from "./pages/FAQ";
import Delivery from "./pages/Delivery";
import Points from "./pages/Points";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Wholesale from "./pages/Wholesale";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/points" element={<Points />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/checkout-success" element={<CheckoutSuccess />} />
        {/* Wholesale moved to FAQ page */}
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AgeGate>
        <CartProvider>
          <BrowserRouter>
            <MusicPlayer />
            <AnimatedRoutes />
          </BrowserRouter>
        </CartProvider>
      </AgeGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
