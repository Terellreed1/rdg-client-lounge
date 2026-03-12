import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "LCC";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const getOrCreateReferralCode = async (): Promise<string> => {
  const stored = localStorage.getItem("lcc_referral_code");
  if (stored) return stored;
  const code = generateCode();
  await supabase.from("referral_codes").insert({ code });
  localStorage.setItem("lcc_referral_code", code);
  return code;
};

interface ReferralDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: "join" | "share";
}

const ReferralDialog = ({ open, onClose, initialTab = "join" }: ReferralDialogProps) => {
  const [tab, setTab] = useState<"join" | "share">(initialTab);
  const [code, setCode] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Join form state
  const [birthday, setBirthday] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      getOrCreateReferralCode().then(setCode);
    }
  }, [open, initialTab]);

  // Capture ref param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) localStorage.setItem("lcc_referral_ref", ref.toUpperCase());
  }, []);

  const referralLink = `https://luxurycourier.club/r/${code.toLowerCase()}`;
  const shareMessage = `Join the Luxury Courier Club and get a free 8th on me 🌿 ${referralLink}`;

  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2200);
    } catch {}
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Luxury Courier Club", text: shareMessage }); } catch {}
    } else {
      handleCopy(shareMessage, "message");
    }
  }, [shareMessage, handleCopy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const refCode = localStorage.getItem("lcc_referral_ref");
      if (refCode) {
        const { data: codeRow } = await supabase.from("referral_codes").select("id").eq("code", refCode).single();
        if (codeRow) {
          await supabase.from("referral_signups").insert({ referral_code_id: codeRow.id, referred_name: firstName || null, referred_email: email });
          await supabase.rpc("increment_referral_count" as never, { code_id: codeRow.id } as never);
        }
        localStorage.removeItem("lcc_referral_ref");
      }
      setSuccess(true);
      setTimeout(() => { setTab("share"); setSuccess(false); }, 1500);
    } catch {}
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative w-full max-w-[400px] pointer-events-auto rounded-xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(197, 163, 85, 0.15)" }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tab switcher with close */}
              <div className="flex relative" style={{ borderBottom: "1px solid rgba(197, 163, 85, 0.15)" }}>
                {(["join", "share"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 py-3.5 text-[10px] font-sans uppercase tracking-[0.15em] transition-all duration-300 pr-2",
                      tab === t
                        ? "text-[#D4AF37] border-b-2 border-[#D4AF37]"
                        : "text-gray-500 hover:text-gray-400"
                    )}
                  >
                    {t === "join" ? "Join the Club" : "Share the Club"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === "join" ? (
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pt-4 pb-4"
                  >
                    <img src={logo} alt="Luxury Courier Club" className="h-20 w-20 object-contain mx-auto mb-3" />
                    <h2 className="font-serif text-xl leading-tight">
                      <span className="text-white">Join the</span><br />
                      <span className="italic text-[#D4AF37]">Club.</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed mb-5">
                      15% off your first order, plus exclusive drops & members-only deals.
                    </p>

                    {success ? (
                      <motion.p
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-[#D4AF37] font-serif text-lg py-6 text-center"
                      >
                        Welcome to the Club ✓
                      </motion.p>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-2.5">
                        <input type="text" placeholder="MM/DD/YYYY" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                          className="w-full bg-[#141414] px-4 py-2.5 text-xs font-sans text-white placeholder:text-white/40 uppercase tracking-wider focus:outline-none transition-all duration-300 rounded-lg"
                          style={{ border: "1px solid rgba(197, 163, 85, 0.4)" }}
                          onFocus={(e) => e.target.style.borderColor = "#D4AF37"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(197, 163, 85, 0.4)"}
                        />
                        <input type="text" placeholder="FIRST NAME (OPTIONAL)" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-[#141414] px-4 py-2.5 text-xs font-sans text-white placeholder:text-white/40 uppercase tracking-wider focus:outline-none transition-all duration-300 rounded-lg"
                          style={{ border: "1px solid rgba(197, 163, 85, 0.4)" }}
                          onFocus={(e) => e.target.style.borderColor = "#D4AF37"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(197, 163, 85, 0.4)"}
                        />
                        <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} required
                          className="w-full bg-[#141414] px-4 py-2.5 text-xs font-sans text-white placeholder:text-white/40 uppercase tracking-wider focus:outline-none transition-all duration-300 rounded-lg"
                          style={{ border: "1px solid rgba(197, 163, 85, 0.4)" }}
                          onFocus={(e) => e.target.style.borderColor = "#D4AF37"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(197, 163, 85, 0.4)"}
                        />
                        <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }}
                          className="w-full h-10 font-sans text-[10px] uppercase tracking-[0.2em] text-white font-semibold rounded-full transition-all duration-300 disabled:opacity-50"
                          style={{
                            background: "linear-gradient(135deg, #B8962E 0%, #D4AF37 100%)",
                            boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)"
                          }}
                          whileHover={{
                            boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)"
                          }}
                        >
                          {submitting ? "Joining…" : "Join Now"}
                        </motion.button>
                      </form>
                    )}
                    <p className="text-[9px] text-gray-500 font-sans mt-3 text-center">
                      By signing up, you agree to receive marketing emails.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pt-5 pb-4">
                      <img src={logo} alt="Luxury Courier Club" className="h-20 w-20 object-contain mx-auto mb-3" />
                      <h2 className="font-serif text-xl text-foreground leading-tight">
                        Share the<br /><span className="italic">Club.</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        Both you and your friend receive waived fees on the next qualifying drop.
                      </p>
                    </div>

                    <div className="mx-5 h-px bg-border" />

                    <div className="px-5 py-3.5">
                      <p className="text-[10px] font-sans uppercase wide-spacing text-muted-foreground mb-2">Your Code</p>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg tracking-[0.2em] text-foreground">{code}</span>
                        <CopyPill onClick={() => handleCopy(code, "code")} copied={copiedField === "code"} />
                      </div>
                    </div>

                    <div className="mx-5 h-px bg-border" />

                    <div className="px-5 py-3.5">
                      <p className="text-[10px] font-sans uppercase wide-spacing text-muted-foreground mb-2">Your Link</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-sans text-muted-foreground truncate">{referralLink}</span>
                        <CopyPill onClick={() => handleCopy(referralLink, "link")} copied={copiedField === "link"} />
                      </div>
                    </div>

                    <div className="mx-5 h-px bg-border" />

                    <div className="px-5 pt-3.5 pb-5">
                      <p className="text-[10px] font-sans uppercase wide-spacing text-muted-foreground mb-2">Quick Share</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 italic line-clamp-2">"{shareMessage}"</p>
                      <div className="flex items-center gap-2">
                        <motion.button onClick={handleNativeShare} whileTap={{ scale: 0.97 }}
                          className="flex-1 h-9 bg-foreground text-background font-sans text-[10px] uppercase wide-spacing rounded-full hover:bg-foreground/85 transition-colors"
                        >
                          Share Now
                        </motion.button>
                        <motion.button
                          onClick={() => handleCopy(shareMessage, "message")}
                          className={cn(
                            "h-9 px-4 border rounded-full font-sans text-[10px] uppercase wide-spacing transition-all duration-300",
                            copiedField === "message"
                              ? "border-foreground text-foreground bg-foreground/5"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          )}
                          whileTap={{ scale: 0.97 }}
                        >
                          {copiedField === "message" ? "Copied" : "Copy"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={onClose}
                className="w-full py-3 text-[10px] font-sans uppercase tracking-[0.15em] transition-colors duration-300 hover:text-[#D4AF37]"
                style={{ color: "rgba(197, 163, 85, 0.6)", borderTop: "1px solid rgba(197, 163, 85, 0.15)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#D4AF37"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(197, 163, 85, 0.6)"}
              >
                Skip
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CopyPill = ({ onClick, copied }: { onClick: () => void; copied: boolean }) => (
  <motion.button
    onClick={onClick}
    className={cn(
      "shrink-0 h-8 px-4 rounded-full font-sans text-[11px] uppercase editorial-spacing transition-all duration-300 border",
      copied
        ? "border-foreground text-foreground bg-foreground/5"
        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
    )}
    whileTap={{ scale: 0.93 }}
  >
    {copied ? "Copied" : "Copy"}
  </motion.button>
);

export default ReferralDialog;
