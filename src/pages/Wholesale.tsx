import { useState } from "react";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";

const Wholesale = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    companyAddress: "",
    website: "",
    licenseNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.companyName || !form.companyAddress || !form.licenseNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-wholesale-inquiry", {
        body: form,
      });

      if (error) throw error;

      toast.success("Wholesale inquiry submitted! We'll be in touch.");
      setForm({ name: "", email: "", phone: "", companyName: "", companyAddress: "", website: "", licenseNumber: "" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-muted border border-border rounded-xl px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <PageLayout>
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-6">Partners</p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-[6.5rem] text-foreground leading-[0.95] tracking-tight mb-4">Wholesale</h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          Interested in carrying our products? Fill out the form below and our team will get back to you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input className={inputClass} placeholder="Full Name *" value={form.name} onChange={update("name")} />
            <input className={inputClass} placeholder="Email *" type="email" value={form.email} onChange={update("email")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input className={inputClass} placeholder="Phone Number *" value={form.phone} onChange={update("phone")} />
            <input className={inputClass} placeholder="Company Name *" value={form.companyName} onChange={update("companyName")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input className={inputClass} placeholder="Company Address *" value={form.companyAddress} onChange={update("companyAddress")} />
            <input className={inputClass} placeholder="Website" value={form.website} onChange={update("website")} />
          </div>

          <input className={inputClass} placeholder="License # *" value={form.licenseNumber} onChange={update("licenseNumber")} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-foreground text-background font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Send Message"}
          </button>
        </form>
      </section>
    </PageLayout>
  );
};

export default Wholesale;
