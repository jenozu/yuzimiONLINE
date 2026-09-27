import { useState, useMemo } from "react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { motion } from "motion/react";
import { Search, ArrowUpDown } from "lucide-react";

export function Collections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const { products, loading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }).sort((a, b) => {
      if (sortBy === "bestsellers") {
        const aIsBestseller = a.badge?.toLowerCase() === "bestseller" ? 1 : 0;
        const bIsBestseller = b.badge?.toLowerCase() === "bestseller" ? 1 : 0;
        return bIsBestseller - aIsBestseller;
      }
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0; // featured
    });
  }, [products, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-brutal bg-cherry p-8 md:p-14 border-4 border-charcoal shadow-[8px_8px_0px_0px_#141414] space-y-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-brutal bg-white text-charcoal font-black">
            ART PRINT ARCHIVE
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-charcoal/70">
            <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> // COLLECTION 001
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-charcoal leading-[0.88]">
          Collection 001 — <span className="bg-white px-3 py-0.5 border-3 border-charcoal inline-block shadow-[4px_4px_0px_0px_#141414]">Cherry Blossoms</span>
        </h1>

        <p className="text-sm md:text-base font-bold text-charcoal/80 max-w-xl leading-relaxed">
          An art-print series inspired by the fleeting beauty and quiet strength of sakura season. Created to bring the soft glow of spring into your space all year round.
        </p>
      </motion.div>

      {/* Control Bar: Search and Sort */}
      <div className="space-y-6">
        <div className="flex justify-end border-b-4 border-charcoal pb-6">
          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="FILTER SPECS..."
                className="w-full bg-white border-3 border-charcoal px-4 py-2 text-xs font-black uppercase placeholder:text-charcoal/40 outline-none shadow-[3px_3px_0px_0px_#141414] focus:border-cherry"
              />
              <Search className="w-4 h-4 text-charcoal/50 absolute right-3 top-2.5" />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border-3 border-charcoal px-4 py-2 pr-9 text-xs font-black uppercase outline-none shadow-[3px_3px_0px_0px_#141414] cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="bestsellers">Bestsellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-charcoal absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-xs font-black uppercase tracking-wider text-charcoal/60">
          <span>Displaying {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center font-black uppercase tracking-widest">Loading live catalog…</div>
      ) : error ? (
        <div role="alert" className="border-3 border-charcoal bg-red-100 p-8 font-bold">{error}</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 p-8 border-4 border-dashed border-charcoal/30 bg-white space-y-4">
          <p className="text-3xl font-black uppercase tracking-tight text-charcoal">
            No matching units found
          </p>
          <p className="text-sm font-semibold text-charcoal/60 max-w-sm mx-auto">
            No art print matches "{searchQuery}". Try a different title or clear your search.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="btn-brutal text-xs py-3 px-6"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}

