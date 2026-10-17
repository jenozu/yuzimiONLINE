import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export function Footer(){
 return <footer className="bg-cherry border-t border-charcoal pt-20 pb-8 mt-0 overflow-hidden">
  <div className="editorial-shell">
   <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-14 mb-18">
    <div><p className="editorial-eyebrow mb-7">The end? More like the beginning.</p><h2 className="editorial-display text-[clamp(5rem,11vw,12rem)]">STAY<br/><span className="text-white">INSPIRED.</span></h2><p className="mt-8 text-lg font-semibold max-w-md">Prints for people who want their walls to say something.</p></div>
    <div className="grid sm:grid-cols-2 gap-10 lg:pt-16">
     <div><p className="editorial-eyebrow mb-6">Explore</p><div className="space-y-4 font-black uppercase text-sm"><Link to="/collections" className="flex items-center gap-2 hover:underline">Art prints <ArrowUpRight size={15}/></Link><Link to="/support?tab=shipping" className="block hover:underline">Shipping</Link><Link to="/support?tab=returns" className="block hover:underline">Returns</Link><Link to="/support?tab=faq" className="block hover:underline">FAQ</Link></div></div>
     <div><p className="editorial-eyebrow mb-6">Connect</p><div className="space-y-4 font-black uppercase text-sm"><a href="https://www.pinterest.com/yuzimiONLINE/" target="_blank" rel="noopener noreferrer" className="block hover:underline">Pinterest ↗</a><a href="https://twitter.com/yuzimiONLINE" target="_blank" rel="noopener noreferrer" className="block hover:underline">Twitter ↗</a><a href="https://yuzimiONLINE.tumblr.com/" target="_blank" rel="noopener noreferrer" className="block hover:underline">Tumblr ↗</a><Link to="/support?tab=contact" className="block hover:underline">Contact</Link></div></div>
    </div>
   </div>
   <Link to="/" className="font-black text-[clamp(3rem,11vw,12rem)] uppercase tracking-[-.09em] leading-none block border-b border-charcoal pb-8 whitespace-nowrap">yuzimi<span className="text-white">ONLINE</span>✳</Link>
   <div className="flex flex-wrap justify-between gap-5 items-center pt-7 text-[11px] font-black uppercase tracking-widest"><span>© 2026 yuzimiONLINE / original art prints</span><div className="flex gap-5"><Link to="/privacy" className="hover:underline">Privacy</Link><Link to="/terms" className="hover:underline">Terms</Link></div><button className="hover:underline" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>Back to top ↑</button></div>
  </div>
 </footer>;
}
