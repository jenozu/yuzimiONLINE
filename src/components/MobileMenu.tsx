import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight,ShoppingBag,X } from "lucide-react";
import { useCart } from "../context/CartContext";
export function MobileMenu({isOpen,onClose}:{isOpen:boolean;onClose:()=>void}){
 const {totalCount,openCart}=useCart();
 const reduced=useReducedMotion();
 return <AnimatePresence>{isOpen&&<div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
   <motion.button aria-label="Close navigation" className="absolute inset-0 bg-charcoal/70 w-full h-full" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/>
   <motion.div initial={reduced?false:{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",stiffness:260,damping:30}} className="absolute right-0 top-0 h-full w-[88%] max-w-md bg-cherry flex flex-col p-7 sm:p-10">
    <div className="flex justify-between items-center mb-16"><span className="font-black text-2xl tracking-[-.07em]">yuzimiONLINE</span><button onClick={onClose} aria-label="Close menu" className="w-11 h-11 bg-white grid place-items-center"><X size={23}/></button></div>
    <p className="editorial-eyebrow mb-7">Navigate / 001</p>
    <nav className="flex-1 space-y-7">{[{path:"/",label:"Home"},{path:"/collections",label:"Art prints"},{path:"/support",label:"Support"}].map((p,i)=><Link key={p.path} to={p.path} onClick={onClose} className="flex justify-between items-end gap-4 border-b border-charcoal pb-5"><span className="editorial-display text-[clamp(2.9rem,12vw,5rem)]">{p.label}</span><span className="flex items-center gap-2 editoral-eyebrow"><span className="text-xs font-black">0{i+1}</span><ArrowUpRight size={22}/></span></Link>)}</nav>
    <button onClick={()=>{onClose();openCart()}} className="editorial-button w-full"><ShoppingBag size={18}/> Open bag ({totalCount}) <ArrowUpRight size={18}/></button>
    <p className="editorial-eyebrow mt-7">Art to live with / Collection 001</p>
   </motion.div>
 </div>}</AnimatePresence>
}
