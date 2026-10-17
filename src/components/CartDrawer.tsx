import { useEffect } from "react";
import { motion,AnimatePresence,useReducedMotion } from "motion/react";
import { X,Trash2,Plus,Minus,ArrowUpRight,ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
export function CartDrawer(){
 const {items,isOpen,closeCart,removeFromCart,updateQuantity,subtotal,totalCount}=useCart();
 const reduced=useReducedMotion();
 useEffect(()=>{if(!isOpen)return;const escape=(e:KeyboardEvent)=>{if(e.key==="Escape")closeCart()};window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape)},[isOpen,closeCart]);
 return <AnimatePresence>{isOpen&&<div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping bag">
  <motion.button aria-label="Close shopping bag" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={closeCart} className="absolute inset-0 bg-charcoal/65 w-full h-full"/>
  <motion.section initial={reduced?false:{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",stiffness:250,damping:29}} className="absolute right-0 top-0 w-full max-w-[540px] bg-canvas h-full flex flex-col shadow-2xl">
    <div className="bg-cherry px-6 sm:px-9 pt-8 pb-7 border-b border-charcoal">
     <div className="flex justify-between items-start gap-4"><div><p className="editorial-eyebrow mb-4">Your selection / {totalCount.toString().padStart(2,"0")} pieces</p><h2 className="editorial-display text-[clamp(3.3rem,8vw,5.3rem)]">THE BAG.</h2></div><button onClick={closeCart} aria-label="Close shopping bag" className="w-12 h-12 bg-white border border-charcoal grid place-items-center"><X size={22}/></button></div>
    </div>
    <div className="flex-1 overflow-y-auto px-6 sm:px-9 py-8">
     {items.length===0?<div className="flex flex-col items-center justify-center text-center gap-6 h-full min-h-72"><div className="bg-sky-blue w-20 h-20 rounded-full grid place-items-center"><ShoppingBag size={34}/></div><h3 className="font-black uppercase text-3xl tracking-tight">Room for something beautiful.</h3><p className="text-sm max-w-xs">Your bag is empty. Discover a print worth making space for.</p><Link to="/collections" onClick={closeCart} className="editorial-button">Explore artwork <ArrowUpRight size={18}/></Link></div>:
      <div className="space-y-6">{items.map(item=><motion.article layout key={item.product.id+item.size} className="flex gap-5 pb-6 border-b border-charcoal/20">
        <Link onClick={closeCart} to={"/product/"+item.product.id} className="shrink-0 bg-cherry-light w-27 h-36 p-3"><img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain"/></Link>
        <div className="flex-1 min-w-0"><div className="flex gap-2 justify-between items-start"><div><p className="editorial-eyebrow text-charcoal/55">{item.product.category}</p><Link onClick={closeCart} to={"/product/"+item.product.id} className="font-black text-lg tracking-tight uppercase leading-tight block mt-1 hover:underline">{item.product.name}</Link></div><button onClick={()=>removeFromCart(item.product.id,item.size)} aria-label={"Remove "+item.product.name} className="p-1 hover:text-cherry-dark"><Trash2 size={18}/></button></div>
        <p className="text-xs font-semibold mt-3">Print size / {item.size}</p>
        <div className="flex items-end justify-between gap-2 mt-4"><div className="flex items-center border border-charcoal"><button className="w-9 h-9 grid place-items-center hover:bg-cherry" onClick={()=>updateQuantity(item.product.id,item.size,-1)} aria-label="Decrease quantity"><Minus size={15}/></button><span className="text-sm font-black px-2" aria-live="polite">{item.quantity}</span><button className="w-9 h-9 grid place-items-center hover:bg-sky-blue" onClick={()=>updateQuantity(item.product.id,item.size,1)} aria-label="Increase quantity"><Plus size={15}/></button></div><span className="font-black">USD {(item.product.price*item.quantity).toFixed(2)}</span></div>
        </div>
      </motion.article>)}</div>}
    </div>
    {items.length>0&&<div className="bg-white border-t border-charcoal px-6 sm:px-9 py-7 space-y-5">
     <div className="flex justify-between gap-4 items-end"><div><span className="editorial-eyebrow block mb-2">Subtotal / {totalCount} items</span><span className="text-xs text-charcoal/60">Shipping calculated at checkout</span></div><strong className="text-3xl tracking-tight">USD {subtotal.toFixed(2)}</strong></div>
     <Link to="/checkout" onClick={closeCart} className="editorial-button w-full !py-5">Continue to checkout <ArrowUpRight size={20}/></Link>
     <button onClick={closeCart} className="text-xs font-black uppercase tracking-widest w-full py-2 hover:underline">Keep browsing</button>
     {import.meta.env.VITE_EDITORIAL_PREVIEW==="true"&&<p className="text-center text-[11px] font-semibold">Preview only — payments are disabled.</p>}
    </div>}
  </motion.section>
 </div>}</AnimatePresence>;
}
