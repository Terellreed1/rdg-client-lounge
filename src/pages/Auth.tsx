import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import logo from "@/assets/hero-logo.png";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Update profile with signup details if available
        if (event === "SIGNED_IN") {
          const stored = sessionStorage.getItem("lcc_signup_data");
          if (stored) {
            const data = JSON.parse(stored);
            await supabase.from("profiles").update(data).eq("id", session.user.id);
            sessionStorage.removeItem("lcc_signup_data");
          }
        }
        navigate("/account");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { first_name: firstName, last_name: lastName },
          },
        });
        if (error) throw error;
        // Store profile data to save after email verification
        sessionStorage.setItem("lcc_signup_data", JSON.stringify({
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
          birthday: birthday || null,
        }));
        toast.success("Check your email to verify your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/account");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-[rgba(201,168,76,0.2)] px-4 py-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground/40 uppercase tracking-wider focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "#0D110E" }}>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <img src={logo} alt="Luxury Courier Club" className="h-24 w-24 object-contain mx-auto mb-6" />
            <h1
              className="text-3xl mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#F0EBE0" }}
            >
              {mode === "signup" ? "Join the Club" : "Welcome Back"}
            </h1>
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.5)" }}>
              {mode === "signup"
                ? "Sign up for 15% off your first order"
                : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <input
                  className={inputClass}
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Birthday (MM/DD/YYYY)"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </>
            )}
            <input
              className={inputClass}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={inputClass}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-[11px] font-sans font-semibold uppercase transition-all duration-300 disabled:opacity-50"
              style={{
                letterSpacing: "0.2em",
                background: "#C9A84C",
                color: "#0D110E",
              }}
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-xs uppercase tracking-wider transition-colors"
              style={{ color: "rgba(201,168,76,0.5)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(201,168,76,0.5)"; }}
            >
              {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Auth;
