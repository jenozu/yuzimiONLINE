import { useParams, Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { motion } from "motion/react";
import { ArrowLeft, Heart, Share2, ShieldCheck, Truck, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { PageMeta } from "../components/PageMeta";

const PRINT_SIZES = [
  "8 × 10 in",
  "11 × 14 in",
  "12 × 18 in",
  "16 × 20 in",
  "18 × 24 in",
  "20 × 30 in",
  "24 × 32 in",
  "24 × 36 in",
] as const;

export function ProductDetail() {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState<(typeof PRINT_SIZES)[number]>(PRINT_SIZES[0]);
  const { addToCart, openCart, toggleWishlist, isWishlisted, showToast } = useCart();
  const selectedVariant = product?.variants?.find((variant) => variant.size === selectedSize);
  const selectedPrice = selectedVariant?.price ?? product?.price ?? 0;
  const selectedAvailable = selectedVariant?.available !== false;

  const galleryImages = product?.additionalImages && product.additionalImages.length > 0
    ? product.additionalImages
    : product ? [product.image] : [];

  const [activeImage, setActiveImage] = useState(product?.image || "");

  useEffect(() => {
    if (!product?.variants?.length) return;
    const current = product.variants.find((variant) => variant.size === selectedSize);
    if (current?.available !== false) return;
    const firstAvailable = product.variants.find((variant) => variant.available !== false);
    if (firstAvailable && PRINT_SIZES.includes(firstAvailable.size as (typeof PRINT_SIZES)[number])) {
      setSelectedSize(firstAvailable.size as (typeof PRINT_SIZES)[number]);
    }
  }, [product, selectedSize]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-24 text-center font-black uppercase tracking-widest">Loading product…</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-4xl font-black uppercase text-charcoal">Could not load this print</h2>
        <p role="alert" className="text-sm font-semibold text-charcoal/60">{error}</p>
        <Link to="/collections" className="inline-block btn-brutal text-xs py-3 px-6">Return to Collections</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-4xl font-black uppercase text-charcoal">Unit Not Found</h2>
        <p className="text-sm font-semibold text-charcoal/60">
          The requested item code does not exist in the active catalog.
        </p>
        <Link to="/collections" className="inline-block btn-brutal text-xs py-3 px-6">
          Return to Collections
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedAvailable) {
      showToast("That print size is currently unavailable.");
      return;
    }
    addToCart({ ...product, price: selectedPrice }, selectedSize);
    openCart();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast("Product link copied to clipboard 🌸");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <PageMeta
        title={product.name}
        description={product.description || `Shop ${product.name} in eight fine-art print sizes.`}
        image={product.image}
        type="product"
      />
      <div className="flex justify-between items-center mb-12">
        <Link 
          to="/collections" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-cherry-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-charcoal/70 hover:text-charcoal bg-white border-2 border-charcoal px-3 py-1.5 shadow-[2px_2px_0px_0px_#141414] active:shadow-none"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Spec</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20">
        {/* Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card-brutal aspect-[4/5] bg-white p-6 shadow-[8px_8px_0px_0px_#FFB7C5]">
            <div className="w-full h-full bg-[#FFF0F4] border-2 border-dashed border-charcoal/20 overflow-hidden relative">
              <img 
                src={activeImage || product.image} 
                alt={product.name}
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-cherry text-charcoal border-2 border-charcoal px-2.5 py-1 text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#141414]">
                  🌸 Sakura Spec // <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(img)}
                aria-label={`View photo ${i + 1}`}
                className={`card-brutal aspect-square p-2 transition-all cursor-pointer ${
                  (activeImage || product.image) === img 
                    ? "border-cherry shadow-[4px_4px_0px_0px_#FFB7C5] scale-102" 
                    : "opacity-70 hover:opacity-100 hover:border-cherry"
                }`}
              >
                <div className="w-full h-full bg-[#FFF0F4] overflow-hidden">
                  <img 
                    src={img} 
                    alt="" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="badge-brutal bg-cherry text-charcoal">{product.category}</span>
              <span className="text-xs font-black uppercase bg-white border border-charcoal px-2.5 py-1 shadow-[2px_2px_0px_0px_#89CFF0]">Made to order</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.88] text-charcoal">
              {product.name}
            </h1>
            
            <div className="inline-block bg-cherry text-charcoal border-3 border-charcoal px-6 py-2.5 text-2xl md:text-3xl font-black italic shadow-[4px_4px_0px_0px_#141414]">
              ${selectedPrice.toFixed(2)}
            </div>
          </div>
          
          <p className="text-charcoal/85 font-semibold leading-relaxed text-lg max-w-lg">
            {product.description}
          </p>
          
          <div className="space-y-8 border-t-3 border-charcoal pt-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-charcoal/60">Select Print Size</span>
                <span className="text-[11px] font-bold text-charcoal/50 text-right">Fine-art print dimensions</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {PRINT_SIZES.map((size) => {
                  const variant = product.variants?.find((item) => item.size === size);
                  const available = variant?.available !== false;
                  return <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!available}
                    aria-label={`${size}, ${(variant?.price ?? product.price).toFixed(2)} dollars${available ? "" : ", unavailable"}`}
                    className={`min-w-0 min-h-12 px-1.5 py-2 border-3 border-charcoal text-[10px] sm:text-xs font-black leading-tight flex items-center justify-center text-center transition-all ${
                      !available
                        ? "bg-neutral-200 text-neutral-500 line-through cursor-not-allowed shadow-none"
                        : "cursor-pointer " + (
                      selectedSize === size 
                        ? "bg-cherry text-charcoal translate-x-0.5 translate-y-0.5 shadow-[2px_2px_0px_0px_#141414]" 
                        : "bg-white text-charcoal hover:bg-cherry/30 shadow-[4px_4px_0px_0px_#141414] active:shadow-none"
                        )
                    }`}
                  >
                    {size}
                  </button>
                })}
              </div>
            </div>
            
            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedAvailable}
                className="btn-brutal flex-grow text-xl py-5 hover:bg-sky-blue transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedAvailable ? "Add to Cart" : "Size Unavailable"}
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                aria-label="Save to wishlist"
                className={`w-20 h-20 border-3 border-charcoal flex items-center justify-center transition-colors shadow-[4px_4px_0px_0px_#141414] active:shadow-none cursor-pointer ${
                  isWishlisted(product.id) ? "bg-cherry text-charcoal" : "bg-white hover:bg-cherry/40"
                }`}
              >
                <Heart className={`w-7 h-7 ${isWishlisted(product.id) ? "fill-charcoal text-charcoal" : "text-charcoal"}`} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-5 pt-8 border-t-3 border-dashed border-charcoal/20">
            <div className="p-3 sm:p-5 border-3 border-charcoal bg-[#FFF2F5] shadow-[3px_3px_0px_0px_#FFB7C5]">
              <Truck className="w-5 h-5 mb-2" aria-hidden="true" />
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wide sm:tracking-widest mb-1 text-charcoal">Free U.S. Shipping</p>
              <p className="text-[10px] sm:text-xs leading-snug text-charcoal/70 font-semibold">Every U.S. order, no minimum.</p>
            </div>
            <div className="p-3 sm:p-5 border-3 border-charcoal bg-[#EEF8FD] shadow-[3px_3px_0px_0px_#89CFF0]">
              <ShieldCheck className="w-5 h-5 mb-2" aria-hidden="true" />
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wide sm:tracking-widest mb-1 text-charcoal">Secure Checkout</p>
              <p className="text-[10px] sm:text-xs leading-snug text-charcoal/70 font-semibold">Your payment details stay protected.</p>
            </div>
            <div className="p-3 sm:p-5 border-3 border-charcoal bg-white shadow-[3px_3px_0px_0px_#141414]">
              <PackageCheck className="w-5 h-5 mb-2" aria-hidden="true" />
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wide sm:tracking-widest mb-1 text-charcoal">Quality Prints</p>
              <p className="text-[10px] sm:text-xs leading-snug text-charcoal/70 font-semibold">Carefully printed and packed for you.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
