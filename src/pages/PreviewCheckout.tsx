import { useMemo,useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft,ArrowUpRight,CheckCircle2,ShieldOff } from "lucide-react";
import { useCart } from "../context/CartContext";
import { shippingCents } from "../../lib/checkout/shipping";

export function PreviewCheckout(){
 const {items,subtotal,totalCount}=useCart();
 const [country,setCountry]=useState("US");
 const [complete,setComplete]=useState(false);
 const shipping=useMemo(()=>{try{return shippingCents(country,totalCount)/100}catch{return 0}},[country,totalCount]);
 if(!items.length) return <div className="editorial-shell py-28 text-center"><p className="editorial-eyebrow mb-4">Editorial preview / simulated checkout</p><h1 className="editorial-display text-6xl mb-8">NOTHING<br/>IN THE BAG.</h1><Link to="/collections" className="editorial-button">Browse prints <ArrowUpRight size={18}/></Link></div>;
 return <div className="editorial-shell py-12 lg:py-22">
  <Link to="/collections" className="editorial-eyebrow inline-flex items-center gap-2 mb-12"><ArrowLeft size={16}/> Continue shopping</Link>
  <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 lg:gap-18">
   <div><p className="editorial-eyebrow mb-6">Checkout / interactive preview only</p><h1 className="editorial-display text-[clamp(4rem,7vw,8rem)] mb-10">THE FINAL<br/><span className="text-cherry-dark">DETAILS.</span></h1>
   <div className="bg-sky-light border border-charcoal p-5 flex gap-4 items-start"><ShieldOff size={22} className="shrink-0"/><div><h2 className="font-black uppercase tracking-tight">Payments disabled in preview</h2><p className="text-sm leading-relaxed mt-2">You can explore checkout totals and shipping destinations here. No customer information, real orders, charges or emails are created.</p></div></div>
   {complete?<div className="border border-charcoal bg-cherry-light p-9 mt-8"><CheckCircle2 size={32}/><h2 className="font-black text-2xl uppercase mt-4">Demo flow complete</h2><p className="mt-3">This was a simulated checkout. Nothing was submitted or paid.</p><button onClick={()=>setComplete(false)} className="editorial-button mt-6">Go back</button></div>:<div className="mt-10 space-y-5"><label className="block"><span className="editorial-eyebrow block mb-3">Shipping destination</span><select className="editorial-input bg-white" value={country} onChange={e=>setCountry(e.target.value)}><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="FR">France</option><option value="DE">Germany</option></select></label><p className="text-sm font-medium text-charcoal/65">Shipping is estimated with the existing store rate table; no shipping address is collected in this safe preview.</p><button onClick={()=>setComplete(true)} className="editorial-button w-full">Simulate checkout completion <ArrowUpRight size={19}/></button></div>}
   </div>
   <aside className="bg-white border border-charcoal/25 p-6 sm:p-10 self-start lg:sticky lg:top-32"><p className="editorial-eyebrow mb-8">Your selection / {totalCount} items</p><div className="space-y-6">{items.map(item=><div key={item.product.id+item.size} className="flex gap-4 items-start"><div className="bg-cherry-light p-2 w-23 h-28 shrink-0"><img src={item.product.image} alt={item.product.name} className="object-contain w-full h-full"/></div><div className="flex-1"><h3 className="font-black uppercase tracking-tight">{item.product.name}</h3><p className="text-xs mt-2">{item.size} / Quantity {item.quantity}</p><p className="font-black mt-3">USD {(item.product.price*item.quantity).toFixed(2)}</p></div></div>)}</div><div className="border-t border-charcoal/25 mt-10 pt-6 space-y-4"><div className="flex justify-between"><span>Subtotal</span><b>USD {subtotal.toFixed(2)}</b></div><div className="flex justify-between"><span>Shipping (estimate)</span><b>{shipping===0?"FREE":"USD "+shipping.toFixed(2)}</b></div><div className="border-t border-charcoal/20 pt-5 flex justify-between text-xl font-black"><span>Total</span><span>USD {(subtotal+shipping).toFixed(2)}</span></div></div></aside>
  </div>
 </div>;
}
