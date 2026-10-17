import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ArrowRight, Ruler, Truck, ScanLine } from "lucide-react";
import { Hero } from "../components/Hero";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

export function Home(){
 const {products,loading,error}=useProducts();
 const featured=products[0];
 const reduced=useReducedMotion();
 return <div className="overflow-hidden">
  <Hero featured={featured}/>
  <div className="bg-charcoal text-white py-4 overflow-hidden"><div className="editorial-ticker flex gap-12 w-max font-black uppercase text-base sm:text-xl tracking-tight">{Array.from({length:8}).map((_,i)=><span key={i} className="flex gap-12 items-center">Art to live with <span className="text-cherry">✳</span> Pink skies, bold walls <span className="text-sky-blue">✳</span></span>)}</div></div>
  <section id="discover" className="editorial-shell py-22 lg:py-34">
   <div className="editorial-rail editorial-eyebrow"><span>The print edit</span><span>Collection 001 / Cherry blossoms</span></div>
   <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-10 lg:gap-24 mt-14">
    <motion.h2 initial={reduced?false:{opacity:0,y:34}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.7}} className="editorial-display text-[clamp(4.4rem,10vw,10.5rem)]">GOOD<br/>ART.<br/><span className="text-cherry-dark">GOOD</span><br/>ENERGY.</motion.h2>
    <div className="flex flex-col justify-end lg:pb-4"><p className="text-xl sm:text-2xl font-semibold leading-snug max-w-lg">The kind of artwork you stop to look at every single day. Cherry blossoms, electric skies and unapologetic colour, in print.</p><div className="border-t border-charcoal/25 my-10"/><div className="flex items-center justify-between flex-wrap gap-6"><span className="editorial-eyebrow max-w-38">Made for your space. Eight dimensions.</span><Link to="/collections" className="editorial-button">Shop the edit <ArrowUpRight size={18}/></Link></div></div>
   </div>
  </section>
  {featured?.image&&<section className="bg-sky-blue py-20 lg:py-30"><div className="editorial-shell grid lg:grid-cols-2 items-center gap-12 lg:gap-24">
   <div className="relative"><motion.div initial={reduced?false:{rotate:-7,scale:.92}} whileInView={{rotate:-3,scale:1}} viewport={{once:true}} transition={{duration:.9}} className="bg-white editorial-paper aspect-[3/4] max-w-[470px] w-[76%] mx-auto p-[5%] pb-[11%]"><img src={featured.image} alt={featured.name} className="object-contain w-full h-full"/></motion.div><span className="absolute right-0 bottom-0 bg-cherry p-4 editorial-eyebrow rotate-6">Featured print / 001</span></div>
   <div><p className="editorial-eyebrow mb-8">The feature / one to live with</p><h2 className="editorial-display text-[clamp(3.5rem,7.5vw,8rem)] break-words">{featured.name}</h2><p className="mt-8 text-lg max-w-md leading-relaxed">{featured.description}</p><div className="editorial-rail mt-10"><span className="font-black uppercase">From USD {featured.price.toFixed(2)}</span><Link to={"/product/"+featured.id} className="editorial-button">Discover print <ArrowRight size={18}/></Link></div></div>
  </div></section>}
  <section className="editorial-shell py-22 lg:py-32">
   <div className="flex flex-wrap justify-between items-end gap-8 mb-14"><div><p className="editorial-eyebrow mb-5">All available artwork</p><h2 className="editorial-display text-[clamp(4rem,9vw,9rem)]">THE PRINT<br/><span className="text-cherry-dark">COLLECTION.</span></h2></div><Link to="/collections" className="editorial-eyebrow flex items-center gap-2 border-b border-charcoal pb-2 hover:gap-4 transition-all">Explore all <ArrowUpRight size={16}/></Link></div>
   {loading&&<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" aria-live="polite">{[0,1,2].map(i=><div key={i} className="aspect-[4/5] bg-cherry-soft animate-pulse"/>)}</div>}
   {error&&<p role="alert" className="bg-white border border-charcoal p-8">Unable to load published art prints: {error}</p>}
   {!loading&&!error&&products.length===0&&<p className="bg-white border border-charcoal/25 text-center py-14 font-semibold">No published art prints are available right now.</p>}
   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-9 lg:gap-12">{products.slice(0,6).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div>
  </section>
  <section className="bg-charcoal text-white py-24 lg:py-32"><div className="editorial-shell"><div className="editorial-rail border-white/25 editorial-eyebrow"><span>Not another blank wall</span><span>The YUZIMI way</span></div><div className="grid lg:grid-cols-[1.2fr_.8fr] gap-12 items-end mt-12"><h2 className="editorial-display text-[clamp(4rem,10vw,10.5rem)]">YOUR WALL.<br/><span className="text-cherry">YOUR</span><br/><span className="text-sky-blue">WORLD.</span></h2><div className="lg:pb-5"><p className="text-xl font-medium leading-relaxed max-w-md mb-9">Start with a print. Give it space. Let the whole room feel different.</p><Link to="/collections" className="editorial-button !bg-white !text-charcoal hover:!bg-cherry">Find your piece <ArrowUpRight size={18}/></Link></div></div></div></section>
  <section className="editorial-shell py-18 lg:py-24 grid md:grid-cols-3 gap-10">{[{n:"01",icon:<ScanLine size={28}/>,title:"Made to order",desc:"Prints are made for your order, keeping the collection focused."},{n:"02",icon:<Ruler size={28}/>,title:"Eight print sizes",desc:"From a small accent to a statement piece. Choose what fits your wall."},{n:"03",icon:<Truck size={28}/>,title:"Free U.S. shipping",desc:"Standard shipping is free for orders shipped within the United States."}].map(item=><div key={item.n} className="border-t border-charcoal pt-6"><div className="flex items-start justify-between mb-10"><span className="editorial-eyebrow">{item.n} / print notes</span>{item.icon}</div><h3 className="font-black uppercase text-2xl tracking-tight mb-3">{item.title}</h3><p className="text-sm leading-relaxed max-w-sm">{item.desc}</p></div>)}</section>
 </div>
}
