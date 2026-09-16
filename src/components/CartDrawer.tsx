import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, subtotal, totalCount } = useCart();
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  const freeShippingThreshold = 150;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const grandTotal = subtotal + shippingCost;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    setIsCheckedOut(true);
    setTimeout(() => {
      clearCart();
      setIsCheckedOut(false);
      closeCart();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full max-w-md bg-[#FFF9FA] border-l-4 border-charcoal shadow-[-10px_0px_0px_0px_rgba(20,20,20,0.15)] flex flex-col h-full z-10"
          >
            {/* Header */}
            <div className="p-6 bg-white border-b-3 border-charcoal flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-cherry text-charcoal border border-charcoal flex items-center justify-center font-black text-[10px]">
                    桜
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-charcoal">
                    Manifest [{totalCount.toString().padStart(2, "0")}]
                  </h3>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/60">
                  <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> // SECURE CHECKOUT
                </p>
              </div>

              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="w-10 h-10 border-2 border-charcoal bg-[#FFF0F4] hover:bg-cherry flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_#141414] active:shadow-none"
              >
                <X className="w-5 h-5 text-charcoal" />
              </button>
            </div>

            {/* Free shipping bar */}
            <div className="bg-[#EEF8FD] border-b-3 border-charcoal px-6 py-3">
              {neededForFreeShipping > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-charcoal">
                    <span>Add ${neededForFreeShipping.toFixed(2)} for Free Dispatch</span>
                    <span>{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
                  </div>
                  <div className="w-full bg-white border border-charcoal h-2 overflow-hidden">
                    <div
                      className="bg-sky-blue h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-charcoal">
                  <span className="w-2 h-2 rounded-full bg-cherry animate-ping inline-block" />
                  <span>🌸 Qualified for Free Express Worldwide Shipping!</span>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isCheckedOut ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 bg-cherry border-3 border-charcoal mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#141414]">
                    <ShieldCheck className="w-10 h-10 text-charcoal" />
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-charcoal">Order Dispatched!</h4>
                  <p className="text-sm font-medium text-charcoal/70 max-w-xs mx-auto">
                    Payment protocol initialized. Verification packet sent to your client node.
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 bg-white border-3 border-charcoal mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#FFB7C5]">
                    <ShoppingBag className="w-8 h-8 text-charcoal/40" />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight text-charcoal">Manifest Empty</h4>
                  <p className="text-xs font-semibold text-charcoal/60 max-w-xs mx-auto">
                    Your collection manifest is clear. Explore our seasonal drops to initiate an order.
                  </p>
                  <Link
                    to="/collections"
                    onClick={closeCart}
                    className="inline-block btn-brutal text-xs py-3 px-6"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="p-4 bg-white border-3 border-charcoal shadow-[4px_4px_0px_0px_#FFB7C5] flex gap-4 items-center"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-18 h-18 object-cover border-2 border-charcoal shrink-0 bg-[#FFF0F4]"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="font-black text-sm uppercase tracking-tight text-charcoal hover:text-cherry-dark truncate block"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="text-charcoal/40 hover:text-charcoal p-1 ml-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase bg-[#FFF0F4] border border-charcoal px-2 py-0.5">
                          Size: {item.size}
                        </span>
                        <span className="text-xs font-black text-charcoal">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, -1)}
                          className="w-6 h-6 border border-charcoal bg-white flex items-center justify-center font-black hover:bg-cherry text-xs active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, 1)}
                          className="w-6 h-6 border border-charcoal bg-white flex items-center justify-center font-black hover:bg-cherry text-xs active:scale-95"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && !isCheckedOut && (
              <div className="p-6 bg-white border-t-3 border-charcoal space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-bold text-charcoal/70">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-charcoal/70">
                    <span>Express Dispatch</span>
                    <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-charcoal pt-2 border-t border-charcoal/10">
                    <span>Grand Total</span>
                    <span className="bg-cherry text-charcoal px-2 py-0.5 border border-charcoal">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full btn-brutal text-sm py-4 flex items-center justify-center gap-2 hover:bg-sky-blue transition-colors"
                  >
                    <span>Authorize Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={closeCart}
                    className="w-full text-center text-[11px] font-black uppercase tracking-widest text-charcoal/60 hover:text-charcoal py-2"
                  >
                    ← Keep Browsing Drops
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
