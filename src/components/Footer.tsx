import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white pt-20 pb-12 mt-24 border-t-4 border-cherry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-cherry text-charcoal border-2 border-white flex items-center justify-center font-black text-xs">
                桜
              </span>
              <h3 className="text-3xl font-black tracking-tighter not-italic">
                <span className="lowercase">yuzimi</span><span className="text-cherry uppercase not-italic">ONLINE</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs">
              Anime-inspired, made-to-order art prints in eight sizes. Collection 001 pairs cherry blossom pink with clear-sky blue and bold brutalist framing.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-cherry">Navigation</h4>
            <ul className="space-y-3.5 text-sm font-black uppercase tracking-wider">
              <li>
                <Link to="/collections" className="hover:text-cherry transition-colors block">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-cherry transition-colors block">
                  Cherry Blossoms
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className="hover:text-cherry transition-colors block">
                  Archive Lookbook
                </Link>
              </li>
              <li>
                <Link to="/archive" className="hover:text-cherry transition-colors block">
                  Historical Vault
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-cherry">Protocol</h4>
            <ul className="space-y-3.5 text-sm font-black uppercase tracking-wider">
              <li>
                <Link to="/support?tab=shipping" className="hover:text-cherry transition-colors block">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/support?tab=returns" className="hover:text-cherry transition-colors block">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link to="/support?tab=authenticity" className="hover:text-cherry transition-colors block">
                  Print Quality & Care
                </Link>
              </li>
              <li>
                <Link to="/support?tab=contact" className="hover:text-cherry transition-colors block">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-cherry">Need Help?</h4>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">Find processing times, destinations, print care, replacements, and answers to common order questions.</p>
            <Link to="/support" className="inline-block bg-cherry text-charcoal border-2 border-white px-5 py-3 font-black text-xs uppercase hover:bg-sky-blue transition-colors">Visit Support</Link>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 bg-cherry border border-white"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              © 2026 <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> // ART PRINTS
            </p>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <Link to="/privacy" className="hover:text-cherry transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-cherry transition-colors">Terms</Link>
            <Link to="/security" className="hover:text-cherry transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
