import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  author_name: string;
  body: string;
  rating: number;
}

const SocialProof = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id, author_name, body, rating")
      .eq("active", true)
      .eq("show_on_homepage", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setReviews(data || []));
  }, []);

  if (!reviews.length) return null;

  return (
    <section style={{ background: "#0A0D09" }}>
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent)" }} />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl uppercase mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              color: "#F0EBE0",
              letterSpacing: "0.06em",
            }}
          >
            What People Say
          </h2>
          <div className="h-px w-12 mx-auto" style={{ background: "rgba(201,168,76,0.3)" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              className="text-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-0.5 mb-5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} size={12} style={{ fill: "#C9A84C", color: "#C9A84C" }} />
                ))}
              </div>
              <p
                className="text-base sm:text-lg leading-relaxed mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "rgba(240,235,224,0.65)",
                  lineHeight: 1.7,
                }}
              >
                &ldquo;{r.body}&rdquo;
              </p>
              <p
                className="text-[10px] uppercase font-sans font-medium"
                style={{ letterSpacing: "0.15em", color: "rgba(201,168,76,0.5)" }}
              >
                {r.author_name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
