import { useState, type FormEvent } from "react";
import { Search, ShoppingCart, Menu, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const { totalCount, openCart, searchQuery, setSearchQuery } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    navigate(`/collections`);
  };

  return (
    <header className="sticky top-0 z-40">
      {/* Top Sakura Ribbon */}
      <div className="bg-cherry border-b-2 border-charcoal py-1.5 px-4 text-center text-[11px] font-black uppercase tracking-widest text-charcoal flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 fill-charcoal" />
        <span>Spring Sakura Drop // <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> Primary Pink Collection Live // Free Shipping on All Orders (USA Only)</span>
        <Sparkles className="w-3.5 h-3.5 fill-charcoal" />
      </div>

      <nav className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-3">
        <div className="nav-brutal !px-3 sm:!px-8 !py-2 sm:!py-3 flex justify-between items-center min-h-16 sm:h-20 bg-white gap-2">
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            <Link to="/" className="text-lg sm:text-3xl font-black tracking-tighter not-italic flex items-center gap-1.5 sm:gap-2.5 group min-w-0">
              <span className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-cherry border-2 border-charcoal flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#141414] group-hover:bg-sky-blue transition-colors">
                桜
              </span>
              <span className="not-italic whitespace-nowrap">
                <span className="lowercase">yuzimi</span><span className="text-cherry-dark uppercase not-italic">ONLINE</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/collections" 
                className="text-sm font-black uppercase tracking-tight hover:text-cherry-dark hover:underline underline-offset-4 decoration-2 decoration-cherry transition-all"
              >
                Collections
              </Link>
              <Link 
                to="/archive" 
                className="text-sm font-black uppercase tracking-tight hover:text-cherry-dark hover:underline underline-offset-4 decoration-2 decoration-cherry transition-all"
              >
                Archive
              </Link>
              <Link 
                to="/lookbook" 
                className="text-sm font-black uppercase tracking-tight hover:text-cherry-dark hover:underline underline-offset-4 decoration-2 decoration-cherry transition-all"
              >
                Lookbook
              </Link>
              <Link 
                to="/support" 
                className="text-sm font-black uppercase tracking-tight hover:text-cherry-dark hover:underline underline-offset-4 decoration-2 decoration-cherry transition-all"
              >
                Support
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <form 
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex items-center border-2 border-charcoal bg-white h-10 px-3 gap-2 shadow-[2px_2px_0px_0px_#FFB7C5] focus-within:shadow-[3px_3px_0px_0px_#141414] transition-all"
            >
              <Search className="w-4 h-4 text-charcoal/60 shrink-0" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="SEARCH SPECS..."
                className="bg-transparent border-none outline-none text-xs font-black w-24 focus:w-36 transition-all uppercase placeholder:text-charcoal/40"
              />
            </form>

            <button
              onClick={openCart}
              aria-label="Open cart"
              className="bg-cherry hover:bg-sky-blue px-2.5 sm:px-4 h-11 border-2 border-charcoal font-black text-[10px] sm:text-xs uppercase whitespace-nowrap shadow-[3px_3px_0px_0px_#141414] active:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 text-charcoal cursor-pointer"
            >
              <ShoppingCart className="hidden sm:block w-3.5 h-3.5" />
              <span>Cart ({totalCount.toString().padStart(2, "0")})</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="w-11 h-11 shrink-0 md:hidden border-2 border-charcoal bg-white shadow-[2px_2px_0px_0px_#FFB7C5] active:translate-x-0.5 active:translate-y-0.5 grid place-items-center"
            >
              <Menu className="w-5 h-5 text-charcoal" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
