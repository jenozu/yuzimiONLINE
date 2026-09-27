import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, LogOut, PackageCheck, RefreshCw, RotateCcw } from "lucide-react";

type OrderStatus = "pending" | "paid" | "processing" | "fulfilled" | "failed" | "expired" | "cancelled" | "refunded" | "partially_refunded" | "disputed";

type OrderLine = {
  productId?: string;
  name?: string;
  size?: string;
  quantity?: number;
  unitPriceCents?: number;
};

type AdminOrder = {
  id: string;
  stripe_session_id?: string;
  status: OrderStatus;
  line_items: OrderLine[] | string;
  country: string;
  total_cents: number;
  customer_email?: string;
  provider_order_id?: string;
  tracking_number?: string;
  tracking_url?: string;
  refunded_cents?: number;
  created_at: string;
};

const request = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { credentials: "include", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status}).`);
  return body as T;
};

const parseLines = (value: AdminOrder["line_items"]): OrderLine[] => {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value) as OrderLine[]; } catch { return []; }
};

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const session = await request<{ authenticated: boolean }>("/api/admin/session");
      if (!session.authenticated) {
        window.location.assign("/admin");
        return;
      }
      const result = await request<{ orders: AdminOrder[] }>("/api/admin/orders");
      setOrders(result.orders);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const visibleOrders = useMemo(() => filter === "all" ? orders : orders.filter((order) => order.status === filter), [filter, orders]);
  const statuses = useMemo(() => Array.from(new Set(orders.map((order) => order.status))), [orders]);

  const patchOrder = async (order: AdminOrder, status: OrderStatus) => {
    const input: Record<string, string> = { status };
    if (status === "fulfilled") {
      const providerOrderId = window.prompt("Print-provider order ID (optional)", order.provider_order_id || "");
      if (providerOrderId === null) return;
      const trackingNumber = window.prompt("Tracking number (optional)", order.tracking_number || "");
      if (trackingNumber === null) return;
      const trackingUrl = window.prompt("Public tracking URL (optional)", order.tracking_url || "");
      if (trackingUrl === null) return;
      input.provider_order_id = providerOrderId;
      input.tracking_number = trackingNumber;
      input.tracking_url = trackingUrl;
    }
    setWorkingId(order.id);
    setError("");
    try {
      const result = await request<{ order: AdminOrder }>(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setOrders((current) => current.map((item) => item.id === order.id ? result.order : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update order.");
    } finally {
      setWorkingId("");
    }
  };

  const refundOrder = async (order: AdminOrder) => {
    if (!window.confirm(`Issue a full ${money(order.total_cents)} refund for order ${order.id}? Stripe will process this immediately.`)) return;
    setWorkingId(order.id);
    setError("");
    try {
      const result = await request<{ order: AdminOrder }>(`/api/admin/orders/${order.id}/refund`, { method: "POST" });
      setOrders((current) => current.map((item) => item.id === order.id ? result.order : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not refund order.");
    } finally {
      setWorkingId("");
    }
  };

  const logout = async () => {
    await request("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign("/admin");
  };

  return (
    <main className="min-h-screen bg-canvas text-charcoal">
      <header className="bg-charcoal text-white border-b-4 border-cherry sticky top-0 z-30">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cherry">Order command</p>
            <h1 className="text-2xl font-black tracking-tighter">yuzimi<span className="text-cherry">ONLINE</span> / ORDERS</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/admin" className="bg-white text-charcoal border-2 border-white px-4 py-2 text-xs font-black uppercase hover:bg-sky-blue inline-flex items-center gap-2"><ArrowLeft size={15} /> Products</a>
            <button onClick={logout} className="border-2 border-white px-4 py-2 text-xs font-black uppercase hover:bg-cherry hover:text-charcoal inline-flex items-center gap-2"><LogOut size={15} /> Log out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cherry-dark">Payment & fulfillment</p>
            <h2 className="text-4xl font-black tracking-tight">Order queue</h2>
            <p className="text-sm text-neutral-600 mt-2">Only fulfill orders marked paid or processing. Refunds are sent through Stripe.</p>
          </div>
          <button onClick={() => void loadOrders()} disabled={loading} className="btn-sky inline-flex items-center gap-2 disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh</button>
        </div>

        {error && <p role="alert" className="mb-6 border-3 border-red-800 bg-red-100 p-4 font-bold text-red-900">{error}</p>}

        <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter orders by status">
          {["all", ...statuses].map((status) => <button key={status} onClick={() => setFilter(status as OrderStatus | "all")} aria-pressed={filter === status} className={`border-2 border-charcoal px-3 py-2 text-xs font-black uppercase ${filter === status ? "bg-cherry shadow-[3px_3px_0_0_#141414]" : "bg-white hover:bg-sky-light"}`}>{status}</button>)}
        </div>

        {loading ? <div className="border-3 border-charcoal bg-white p-12 text-center font-black uppercase tracking-widest">Loading orders…</div> : visibleOrders.length === 0 ? (
          <div className="border-3 border-charcoal bg-white p-12 text-center shadow-[7px_7px_0_0_#89CFF0]"><PackageCheck size={48} className="mx-auto text-cherry-dark" /><h3 className="text-2xl font-black mt-4">No matching orders</h3><p className="text-sm text-neutral-600 mt-2">Paid test and live orders will appear here after Stripe confirmation.</p></div>
        ) : (
          <div className="space-y-5">
            {visibleOrders.map((order) => {
              const lines = parseLines(order.line_items);
              const busy = workingId === order.id;
              return <article key={order.id} className="border-3 border-charcoal bg-white shadow-[6px_6px_0_0_#FFB7C5]">
                <div className="p-4 sm:p-5 border-b-3 border-charcoal flex flex-wrap justify-between gap-4 bg-cherry-soft">
                  <div><p className="text-[10px] font-black uppercase tracking-widest">Order</p><h3 className="font-black break-all">{order.id}</h3><p className="text-xs text-neutral-600 mt-1">{new Date(order.created_at).toLocaleString()}</p></div>
                  <div className="text-right"><span className="inline-block border-2 border-charcoal bg-sky-blue px-3 py-1 text-xs font-black uppercase">{order.status.replace("_", " ")}</span><p className="text-2xl font-black mt-2">{money(order.total_cents)}</p></div>
                </div>
                <div className="p-4 sm:p-5 grid lg:grid-cols-[1fr_280px] gap-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{order.customer_email || "Email pending"} / {order.country}</p>
                    <ul className="mt-3 divide-y-2 divide-neutral-200">{lines.map((line, index) => <li key={`${line.productId || line.name}-${index}`} className="py-2 flex justify-between gap-3 text-sm"><span><strong>{line.name || "Print"}</strong> — {line.size}</span><span>× {line.quantity || 1}</span></li>)}</ul>
                    {(order.tracking_number || order.provider_order_id) && <p className="mt-3 text-xs font-bold text-neutral-600">Provider: {order.provider_order_id || "—"} · Tracking: {order.tracking_number || "—"} {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="ml-1 underline inline-flex items-center gap-1">Open <ExternalLink size={11} /></a>}</p>}
                  </div>
                  <div className="grid gap-2 content-start">
                    {order.status === "paid" && <button disabled={busy} onClick={() => void patchOrder(order, "processing")} className="btn-sky !py-3 disabled:opacity-50">Start processing</button>}
                    {order.status === "processing" && <button disabled={busy} onClick={() => void patchOrder(order, "fulfilled")} className="btn-sky !py-3 disabled:opacity-50">Mark fulfilled</button>}
                    {order.status === "pending" && <button disabled={busy} onClick={() => void patchOrder(order, "cancelled")} className="border-2 border-charcoal bg-white px-3 py-3 text-xs font-black uppercase hover:bg-red-100 disabled:opacity-50">Cancel pending order</button>}
                    {["paid", "processing", "fulfilled", "cancelled", "partially_refunded", "disputed"].includes(order.status) && <button disabled={busy} onClick={() => void refundOrder(order)} className="border-2 border-charcoal bg-cherry px-3 py-3 text-xs font-black uppercase hover:bg-red-200 disabled:opacity-50 inline-flex items-center justify-center gap-2"><RotateCcw size={15} /> Full refund</button>}
                  </div>
                </div>
              </article>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}
