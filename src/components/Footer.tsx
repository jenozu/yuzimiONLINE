import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white pt-16 pb-10 mt-24 border-t-4 border-cherry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-cherry text-charcoal border-2 border-white flex items-center justify-center font-black text-xs">桜</span>
              <h3 className="text-3xl font-black tracking-tighter">
                <span className="lowercase">yuzimi</span><span className="text-cherry uppercase">ONLINE</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
              Anime-inspired art prints built around cherry blossom pinks, crisp sky blues, and bold graphic composition.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-cherry">Shop</h4>
            <ul className="space-y-3.5 text-sm font-black uppercase tracking-wider">
              <li><Link to="/collections" className="hover:text-cherry transition-colors block">Art Prints</Link></li>
              <li><Link to="/support?tab=shipping" className="hover:text-cherry transition-colors block">Shipping</Link></li>
              <li><Link to="/support?tab=returns" className="hover:text-cherry transition-colors block">Returns & Replacements</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-cherry">Help</h4>
            <ul className="space-y-3.5 text-sm font-black uppercase tracking-wider">
              <li><Link to="/support?tab=faq" className="hover:text-cherry transition-colors block">FAQ</Link></li>
              <li><Link to="/support?tab=contact" className="hover:text-cherry transition-colors block">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-cherry transition-colors block">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-cherry transition-colors block">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            © 2026 <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span>
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Art prints // Collection 001</p>
        </div>
      </div>
    </footer>
  );
}
