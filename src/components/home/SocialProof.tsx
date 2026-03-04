import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string;
}

const fallbackReviews: Review[] = [
  { id: "1", author_name: "Marcus T.", rating: 5, body: "Best premium selection in the DMV. The service is unmatched — they truly treat you like family." },
  { id: "2", author_name: "Jade W.", rating: 5, body: "From packaging to product quality, everything screams luxury. My go-to for top-shelf flower." },
  { id: "3", author_name: "Devon R.", rating: 5, body: "Fast delivery, incredible strains. Luxury Couriers understands the culture and the craft." },
];

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-label="Google">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const DURATION = 5000;

const SocialProof = () => {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id, author_name, rating, body")
      .eq("active", true)
      .eq("show_on_homepage", true)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) setReviews(data);
      });
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(next, DURATION);
    return () => clearInterval(timer);
  }, [next, reviews.length]);

  const review = reviews[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6" style={{ background: "#0D110E" }}>
      <div className="max-w-xl mx-auto text-center">
        {/* Google badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ background: "#161A14", border: "1px solid rgba(201,168,76,0.15)" }}>
            <GoogleLogo />
            <p className="text-xs font-sans font-medium" style={{ color: "rgba(201,168,76,0.6)" }}>Verified Reviews</p>
          </div>
        </div>

        <h2
          className="text-xl sm:text-3xl lg:text-4xl font-light mb-10"
          style={{ fontFamily: "'Cormorant Garamond', 'Bodoni Moda', serif", color: "#e8dcc8" }}
        >
          What Our Customers Say
        </h2>

        <div className="relative overflow-hidden min-h-[140px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={review.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-0.5 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4" style={{ fill: "#C9A84C", color: "#C9A84C" }} />
                ))}
              </div>
              <p className="text-sm sm:text-base leading-relaxed mb-4 italic font-light" style={{ color: "rgba(232,220,200,0.6)" }}>
                "{review.body}"
              </p>
              <p className="text-sm font-semibold" style={{ color: "#e8dcc8" }}>{review.author_name}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {reviews.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 16 : 6,
                  height: 6,
                  background: i === current ? "#C9A84C" : "rgba(201,168,76,0.2)",
                }}
                aria-label={`Review ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialProof;
