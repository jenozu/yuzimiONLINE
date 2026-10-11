import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function CheckoutResult() {
  const { pathname, search } = useLocation();
  const { clearCart } = useCart();
  const cancelled = pathname.endsWith('/cancel');
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'failed'>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    if (cancelled) return;

    const params = new URLSearchParams(search);
    const paymentIntentId = params.get('payment_intent');
    const sessionId = params.get('session_id');
    const query = paymentIntentId
      ? `payment_intent=${encodeURIComponent(paymentIntentId)}`
      : sessionId
        ? `session_id=${encodeURIComponent(sessionId)}`
        : '';

    if (!query) {
      setError('This checkout link is missing its payment reference.');
      return;
    }

    let active = true;
    let timer: number | undefined;
    let attempts = 0;

    const check = async () => {
      try {
        const response = await fetch(`/api/checkout-status?${query}`);
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Could not verify the payment.');
        if (!active) return;

        const next = body.status === 'paid' ? 'paid' : body.status === 'failed' ? 'failed' : 'pending';
        setStatus(next);

        if (next === 'paid') {
          clearCart();
          return;
        }

        attempts += 1;
        if (next === 'pending' && attempts < 8) {
          timer = window.setTimeout(check, 900);
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not verify the payment.');
      }
    };

    void check();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [cancelled, search, clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
      <p className="text-xs font-black uppercase tracking-widest text-charcoal/60">Stripe test payment</p>
      <h1 className="text-4xl font-black uppercase text-charcoal">
        {cancelled
          ? 'Checkout cancelled'
          : error
            ? 'Could not verify payment'
            : status === 'paid'
              ? 'Test payment received'
              : status === 'failed'
                ? 'Payment failed'
                : 'Checking payment'}
      </h1>
      <p className="text-charcoal/70 font-semibold">
        {cancelled
          ? 'Your cart is still here.'
          : error || (status === 'paid'
            ? 'This was a test payment. No real money was charged and no print will be fulfilled.'
            : status === 'failed'
              ? 'No order will be fulfilled. Please return to checkout and try again.'
              : 'We are confirming the payment with Stripe. Do not fulfill the order until it is marked paid.')}
      </p>
      <Link to="/collections" className="inline-block btn-brutal px-6 py-3 text-sm">Browse prints</Link>
    </div>
  );
}
