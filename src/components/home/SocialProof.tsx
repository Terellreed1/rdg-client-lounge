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
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" style={{ background: "#0D110E" }}>
      <div className="max-w-5xl mx-auto">
        {/* Minimal header */}
        <div className="mb-14">
          <p
            className="text-[9px] uppercase tracking-[0.3em] mb-3"
            style={{ color: "rgba(201,168,76,0.4)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
          >
            Reviews
          </p>
          <h2
            className="text-2xl sm:text-3xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
          >
            What Our Customers Say
          </h2>
          <div className="h-px w-12 mt-5" style={{ background: "rgba(201,168,76,0.25)" }} />
        </div>

        {/* Desktop: 3-column layout — minimal, no containers */}
        <div className="hidden md:grid grid-cols-3 gap-12">
          {displayReviews.map((review, i) => (
            <motion.div
              key={review.id}
              className="flex flex-col"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-5">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-3 h-3" style={{ fill: "#C9A84C", color: "#C9A84C" }} />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-sm sm:text-base leading-relaxed flex-1 mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "rgba(240,235,224,0.7)",
                  lineHeight: 1.7,
                }}
              >
                "{review.body}"
              </p>

              {/* Author */}
              <p
                className="text-[9px] uppercase tracking-[0.15em]"
                style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
              >
                {review.author_name}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile: simple carousel */}
        <div className="md:hidden">
          <div className="relative overflow-hidden min-h-[200px]">
            <AnimatePresence mode="wait" custom={direction}>
              {displayReviews[current] && (
                <motion.div
                  key={displayReviews[current].id}
                  custom={direction}
                  variants={mobileVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: displayReviews[current].rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3" style={{ fill: "#C9A84C", color: "#C9A84C" }} />
                    ))}
                  </div>
                  <p
                    className="text-base leading-relaxed mb-5"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontWeight: 300,
                      color: "rgba(240,235,224,0.7)",
                      lineHeight: 1.7,
                    }}
                  >
                    "{displayReviews[current].body}"
                  </p>
                  <p
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
                  >
                    {displayReviews[current].author_name}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {displayReviews.length > 1 && (
            <div className="flex items-center gap-2 mt-6">
              {displayReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className="transition-all duration-300"
                  style={{
                    width: i === current ? 16 : 6,
                    height: 1,
                    background: i === current ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.15)",
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
