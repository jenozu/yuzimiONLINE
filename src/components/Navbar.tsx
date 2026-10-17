import React,{useState} from "react";
import { Link,NavLink,useNavigate } from "react-router-dom";
import { Search,ShoppingBag,Menu,ArrowUpRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { MobileMenu } from "./MobileMenu";
export function Navbar(){
 const {totalCount,openCart,searchQuery,setSearchQuery}=useCart();
 const [mobileOpen,setMobileOpen]=useState(false);
 const [search,setSearch]=useState(searchQuery);
 const navigate=useNavigate();
 const submit=(e:React.FormEvent)=>{e.preventDefault();setSearchQuery(search);navigate("/collections")};
 return <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-xl border-b border-charcoal">
  <div className="bg-sky-blue border-b border-charcoal/25 text-center py-1.5 px-3 editorial-eyebrow !tracking-[.08em]">COLLECTION 001 / CHERRY BLOSSOMS &nbsp; ✳ &nbsp; FREE STANDARD U.S. SHIPPING</div>
  <nav className="editorial-shell h-18 sm:h-23 flex items-center justify-between gap-4">
    <Link to="/" aria-label="YUZIMI homepage" className="flex items-center gap-2 shrink-0 group"><span className="w-9 h-9 rounded-full bg-cherry border border-charcoal flex items-center justify-center text-xl font-black group-hover:rotate-35 transition-transform">✳</span><span className="font-black tracking-[-.075em] text-xl sm:text-3xl whitespace-nowrap"><span className="lowercase">yuzimi</span><span className="uppercase text-cherry-dark">ONLINE</span></span></Link>
    <div className="hidden lg:flex gap-10 items-center"><NavLink to="/collections" className={({isActive})=>["editorial-eyebrow hover:text-cherry-dark transition-colors",isActive?"underline underline-offset-6":""].join(" ")}>Shop prints</NavLink><NavLink to="/support" className={({isActive})=>["editorial-eyebrow hover:text-cherry-dark transition-colors",isActive?"underline underline-offset-6":""].join(" ")}>Support</NavLink></div>
    <div className="flex items-center gap-2 sm:gap-5">
      <form onSubmit={submit} className="hidden md:flex items-center gap-2 border-b border-charcoal py-2"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search art" aria-label="Search artwork" className="outline-none bg-transparent text-xs font-semibold w-30 xl:w-42 placeholder:text-charcoal/50"/><button type="submit" aria-label="Submit search"><ArrowUpRight size={17}/></button></form>
      <button onClick={openCart} aria-label={"Open shopping bag with "+totalCount+" items"} className="bg-charcoal text-white flex items-center gap-2 py-3 px-3 sm:px-5 hover:bg-cherry hover:text-charcoal transition-colors"><ShoppingBag size={17}/><span className="text-xs font-black uppercase">Bag ({totalCount.toString().padStart(2,"0")})</span></button>
      <button onClick={()=>setMobileOpen(true)} aria-label="Open navigation menu" className="lg:hidden border border-charcoal w-11 h-11 flex items-center justify-center"><Menu size={21}/></button>
    </div>
  </nav>
  <MobileMenu isOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/>
 </header>;
}
