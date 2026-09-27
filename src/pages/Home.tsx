import { Link } from "react-router-dom";
import { Hero } from "../components/Hero";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { Sparkles, Frame, Truck, ArrowRight } from "lucide-react";

export function Home() {
  const { products, loading, error } = useProducts();

  return (
    <div className="space-y-24 pb-24">
      <Hero />
      
      {/* Featured Collection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b-4 border-charcoal pb-8">
          <div className="space-y-2">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-charcoal">
              Collection 001 — <span className="bg-cherry text-charcoal px-3 py-0.5 border-3 border-charcoal inline-block shadow-[4px_4px_0px_0px_#141414]">Cherry Blossoms</span>
            </h2>
            <p className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-charcoal/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cherry rounded-full inline-block border border-charcoal"></span>
              Anime-inspired art prints made to order in eight sizes
            </p>
          </div>
        </div>
        
        {loading && <p className="mb-8 text-sm font-black uppercase tracking-widest">Loading live catalog…</p>}
        {error && <p role="alert" className="mb-8 border-3 border-charcoal bg-red-100 p-4 font-bold">{error}</p>}
        {!loading && !error && products.length === 0 && <p className="mb-8 border-3 border-charcoal bg-white p-8 text-center font-black uppercase">The first collection is being prepared. Check back soon.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {products.map((product, idx) => (
            <div key={product.id}>
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>

        {/* View full collection button */}
        <div className="mt-16 text-center">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 btn-brutal text-sm py-4 px-8"
          >
            <span>View Complete Collection Index</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature Pillar Trio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FFF0F4] border-3 border-charcoal p-8 shadow-[6px_6px_0px_0px_#FFB7C5] space-y-4">
            <div className="w-12 h-12 bg-cherry border-2 border-charcoal flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#141414]">
              <Sparkles className="w-6 h-6 text-charcoal" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-charcoal">
              01 // Made to Order
            </h3>
            <p className="text-sm font-medium leading-relaxed text-charcoal/80">
              Each print is produced for your order, with 2–5 business days reserved for careful processing before shipment.
            </p>
          </div>

          <div className="bg-[#EFF8FD] border-3 border-charcoal p-8 shadow-[6px_6px_0px_0px_#89CFF0] space-y-4">
            <div className="w-12 h-12 bg-sky-blue border-2 border-charcoal flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#141414]">
              <Frame className="w-6 h-6 text-charcoal" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-charcoal">
              02 // Eight Print Sizes
            </h3>
            <p className="text-sm font-medium leading-relaxed text-charcoal/80">
              Choose from eight dimensions, from 8 × 10 through 24 × 36 inches, with pricing shown for every size.
            </p>
          </div>

          <div className="bg-white border-3 border-charcoal p-8 shadow-[6px_6px_0px_0px_#141414] space-y-4">
            <div className="w-12 h-12 bg-white border-2 border-charcoal flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#FFB7C5]">
              <Truck className="w-6 h-6 text-charcoal" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-charcoal">
              03 // Protected Shipping
            </h3>
            <p className="text-sm font-medium leading-relaxed text-charcoal/80">
              Prints ship in protective packaging selected for their size. Every United States order ships free.
            </p>
          </div>
        </div>
      </section>
      
      {/* Visual Break / Primary Pink Marquee Section */}
      <section className="bg-cherry border-y-4 border-charcoal py-20 sm:py-28 overflow-hidden relative shadow-brutal">
        <div className="absolute inset-0 flex items-center opacity-15 pointer-events-none select-none">
          <p className="text-[140px] sm:text-[200px] font-black whitespace-nowrap animate-marquee text-charcoal not-italic">
            <span className="lowercase">yuzimi</span>ONLINE // CHERRY BLOSSOMS // <span className="lowercase">yuzimi</span>ONLINE // CHERRY BLOSSOMS //
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <span className="inline-block bg-white text-charcoal px-4 py-1 text-xs font-black uppercase tracking-widest border-2 border-charcoal shadow-[2px_2px_0px_0px_#141414]">
            Collection 001 // 2026 Edition
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-charcoal max-w-4xl mx-auto leading-[0.95]">
            Crafted for the cinematic everyday.
          </h2>
          <p className="text-base sm:text-lg font-bold max-w-lg mx-auto text-charcoal/85">
            Minimalist e-commerce for the cinematic soul. Soft cherry blossom pinks paired with crisp sky blues and stark brutalist frames.
          </p>
          <div>
            <Link 
              to="/archive"
              className="inline-block bg-sky-blue border-3 border-charcoal text-charcoal px-10 py-4 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#141414] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#141414] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm sm:text-base cursor-pointer"
            >
              Explore The Archive
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
