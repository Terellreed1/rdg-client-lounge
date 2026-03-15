import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, HelpCircle, Star, BarChart3, LogOut,
  Plus, Pencil, Trash2, X, ChevronDown, RefreshCw,
  ExternalLink, Image as ImageIcon, Users, Menu,
  ShoppingBag, MessageSquare, FileQuestion, GripVertical,
  Upload, Check, Loader2, MapPin, Truck, Send,
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
interface Brand {
  id: string; name: string; logo_url: string | null; sort_order: number; active: boolean; created_at: string;
}

const STRAIN_OPTIONS = ["None", "Indica", "Sativa", "Hybrid"];
const TYPE_OPTIONS = ["Flower", "Vapes", "Edibles", "Concentrates", "Pre-Rolls", "Accessories", "Other"];
const DEFAULT_BRAND_OPTIONS = ["Luxury Courier Club", "The Candy Shop", "Pain Network", "Grumpus", "Cupz Strainz", "Julato NYC", "High Mart", "Highflix", "High Monkey", "Mameys", "ESPN", "MB", "Fumi", "Frutaz LA", "Don Merfos", "Kandy Depo", "Always Faded", "FS", "Super Candy Bros", "Backpack Boyz", "Kush Factory", "Friday", "High Tolerance", "Cali Clouds Club"];

const navItems = [
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Package },
  { id: "brands", label: "Brands", icon: ImageIcon },
  { id: "state_laws", label: "State Laws", icon: MapPin },
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
    <div className="w-16 h-16 bg-black/[0.03] border border-black/[0.06] flex items-center justify-center mb-5">
      <Icon size={24} className="text-black/20" />
    </div>
    <h3 className="text-foreground text-base font-medium mb-1">{title}</h3>
    <p className="text-muted-foreground text-sm text-center max-w-xs mb-6">{description}</p>
    {actionLabel && onAction && (
      <button onClick={onAction} className="flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-5 py-2.5 hover:opacity-80 transition-opacity">
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
    <motion.div className="bg-white border border-black/10 w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
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
  const [bulkSaving, setBulkSaving] = useState(false);

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
    setModal("bulk");
  };

  const extractImageUrl = (input: string): string | null => {
    const trimmed = input.trim();
    // Direct image URL
    if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(trimmed)) return trimmed;
    // imgbb viewer page → extract direct image from the URL pattern
    const ibbMatch = trimmed.match(/https?:\/\/ibb\.co\/([A-Za-z0-9]+)/);
    if (ibbMatch) return `https://i.ibb.co/${ibbMatch[1]}/image.jpg`;
    // HTML img tag → extract src
    const imgSrcMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgSrcMatch) return imgSrcMatch[1];
    // HTML anchor with image URL
    const hrefMatch = trimmed.match(/href=["']([^"']+\.(jpg|jpeg|png|gif|webp))["']/i);
    if (hrefMatch) return hrefMatch[1];
    // BBCode [img] tag
    const bbcodeMatch = trimmed.match(/\[img\](.*?)\[\/img\]/i);
    if (bbcodeMatch) return bbcodeMatch[1];
    // Fallback: if it starts with http, use as-is
    if (trimmed.startsWith("http")) return trimmed;
    return null;
  };

  const parseBulkUrls = () => {
    const lines = bulkUrls.split(/[\n]+/).map(l => l.trim()).filter(Boolean);
    const urls: string[] = [];
    for (const line of lines) {
      const extracted = extractImageUrl(line);
      if (extracted) urls.push(extracted);
    }
    if (urls.length === 0) return;
    setBulkItems(urls.map(url => ({ image_url: url, name: "New Product", brand: "Luxury Courier Club", product_type: "Flower", description: "", price: "$65", selected: true })));
    setBulkStep("review");
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
                  {form.image_url && <img src={form.image_url} alt="Preview" className="w-16 h-16 object-cover border border-black/10 mt-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
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
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10 hover:border-black/20 transition-colors">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold hover:opacity-80 disabled:opacity-40 transition-all">{saving ? "Saving…" : "Save Product"}</button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete Product" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">This will permanently remove the product. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </Modal>
        )}
        {modal === "bulk" && (
          <Modal title={bulkStep === "paste" ? "Bulk Import Products" : `Review ${bulkItems.filter(i => i.selected).length} Products`} onClose={() => setModal(null)}>
            {bulkStep === "paste" ? (
              <div className="space-y-4">
                <p className="text-black/50 text-xs mb-3">Paste image URLs, imgbb links, or HTML embed codes below — one per line. Direct URLs, viewer pages, and HTML img tags all work.</p>
                <textarea
                  className={inputCls + " min-h-[200px] font-mono text-xs resize-none"}
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  placeholder={"https://i.ibb.co/abc123/photo.jpg\nhttps://ibb.co/abc123\n<img src=\"https://i.ibb.co/abc123/photo.jpg\">\n..."}
                />
                <p className="text-black/30 text-[10px]">{bulkUrls.split(/[\n,]+/).filter(u => u.trim().startsWith("http")).length} URLs detected</p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm text-black/40 border border-black/10">Cancel</button>
                  <button onClick={parseBulkUrls} disabled={!bulkUrls.trim()} className="flex-1 py-2.5 text-sm bg-black text-white font-semibold disabled:opacity-30">Continue</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setBulkStep("paste")} className="text-xs text-black/40 border border-black/10 px-3 py-2.5 hover:border-black/20">← Back</button>
                </div>
                
                <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
                  {bulkItems.map((item, idx) => (
                    <div key={idx} className={`border p-3 transition-all ${item.selected ? "border-black/10" : "border-black/5 opacity-40"}`}>
                      <div className="flex gap-3">
                        <label className="flex-shrink-0 pt-1">
                          <input type="checkbox" checked={item.selected} onChange={(e) => updateBulkItem(idx, "selected", e.target.checked)} className="accent-black" />
                        </label>
                        <div className="w-14 h-14 bg-black/[0.03] border border-black/[0.06] overflow-hidden flex-shrink-0">
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <input className="w-full bg-transparent border-b border-black/10 text-black text-sm font-medium pb-1 focus:outline-none focus:border-black/30" 
                            value={item.name} onChange={(e) => updateBulkItem(idx, "name", e.target.value)} placeholder="Product name" />
                          <div className="flex gap-2">
                            <select className="bg-transparent border border-black/10 text-black/60 text-[11px] px-2 py-1 flex-1" 
                              value={item.brand} onChange={(e) => updateBulkItem(idx, "brand", e.target.value)}>
                              {DEFAULT_BRAND_OPTIONS.map(b => <option key={b}>{b}</option>)}
                            </select>
                            <select className="bg-transparent border border-black/10 text-black/60 text-[11px] px-2 py-1 w-24"
                              value={item.product_type} onChange={(e) => updateBulkItem(idx, "product_type", e.target.value)}>
                              {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <input className="bg-transparent border border-black/10 text-black/60 text-[11px] px-2 py-1 w-16"
                              value={item.price} onChange={(e) => updateBulkItem(idx, "price", e.target.value)} placeholder="$65" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-2 sticky bottom-0 bg-white">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm text-black/40 border border-black/10">Cancel</button>
                  <button onClick={saveBulkProducts} disabled={bulkSaving || bulkItems.filter(i => i.selected).length === 0}
                    className="flex-1 py-2.5 text-sm bg-black text-white font-semibold disabled:opacity-30 flex items-center justify-center gap-2">
                    {bulkSaving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> Import {bulkItems.filter(i => i.selected).length} Products</>}
                  </button>
                </div>
              </div>
            )}
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
            <div key={item.id} className={`p-3 sm:p-4 border flex gap-3 sm:gap-4 transition-all ${item.active ? "border-black/[0.06] hover:border-black/10 hover:shadow-sm" : "border-black/[0.04] opacity-40"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium">{item.question}</p>
                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{item.answer}</p>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Pencil size={13} /></button>
                <button onClick={() => setDeleteId(item.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50/60 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Trash2 size={13} /></button>
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
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete FAQ" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">Remove this question permanently?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold">Delete</button>
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
            <div key={r.id} className={`p-3 sm:p-4 border flex gap-3 sm:gap-4 transition-all ${r.active ? "border-black/[0.06] hover:border-black/10 hover:shadow-sm" : "border-black/[0.04] opacity-50"}`}>
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
                  className={`p-2 text-xs font-medium transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${r.active ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"}`}>
                  {r.active ? "On" : "Off"}
                </button>
                <button onClick={() => openEdit(r)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Pencil size={13} /></button>
                <button onClick={() => setDeleteId(r.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50/60 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"><Trash2 size={13} /></button>
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
                <button onClick={() => setModal(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 sm:py-2.5 text-sm bg-foreground text-background font-semibold disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete Review" onClose={() => setDeleteId(null)}>
            <p className="text-muted-foreground text-sm mb-6">Remove this review permanently?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 sm:py-2.5 text-sm text-muted-foreground border border-black/10">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-3 sm:py-2.5 text-sm bg-red-500 text-white font-semibold">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Brands Section ───────────────────────────────────────────────
const BrandsSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", logo_url: "", active: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBrands((await callAdmin("brands", "GET")) as Brand[]); } catch { setBrands([]); }
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: "", logo_url: "", active: true }); setModal("add"); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, logo_url: b.logo_url || "", active: b.active }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, logo_url: form.logo_url || null };
      if (modal === "add") await callAdmin("brands", "POST", payload);
      else await callAdmin("brands", "PUT", { id: editing!.id, ...payload });
      await load(); setModal(null);
    } catch (e) { alert("Save failed: " + e); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    try { await callAdmin("brands", "DELETE", { id }); await load(); } catch (e) { alert("Delete failed: " + e); }
    setDeleteId(null);
  };

  return (
    <div>
      <SectionHeader title="Brands" subtitle={`${brands.length} brands`}
        actions={<>
          <button onClick={load} className={btnSecondary}><RefreshCw size={14} /></button>
          <button onClick={openAdd} className={btnPrimary}><Plus size={14} /> <span className="hidden sm:inline">Add Brand</span><span className="sm:hidden">Add</span></button>
        </>}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" /></div>
      ) : brands.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No brands yet" description="Add your first brand to display on the website." actionLabel="Add Brand" onAction={openAdd} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {brands.map((b) => (
            <div key={b.id} className={`border p-4 transition-all group relative ${b.active ? "border-black/[0.06] hover:border-black/10 hover:shadow-sm" : "border-black/[0.04] opacity-40"}`}>
              <div className="h-24 flex items-center justify-center mb-3">
                {b.logo_url ? <img src={b.logo_url} alt={b.name} className="max-h-full max-w-full object-contain" /> : <ImageIcon size={32} className="text-black/10" />}
              </div>
              <p className="text-black text-xs font-medium text-center truncate">{b.name}</p>
              {!b.active && <span className="absolute top-2 right-2 text-[8px] bg-black/5 text-black/40 px-1.5 py-0.5 font-medium">HIDDEN</span>}
              <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(b)} className="p-1.5 bg-white border border-black/10 text-black/40 hover:text-black"><Pencil size={11} /></button>
                <button onClick={() => setDeleteId(b.id)} className="p-1.5 bg-white border border-black/10 text-black/40 hover:text-red-500"><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <Modal title={modal === "add" ? "Add Brand" : "Edit Brand"} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <Field label="Brand Name"><input className={inputCls} value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Brand name" /></Field>
              <Field label="Logo URL" hint="Upload to imgbb.com → copy Direct Link → paste here">
                <div className="space-y-2">
                  <input className={inputCls} value={form.logo_url} onChange={(e) => setForm(prev => ({ ...prev, logo_url: e.target.value }))} placeholder="https://i.ibb.co/..." />
                  <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-black/30 hover:text-black/60 transition-colors"><ExternalLink size={10} /> Open imgbb.com</a>
                  {form.logo_url && <img src={form.logo_url} alt="Preview" className="h-16 object-contain border border-black/10 p-2 mt-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                </div>
              </Field>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))} className="sr-only" />
                <div className={`w-9 h-5 rounded-full transition-colors relative ${form.active ? "bg-emerald-500" : "bg-black/10"}`}><div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" style={{ transform: form.active ? "translateX(1rem)" : "translateX(0.125rem)" }} /></div>
                <span className="text-black/40 text-xs">Visible on website</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm text-black/40 border border-black/10">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-2.5 text-sm bg-black text-white font-semibold disabled:opacity-40">{saving ? "Saving…" : "Save Brand"}</button>
              </div>
            </div>
          </Modal>
        )}
        {deleteId && (
          <Modal title="Delete Brand" onClose={() => setDeleteId(null)}>
            <p className="text-black/40 text-sm mb-6">This will permanently remove the brand. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm text-black/40 border border-black/10">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 py-2.5 text-sm bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Delete</button>
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
              <div key={label} className="border border-black/[0.06] p-5">
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
                    className="w-full flex items-center gap-3 p-3 sm:p-4 border border-black/[0.06] hover:border-black/10 hover:shadow-sm transition-all text-left">
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

// ─── State Laws Section ───────────────────────────────────────────
const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" }, { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "Washington D.C." },
];

const LEGAL_STATUS_OPTIONS = ["legal", "medical_only", "decriminalized", "illegal"];
const LEGAL_STATUS_LABELS: Record<string, string> = { legal: "Fully Legal", medical_only: "Medical Only", decriminalized: "Decriminalized", illegal: "Illegal" };
const LEGAL_STATUS_COLORS: Record<string, string> = { legal: "bg-emerald-100 text-emerald-700", medical_only: "bg-amber-100 text-amber-700", decriminalized: "bg-blue-100 text-blue-700", illegal: "bg-red-100 text-red-700" };

interface StateLaw {
  id: string; state_name: string; state_code: string; can_ship: boolean; can_deliver: boolean;
  legal_status: string; notes: string; active: boolean; sort_order: number;
}

const StateLawsSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [states, setStates] = useState<StateLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "seed" | null>(null);
  const [editing, setEditing] = useState<StateLaw | null>(null);
  const [form, setForm] = useState({ state_name: "", state_code: "", can_ship: false, can_deliver: false, legal_status: "illegal", notes: "", active: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "ship" | "deliver">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try { setStates((await callAdmin("state_laws", "GET")) as StateLaw[]); } catch { setStates([]); }
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    const existingCodes = new Set(states.map(s => s.state_code));
    const nextState = US_STATES.find(s => !existingCodes.has(s.code));
    setForm({ state_name: nextState?.name || "", state_code: nextState?.code || "", can_ship: false, can_deliver: false, legal_status: "illegal", notes: "", active: true });
    setModal("add");
  };

  const openEdit = (s: StateLaw) => {
    setEditing(s);
    setForm({ state_name: s.state_name, state_code: s.state_code, can_ship: s.can_ship, can_deliver: s.can_deliver, legal_status: s.legal_status, notes: s.notes || "", active: s.active });
    setModal("edit");
  };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") await callAdmin("state_laws", "POST", form);
      else await callAdmin("state_laws", "PUT", { id: editing!.id, ...form });
      await load(); setModal(null);
    } catch (e) { alert("Save failed: " + e); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    try { await callAdmin("state_laws", "DELETE", { id }); await load(); } catch (e) { alert("Delete failed: " + e); }
    setDeleteId(null);
  };

  const seedAllStates = async () => {
    setSaving(true);
    try {
      const existingCodes = new Set(states.map(s => s.state_code));
      const newStates = US_STATES.filter(s => !existingCodes.has(s.code)).map((s, i) => ({
        state_name: s.name, state_code: s.code, can_ship: false, can_deliver: false,
        legal_status: "illegal", notes: "", active: true, sort_order: i,
      }));
      if (newStates.length > 0) {
        await supabase.functions.invoke("admin-data?resource=state_laws&action=bulk_create", {
          method: "POST",
          body: { states: newStates },
          headers: { Authorization: `Bearer ${localStorage.getItem("lc_admin_token")}` },
        });
        await load();
      }
      setModal(null);
    } catch (e) { alert("Seed failed: " + e); }
    setSaving(false);
  };

  const toggleField = async (state: StateLaw, field: "can_ship" | "can_deliver") => {
    try {
      await callAdmin("state_laws", "PUT", { id: state.id, [field]: !state[field] });
      await load();
    } catch (e) { alert("Update failed: " + e); }
  };

  const filtered = states.filter(s => {
    if (filter === "ship") return s.can_ship;
    if (filter === "deliver") return s.can_deliver;
    return true;
  });

  const shipCount = states.filter(s => s.can_ship).length;
  const deliverCount = states.filter(s => s.can_deliver).length;

  return (
    <div>
      <SectionHeader title="State Cannabis Laws" subtitle="Manage shipping & delivery eligibility by state"
        actions={
          <>
            {states.length < 51 && (
              <button onClick={() => setModal("seed")} className={btnSecondary + " text-xs px-3"}>
                <Plus size={14} /> Seed All States
              </button>
            )}
            <button onClick={openAdd} className={btnPrimary}>
              <Plus size={14} /> Add State
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total States", value: states.length, color: "text-foreground" },
          { label: "Can Ship", value: shipCount, color: "text-emerald-600" },
          { label: "Can Deliver", value: deliverCount, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-black/[0.06] p-4">
            <p className={`text-2xl font-light ${color}`}>{value}</p>
            <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([["all", "All States"], ["ship", "Can Ship"], ["deliver", "Can Deliver"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-xs font-medium transition-all ${filter === key ? "bg-black text-white" : "bg-black/[0.04] text-muted-foreground hover:bg-black/[0.08]"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={MapPin} title="No states configured" description="Add states to manage cannabis shipping and delivery laws." actionLabel="Add State" onAction={openAdd} />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((state) => (
            <div key={state.id} className="flex items-center gap-3 p-3 border border-black/[0.06] bg-white group">
              <div className="w-10 h-10 bg-black/[0.03] border border-black/[0.06] flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                {state.state_code}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium">{state.state_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${LEGAL_STATUS_COLORS[state.legal_status] || "bg-black/5 text-black/40"}`}>
                    {LEGAL_STATUS_LABELS[state.legal_status] || state.legal_status}
                  </span>
                  {state.notes && <span className="text-muted-foreground text-[10px] truncate max-w-[150px]">{state.notes}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleField(state, "can_ship")}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all ${state.can_ship ? "bg-emerald-100 text-emerald-700" : "bg-black/[0.04] text-black/30"}`}
                  title={state.can_ship ? "Can ship – click to disable" : "Cannot ship – click to enable"}>
                  <Send size={10} /> Ship
                </button>
                <button onClick={() => toggleField(state, "can_deliver")}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all ${state.can_deliver ? "bg-blue-100 text-blue-700" : "bg-black/[0.04] text-black/30"}`}
                  title={state.can_deliver ? "Can deliver – click to disable" : "Cannot deliver – click to enable"}>
                  <Truck size={10} /> Deliver
                </button>
                <button onClick={() => openEdit(state)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-foreground transition-all"><Pencil size={12} /></button>
                <button onClick={() => setDeleteId(state.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <Modal title="Delete State" onClose={() => setDeleteId(null)}>
            <p className="text-sm text-muted-foreground mb-4">Remove this state from the list?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-black/10 hover:bg-black/5 transition-all">Cancel</button>
              <button onClick={() => remove(deleteId)} className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 transition-all">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Seed Confirm */}
      <AnimatePresence>
        {modal === "seed" && (
          <Modal title="Seed All States" onClose={() => setModal(null)}>
            <p className="text-sm text-muted-foreground mb-4">
              This will add all {51 - states.length} missing U.S. states to the list with default settings (illegal, no shipping/delivery). You can then configure each one.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-black/10 hover:bg-black/5 transition-all">Cancel</button>
              <button onClick={seedAllStates} disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add All States
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(modal === "add" || modal === "edit") && (
          <Modal title={modal === "add" ? "Add State" : "Edit State"} onClose={() => setModal(null)}>
            <div className="space-y-4">
              {modal === "add" && (
                <Field label="State">
                  <select className={selectCls + " rounded-xl"} value={form.state_code}
                    onChange={(e) => {
                      const st = US_STATES.find(s => s.code === e.target.value);
                      if (st) setForm(f => ({ ...f, state_code: st.code, state_name: st.name }));
                    }}>
                    <option value="">Select state…</option>
                    {US_STATES.filter(s => !states.some(ex => ex.state_code === s.code) || s.code === form.state_code).map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </Field>
              )}
              {modal === "edit" && (
                <Field label="State">
                  <input className={inputCls + " rounded-xl bg-black/[0.02]"} value={`${form.state_name} (${form.state_code})`} disabled />
                </Field>
              )}
              <Field label="Legal Status">
                <select className={selectCls + " rounded-xl"} value={form.legal_status} onChange={e => setForm(f => ({ ...f, legal_status: e.target.value }))}>
                  {LEGAL_STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{LEGAL_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Can Ship">
                  <button type="button" onClick={() => setForm(f => ({ ...f, can_ship: !f.can_ship }))}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.can_ship ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-black/10 text-black/40"}`}>
                    <Send size={14} /> {form.can_ship ? "Yes" : "No"}
                  </button>
                </Field>
                <Field label="Can Deliver">
                  <button type="button" onClick={() => setForm(f => ({ ...f, can_deliver: !f.can_deliver }))}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.can_deliver ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-black/10 text-black/40"}`}>
                    <Truck size={14} /> {form.can_deliver ? "Yes" : "No"}
                  </button>
                </Field>
              </div>
              <Field label="Notes" hint="Optional – internal notes about this state's regulations">
                <textarea className={inputCls + " rounded-xl h-20 resize-none"} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Recreational legal since 2018, license required..." />
              </Field>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm border border-black/10 rounded-xl hover:bg-black/5 transition-all">Cancel</button>
                <button onClick={save} disabled={saving || !form.state_code} className={btnPrimary + " rounded-xl disabled:opacity-40"}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {modal === "add" ? "Add" : "Save"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Orders Section ───────────────────────────────────────────────
interface Order {
  id: string; stripe_session_id: string; customer_name: string; customer_email: string;
  customer_phone: string; delivery_method: string; delivery_address: string;
  delivery_city: string; delivery_state: string; delivery_zip: string;
  pickup_location: string | null; time_slot: string; delivery_fee: number;
  subtotal: number; total: number; items: { name: string; price: number; quantity: number }[];
  status: string; notes: string; created_at: string;
}

const PICKUP_LABELS: Record<string, string> = {
  dc: "DC — 5300 Connecticut Ave NW",
  pg: "PG — 14718 Baltimore Ave, Laurel, MD",
  va: "VA — 6500 Springfield Mall, Springfield, VA",
  baltimore: "Baltimore — 3559 Boston St, Baltimore, MD",
};

const METHOD_COLORS: Record<string, string> = {
  delivery: "bg-blue-50 text-blue-700 border-blue-200",
  pickup: "bg-amber-50 text-amber-700 border-amber-200",
  postal: "bg-purple-50 text-purple-700 border-purple-200",
};

const OrdersSection = ({ callAdmin }: { callAdmin: (r: string, m: "GET" | "POST" | "PUT" | "DELETE", b?: object) => Promise<unknown> }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState<"all" | "delivery" | "pickup" | "postal">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders((await callAdmin("orders", "GET")) as Order[]); } catch { setOrders([]); }
    setLoading(false);
  }, [callAdmin]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? orders : orders.filter(o => o.delivery_method === filter);

  const updateStatus = async (id: string, status: string) => {
    await callAdmin("orders&action=update", "POST", { id, status });
    load();
  };

  return (
    <div>
      <SectionHeader title="Orders" subtitle="Paid orders from customers" actions={
        <button onClick={load} className={btnSecondary + " rounded-xl"}><RefreshCw size={14} /></button>
      } />

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "delivery", "pickup", "postal"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all capitalize ${filter === f ? "bg-black text-white border-black" : "border-black/10 text-black/50 hover:border-black/30"}`}>
            {f} {f !== "all" && `(${orders.filter(o => o.delivery_method === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={20} className="animate-spin text-black/20" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Paid orders will appear here automatically." />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} onClick={() => setSelected(order)}
              className="border border-black/[0.06] rounded-xl p-4 hover:border-black/15 transition-all cursor-pointer bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${METHOD_COLORS[order.delivery_method] || "bg-gray-50 text-gray-700"}`}>
                    {order.delivery_method}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${order.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : order.status === "fulfilled" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {order.status}
                  </span>
                </div>
                <span className="text-xs text-black/40">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">{order.customer_name}</p>
                  <p className="text-xs text-black/40">{order.customer_email} · {order.customer_phone}</p>
                </div>
                <p className="text-lg font-light text-black">${order.total.toFixed(2)}</p>
              </div>
              {order.delivery_method === "pickup" && order.pickup_location && (
                <p className="text-[10px] text-black/40 mt-1">📍 {PICKUP_LABELS[order.pickup_location] || order.pickup_location}</p>
              )}
              {order.time_slot && <p className="text-[10px] text-black/40 mt-0.5">🕐 {order.time_slot}</p>}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <Modal title="Order Details" onClose={() => setSelected(null)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${METHOD_COLORS[selected.delivery_method] || ""}`}>
                  {selected.delivery_method}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${selected.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600"}`}>
                  {selected.status}
                </span>
              </div>

              <div className="border border-black/[0.06] rounded-xl p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-black/30 mb-2">Customer</p>
                <p className="text-sm font-medium">{selected.customer_name}</p>
                <p className="text-xs text-black/50">{selected.customer_email}</p>
                <p className="text-xs text-black/50">{selected.customer_phone}</p>
              </div>

              {(selected.delivery_method === "delivery" || selected.delivery_method === "postal") && (
                <div className="border border-black/[0.06] rounded-xl p-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-black/30 mb-2">
                    {selected.delivery_method === "delivery" ? "Delivery Address" : "Shipping Address"}
                  </p>
                  <p className="text-sm">{selected.delivery_address}</p>
                  <p className="text-sm">{selected.delivery_city}, {selected.delivery_state} {selected.delivery_zip}</p>
                </div>
              )}

              {selected.delivery_method === "pickup" && (
                <div className="border border-black/[0.06] rounded-xl p-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-black/30 mb-2">Pickup Location</p>
                  <p className="text-sm">{PICKUP_LABELS[selected.pickup_location || ""] || selected.pickup_location}</p>
                </div>
              )}

              {selected.time_slot && (
                <div className="border border-black/[0.06] rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-black/30 mb-2">Time Slot</p>
                  <p className="text-sm">{selected.time_slot}</p>
                </div>
              )}

              <div className="border border-black/[0.06] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-black/30 mb-2">Items</p>
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-black/[0.04] last:border-0">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs text-black/40 pt-2">
                  <span>Subtotal</span><span>${selected.subtotal.toFixed(2)}</span>
                </div>
                {selected.delivery_fee > 0 && (
                  <div className="flex justify-between text-xs text-black/40">
                    <span>{selected.delivery_method === "postal" ? "Shipping" : "Delivery Fee"}</span>
                    <span>${selected.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-black/[0.06]">
                  <span>Total</span><span>${selected.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {selected.status === "paid" && (
                  <button onClick={() => { updateStatus(selected.id, "fulfilled"); setSelected(null); }}
                    className={btnPrimary + " rounded-xl flex-1 justify-center"}>
                    <Check size={14} /> Mark Fulfilled
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="px-4 py-2.5 text-sm border border-black/10 rounded-xl hover:bg-black/5 transition-all flex-1 text-center">
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
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
  const [section, setSection] = useState("orders");
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
              {section === "orders" && <OrdersSection callAdmin={callAdmin} />}
              {section === "products" && <ProductsSection callAdmin={callAdmin} />}
              {section === "brands" && <BrandsSection callAdmin={callAdmin} />}
              {section === "state_laws" && <StateLawsSection callAdmin={callAdmin} />}
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
