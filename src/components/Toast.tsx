import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../context/CartContext";
import { Sparkles } from "lucide-react";

export function Toast() {
  const { toastMessage } = useCart();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-none"
        >
          <div className="bg-charcoal text-white border-3 border-cherry px-5 py-3 shadow-[6px_6px_0px_0px_#FFB7C5] flex items-center gap-3">
            <span className="w-5 h-5 bg-cherry text-charcoal flex items-center justify-center font-black text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider">
              {toastMessage}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

