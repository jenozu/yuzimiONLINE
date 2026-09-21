import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ImagePlus,
  LogOut,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type ProductStatus = "draft" | "published";

const PRINT_SIZES = [
  "5 × 7 in",
  "8 × 10 in",
  "11 × 14 in",
  "12 × 18 in",
  "16 × 20 in",
  "18 × 24 in",
  "20 × 30 in",
  "24 × 36 in",
] as const;

type VariantDraft = { size: string; price: string };
type ProductVariant = { size: string; price_cents: number; price: number; position: number };

type ProductImage = {
  id?: string;
  url: string;
  object_key: string;
  alt?: string;
  position?: number;
};

type AdminProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  category: string;
  badge?: string;
  status: ProductStatus;
  images: ProductImage[];
  variants?: ProductVariant[];
};

type ProductDraft = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  variants: VariantDraft[];
  category: string;
  badge: string;
  status: ProductStatus;
  images: ProductImage[];
};

const emptyDraft = (): ProductDraft => ({
  title: "",
  slug: "",
  description: "",
  variants: PRINT_SIZES.map((size) => ({ size, price: "" })),
  category: "Prints",
  badge: "",
  status: "draft",
  images: [],
});

const api = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { credentials: "include", ...options });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status}).`);
  return body as T;
};

const productToDraft = (product: AdminProduct): ProductDraft => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  description: product.description,
  variants: PRINT_SIZES.map((size) => {
    const variant = product.variants?.find((item) => item.size === size);
    const priceCents = variant?.price_cents ?? product.price_cents;
    return { size, price: (priceCents / 100).toFixed(2) };
  }),
  category: product.category,
  badge: product.badge || "",
  status: product.status,
  images: product.images || [],
});

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function Admin() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError("");
    try {
      const result = await api<{ products: AdminProduct[] }>("/api/admin/products");
      setProducts(result.products);
    } catch (caught) {
      const nextError = caught instanceof Error ? caught.message : "Could not load products.";
      if (nextError.toLowerCase().includes("authentication")) setAuthenticated(false);
      setError(nextError);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api<{ authenticated: boolean }>("/api/admin/session")
      .then((result) => {
        if (!active) return;
        setAuthenticated(result.authenticated);
        if (result.authenticated) void loadProducts();
      })
      .catch(() => active && setAuthenticated(false))
      .finally(() => active && setCheckingSession(false));
    return () => { active = false; };
  }, [loadProducts]);

  const counts = useMemo(() => ({
    total: products.length,
    published: products.filter((product) => product.status === "published").length,
    drafts: products.filter((product) => product.status === "draft").length,
  }), [products]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setPassword("");
      setAuthenticated(true);
      await loadProducts();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    }
  };

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setProducts([]);
    setDraft(null);
    setAuthenticated(false);
    setMessage("");
    setError("");
  };

  const startNewProduct = () => {
    setDraft(emptyDraft());
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editProduct = (product: AdminProduct) => {
    setDraft(productToDraft(product));
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateDraft = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const updateVariantPrice = (size: string, price: string) => {
    setDraft((current) => current ? {
      ...current,
      variants: current.variants.map((variant) => variant.size === size ? { ...variant, price } : variant),
    } : current);
  };

  const titleChanged = (value: string) => {
    setDraft((current) => {
      if (!current) return current;
      const shouldUpdateSlug = !current.slug || current.slug === slugify(current.title);
      return { ...current, title: value, slug: shouldUpdateSlug ? slugify(value) : current.slug };
    });
  };

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length || !draft) return;
    setUploading(true);
    setError("");
    setMessage("");
    const uploaded: ProductImage[] = [];
    const failures: string[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        failures.push(`${file.name}: unsupported format`);
        continue;
      }
      if (!file.size || file.size > 8 * 1024 * 1024) {
        failures.push(`${file.name}: must be under 8 MB`);
        continue;
      }
      try {
        const image = await api<ProductImage>("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": file.type, "x-file-name": file.name },
          body: file,
        });
        uploaded.push({ ...image, alt: draft.title || file.name.replace(/\.[^.]+$/, "") });
      } catch (caught) {
        failures.push(`${file.name}: ${caught instanceof Error ? caught.message : "upload failed"}`);
      }
    }

    if (uploaded.length) {
      setDraft((current) => current ? { ...current, images: [...current.images, ...uploaded] } : current);
      setMessage(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded. Save the product to keep the changes.`);
    }
    if (failures.length) setError(failures.join(" • "));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setDraft((current) => current ? {
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    } : current);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.images.length) return current;
      const images = [...current.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || uploading) return;
    if (!draft.title.trim()) return setError("Add a product title.");
    const invalidVariant = draft.variants.find((variant) => {
      const price = Number(variant.price);
      return variant.price.trim() === "" || !Number.isFinite(price) || price < 0;
    });
    if (invalidVariant) return setError(`Enter a valid price for ${invalidVariant.size}.`);
    const variants = draft.variants.map((variant, position) => ({
      size: variant.size,
      price_cents: Math.round(Number(variant.price) * 100),
      position,
    }));
    if (!draft.images.length) return setError("Upload at least one product image.");

    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      title: draft.title.trim(),
      slug: slugify(draft.slug || draft.title),
      description: draft.description.trim(),
      price_cents: Math.min(...variants.map((variant) => variant.price_cents)),
      variants,
      currency: "USD",
      category: draft.category.trim() || "Prints",
      badge: draft.badge.trim() || null,
      status: draft.status,
      images: draft.images.map((image, position) => ({
        url: image.url,
        object_key: image.object_key,
        alt: image.alt || draft.title,
        position,
      })),
    };

    try {
      const url = draft.id ? `/api/admin/products/${draft.id}` : "/api/admin/products";
      const method = draft.id ? "PATCH" : "POST";
      const result = await api<{ product: AdminProduct }>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProducts((current) => {
        const others = current.filter((product) => product.id !== result.product.id);
        return [result.product, ...others];
      });
      setDraft(productToDraft(result.product));
      setMessage(`${result.product.title} saved as ${result.product.status}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Delete “${product.title}” and its uploaded images? This cannot be undone.`)) return;
    setError("");
    setMessage("");
    try {
      await api(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (draft?.id === product.id) setDraft(null);
      setMessage(`${product.title} was deleted.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete product.");
    }
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-charcoal text-white grid place-items-center font-black uppercase tracking-[0.25em]">Checking admin access…</div>;
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-charcoal text-white grid place-items-center p-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-4 bg-cherry border-b-3 border-charcoal" />
        <form onSubmit={login} className="w-full max-w-md bg-white text-charcoal border-3 border-charcoal p-8 shadow-[10px_10px_0_0_#FFB7C5]">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-cherry-dark"><ArrowLeft size={16} /> Storefront</a>
          <div className="my-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cherry-dark">Restricted node</p>
            <h1 className="text-4xl font-black tracking-tighter mt-2">yuzimi<span className="text-cherry-dark">ONLINE</span></h1>
            <p className="mt-3 text-sm text-neutral-600">Sign in with the admin password stored in Vercel.</p>
          </div>
          <label className="block text-xs font-black uppercase tracking-widest" htmlFor="admin-password">Admin password</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border-3 border-charcoal bg-canvas px-4 py-3 font-bold outline-none focus:shadow-[4px_4px_0_0_#89CFF0]" required autoFocus />
          {error && <p role="alert" className="mt-4 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p>}
          <button type="submit" className="btn-brutal w-full mt-6">Enter admin</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-charcoal">
      <header className="bg-charcoal text-white border-b-4 border-cherry sticky top-0 z-30">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cherry">Catalog command</p>
            <h1 className="text-2xl font-black tracking-tighter">yuzimi<span className="text-cherry">ONLINE</span> / ADMIN</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="bg-white text-charcoal border-2 border-white px-4 py-2 text-xs font-black uppercase hover:bg-sky-blue">View shop</a>
            <button onClick={logout} className="border-2 border-white px-4 py-2 text-xs font-black uppercase hover:bg-cherry hover:text-charcoal hover:border-cherry inline-flex items-center gap-2"><LogOut size={15} /> Log out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">
        {(error || message) && (
          <div className={`mb-6 border-3 border-charcoal p-4 font-bold flex items-start justify-between gap-4 ${error ? "bg-red-100" : "bg-sky-light"}`} role={error ? "alert" : "status"}>
            <span>{error || message}</span>
            <button aria-label="Dismiss message" onClick={() => { setError(""); setMessage(""); }}><X size={20} /></button>
          </div>
        )}

        <section className="grid sm:grid-cols-3 gap-4 mb-8" aria-label="Catalog summary">
          {[
            ["Total products", counts.total, "bg-white"],
            ["Published", counts.published, "bg-sky-blue"],
            ["Drafts", counts.drafts, "bg-cherry"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className={`${color} border-3 border-charcoal p-5 shadow-[4px_4px_0_0_#141414]`}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em]">{label}</p>
              <p className="text-4xl font-black mt-1">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid xl:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
          <section className="bg-white border-3 border-charcoal shadow-[7px_7px_0_0_#89CFF0] min-w-0">
            <div className="border-b-3 border-charcoal p-5 flex flex-wrap items-center justify-between gap-3 bg-cherry-soft">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em]">Inventory</p>
                <h2 className="text-2xl font-black">Product library</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void loadProducts()} disabled={loadingProducts} className="bg-white border-2 border-charcoal p-3 hover:bg-sky-blue disabled:opacity-50" aria-label="Refresh products"><RefreshCw size={18} className={loadingProducts ? "animate-spin" : ""} /></button>
                <button onClick={startNewProduct} className="btn-brutal !px-5 !py-3 inline-flex items-center gap-2"><Plus size={18} /> New product</button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="p-12 text-center font-black uppercase tracking-widest">Loading catalog…</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Package size={52} className="mx-auto text-cherry-dark" />
                <h3 className="text-xl font-black mt-4">Your catalog is empty</h3>
                <p className="text-sm text-neutral-600 mt-2">Create the first product, upload images, then publish it.</p>
                <button onClick={startNewProduct} className="btn-sky mt-6">Create first product</button>
              </div>
            ) : (
              <div className="divide-y-3 divide-charcoal">
                {products.map((product) => (
                  <article key={product.id} className={`p-4 sm:p-5 flex gap-4 hover:bg-cherry-light ${draft?.id === product.id ? "bg-sky-light" : ""}`}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-charcoal bg-neutral-100 shrink-0 overflow-hidden">
                      {product.images[0]?.url ? <img src={product.images[0].url} alt={product.images[0].alt || product.title} className="w-full h-full object-cover" /> : <div className="h-full grid place-items-center"><ImagePlus /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-black text-lg leading-tight truncate">{product.title}</h3>
                          <p className="text-xs uppercase font-bold text-neutral-500 mt-1">{product.category} / {product.slug}</p>
                        </div>
                        <span className={`border-2 border-charcoal px-2 py-1 text-[10px] font-black uppercase ${product.status === "published" ? "bg-sky-blue" : "bg-cherry"}`}>{product.status}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <strong>From ${(product.price_cents / 100).toFixed(2)}</strong>
                        <div className="flex gap-2">
                          <button onClick={() => editProduct(product)} className="border-2 border-charcoal px-3 py-2 text-xs font-black uppercase hover:bg-sky-blue inline-flex items-center gap-1"><Pencil size={14} /> Edit</button>
                          <button onClick={() => void deleteProduct(product)} className="border-2 border-charcoal p-2 hover:bg-red-200" aria-label={`Delete ${product.title}`}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-28">
            {!draft ? (
              <div className="bg-charcoal text-white border-3 border-charcoal p-8 shadow-[7px_7px_0_0_#FFB7C5] text-center">
                <Pencil size={40} className="mx-auto text-cherry" />
                <h2 className="text-2xl font-black mt-4">Select a product</h2>
                <p className="text-sm text-neutral-300 mt-2">Edit an existing item or start a new listing.</p>
                <button onClick={startNewProduct} className="btn-sky mt-6 w-full">New product</button>
              </div>
            ) : (
              <form onSubmit={saveProduct} className="bg-white border-3 border-charcoal shadow-[7px_7px_0_0_#FFB7C5]">
                <div className="p-5 border-b-3 border-charcoal bg-sky-light flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em]">Manual editor</p>
                    <h2 className="text-2xl font-black">{draft.id ? "Edit product" : "New product"}</h2>
                  </div>
                  <button type="button" onClick={() => setDraft(null)} className="border-2 border-charcoal p-2 bg-white hover:bg-cherry" aria-label="Close editor"><X size={18} /></button>
                </div>

                <div className="p-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">
                  <Field label="Product title" htmlFor="title">
                    <input id="title" value={draft.title} onChange={(event) => titleChanged(event.target.value)} className="admin-input" placeholder="Sakura Horizon Print" required />
                  </Field>
                  <Field label="URL slug" htmlFor="slug" hint="Used in the product web address.">
                    <input id="slug" value={draft.slug} onChange={(event) => updateDraft("slug", slugify(event.target.value))} className="admin-input" placeholder="sakura-horizon-print" />
                  </Field>
                  <Field label="Category" htmlFor="category"><input id="category" list="category-options" value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} className="admin-input" /><datalist id="category-options"><option value="Prints" /><option value="Apparel" /><option value="Gear" /><option value="Home" /></datalist></Field>
                  <fieldset>
                    <legend className="text-xs font-black uppercase tracking-widest">Variant prices (USD)</legend>
                    <p className="text-xs text-neutral-500 mt-1">Enter the selling price for every print size.</p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {draft.variants.map((variant) => {
                        const inputId = `variant-${variant.size.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                        return (
                          <div key={variant.size}>
                            <label htmlFor={inputId} className="block text-[10px] font-black uppercase tracking-wide mb-1">{variant.size}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm" aria-hidden="true">$</span>
                              <input id={inputId} type="number" inputMode="decimal" min="0" step="0.01" value={variant.price} onChange={(event) => updateVariantPrice(variant.size, event.target.value)} className="admin-input !pl-7" placeholder="0.00" required aria-label={`${variant.size} price in USD`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                  <Field label="Badge (optional)" htmlFor="badge"><input id="badge" value={draft.badge} onChange={(event) => updateDraft("badge", event.target.value)} className="admin-input" placeholder="New / Limited / Bestseller" /></Field>
                  <Field label="Description" htmlFor="description" hint="Write the storefront copy manually—no AI is used.">
                    <textarea id="description" value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} className="admin-input min-h-32 resize-y" placeholder="Materials, sizing, finish, care instructions…" />
                  </Field>

                  <fieldset>
                    <legend className="text-xs font-black uppercase tracking-widest mb-2">Visibility</legend>
                    <div className="grid grid-cols-2 gap-2">
                      <StatusButton active={draft.status === "draft"} onClick={() => updateDraft("status", "draft")} icon={<EyeOff size={16} />} label="Draft" />
                      <StatusButton active={draft.status === "published"} onClick={() => updateDraft("status", "published")} icon={<Eye size={16} />} label="Published" />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-xs font-black uppercase tracking-widest">Product images</legend>
                    <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP, or GIF. Maximum 8 MB each. The first image is the cover.</p>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files); event.target.value = ""; }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDrop={(event) => { event.preventDefault(); setDragging(false); void uploadFiles(event.dataTransfer.files); }} disabled={uploading} className={`w-full mt-3 border-3 border-dashed border-charcoal p-6 grid place-items-center text-center hover:bg-cherry-light disabled:opacity-50 ${dragging ? "bg-sky-blue" : "bg-canvas"}`}>
                      <UploadCloud size={30} />
                      <span className="text-xs font-black uppercase mt-2">{uploading ? "Uploading images…" : "Drop images or choose files"}</span>
                    </button>

                    {draft.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {draft.images.map((image, index) => (
                          <div key={`${image.object_key}-${index}`} className="border-2 border-charcoal bg-white">
                            <div className="aspect-square relative overflow-hidden bg-neutral-100"><img src={image.url} alt={image.alt || `Product image ${index + 1}`} className="w-full h-full object-cover" />{index === 0 && <span className="absolute left-1 top-1 bg-cherry border-2 border-charcoal px-2 py-1 text-[9px] font-black uppercase">Cover</span>}</div>
                            <div className="grid grid-cols-3 divide-x-2 divide-charcoal border-t-2 border-charcoal">
                              <button type="button" aria-label="Move image earlier" disabled={index === 0} onClick={() => moveImage(index, -1)} className="p-2 hover:bg-sky-blue disabled:opacity-25"><ChevronUp size={16} className="mx-auto" /></button>
                              <button type="button" aria-label="Move image later" disabled={index === draft.images.length - 1} onClick={() => moveImage(index, 1)} className="p-2 hover:bg-sky-blue disabled:opacity-25"><ChevronDown size={16} className="mx-auto" /></button>
                              <button type="button" aria-label="Remove image" onClick={() => removeImage(index)} className="p-2 hover:bg-red-200"><Trash2 size={16} className="mx-auto" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </fieldset>
                </div>

                <div className="p-5 border-t-3 border-charcoal bg-cherry-soft flex gap-3">
                  <button type="submit" disabled={saving || uploading} className="btn-brutal flex-1 !px-4 !py-3 inline-flex justify-center items-center gap-2 disabled:opacity-50"><Save size={17} /> {saving ? "Saving…" : "Save product"}</button>
                  {draft.id && <span className="border-2 border-charcoal bg-white px-3 grid place-items-center" title="Saved product"><Check size={18} /></span>}
                </div>
              </form>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest" htmlFor={htmlFor}>{label}</label>
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`border-2 border-charcoal p-3 text-xs font-black uppercase inline-flex items-center justify-center gap-2 ${active ? "bg-sky-blue shadow-[3px_3px_0_0_#141414]" : "bg-white hover:bg-cherry-light"}`}>{icon}{label}</button>;
}
