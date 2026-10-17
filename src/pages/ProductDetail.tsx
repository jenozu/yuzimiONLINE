import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import { ArrowLeft,ArrowUpRight,ChevronLeft,ChevronRight,Expand,Plus,Share2,Truck,X } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { PrintSizeVisualizer } from "../components/PrintSizeVisualizer";
import { ProductCard } from "../components/ProductCard";
const PRINT_SIZES=["8 × 10 in","11 × 14 in","12 × 18 in","16 × 20 in","18 × 24 in","20 × 30 in","24 × 32 in","24 × 36 in"] as const;
export function ProductDetail(){
 const {id}=useParams();
 const {products,loading,error}=useProducts();
 const product=products.find(p=>p.id===id);
 const {addToCart,openCart,showToast}=useCart();
 const [size,setSize]=useState<string>(PRINT_SIZES[0]);
 const [active,setActive]=useState(0);
 const [zoom,setZoom]=useState(false);
 const reduced=useReducedMotion();
 useEffect(()=>{setSize(PRINT_SIZES[0]);setActive(0);setZoom(false)},[id]);
 useEffect(()=>{if(!zoom)return;const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setZoom(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[zoom]);
 if(loading)return <div className="editorial-shell py-28 font-black uppercase" aria-live="polite">Preparing artwork...</div>;
 if(error)return <div className="editorial-shell py-24" role="alert">Could not load artwork: {error}</div>;
 if(!product)return <div className="editorial-shell py-24"><h1 className="editorial-display text-5xl mb-8">Artwork not found</h1><Link to="/collections" className="editorial-button">Back to prints</Link></div>;
 const gallery=Array.from(new Set([product.image,...(product.additionalImages||[])].filter(Boolean)));
 const image=gallery[Math.min(active,gallery.length-1)]||product.image;
 const variant=product.variants?.find(v=>v.size===size);
 const price=variant?.price;
 const change=(delta:number)=>setActive(v=>(v+delta+gallery.length)%gallery.length);
 const add=()=>{if(price===undefined)return;addToCart({...product,price},size);openCart()};
 const share=async()=>{try{await navigator.clipboard.writeText(window.location.href);showToast("Artwork link copied")}catch{showToast("Unable to copy link")}};
 return <div className="pb-26">
  <div className="editorial-shell pt-8 pb-8 flex items-center justify-between gap-3"><Link to="/collections" className="editorial-eyebrow inline-flex items-center gap-2 hover:underline"><ArrowLeft size={16}/> Back to collection</Link><button onClick={share} className="editorial-eyebrow inline-flex items-center gap-2 hover:underline"><Share2 size={16}/> Share art</button></div>
  <div className="editorial-shell grid lg:grid-cols-[minmax(0,1.2fr)_minmax(350px,.8fr)] gap-10 xl:gap-20">
   <div className="min-w-0">
    <div className="relative bg-cherry-light aspect-[4/5] p-[8%] sm:p-[10%]">
      <AnimatePresence mode="wait"><motion.div key={image} initial={reduced?false:{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.3}} className="bg-white editorial-paper w-full h-full p-[4%]"><img src={image} alt={product.name} className="w-full h-full object-contain"/></motion.div></AnimatePresence>
      <button onClick={()=>setZoom(true)} className="absolute top-5 right-5 bg-white border border-charcoal p-3 hover:bg-sky-blue transition-colors" aria-label="Enlarge artwork"><Expand size={18}/></button>
      {gallery.length>1&&<div className="absolute bottom-5 right-5 flex gap-2"><button onClick={()=>change(-1)} className="bg-white p-3 border border-charcoal" aria-label="Previous image"><ChevronLeft size={19}/></button><button onClick={()=>change(1)} className="bg-white p-3 border border-charcoal" aria-label="Next image"><ChevronRight size={19}/></button></div>}
      <span className="absolute bottom-5 left-5 editorial-eyebrow">{String(active+1).padStart(2,"0")} / {String(gallery.length).padStart(2,"0")}</span>
    </div>
    {gallery.length>1&&<div className="flex gap-3 mt-4 overflow-x-auto pb-3">{gallery.map((src,i)=><button key={i} onClick={()=>setActive(i)} aria-label={"View artwork image "+(i+1)} aria-pressed={i===active} className={["shrink-0 bg-white p-1.5 border-2 w-22 h-26 sm:w-26 sm:h-30 transition-opacity",i===active?"border-charcoal":"border-transparent opacity-60 hover:opacity-100"].join(" ")}><img src={src} alt="" className="w-full h-full object-contain"/></button>)}</div>}
   </div>
   <div className="lg:sticky lg:top-30 self-start">
    <p className="editorial-eyebrow mb-5">{product.category} / the artwork</p>
    <h1 className="editorial-display text-[clamp(3.8rem,6vw,7.5rem)] break-words">{product.name}</h1>
    <div className="editorial-rail mt-8"><span className="editorial-eyebrow">Selected print / USD</span><span aria-live="polite" className="text-2xl sm:text-3xl font-black">{price===undefined?"Unavailable":"$"+price.toFixed(2)}</span></div>
    <p className="text-base sm:text-lg leading-relaxed font-medium mt-7 whitespace-pre-line">{product.description}</p>
    <div className="border-t border-charcoal/25 mt-9 pt-7">
      <div className="flex justify-between gap-3 items-end mb-4"><h2 className="editorial-eyebrow">01 / Choose print dimensions</h2><span className="editorial-eyebrow text-charcoal/55">{size}</span></div>
      <div className="grid grid-cols-4 gap-2">{PRINT_SIZES.map(s=>{const v=product.variants?.find(item=>item.size===s);return <button key={s} onClick={()=>setSize(s)} disabled={!v} aria-pressed={size===s} aria-label={s+(v?" for $"+v.price.toFixed(2):" unavailable")} className={["min-h-16 sm:min-h-18 p-1 border text-[10px] sm:text-xs font-black leading-tight transition-colors",size===s?"bg-cherry border-charcoal":"bg-white border-charcoal/25 hover:border-charcoal",!v?"opacity-40 cursor-not-allowed":""].join(" ")}>{s.replace(" in","")}<span className="block font-medium mt-1">inches</span></button>})}</div>
      <p className="text-xs font-medium text-charcoal/65 mt-4">Prices update with your selected size. Artwork is sold as a print.</p>
      <button onClick={add} disabled={price===undefined} className="editorial-button w-full mt-7 !py-5 disabled:opacity-40 disabled:cursor-not-allowed">Add to cart — {price===undefined?"Unavailable":"$"+price.toFixed(2)} <Plus size={19}/></button>
      <div className="flex items-center justify-between gap-3 border-b border-charcoal/20 py-5"><span className="flex items-center gap-2 editorial-eyebrow"><Truck size={17}/> Standard shipping</span><Link to="/support?tab=shipping" className="text-xs font-semibold underline underline-offset-4">View shipping policy</Link></div>
    </div>
    <div className="mt-8"><PrintSizeVisualizer size={size} image={product.image} name={product.name}/></div>
   </div>
  </div>
  {products.length>1&&<section className="editorial-shell mt-28"><div className="flex justify-between items-end gap-4 mb-12"><div><p className="editorial-eyebrow mb-4">Continue exploring</p><h2 className="editorial-display text-[clamp(3.5rem,7vw,7rem)]">MORE TO LOVE.</h2></div><Link to="/collections" className="editorial-eyebrow flex gap-2 items-center">All prints <ArrowUpRight size={16}/></Link></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-9">{products.filter(p=>p.id!==id).slice(0,3).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div></section>}
  <AnimatePresence>{zoom&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} role="dialog" aria-modal="true" aria-label="Enlarged artwork" className="fixed inset-0 z-[100] bg-charcoal/95 flex flex-col p-4 sm:p-10"><div className="flex items-center justify-between text-white pb-4 gap-5"><span className="editorial-eyebrow">{product.name}</span><button onClick={()=>setZoom(false)} aria-label="Close enlarged artwork" className="p-3 border border-white/30"><X size={23}/></button></div><img src={image} alt={product.name} className="flex-1 w-full min-h-0 object-contain"/></motion.div>}</AnimatePresence>
 </div>;
}
