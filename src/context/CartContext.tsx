import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Product, CartItem } from "../types";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(["1", "2"]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Product, size = "8 × 10 in") => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + 1 };
        return next;
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    showToast(`Added "${product.name}" (${size}) to cart`);
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Saved to wishlist 🌸");
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        toastMessage,
        showToast,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
