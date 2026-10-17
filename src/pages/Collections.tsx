import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Search, ArrowDownUp, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
export function Collections(){
 const [search,setSearch]=useState("");
 const [sort,setSort]=useState("featured");
 const {products,loading,error}=useProducts();
 const results=useMemo(()=>products.filter(p=>[p.name,p.description,p.category].some(v=>(v||"").toLowerCase().includes(search.toLowerCase().trim()))).sort((a,b)=>sort==="low"?a.price-b.price:sort==="high"?b.price-a.price:sort==="az"?a.name.localeCompare(b.name):sort==="bestsellers"?Number(b.badge?.toLowerCase()==="bestseller")-Number(a.badge?.toLowerCase()==="bestseller"):0),[products,search,sort]);
 return <div className="pb-28">
  <header className="bg-sky-blue"><div className="editorial-shell pt-18 lg:pt-26 pb-20 relative overflow-hidden"><div className="flex justify-between gap-4 editorial-eyebrow mb-12"><span>Art prints / collection 001</span><span>Cherry blossoms</span></div><motion.h1 initial={{opacity:0,y:35}} animate={{opacity:1,y:0}} transition={{duration:.7}} className="editorial-display text-[clamp(4.5rem,12.5vw,13rem)] relative z-10">THE ART<br/><span className="text-white">OF THE</span><br/>EVERYDAY.</motion.h1><p className="mt-9 text-lg sm:text-xl max-w-lg lg:ml-auto font-semibold leading-snug relative z-10">A growing collection of anime-inspired art prints. Find the one that feels like you.</p><span className="absolute top-1/5 right-[-7%] w-[38%] aspect-square rounded-full border-[28px] border-cherry opacity-60 pointer-events-none" aria-hidden/></div></header>
  <div className="editorial-shell pt-14">
   <div className="flex flex-wrap lg:items-end justify-between gap-7 border-b border-charcoal pb-7"><div><p className="editorial-eyebrow mb-2">Explore what is available</p><h2 className="font-black text-3xl sm:text-4xl tracking-tight uppercase">{loading?"Loading prints":results.length+" art print"+(results.length===1?"":"s")}</h2></div><div className="flex flex-wrap gap-3 w-full lg:w-auto"><label className="relative flex-1 min-w-[190px]"><span className="sr-only">Search artwork</span><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2"/><input className="editorial-input !pl-11" value={search} onChange={e=>setSearch(e.target.value)} type="search" placeholder="Search prints"/></label><label className="relative min-w-[220px]"><span className="sr-only">Sort artwork</span><ArrowDownUp size={17} className="absolute left-4 top-1/2 -translate-y-1/2"/><select className="editorial-input !pl-11" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="bestsellers">Bestsellers</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="az">Title: A to Z</option></select></label></div></div>
   {loading&&<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 py-14">{[0,1,2].map(i=><div key={i} className="bg-cherry-soft aspect-[4/5] animate-pulse"/>)}</div>}
   {error&&<p role="alert" className="p-8 bg-white border border-charcoal mt-9">Catalog is unavailable: {error}</p>}
   {!loading&&!error&&results.length===0&&<div className="bg-white text-center border border-charcoal/20 mt-12 p-14 space-y-5"><h3 className="font-black uppercase text-3xl">{search?"No matching artwork":"Gallery coming soon"}</h3><p>{search?"Try another title or clear your search.":"No published art prints are currently available."}</p>{search&&<button className="editorial-button" onClick={()=>setSearch("")}>Clear search <X size={15}/></button>}</div>}
   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-9 lg:gap-12 py-14">{!loading&&!error&&results.map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div>
   <div className="editorial-rail editorial-eyebrow"><span>End of collection 001</span><a href="#top" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:"smooth"})}} className="flex items-center gap-2">Back to top <ArrowUpRight size={17}/></a></div>
  </div>
 </div>
}
