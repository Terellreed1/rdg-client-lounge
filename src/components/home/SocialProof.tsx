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
  { id: "1", author_name: "Brianna C.", rating: 5, body: "Smells exactly like cotton candy, it's wild. The smoke is so smooth too — best I've had in a long time. Definitely ordering again." },
  { id: "2", author_name: "Marcus T.", rating: 4, body: "Delivery was fast and discreet. Packaging was premium. Only thing is I wish they had more edible options, but the flower quality is unmatched." },
  { id: "3", author_name: "Jasmine R.", rating: 5, body: "The selection here is crazy. You can tell they actually curate what goes on the menu — no mid, no filler. This is my go-to now." },
];

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-label="Google">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ReviewCard = ({ review, index }: { review: Review; index: number }) => (
  <motion.div
    className="p-6 sm:p-8 flex flex-col h-full"
    style={{
      background: "#131810",
      border: "1px solid rgba(201,168,76,0.08)",
    }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
  >
    {/* Stars */}
    <div className="flex items-center gap-0.5 mb-5">
      {Array.from({ length: review.rating }).map((_, j) => (
        <Star key={j} className="w-4 h-4" style={{ fill: "#C9A84C", color: "#C9A84C" }} />
      ))}
    </div>

    {/* Divider */}
    <div className="h-px w-full mb-5" style={{ background: "rgba(201,168,76,0.1)" }} />

    {/* Quote */}
    <p
      className="text-base sm:text-lg leading-relaxed flex-1 mb-6"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        fontWeight: 300,
        color: "#F0EBE0",
        lineHeight: 1.65,
      }}
    >
      "{review.body}"
    </p>

    {/* Author */}
    <p
      className="text-[11px] font-sans font-semibold uppercase"
      style={{ letterSpacing: "0.15em", color: "#C9A84C" }}
    >
      {review.author_name}
    </p>
  </motion.div>
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

  const displayReviews = reviews.slice(0, 3);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % displayReviews.length);
  }, [displayReviews.length]);

  useEffect(() => {
    if (displayReviews.length <= 1) return;
    const timer = setInterval(next, DURATION);
    return () => clearInterval(timer);
  }, [next, displayReviews.length]);

  const mobileVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0D110E" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <GoogleLogo />
            <span className="text-[10px] font-sans font-medium uppercase" style={{ letterSpacing: "0.1em", color: "rgba(160,144,112,0.6)" }}>
              Verified Reviews
            </span>
          </div>
        </div>

        <h2
          className="text-2xl sm:text-3xl lg:text-4xl mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
        >
          What Our Customers Say
        </h2>

        <div className="h-px w-12 mb-10" style={{ background: "#C9A84C" }} />

        {/* Desktop: 3-card grid */}
        <div className="hidden md:grid grid-cols-3 gap-5">
          {displayReviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden">
          <div className="relative overflow-hidden min-h-[220px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={displayReviews[current]?.id}
                custom={direction}
                variants={mobileVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              >
                {displayReviews[current] && (
                  <ReviewCard review={displayReviews[current]} index={0} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {displayReviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {displayReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className="transition-all duration-300"
                  style={{
                    width: i === current ? 20 : 8,
                    height: 2,
                    background: i === current ? "#C9A84C" : "rgba(201,168,76,0.2)",
                  }}
                  aria-label={`Review ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
