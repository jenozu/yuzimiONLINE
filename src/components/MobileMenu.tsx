import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { totalCount, openCart } = useCart();

  const handleOpenCart = () => {
    onClose();
    openCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="relative w-4/5 max-w-sm bg-[#FFF8FA] h-full border-r-4 border-charcoal flex flex-col z-10 shadow-[10px_0px_0px_0px_rgba(20,20,20,0.1)]"
          >
            <div className="p-6 bg-white border-b-3 border-charcoal flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-cherry text-charcoal border-2 border-charcoal flex items-center justify-center font-black text-sm">桜</span>
                <span className="text-2xl font-black tracking-tighter text-charcoal">
                  <span className="lowercase">yuzimi</span><span className="text-cherry-dark uppercase">ONLINE</span>
                </span>
              </div>
              <button onClick={onClose} aria-label="Close menu" className="w-10 h-10 border-2 border-charcoal bg-[#FFF0F4] hover:bg-cherry flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-charcoal" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/50">Navigation</p>
              <nav className="space-y-3">
                {[
                  { name: "Art Prints", path: "/collections" },
                  { name: "Support & FAQ", path: "/support" }
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center justify-between p-4 bg-white border-3 border-charcoal shadow-[4px_4px_0px_0px_#FFB7C5] hover:bg-cherry hover:shadow-none transition-all"
                  >
                    <span className="font-black uppercase tracking-tight text-lg text-charcoal">{item.name}</span>
                    <ArrowRight className="w-4 h-4 text-charcoal" />
                  </Link>
                ))}
              </nav>

              <div className="pt-6 border-t-3 border-charcoal">
                <button
                  onClick={handleOpenCart}
                  className="w-full flex items-center justify-between p-4 bg-cherry text-charcoal border-3 border-charcoal font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_#141414] active:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Cart</span>
                  </div>
                  <span className="bg-white border border-charcoal px-2 py-0.5 text-xs">[{totalCount.toString().padStart(2, "0")}]</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-white border-t-3 border-charcoal">
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/60">yuzimiONLINE // Art Prints</p>
              <p className="text-[10px] text-charcoal/40 font-semibold mt-1">Collection 001 — Cherry Blossoms</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
