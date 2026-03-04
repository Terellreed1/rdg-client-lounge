import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/home/ScrollReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Wholesale form state
  const [wsForm, setWsForm] = useState({
    name: "", email: "", phone: "", companyName: "", companyAddress: "", website: "", licenseNumber: "",
  });
  const [wsSubmitting, setWsSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("faq_items").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      setFaqs(data || []);
      setLoading(false);
    });
  }, []);

  const updateWs = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setWsForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleWsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsForm.name || !wsForm.email || !wsForm.phone || !wsForm.companyName || !wsForm.companyAddress || !wsForm.licenseNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setWsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-wholesale-inquiry", { body: wsForm });
      if (error) throw error;
      toast.success("Wholesale inquiry submitted! We'll be in touch.");
      setWsForm({ name: "", email: "", phone: "", companyName: "", companyAddress: "", website: "", licenseNumber: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setWsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-[rgba(201,168,76,0.2)] px-4 py-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground/40 uppercase tracking-wider focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <PageLayout>
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-4">Support</p>
              <h1 className="font-serif text-4xl md:text-6xl text-foreground">FAQ</h1>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <AccordionItem
                    value={faq.id}
                    className="border border-border/50 px-8 data-[state=open]:border-border transition-colors duration-300"
                  >
                    <AccordionTrigger className="font-serif text-lg text-foreground hover:text-muted-foreground hover:no-underline py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed font-sans pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}

          {/* ── Wholesale Inquiry ── */}
          <div className="mt-24">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p
                  className="text-[11px] font-sans font-semibold uppercase mb-3"
                  style={{ letterSpacing: "0.3em", color: "#C9A84C" }}
                >
                  For Business
                </p>
                <h2
                  className="text-3xl md:text-4xl mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
                >
                  Wholesale Inquiries
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Interested in carrying our products? Fill out the form below and our team will get back to you.
                </p>
              </div>
            </ScrollReveal>

            <form onSubmit={handleWsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className={inputClass} placeholder="Full Name *" value={wsForm.name} onChange={updateWs("name")} />
                <input className={inputClass} placeholder="Email *" type="email" value={wsForm.email} onChange={updateWs("email")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className={inputClass} placeholder="Phone Number *" value={wsForm.phone} onChange={updateWs("phone")} />
                <input className={inputClass} placeholder="Company Name *" value={wsForm.companyName} onChange={updateWs("companyName")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className={inputClass} placeholder="Company Address *" value={wsForm.companyAddress} onChange={updateWs("companyAddress")} />
                <input className={inputClass} placeholder="Website" value={wsForm.website} onChange={updateWs("website")} />
              </div>
              <input className={inputClass} placeholder="License # *" value={wsForm.licenseNumber} onChange={updateWs("licenseNumber")} />
              <button
                type="submit"
                disabled={wsSubmitting}
                className="w-full py-4 text-[11px] font-sans font-semibold uppercase transition-all duration-300 disabled:opacity-50"
                style={{
                  letterSpacing: "0.2em",
                  border: "1px solid #C9A84C",
                  color: "#0D110E",
                  background: "#C9A84C",
                }}
              >
                {wsSubmitting ? "Submitting…" : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
