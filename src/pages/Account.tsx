import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import logo from "@/assets/hero-logo.png";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birthday: string | null;
}

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  used: boolean;
  used_at: string | null;
}

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [discount, setDiscount] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", birthday: "" });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    const [profileRes, discountRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("discount_codes").select("*").eq("user_id", userId).limit(1).single(),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data as Profile);
      setForm({
        first_name: profileRes.data.first_name || "",
        last_name: profileRes.data.last_name || "",
        phone: profileRes.data.phone || "",
        birthday: profileRes.data.birthday || "",
      });
    }
    if (discountRes.data) setDiscount(discountRes.data as DiscountCode);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated!"); setProfile({ ...form } as Profile); setEditing(false); }
    setSaving(false);
  };

  const handleCopy = () => {
    if (discount) {
      navigator.clipboard.writeText(discount.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center" style={{ background: "#0D110E" }}>
          <div className="w-6 h-6 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const inputClass =
    "w-full bg-transparent border border-[rgba(201,168,76,0.2)] px-4 py-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground/40 uppercase tracking-wider focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <PageLayout>
      <div className="min-h-[80vh] px-4 py-16" style={{ background: "#0D110E" }}>
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <img src={logo} alt="LCC" className="h-20 w-20 object-contain mx-auto mb-4" />
              <h1
                className="text-3xl mb-1"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
              >
                My Account
              </h1>
              <p className="text-xs" style={{ color: "rgba(201,168,76,0.4)" }}>
                {user?.email}
              </p>
            </div>

            {/* Welcome Discount */}
            {discount && (
              <div
                className="mb-8 p-6 text-center"
                style={{
                  background: "#131810",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              >
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(201,168,76,0.5)" }}>
                  {discount.used ? "Discount Used" : "Your Welcome Discount"}
                </p>
                <p
                  className="text-2xl font-mono font-bold tracking-wider mb-2"
                  style={{ color: discount.used ? "rgba(201,168,76,0.3)" : "#C9A84C" }}
                >
                  {discount.code}
                </p>
                {discount.used ? (
                  <p className="text-xs" style={{ color: "rgba(201,168,76,0.3)" }}>
                    This code has already been redeemed
                  </p>
                ) : (
                  <>
                    <p className="text-xs mb-3" style={{ color: "rgba(201,168,76,0.5)" }}>
                      {discount.discount_percent}% off your first order
                    </p>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-wider transition-all"
                      style={{
                        border: "1px solid rgba(201,168,76,0.3)",
                        color: "#C9A84C",
                      }}
                    >
                      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Code</>}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Profile */}
            <div
              className="p-6"
              style={{
                background: "#131810",
                border: "1px solid rgba(201,168,76,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F0EBE0" }}>
                  Profile
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-[10px] uppercase tracking-wider transition-colors"
                    style={{ color: "#C9A84C" }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inputClass} placeholder="First Name" value={form.first_name} onChange={(e) => setForm(p => ({ ...p, first_name: e.target.value }))} />
                    <input className={inputClass} placeholder="Last Name" value={form.last_name} onChange={(e) => setForm(p => ({ ...p, last_name: e.target.value }))} />
                  </div>
                  <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                  <input className={inputClass} placeholder="Birthday (MM/DD/YYYY)" value={form.birthday} onChange={(e) => setForm(p => ({ ...p, birthday: e.target.value }))} />
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 py-3 text-[10px] uppercase tracking-wider transition-colors"
                      style={{ border: "1px solid rgba(201,168,76,0.2)", color: "rgba(201,168,76,0.5)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-3 text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
                      style={{ background: "#C9A84C", color: "#0D110E" }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Name", value: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—" },
                    { label: "Phone", value: profile?.phone || "—" },
                    { label: "Birthday", value: profile?.birthday || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2" style={{ borderBottom: "1px solid rgba(201,168,76,0.06)" }}>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(201,168,76,0.4)" }}>{label}</span>
                      <span className="text-sm" style={{ color: "#F0EBE0" }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 py-3.5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider transition-colors"
              style={{ border: "1px solid rgba(201,168,76,0.15)", color: "rgba(201,168,76,0.4)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"; e.currentTarget.style.color = "rgba(201,168,76,0.4)"; }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Account;
