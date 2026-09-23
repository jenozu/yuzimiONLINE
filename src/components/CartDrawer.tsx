import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, subtotal, totalCount } = useCart();

  // Final shipping depends on the customer's address and the number of prints.
  // Tsuya's published rates: US free; Canada $9.99 + $2.50/additional item;
  // Europe varies by destination. Do not claim a final total before address entry.
  const shippingNote = "US: FREE · Canada: $9.99 + $2.50 per extra print · Europe: calculated by country";

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

            <div className="bg-[#EEF8FD] border-b-3 border-charcoal px-6 py-3 text-[11px] font-black uppercase tracking-wider text-charcoal">
              {shippingNote}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
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
            {items.length > 0 && (
              <div className="p-6 bg-white border-t-3 border-charcoal space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-bold text-charcoal/70">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-charcoal/70">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    disabled
                    aria-describedby="checkout-status"
                    className="w-full btn-brutal text-sm py-4 flex items-center justify-center gap-2 hover:bg-sky-blue transition-colors"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p id="checkout-status" className="text-xs text-center text-charcoal/70">
                    Checkout is being set up. No payment or order is placed yet.
                  </p>

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
