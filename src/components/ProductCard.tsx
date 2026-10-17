import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "../types";
export interface ProductCardProps {product:Product;index?:number;key?:string|number}
export function ProductCard({product,index=0}:ProductCardProps) {
 const reduced=useReducedMotion();
 return <motion.article initial={reduced?false:{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.55,delay:Math.min(index*.06,.24)}} className="editorial-grid-card group min-w-0">
 <Link to={"/product/"+product.id} className="block" aria-label={"View "+product.name}>
  <div className="editorial-image-wrap aspect-[4/5] bg-cherry-light group-hover:bg-sky-blue/20 p-[8%] relative transition-colors duration-500">
   <span className="absolute top-4 left-4 editorial-eyebrow z-10">Art print / 00{index+1}</span>
   <div className="bg-white p-[5%] shadow-[0_14px_30px_rgba(20,20,20,.12)] w-full h-full overflow-hidden">{product.image?<img src={product.image} alt={product.name} loading="lazy" className="object-contain w-full h-full"/>:<span className="h-full grid place-items-center font-semibold text-sm">Artwork unavailable</span>}</div>
   <span aria-hidden className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-charcoal text-white group-hover:bg-sky-blue group-hover:text-charcoal grid place-items-center transition-colors"><ArrowUpRight size={20}/></span>
  </div>
  <div className="editorial-rail mt-5"><div className="min-w-0"><span className="editorial-eyebrow text-charcoal/60">{product.category}</span><h3 className="font-black uppercase tracking-[-.05em] text-lg sm:text-xl leading-tight mt-1">{product.name}</h3></div><span className="text-sm font-black whitespace-nowrap">From USD {product.price.toFixed(2)}</span></div>
 </Link></motion.article>;
}
