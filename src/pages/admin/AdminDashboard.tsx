import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, HelpCircle, Star, BarChart3, LogOut,
  Plus, Pencil, Trash2, X, ChevronDown, RefreshCw,
  ExternalLink, Image as ImageIcon, Users, Menu,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  qty: number;
  image_url: string | null;
  description: string;
  is_new: boolean;
  sold_out: boolean;
  strain: string | null;
  product_type: string;
  active: boolean;
  sort_order: number;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
}

interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  product_id: string | null;
  show_on_homepage: boolean;
  active: boolean;
  products?: { name: string } | null;
}

const STRAIN_OPTIONS = ["None", "Indica", "Sativa", "Hybrid"];
const TYPE_OPTIONS = ["Flower", "Vapes", "Edibles", "Concentrates", "Pre-Rolls", "Accessories", "Other"];
const DEFAULT_BRAND_OPTIONS = ["Luxury Courier Club", "The Candy Shop", "Pain Network", "Grumpus", "Cupz Strainz", "Julato NYC", "High Mart", "Highflix", "High Monkey", "Mameys", "ESPN", "MB", "Fumi", "Frutaz LA", "Don Merfos", "Kandy Depo", "Always Faded", "FS", "Super Candy Bros", "Backpack Boyz", "Kush Factory", "Friday", "High Tolerance", "Cali Clouds Club"];

// ─── Sidebar Nav ─────────────────────────────────────────────────
const navItems = [
  { id: "products", label: "Products", icon: Package },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

// ─── Helpers ─────────────────────────────────────────────────────
const StarRating = ({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange?.(s)}
        className={`text-lg leading-none transition-colors ${s <= rating ? "text-yellow-400" : "text-black/15"} ${onChange ? "cursor-pointer hover:text-yellow-300" : "cursor-default"}`}
      >
        ★
      </button>
    ))}
  </div>
);

// ─── Modal wrapper ────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/20 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <motion.div
      className="bg-white border border-black/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
      initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
    >
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-black/8 sticky top-0 bg-white z-10">
        <h3 className="text-foreground font-semibold">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1">
          <X size={18} />
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </motion.div>
  </motion.div>
);

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <label className="block text-black/40 text-xs uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-black/30 text-[10px] mt-1">{hint}</p>}
  </div>
);

const inputCls = "w-full bg-transparent border border-black/15 text-foreground placeholder-black/25 px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-black/40 transition-colors";
const selectCls = inputCls + " appearance-none";

// ─── Section Header ───────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, actions }: { title: string; subtitle: string; actions: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h2 className="text-foreground text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>
    </div>
    <div className="flex gap-2 flex-shrink-0">{actions}</div>
  </div>
);

// ─── Products Section ─────────────────────────────────────────────
const ProductsSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", brand: "Luxury Courier Club", price: "$65", image_url: "", description: "", strain: "None", product_type: "Flower", sold_out: false, active: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [customBrand, setCustomBrand] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts((await callAdmin("products", "GET")) as Product[]); } catch {}
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ name: "", brand: "Luxury Courier Club", price: "$65", image_url: "", description: "", strain: "None", product_type: "Flower", sold_out: false, active: true });
    setModal("add");
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, brand: p.brand, price: p.price, image_url: p.image_url || "", description: p.description, strain: p.strain || "None", product_type: p.product_type, sold_out: p.sold_out, active: p.active });
    setModal("edit");
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, image_url: form.image_url || null, strain: form.strain === "None" ? null : form.strain };
      if (modal === "add") await callAdmin("products", "POST", payload);
      else await callAdmin("products", "PUT", { id: editing!.id, ...payload });
      await load();
      setModal(null);
    } catch (e) { alert("Save failed: " + e); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    try { await callAdmin("products", "DELETE", { id }); await load(); } catch (e) { alert("Delete failed: " + e); }
    setDeleteId(null);
  };

  const f = (k: string, v: string | number | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div>
      <SectionHeader
        title="Products"
        subtitle={`${products.length} items in catalog`}
        actions={
          <>
            <button onClick={load} className="p-2.5 text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 rounded-lg transition-all">
              <RefreshCw size={14} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-80 transition-opacity">
              <Plus size={14} /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
            </button>
          </>
        }
      />

      {loading ? (
        <div className="text-muted-foreground text-sm text-center py-16">Loading…</div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <motion.div
              key={p.id}
              layout
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-colors ${p.active ? "border-black/8 hover:bg-black/2" : "border-black/5 opacity-40"}`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-black/5 border border-black/8 overflow-hidden flex-shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/20"><ImageIcon size={16} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-foreground text-sm font-medium truncate">{p.name}</p>
                  {p.sold_out && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Sold Out</span>}
                  {!p.active && <span className="text-[9px] bg-black/8 text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">Hidden</span>}
                </div>
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{p.brand} · {p.product_type} {p.strain ? `· ${p.strain}` : ""}</p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-foreground text-sm font-medium">{p.price}</p>
              </div>
              <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-black/5 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteId(p.id)} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <Modal title={modal === "add" ? "Add Product" : "Edit Product"} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name">
                  <input className={inputCls} value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="Product name" />
                </Field>
                <Field label="Brand">
                  <div className="space-y-2">
                    <div className="relative">
                      <select className={selectCls} value={DEFAULT_BRAND_OPTIONS.includes(form.brand) ? form.brand : "__custom__"} onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setCustomBrand(form.brand === "__custom__" ? "" : "");
                          f("brand", "");
                        } else {
                          f("brand", e.target.value);
                          setCustomBrand("");
                        }
                      }}>
                        {DEFAULT_BRAND_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                        <option value="__custom__">+ Custom Brand</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    {(!DEFAULT_BRAND_OPTIONS.includes(form.brand) || form.brand === "") && (
                      <input className={inputCls} value={form.brand} onChange={(e) => f("brand", e.target.value)} placeholder="Enter custom brand name" />
                    )}
                  </div>
                </Field>
              </div>
              <Field label="Price">
                <input className={inputCls} value={form.price} onChange={(e) => f("price", e.target.value)} placeholder="$65" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Strain">
                  <div className="relative">
                    <select className={selectCls} value={form.strain} onChange={(e) => f("strain", e.target.value)}>
                      {STRAIN_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>
                <Field label="Product Type">
                  <div className="relative">
                    <select className={selectCls} value={form.product_type} onChange={(e) => f("product_type", e.target.value)}>
                      {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>
              </div>
              <Field
                label="Image URL (imgbb)"
                hint="Upload your image to imgbb.com → copy the Direct Link → paste it here"
              >
                <div className="space-y-2">
                  <input
                    className={inputCls}
                    value={form.image_url}
                    onChange={(e) => f("image_url", e.target.value)}
                    placeholder="https://i.ibb.co/..."
                  />
                  <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink size={10} /> Open imgbb.com to upload &amp; get link
                  </a>
                  {form.image_url && (
                    <img src={form.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-black/10 mt-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                </div>
              </Field>
              <Field label="Description">
                <textarea
                  className={inputCls + " min-h-[80px] resize-none"}
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  placeholder="Product description…"
                />
              </Field>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={form.sold_out} onChange={(e) => f("sold_out", e.target.checked)} className="sr-only" />
                  <div className={`w-10 h-5 sm:w-8 sm:h-4 rounded-full transition-colors relative ${form.sold_out ? "bg-red-500" : "bg-black/15"}`}>
                    <div className="absolute top-0.5 w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-white transition-transform" style={{ transform: form.sold_out ? "translateX(1.25rem)" : "translateX(0.125rem)" }} />
                  </div>
                  <span className="text-muted-foreground text-xs">Sold Out</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="sr-only" />
                  <div className={`w-10 h-5 sm:w-8 sm:h-4 rounded-full transition-colors relative ${form.active ? "bg-emerald-500" : "bg-black/15"}`}>
                    <div className="absolute top-0.5 w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-white transition-transform" style={{ transform: form.active ? "translateX(1.25rem)" : "translateX(0.125rem)" }} />
                  </div>
                  <span className="text-muted-foreground text-xs">Active / Visible</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-border rounded-lg hover:border-foreground/30 transition-colors">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold rounded-lg hover:opacity-80 disabled:opacity-40 transition-all">
                  {saving ? "Saving…" : "Save Product"}
                </button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">This will permanently remove the product. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-border rounded-lg">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── FAQ Section ──────────────────────────────────────────────────
const FaqSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", active: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await callAdmin("faq", "GET")) as FaqItem[]); } catch {}
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ question: "", answer: "", active: true }); setModal("add"); };
  const openEdit = (item: FaqItem) => { setEditing(item); setForm({ question: item.question, answer: item.answer, active: item.active }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") await callAdmin("faq", "POST", form);
      else await callAdmin("faq", "PUT", { id: editing!.id, ...form });
      await load(); setModal(null);
    } catch (e) { alert("Save failed: " + e); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    try { await callAdmin("faq", "DELETE", { id }); await load(); } catch (e) { alert("Delete failed: " + e); }
    setDeleteId(null);
  };

  const f = (k: string, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div>
      <SectionHeader
        title="FAQ"
        subtitle={`${items.length} questions`}
        actions={
          <>
            <button onClick={load} className="p-2.5 text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 rounded-lg transition-all"><RefreshCw size={14} /></button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-80 transition-opacity">
              <Plus size={14} /> <span className="hidden sm:inline">Add Question</span><span className="sm:hidden">Add</span>
            </button>
          </>
        }
      />

      {loading ? <div className="text-muted-foreground text-sm text-center py-16">Loading…</div> : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className={`p-3 sm:p-4 rounded-xl border flex gap-3 sm:gap-4 transition-colors ${item.active ? "border-black/8 hover:bg-black/2" : "border-black/5 opacity-40"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium">{item.question}</p>
                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{item.answer}</p>
              </div>
              <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-black/5 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Pencil size={13} /></button>
                <button onClick={() => setDeleteId(item.id)} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <Modal title={modal === "add" ? "Add Question" : "Edit Question"} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <Field label="Question">
                <input className={inputCls} value={form.question} onChange={(e) => f("question", e.target.value)} placeholder="What do customers ask?" />
              </Field>
              <Field label="Answer">
                <textarea className={inputCls + " min-h-[100px] resize-none"} value={form.answer} onChange={(e) => f("answer", e.target.value)} placeholder="Your answer…" />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="sr-only" />
                <div className={`w-10 h-5 sm:w-8 sm:h-4 rounded-full transition-colors relative ${form.active ? "bg-emerald-500" : "bg-black/15"}`}>
                  <div className="absolute top-0.5 w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-white transition-transform" style={{ transform: form.active ? "translateX(1.25rem)" : "translateX(0.125rem)" }} />
                </div>
                <span className="text-muted-foreground text-xs">Visible on FAQ page</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-border rounded-lg">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold rounded-lg disabled:opacity-40">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete FAQ" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">Remove this question permanently?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-border rounded-lg">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold rounded-lg">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Reviews Section ──────────────────────────────────────────────
const ReviewsSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState({ author_name: "", rating: 5, body: "", show_on_homepage: true, active: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = (await callAdmin("reviews", "GET")) as Review[];
      setReviews(all.filter((r) => r.show_on_homepage));
    } catch {}
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ author_name: "", rating: 5, body: "", show_on_homepage: true, active: true }); setModal("add"); };
  const openEdit = (r: Review) => {
    setEditing(r);
    setForm({ author_name: r.author_name, rating: r.rating, body: r.body, show_on_homepage: r.show_on_homepage, active: r.active });
    setModal("edit");
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, show_on_homepage: true, product_id: null };
      if (modal === "add") await callAdmin("reviews", "POST", payload);
      else await callAdmin("reviews", "PUT", { id: editing!.id, ...payload });
      await load(); setModal(null);
    } catch (e) { alert("Save failed: " + e); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    try { await callAdmin("reviews", "DELETE", { id }); await load(); } catch (e) { alert("Delete failed: " + e); }
    setDeleteId(null);
  };

  const toggleActive = async (r: Review) => {
    try {
      await callAdmin("reviews", "PUT", { id: r.id, active: !r.active });
      await load();
    } catch (e) { alert("Update failed: " + e); }
  };

  const f = (k: string, v: string | number | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div>
      <SectionHeader
        title="Homepage Reviews"
        subtitle={`Google-style testimonials · ${reviews.length} total`}
        actions={
          <>
            <button onClick={load} className="p-2.5 text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 rounded-lg transition-all"><RefreshCw size={14} /></button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-80 transition-opacity">
              <Plus size={14} /> <span className="hidden sm:inline">Add Review</span><span className="sm:hidden">Add</span>
            </button>
          </>
        }
      />
      <p className="text-muted-foreground text-xs mb-6">These appear in the "What Our Customers Say" section on the homepage.</p>

      {loading ? <div className="text-muted-foreground text-sm text-center py-16">Loading…</div> : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className={`p-3 sm:p-4 rounded-xl border flex gap-3 sm:gap-4 transition-colors ${r.active ? "border-black/8 hover:bg-black/2" : "border-black/5 opacity-50"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-foreground text-sm font-medium">{r.author_name}</p>
                  <StarRating rating={r.rating} />
                  {!r.active && <span className="text-[9px] bg-black/8 text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">Hidden</span>}
                </div>
                <p className="text-muted-foreground text-xs line-clamp-2">{r.body}</p>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleActive(r)}
                  title={r.active ? "Hide review" : "Show review"}
                  className={`p-2 rounded-lg text-xs font-medium transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${r.active ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"}`}
                >
                  {r.active ? "On" : "Off"}
                </button>
                <button onClick={() => openEdit(r)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-black/5 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Pencil size={13} /></button>
                <button onClick={() => setDeleteId(r.id)} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <Modal title={modal === "add" ? "Add Homepage Review" : "Edit Review"} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Customer Name">
                  <input className={inputCls} value={form.author_name} onChange={(e) => f("author_name", e.target.value)} placeholder="John D." />
                </Field>
                <Field label="Rating">
                  <div className="flex items-center h-[42px]">
                    <StarRating rating={form.rating} onChange={(r) => f("rating", r)} />
                  </div>
                </Field>
              </div>
              <Field label="Review Text">
                <textarea className={inputCls + " min-h-[80px] resize-none"} value={form.body} onChange={(e) => f("body", e.target.value)} placeholder="What did they say?" />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="sr-only" />
                <div className={`w-10 h-5 sm:w-8 sm:h-4 rounded-full transition-colors relative ${form.active ? "bg-emerald-500" : "bg-black/15"}`}>
                  <div className="absolute top-0.5 w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-white transition-transform" style={{ transform: form.active ? "translateX(1.25rem)" : "translateX(0.125rem)" }} />
                </div>
                <span className="text-muted-foreground text-xs">Visible on homepage</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-border rounded-lg">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold rounded-lg disabled:opacity-40">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete Review" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">Remove this review from the homepage permanently?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-border rounded-lg">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold rounded-lg">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Referrals Section ────────────────────────────────────────────
interface ReferralCode {
  id: string;
  code: string;
  creator_name: string | null;
  creator_email: string | null;
  total_signups: number;
  created_at: string;
  referral_signups: { id: string; referred_name: string | null; referred_email: string; created_at: string }[];
}

const ReferralsSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [data, setData] = useState<{ codes: ReferralCode[]; stats: { totalCodes: number; totalSignups: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await callAdmin("referrals", "GET") as { codes: ReferralCode[]; stats: { totalCodes: number; totalSignups: number } };
      setData(result);
    } catch {}
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <SectionHeader
        title="Referrals"
        subtitle="Track referral codes and signups"
        actions={
          <button onClick={load} className="p-2.5 text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 rounded-lg transition-all">
            <RefreshCw size={14} />
          </button>
        }
      />

      {loading ? (
        <div className="text-muted-foreground text-sm text-center py-16">Loading…</div>
      ) : data ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="border border-black/8 rounded-xl p-4 sm:p-6">
              <p className="text-foreground text-2xl sm:text-3xl font-light">{data.stats.totalCodes}</p>
              <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 uppercase tracking-wider">Total Codes</p>
            </div>
            <div className="border border-black/8 rounded-xl p-4 sm:p-6">
              <p className="text-foreground text-2xl sm:text-3xl font-light">{data.stats.totalSignups}</p>
              <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 uppercase tracking-wider">Total Signups</p>
            </div>
            <div className="border border-black/8 rounded-xl p-4 sm:p-6 col-span-2 sm:col-span-1">
              <p className="text-foreground text-2xl sm:text-3xl font-light">
                {data.stats.totalCodes > 0 ? ((data.stats.totalSignups / data.stats.totalCodes) * 100).toFixed(1) + "%" : "0%"}
              </p>
              <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 uppercase tracking-wider">Conversion</p>
            </div>
          </div>

          {/* Top Referrers */}
          <h3 className="text-foreground text-sm font-semibold mb-3 uppercase tracking-wider">All Referral Codes</h3>
          {data.codes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No referral codes yet.</p>
          ) : (
            <div className="space-y-2">
              {data.codes.map((rc) => (
                <div key={rc.id}>
                  <button
                    onClick={() => setExpanded(expanded === rc.id ? null : rc.id)}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-black/8 hover:bg-black/2 transition-colors text-left min-h-[56px]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-foreground tracking-wider">{rc.code}</span>
                        {rc.total_signups > 0 && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {rc.total_signups} signup{rc.total_signups !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5 truncate">
                        Created {new Date(rc.created_at).toLocaleDateString()}
                        {rc.creator_email && ` · ${rc.creator_email}`}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-muted-foreground transition-transform flex-shrink-0 ${expanded === rc.id ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {expanded === rc.id && rc.referral_signups.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 sm:ml-6 border-l border-black/10 pl-3 sm:pl-4 py-2 space-y-2">
                          {rc.referral_signups.map((s) => (
                            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-[1.0625rem] sm:-ml-[1.3125rem] hidden sm:block" />
                              <span className="text-foreground font-medium truncate">{s.referred_email}</span>
                              {s.referred_name && <span className="text-muted-foreground">({s.referred_name})</span>}
                              <span className="text-muted-foreground sm:ml-auto">{new Date(s.created_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {expanded === rc.id && rc.referral_signups.length === 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-muted-foreground text-xs py-3 pl-8 sm:pl-10">No signups yet for this code.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};


// ─── Analytics Section ────────────────────────────────────────────
const AnalyticsSection = () => {
  const [stats, setStats] = useState({ productCount: 0, reviewCount: 0, faqCount: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("faq_items").select("id", { count: "exact", head: true }),
    ]).then(([p, r, f]) => {
      setStats({ productCount: p.count || 0, reviewCount: r.count || 0, faqCount: f.count || 0 });
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-foreground text-xl font-semibold">Analytics</h2>
        <p className="text-muted-foreground text-xs mt-0.5">Store overview & Stripe insights</p>
      </div>

      {/* Site Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
        {[
          { label: "Products", value: stats.productCount },
          { label: "Reviews", value: stats.reviewCount },
          { label: "FAQ Items", value: stats.faqCount },
        ].map(({ label, value }) => (
          <div key={label} className="border border-black/8 rounded-xl p-4 sm:p-6">
            <p className="text-foreground text-2xl sm:text-3xl font-light">{value}</p>
            <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Stripe */}
      <div className="border border-black/8 rounded-xl p-4 sm:p-6 mb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Stripe</p>
        <h3 className="text-foreground font-semibold mb-1">Payment Dashboard</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">View real-time revenue, transactions, and customer data directly in Stripe.</p>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs border border-foreground text-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-foreground hover:text-background transition-all"
        >
          Open Stripe Dashboard <ExternalLink size={11} />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Revenue Overview", desc: "Total revenue, MRR, refunds", href: "https://dashboard.stripe.com/revenue" },
          { label: "Customers", desc: "Customer profiles and purchase history", href: "https://dashboard.stripe.com/customers" },
        ].map(({ label, desc, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between p-4 border border-black/8 rounded-xl hover:bg-black/2 transition-colors group">
            <div>
              <p className="text-foreground text-sm font-medium">{label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
            <ExternalLink size={11} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────
interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { callAdmin, logout } = useAdmin();
  const [section, setSection] = useState("products");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const handleNavClick = (id: string) => {
    setSection(id);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-black/8 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 text-foreground rounded-lg hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu size={20} />
          </button>
          <img src={logoImg} alt="Logo" className="h-8" />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all min-h-[44px]"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl md:hidden flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-4 border-b border-black/8 flex items-center justify-between">
                <img src={logoImg} alt="Logo" className="h-16" />
                <button onClick={() => setMobileNavOpen(false)} className="p-2 text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-3">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm mb-1 transition-all min-h-[48px] ${
                      section === id
                        ? "bg-black/8 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/4"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                    {section === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground/40" />}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 border-r border-black/8 flex-col">
        <div className="p-6 border-b border-black/8 flex flex-col items-start">
          <img src={logoImg} alt="Logo" className="h-48 mb-2" />
          <p className="text-black/30 text-[10px] uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all ${
                section === id
                  ? "bg-black/8 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/4"
              }`}
            >
              <Icon size={15} />
              {label}
              {section === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground/40" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-black/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {section === "products" && <ProductsSection callAdmin={callAdmin} />}
              {section === "faq" && <FaqSection callAdmin={callAdmin} />}
              {section === "reviews" && <ReviewsSection callAdmin={callAdmin} />}
              {section === "referrals" && <ReferralsSection callAdmin={callAdmin} />}
              {section === "analytics" && <AnalyticsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
