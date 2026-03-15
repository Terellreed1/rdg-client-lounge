import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, HelpCircle, Star, BarChart3, LogOut,
  Plus, Pencil, Trash2, X, ChevronDown, RefreshCw,
  ExternalLink, Image as ImageIcon, Users, Menu,
  ShoppingBag, MessageSquare, FileQuestion, GripVertical,
  Upload, Sparkles, Check, Loader2,
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAdmin } from "@/hooks/useAdmin";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────
interface Product {
  id: string; name: string; brand: string; price: string; qty: number;
  image_url: string | null; description: string; is_new: boolean;
  sold_out: boolean; strain: string | null; product_type: string;
  active: boolean; sort_order: number;
}
interface FaqItem {
  id: string; question: string; answer: string; sort_order: number; active: boolean;
}
interface Review {
  id: string; author_name: string; rating: number; body: string;
  product_id: string | null; show_on_homepage: boolean; active: boolean;
  products?: { name: string } | null;
}

const STRAIN_OPTIONS = ["None", "Indica", "Sativa", "Hybrid"];
const TYPE_OPTIONS = ["Flower", "Vapes", "Edibles", "Concentrates", "Pre-Rolls", "Accessories", "Other"];
const DEFAULT_BRAND_OPTIONS = ["Luxury Courier Club", "The Candy Shop", "Pain Network", "Grumpus", "Cupz Strainz", "Julato NYC", "High Mart", "Highflix", "High Monkey", "Mameys", "ESPN", "MB", "Fumi", "Frutaz LA", "Don Merfos", "Kandy Depo", "Always Faded", "FS", "Super Candy Bros", "Backpack Boyz", "Kush Factory", "Friday", "High Tolerance", "Cali Clouds Club"];

const navItems = [
  { id: "products", label: "Products", icon: Package },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

// ─── Helpers ─────────────────────────────────────────────────────
const StarRating = ({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange?.(s)}
        className={`text-base leading-none transition-colors ${s <= rating ? "text-amber-400" : "text-black/10"} ${onChange ? "cursor-pointer hover:text-amber-300" : "cursor-default"}`}
      >★</button>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: React.ElementType; title: string; description: string; actionLabel?: string; onAction?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/[0.06] flex items-center justify-center mb-5">
      <Icon size={24} className="text-black/20" />
    </div>
    <h3 className="text-foreground text-base font-medium mb-1">{title}</h3>
    <p className="text-muted-foreground text-sm text-center max-w-xs mb-6">{description}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-80 transition-opacity">
        <Plus size={14} /> {actionLabel}
      </button>
    )}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/20 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <motion.div className="bg-white border border-black/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
      initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}>
      <div className="flex items-center justify-between p-5 border-b border-black/[0.06] sticky top-0 bg-white z-10">
        <h3 className="text-foreground font-semibold text-sm">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"><X size={18} /></button>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  </motion.div>
);

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <label className="block text-black/40 text-[11px] uppercase tracking-wider mb-1.5 font-medium">{label}</label>
    {children}
    {hint && <p className="text-black/25 text-[10px] mt-1">{hint}</p>}
  </div>
);

const inputCls = "w-full bg-white border border-black/10 text-black placeholder-black/20 px-3.5 py-2.5 text-sm focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/5 transition-all";
const selectCls = inputCls + " appearance-none";
const btnPrimary = "flex items-center gap-2 bg-black text-white text-sm font-semibold px-4 py-2.5 hover:opacity-80 transition-opacity";
const btnSecondary = "p-2.5 text-black/40 hover:text-black border border-black/10 hover:border-black/20 transition-all";

const SectionHeader = ({ title, subtitle, actions }: { title: string; subtitle: string; actions: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h2 className="text-foreground text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>
    </div>
    <div className="flex gap-2 flex-shrink-0">{actions}</div>
  </div>
);

// ─── Sortable Product Row ─────────────────────────────────────────
const SortableProductRow = ({ product, index }: { product: Product; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 sm:p-4 border border-black/[0.06] bg-white ${isDragging ? "shadow-lg" : ""}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-black/30 hover:text-black/60 touch-none">
        <GripVertical size={16} />
      </button>
      <span className="text-black/25 text-xs font-mono w-6 text-center">{index + 1}</span>
      <div className="w-10 h-10 bg-black/[0.03] border border-black/[0.06] overflow-hidden flex-shrink-0">
        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-black/15"><ImageIcon size={14} /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-black text-sm font-medium truncate">{product.name}</p>
        <p className="text-black/40 text-xs truncate">{product.brand} · {product.price}</p>
      </div>
    </div>
  );
};

// ─── Products Section ─────────────────────────────────────────────
const ProductsSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "bulk" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", brand: "Luxury Courier Club", price: "$65", image_url: "", description: "", strain: "None", product_type: "Flower", sold_out: false, active: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [customBrand, setCustomBrand] = useState("");
  const [reorderMode, setReorderMode] = useState(false);
  const [reordering, setReordering] = useState(false);
  
  // Bulk import state
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkItems, setBulkItems] = useState<{ image_url: string; name: string; brand: string; product_type: string; description: string; price: string; selected: boolean }[]>([]);
  const [bulkStep, setBulkStep] = useState<"paste" | "review">("paste");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [aiNaming, setAiNaming] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts((await callAdmin("products", "GET")) as Product[]); } catch { setProducts([]); }
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    setProducts(arrayMove(products, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    setReordering(true);
    try {
      const items = products.map((p, i) => ({ id: p.id, sort_order: i }));
      await supabase.functions.invoke("admin-data?resource=products&action=reorder", {
        method: "POST",
        body: { items },
        headers: { Authorization: `Bearer ${localStorage.getItem("lc_admin_token")}` },
      });
      await load();
      setReorderMode(false);
    } catch (e) { alert("Reorder failed: " + e); }
    setReordering(false);
  };

  const openAdd = () => {
    setForm({ name: "", brand: "Luxury Courier Club", price: "$65", image_url: "", description: "", strain: "None", product_type: "Flower", sold_out: false, active: true });
    setCustomBrand("");
    setModal("add");
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, brand: p.brand, price: p.price, image_url: p.image_url || "", description: p.description, strain: p.strain || "None", product_type: p.product_type, sold_out: p.sold_out, active: p.active });
    setCustomBrand("");
    setModal("edit");
  };
  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, image_url: form.image_url || null, strain: form.strain === "None" ? null : form.strain };
      if (modal === "add") await callAdmin("products", "POST", payload);
      else await callAdmin("products", "PUT", { id: editing!.id, ...payload });
      await load(); setModal(null);
    } catch (e) { alert("Save failed: " + e); }
    setSaving(false);
  };
  const remove = async (id: string) => {
    try { await callAdmin("products", "DELETE", { id }); await load(); } catch (e) { alert("Delete failed: " + e); }
    setDeleteId(null);
  };
  const openBulkImport = () => {
    setBulkUrls("");
    setBulkItems([]);
    setBulkStep("paste");
    setBulkLoading(false);
    setModal("bulk");
  };

  const parseBulkUrls = () => {
    const urls = bulkUrls
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.startsWith("http"));
    if (urls.length === 0) return;
    setBulkItems(urls.map(url => ({ image_url: url, name: "New Product", brand: "Luxury Courier Club", product_type: "Flower", description: "", price: "$65", selected: true })));
    setBulkStep("review");
  };

  const runAiNaming = async () => {
    setAiNaming(true);
    try {
      const urls = bulkItems.filter(i => i.selected).map(i => i.image_url);
      const { data, error } = await supabase.functions.invoke("ai-product-namer", {
        method: "POST",
        body: { image_urls: urls },
        headers: { Authorization: `Bearer ${localStorage.getItem("lc_admin_token")}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const results = data.results || [];
      setBulkItems(prev => prev.map(item => {
        if (!item.selected) return item;
        const match = results.find((r: { image_url: string }) => r.image_url === item.image_url);
        if (match) return { ...item, name: match.name || item.name, brand: match.brand || item.brand, product_type: match.product_type || item.product_type, description: match.description || item.description };
        return item;
      }));
    } catch (e) { alert("AI naming failed: " + e); }
    setAiNaming(false);
  };

  const saveBulkProducts = async () => {
    const toSave = bulkItems.filter(i => i.selected);
    if (toSave.length === 0) return;
    setBulkSaving(true);
    try {
      for (const item of toSave) {
        await callAdmin("products", "POST", {
          name: item.name, brand: item.brand, price: item.price, product_type: item.product_type,
          description: item.description, image_url: item.image_url, strain: null, sold_out: false, active: true,
        });
      }
      await load();
      setModal(null);
    } catch (e) { alert("Bulk save failed: " + e); }
    setBulkSaving(false);
  };

  const updateBulkItem = (idx: number, field: string, value: string | boolean) => {
    setBulkItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const f = (k: string, v: string | number | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div>
      <SectionHeader title="Products" subtitle={`${products.length} items in catalog`}
        actions={<>
          {!reorderMode ? (
            <>
              <button onClick={() => setReorderMode(true)} className={btnSecondary + " text-xs flex items-center gap-1.5"}><GripVertical size={14} /> <span className="hidden sm:inline">Reorder</span></button>
              <button onClick={openBulkImport} className={btnSecondary + " text-xs flex items-center gap-1.5"}><Upload size={14} /> <span className="hidden sm:inline">Bulk Import</span><span className="sm:hidden">Bulk</span></button>
              <button onClick={load} className={btnSecondary}><RefreshCw size={14} /></button>
              <button onClick={openAdd} className={btnPrimary}><Plus size={14} /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span></button>
            </>
          ) : (
            <>
              <button onClick={() => { setReorderMode(false); load(); }} className={btnSecondary + " text-xs"}>Cancel</button>
              <button onClick={saveOrder} disabled={reordering} className={btnPrimary + " text-xs"}>{reordering ? "Saving..." : "Save Order"}</button>
            </>
          )}
        </>}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No products yet" description="Add your first product to get started with your catalog." actionLabel="Add Product" onAction={openAdd} />
      ) : reorderMode ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {products.map((p, idx) => (
                <SortableProductRow key={p.id} product={p} index={idx} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-1.5">
          {products.map((p) => (
            <motion.div key={p.id} layout
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border transition-all ${p.active ? "border-black/[0.06] hover:border-black/10 hover:shadow-sm" : "border-black/[0.04] opacity-40"}`}>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-black/[0.03] border border-black/[0.06] overflow-hidden flex-shrink-0">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-black/15"><ImageIcon size={16} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-foreground text-sm font-medium truncate">{p.name}</p>
                  {p.sold_out && <span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 font-medium">SOLD OUT</span>}
                  {!p.active && <span className="text-[9px] bg-black/5 text-muted-foreground px-1.5 py-0.5 font-medium">HIDDEN</span>}
                </div>
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{p.brand} · {p.product_type}{p.strain ? ` · ${p.strain}` : ""}</p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-foreground text-sm font-medium">{p.price}</p>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Pencil size={13} /></button>
                <button onClick={() => setDeleteId(p.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50/60 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Trash2 size={13} /></button>
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
                <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="Product name" /></Field>
                <Field label="Brand">
                  <div className="space-y-2">
                    <div className="relative">
                      <select className={selectCls} value={DEFAULT_BRAND_OPTIONS.includes(form.brand) ? form.brand : "__custom__"} onChange={(e) => {
                        if (e.target.value === "__custom__") { setCustomBrand(""); f("brand", ""); } else { f("brand", e.target.value); setCustomBrand(""); }
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
              <Field label="Price"><input className={inputCls} value={form.price} onChange={(e) => f("price", e.target.value)} placeholder="$65" /></Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Strain">
                  <div className="relative">
                    <select className={selectCls} value={form.strain} onChange={(e) => f("strain", e.target.value)}>{STRAIN_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>
                <Field label="Product Type">
                  <div className="relative">
                    <select className={selectCls} value={form.product_type} onChange={(e) => f("product_type", e.target.value)}>{TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}</select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>
              </div>
              <Field label="Image URL" hint="Upload to imgbb.com → copy Direct Link → paste here">
                <div className="space-y-2">
                  <input className={inputCls} value={form.image_url} onChange={(e) => f("image_url", e.target.value)} placeholder="https://i.ibb.co/..." />
                  <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"><ExternalLink size={10} /> Open imgbb.com</a>
                  {form.image_url && <img src={form.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-black/10 mt-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                </div>
              </Field>
              <Field label="Description"><textarea className={inputCls + " min-h-[80px] resize-none"} value={form.description} onChange={(e) => f("description", e.target.value)} placeholder="Product description…" /></Field>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={form.sold_out} onChange={(e) => f("sold_out", e.target.checked)} className="sr-only" />
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${form.sold_out ? "bg-red-500" : "bg-black/10"}`}><div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" style={{ transform: form.sold_out ? "translateX(1rem)" : "translateX(0.125rem)" }} /></div>
                  <span className="text-muted-foreground text-xs">Sold Out</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="sr-only" />
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${form.active ? "bg-emerald-500" : "bg-black/10"}`}><div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" style={{ transform: form.active ? "translateX(1rem)" : "translateX(0.125rem)" }} /></div>
                  <span className="text-muted-foreground text-xs">Visible</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10 rounded-xl hover:border-black/20 transition-colors">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold rounded-xl hover:opacity-80 disabled:opacity-40 transition-all">{saving ? "Saving…" : "Save Product"}</button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete Product" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">This will permanently remove the product. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10 rounded-xl">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors">Delete</button>
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
    try { setItems((await callAdmin("faq", "GET")) as FaqItem[]); } catch { setItems([]); }
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
      <SectionHeader title="FAQ" subtitle={`${items.length} questions`}
        actions={<>
          <button onClick={load} className={btnSecondary}><RefreshCw size={14} /></button>
          <button onClick={openAdd} className={btnPrimary}><Plus size={14} /> <span className="hidden sm:inline">Add Question</span><span className="sm:hidden">Add</span></button>
        </>}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={FileQuestion} title="No FAQ items" description="Add frequently asked questions to help your customers." actionLabel="Add Question" onAction={openAdd} />
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className={`p-3 sm:p-4 rounded-xl border flex gap-3 sm:gap-4 transition-all ${item.active ? "border-black/[0.06] hover:border-black/10 hover:shadow-sm" : "border-black/[0.04] opacity-40"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium">{item.question}</p>
                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{item.answer}</p>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-black/[0.04] transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Pencil size={13} /></button>
                <button onClick={() => setDeleteId(item.id)} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50/60 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {modal && (
          <Modal title={modal === "add" ? "Add Question" : "Edit Question"} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <Field label="Question"><input className={inputCls} value={form.question} onChange={(e) => f("question", e.target.value)} placeholder="What do customers ask?" /></Field>
              <Field label="Answer"><textarea className={inputCls + " min-h-[100px] resize-none"} value={form.answer} onChange={(e) => f("answer", e.target.value)} placeholder="Your answer…" /></Field>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="sr-only" />
                <div className={`w-9 h-5 rounded-full transition-colors relative ${form.active ? "bg-emerald-500" : "bg-black/10"}`}><div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" style={{ transform: form.active ? "translateX(1rem)" : "translateX(0.125rem)" }} /></div>
                <span className="text-muted-foreground text-xs">Visible on FAQ page</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10 rounded-xl">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold rounded-xl disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete FAQ" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">Remove this question permanently?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10 rounded-xl">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl">Delete</button>
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
    } catch { setReviews([]); }
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setForm({ author_name: "", rating: 5, body: "", show_on_homepage: true, active: true }); setModal("add"); };
  const openEdit = (r: Review) => { setEditing(r); setForm({ author_name: r.author_name, rating: r.rating, body: r.body, show_on_homepage: r.show_on_homepage, active: r.active }); setModal("edit"); };
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
    try { await callAdmin("reviews", "PUT", { id: r.id, active: !r.active }); await load(); } catch (e) { alert("Update failed: " + e); }
  };
  const f = (k: string, v: string | number | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div>
      <SectionHeader title="Homepage Reviews" subtitle={`${reviews.length} testimonials`}
        actions={<>
          <button onClick={load} className={btnSecondary}><RefreshCw size={14} /></button>
          <button onClick={openAdd} className={btnPrimary}><Plus size={14} /> <span className="hidden sm:inline">Add Review</span><span className="sm:hidden">Add</span></button>
        </>}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No reviews yet" description="Add customer testimonials to display on your homepage." actionLabel="Add Review" onAction={openAdd} />
      ) : (
        <div className="space-y-1.5">
          {reviews.map((r) => (
            <div key={r.id} className={`p-3 sm:p-4 rounded-xl border flex gap-3 sm:gap-4 transition-all ${r.active ? "border-black/[0.06] hover:border-black/10 hover:shadow-sm" : "border-black/[0.04] opacity-50"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-foreground text-sm font-medium">{r.author_name}</p>
                  <StarRating rating={r.rating} />
                  {!r.active && <span className="text-[9px] bg-black/5 text-muted-foreground px-1.5 py-0.5 rounded-md font-medium">HIDDEN</span>}
                </div>
                <p className="text-muted-foreground text-xs line-clamp-2">{r.body}</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => toggleActive(r)} title={r.active ? "Hide" : "Show"}
                  className={`p-2 rounded-lg text-xs font-medium transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${r.active ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"}`}>
                  {r.active ? "On" : "Off"}
                </button>
                <button onClick={() => openEdit(r)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-black/[0.04] transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Pencil size={13} /></button>
                <button onClick={() => setDeleteId(r.id)} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50/60 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {modal && (
          <Modal title={modal === "add" ? "Add Review" : "Edit Review"} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Customer Name"><input className={inputCls} value={form.author_name} onChange={(e) => f("author_name", e.target.value)} placeholder="John D." /></Field>
                <Field label="Rating"><div className="flex items-center h-[42px]"><StarRating rating={form.rating} onChange={(r) => f("rating", r)} /></div></Field>
              </div>
              <Field label="Review Text"><textarea className={inputCls + " min-h-[80px] resize-none"} value={form.body} onChange={(e) => f("body", e.target.value)} placeholder="What did they say?" /></Field>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="sr-only" />
                <div className={`w-9 h-5 rounded-full transition-colors relative ${form.active ? "bg-emerald-500" : "bg-black/10"}`}><div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" style={{ transform: form.active ? "translateX(1rem)" : "translateX(0.125rem)" }} /></div>
                <span className="text-muted-foreground text-xs">Visible on homepage</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10 rounded-xl">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold rounded-xl disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete Review" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">Remove this review permanently?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10 rounded-xl">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Referrals Section ────────────────────────────────────────────
interface ReferralCode {
  id: string; code: string; creator_name: string | null; creator_email: string | null;
  total_signups: number; created_at: string;
  referral_signups: { id: string; referred_name: string | null; referred_email: string; created_at: string }[];
}

const ReferralsSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [data, setData] = useState<{ codes: ReferralCode[]; stats: { totalCodes: number; totalSignups: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await callAdmin("referrals", "GET") as any); } catch { setData({ codes: [], stats: { totalCodes: 0, totalSignups: 0 } }); }
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <SectionHeader title="Referrals" subtitle="Track referral codes and signups"
        actions={<button onClick={load} className={btnSecondary}><RefreshCw size={14} /></button>}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {[
              { label: "Total Codes", value: data.stats.totalCodes },
              { label: "Total Signups", value: data.stats.totalSignups },
              { label: "Conversion", value: data.stats.totalCodes > 0 ? ((data.stats.totalSignups / data.stats.totalCodes) * 100).toFixed(1) + "%" : "0%" },
            ].map(({ label, value }) => (
              <div key={label} className="border border-black/[0.06] rounded-2xl p-5">
                <p className="text-foreground text-2xl font-light">{value}</p>
                <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {data.codes.length === 0 ? (
            <EmptyState icon={Users} title="No referral codes" description="Referral codes will appear here when customers create them." />
          ) : (
            <div className="space-y-1.5">
              {data.codes.map((rc) => (
                <div key={rc.id}>
                  <button onClick={() => setExpanded(expanded === rc.id ? null : rc.id)}
                    className="w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-black/[0.06] hover:border-black/10 hover:shadow-sm transition-all text-left">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-foreground tracking-wider">{rc.code}</span>
                        {rc.total_signups > 0 && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-medium">{rc.total_signups} signup{rc.total_signups !== 1 ? "s" : ""}</span>}
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5 truncate">Created {new Date(rc.created_at).toLocaleDateString()}{rc.creator_email && ` · ${rc.creator_email}`}</p>
                    </div>
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform flex-shrink-0 ${expanded === rc.id ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expanded === rc.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        {rc.referral_signups.length > 0 ? (
                          <div className="ml-6 border-l border-black/10 pl-4 py-2 space-y-2">
                            {rc.referral_signups.map((s) => (
                              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-xs">
                                <span className="text-foreground font-medium truncate">{s.referred_email}</span>
                                {s.referred_name && <span className="text-muted-foreground">({s.referred_name})</span>}
                                <span className="text-muted-foreground sm:ml-auto">{new Date(s.created_at).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs py-3 pl-10">No signups yet.</p>
                        )}
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
      <SectionHeader title="Analytics" subtitle="Store overview & Stripe insights" actions={<></>} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        {[
          { label: "Products", value: stats.productCount },
          { label: "Reviews", value: stats.reviewCount },
          { label: "FAQ Items", value: stats.faqCount },
        ].map(({ label, value }) => (
          <div key={label} className="border border-black/[0.06] rounded-2xl p-5">
            <p className="text-foreground text-2xl font-light">{value}</p>
            <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
      <div className="border border-black/[0.06] rounded-2xl p-5 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stripe</p>
        <h3 className="text-foreground font-semibold mb-1">Payment Dashboard</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">View revenue, transactions, and customer data directly in Stripe.</p>
        <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs border border-foreground text-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-foreground hover:text-background transition-all">
          Open Stripe Dashboard <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────
const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const { callAdmin } = useAdmin();
  const [section, setSection] = useState("products");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavClick = (id: string) => { setSection(id); setMobileNavOpen(false); };

  return (
    <div className="admin-light-theme min-h-screen bg-[#fafafa] flex flex-col md:flex-row" style={{ '--foreground': '0 0% 9%', '--muted-foreground': '0 0% 45%', '--background': '0 0% 98%', '--border': '0 0% 90%', '--muted': '0 0% 96%', '--primary': '0 0% 9%', '--primary-foreground': '0 0% 100%' } as React.CSSProperties}>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-black/[0.06] bg-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="p-2 text-foreground rounded-lg hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"><Menu size={20} /></button>
          <img src={logoImg} alt="Logo" className="h-8" />
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-all min-h-[44px]">
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/20 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNavOpen(false)} />
            <motion.div className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl md:hidden flex flex-col"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
                <img src={logoImg} alt="Logo" className="h-16" />
                <button onClick={() => setMobileNavOpen(false)} className="p-2 text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={18} /></button>
              </div>
              <nav className="flex-1 p-3">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => handleNavClick(id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm mb-1 transition-all min-h-[48px] ${section === id ? "bg-black/[0.06] text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03]"}`}>
                    <Icon size={16} /> {label}
                    {section === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground/30" />}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 border-r border-black/[0.06] flex-col bg-white">
        <div className="p-6 border-b border-black/[0.06] flex flex-col items-start">
          <img src={logoImg} alt="Logo" className="h-48 mb-2" />
          <p className="text-black/25 text-[10px] uppercase tracking-[0.2em] font-medium">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-all ${section === id ? "bg-black/[0.06] text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03]"}`}>
              <Icon size={15} /> {label}
              {section === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground/30" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-black/[0.06]">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-all">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
