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
    const sessionId = new URLSearchParams(search).get('session_id');
    if (!sessionId) { setError('This checkout link is missing its session ID.'); return; }
    let active = true;
    const check = async () => {
      try {
        const response = await fetch(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`);
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Could not verify the payment.');
        if (!active) return;
        setStatus(body.status === 'paid' ? 'paid' : body.status === 'failed' ? 'failed' : 'pending');
        if (body.status === 'paid') clearCart();
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not verify the payment.');
      }
    };
    void check();
    return () => { active = false; };
  }, [cancelled, search, clearCart]);

  return <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
    <p className="text-xs font-black uppercase tracking-widest text-charcoal/60">Stripe test checkout</p>
    <h1 className="text-4xl font-black uppercase text-charcoal">
      {cancelled ? 'Checkout cancelled' : error ? 'Could not verify payment' : status === 'paid' ? 'Test payment received' : status === 'failed' ? 'Payment failed' : 'Checking payment'}
    </h1>
    <p className="text-charcoal/70 font-semibold">
      {cancelled ? 'Your cart is still here.' : error || (status === 'paid' ? 'This was a test payment. No real money was charged and no print will be fulfilled.' : status === 'failed' ? 'No order will be fulfilled. Please try again.' : 'Do not fulfill the order until payment is confirmed. Refresh this page to check again.')}
    </p>
    <Link to="/collections" className="inline-block btn-brutal px-6 py-3 text-sm">Browse prints</Link>
  </div>;
}
