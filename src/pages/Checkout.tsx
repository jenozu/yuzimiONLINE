import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useCart } from "../context/CartContext";
import { shippingCents } from "../../lib/checkout/shipping";

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => any;
    __yuzimiStripeLoader?: Promise<void>;
  }
}

const destinations: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  AT: "Austria",
  BE: "Belgium",
  FR: "France",
  DE: "Germany",
  IE: "Ireland",
  IT: "Italy",
  NL: "Netherlands",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IS: "Iceland",
  LI: "Liechtenstein",
  LV: "Latvia",
  LT: "Lithuania",
  EE: "Estonia",
};

function loadStripeJs() {
  if (window.Stripe) return Promise.resolve();
  if (window.__yuzimiStripeLoader) return window.__yuzimiStripeLoader;

  window.__yuzimiStripeLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load secure payment fields.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load secure payment fields."));
    document.head.appendChild(script);
  });

  return window.__yuzimiStripeLoader;
}

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "US",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
};

export function Checkout() {
  const { items, subtotal, totalCount } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [startingPayment, setStartingPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [serverTotalCents, setServerTotalCents] = useState<number | null>(null);
  const [serverShippingCents, setServerShippingCents] = useState<number | null>(null);
  const paymentMountRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const paymentElementRef = useRef<any>(null);

  const estimatedShippingCents = useMemo(() => {
    if (!totalCount || !form.country) return 0;
    try {
      return shippingCents(form.country, totalCount);
    } catch {
      return 0;
    }
  }, [form.country, totalCount]);

  const displayedShippingCents = serverShippingCents ?? estimatedShippingCents;
  const displayedTotal = serverTotalCents !== null
    ? serverTotalCents / 100
    : subtotal + displayedShippingCents / 100;

  useEffect(() => {
    if (step !== "payment" || !clientSecret || !publishableKey || !paymentMountRef.current) return;

    let active = true;
    let localElement: any;

    const mountPayment = async () => {
      try {
        await loadStripeJs();
        if (!active || !window.Stripe || !paymentMountRef.current) return;

        const stripe = window.Stripe(publishableKey);
        const elements = stripe.elements({
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#141414",
              colorText: "#141414",
              colorBackground: "#ffffff",
              borderRadius: "0px",
              fontFamily: "Inter, sans-serif",
            },
          },
        });

        localElement = elements.create("payment", {
          layout: "tabs",
        });
        localElement.mount(paymentMountRef.current);
        stripeRef.current = stripe;
        elementsRef.current = elements;
        paymentElementRef.current = localElement;
        setPaymentReady(true);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load secure payment fields.");
      }
    };

    void mountPayment();

    return () => {
      active = false;
      if (localElement?.destroy) localElement.destroy();
      setPaymentReady(false);
      paymentElementRef.current = null;
      elementsRef.current = null;
      stripeRef.current = null;
    };
  }, [step, clientSecret, publishableKey]);

  const update = (key: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError("");
  };

  const startPayment = async (event: FormEvent) => {
    event.preventDefault();
    if (startingPayment) return;

    setError("");
    const needsRegion = form.country === "US" || form.country === "CA";
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.line1.trim() || !form.city.trim() || !form.postalCode.trim() || (needsRegion && !form.state.trim())) {
      setError("Please complete the required contact and shipping fields.");
      return;
    }

    setStartingPayment(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.product.id,
            size: item.size,
            quantity: item.quantity,
          })),
          contact: {
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
          shipping: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            country: form.country,
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
          },
        }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not prepare payment.");

      setClientSecret(body.clientSecret);
      setPublishableKey(body.publishableKey);
      setPaymentIntentId(body.paymentIntentId);
      setServerTotalCents(body.totalCents);
      setServerShippingCents(body.shippingCents);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not prepare payment.");
    } finally {
      setStartingPayment(false);
    }
  };

  const submitPayment = async () => {
    if (paying || !stripeRef.current || !elementsRef.current) return;
    setPaying(true);
    setError("");

    try {
      const result = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        throw new Error(result.error.message || "Payment could not be completed.");
      }

      const id = result.paymentIntent?.id || paymentIntentId;
      if (!id) throw new Error("Payment was submitted but could not be verified.");

      navigate(`/checkout/success?payment_intent=${encodeURIComponent(id)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Payment could not be completed.");
      setPaying(false);
    }
  };

  const editShipping = () => {
    setStep("details");
    setClientSecret("");
    setPublishableKey("");
    setPaymentIntentId("");
    setPaymentReady(false);
    setServerTotalCents(null);
    setServerShippingCents(null);
    setError("");
  };

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-5">
        <h1 className="text-4xl font-black uppercase text-charcoal">Your cart is empty</h1>
        <p className="text-charcoal/70 font-semibold">Add a print before starting checkout.</p>
        <Link to="/collections" className="inline-block btn-brutal px-6 py-3 text-sm">Browse prints</Link>
      </div>
    );
  }

  return (
    <div className="editorial-shell py-12 lg:py-22">
      <Link to="/collections" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal/60 hover:text-charcoal mb-8">
        <ArrowLeft className="w-4 h-4" />
        Continue shopping
      </Link>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-start">
        <section className="bg-white border border-charcoal/25 p-6 sm:p-10">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cherry-dark">Secure checkout</p>
              <h1 className="editorial-display text-4xl sm:text-5xl mt-3">
                {step === "details" ? "Shipping details" : "Payment"}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-charcoal/60">
              <LockKeyhole className="w-4 h-4" />
              Stripe secured
            </div>
          </div>

          {step === "details" ? (
            <form onSubmit={startPayment} className="space-y-7">
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-charcoal">Contact</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5 text-xs font-black uppercase">
                    First name *
                    <input autoComplete="given-name" value={form.firstName} onChange={e => update("firstName", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required />
                  </label>
                  <label className="space-y-1.5 text-xs font-black uppercase">
                    Last name *
                    <input autoComplete="family-name" value={form.lastName} onChange={e => update("lastName", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required />
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5 text-xs font-black uppercase">
                    Email *
                    <input type="email" autoComplete="email" value={form.email} onChange={e => update("email", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required />
                  </label>
                  <label className="space-y-1.5 text-xs font-black uppercase">
                    Phone number (optional)
                    <input type="tel" autoComplete="tel" value={form.phone} onChange={e => update("phone", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-charcoal">Shipping address</h2>
                <label className="block space-y-1.5 text-xs font-black uppercase">
                  Country *
                  <select value={form.country} onChange={e => update("country", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required>
                    {Object.entries(destinations).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </label>
                <label className="block space-y-1.5 text-xs font-black uppercase">
                  Address Line 1 *
                  <input autoComplete="shipping address-line1" value={form.line1} onChange={e => update("line1", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required />
                </label>
                <label className="block space-y-1.5 text-xs font-black uppercase">
                  Address Line 2 (optional)
                  <input autoComplete="shipping address-line2" value={form.line2} onChange={e => update("line2", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" />
                </label>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="space-y-1.5 text-xs font-black uppercase">
                    City *
                    <input autoComplete="shipping address-level2" value={form.city} onChange={e => update("city", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required />
                  </label>
                  <label className="space-y-1.5 text-xs font-black uppercase">
                    State/Province *
                    <input autoComplete="shipping address-level1" value={form.state} onChange={e => update("state", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required={form.country === "US" || form.country === "CA"} />
                  </label>
                  <label className="space-y-1.5 text-xs font-black uppercase">
                    Postal/ZIP Code *
                    <input autoComplete="shipping postal-code" value={form.postalCode} onChange={e => update("postalCode", e.target.value)} className="w-full border-2 border-charcoal bg-white p-3 text-base normal-case font-medium" required />
                  </label>
                </div>
              </div>

              {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}

              <button type="submit" disabled={startingPayment} className="editorial-button w-full py-5 disabled:opacity-60">
                {startingPayment ? "Preparing secure payment…" : "Continue to payment"}
              </button>
              <p className="text-xs text-center text-charcoal/60 font-semibold">Test mode: no real money will be charged.</p>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#FFF0F4] border-2 border-charcoal p-4 flex items-start justify-between gap-4">
                <div className="text-sm text-charcoal">
                  <p className="font-black">{form.firstName} {form.lastName}</p>
                  <p>{form.line1}{form.line2 ? `, ${form.line2}` : ""}</p>
                  <p>{form.city}{form.state ? `, ${form.state}` : ""} {form.postalCode}</p>
                  <p>{destinations[form.country]}</p>
                  <p className="mt-2 font-semibold">{form.email}</p>
                </div>
                <button type="button" onClick={editShipping} className="text-xs font-black uppercase underline underline-offset-4">Edit</button>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-charcoal">Payment method</h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal/65">
                    <LockKeyhole className="w-4 h-4" />
                    Securely processed by Stripe
                  </div>
                </div>
                <div ref={paymentMountRef} className="min-h-36 border-2 border-charcoal p-4 bg-white" />
              </div>

              {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}

              <button type="button" onClick={submitPayment} disabled={paying || !paymentReady} className="w-full btn-brutal py-4 text-sm disabled:opacity-60">
                {paying ? "Processing…" : `Pay $${displayedTotal.toFixed(2)} USD`}
              </button>
              <p className="text-xs text-center text-charcoal/60 font-semibold">
                Payments are securely processed by Stripe. YUZIMI never receives or stores your card number.
              </p>
            </div>
          )}
        </section>

        <aside className="bg-cherry-light border border-charcoal/25 p-6 sm:p-9 lg:sticky lg:top-36">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-charcoal mb-5">Order summary</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-3 items-center">
                <div className="relative">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover border-2 border-charcoal bg-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-charcoal text-white text-[10px] font-black flex items-center justify-center">{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm uppercase truncate">{item.product.name}</p>
                  <p className="text-xs text-charcoal/60 font-semibold">{item.size}</p>
                </div>
                <p className="text-sm font-black">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-charcoal/10 mt-6 pt-5 space-y-3 text-sm">
            <div className="flex justify-between font-bold text-charcoal/70"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-charcoal/70">
              <span>Shipping</span>
              <span>{displayedShippingCents === 0 ? "FREE" : `$${(displayedShippingCents / 100).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-lg font-black border-t border-charcoal/15 pt-3"><span>Total</span><span>${displayedTotal.toFixed(2)} USD</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
