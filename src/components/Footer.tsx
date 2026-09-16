import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Check, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useCart();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    showToast("Linked to yuzimiONLINE drop alerts 🌸");
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

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
              Vivid spring utility. Engineered for the neon anime aesthetic. Merging high-performance materials with the softness of cherry blossom pink and sky blue.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="yuzimiONLINE on Instagram" 
                className="w-10 h-10 border-2 border-white/20 flex items-center justify-center hover:bg-cherry hover:text-charcoal hover:border-cherry transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="yuzimiONLINE on Twitter" 
                className="w-10 h-10 border-2 border-white/20 flex items-center justify-center hover:bg-sky-blue hover:text-charcoal hover:border-sky-blue transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="yuzimiONLINE on Facebook" 
                className="w-10 h-10 border-2 border-white/20 flex items-center justify-center hover:bg-cherry hover:text-charcoal hover:border-cherry transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
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
                <Link to="/collections?category=Prints" className="hover:text-cherry transition-colors block">
                  Sakura Drops
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
                  Shipping Protocol
                </Link>
              </li>
              <li>
                <Link to="/support?tab=returns" className="hover:text-cherry transition-colors block">
                  Return Logic
                </Link>
              </li>
              <li>
                <Link to="/support?tab=authenticity" className="hover:text-cherry transition-colors block">
                  Authenticity Check
                </Link>
              </li>
              <li>
                <Link to="/support?tab=contact" className="hover:text-cherry transition-colors block">
                  Direct Node
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-cherry">Direct Uplink</h4>
            
            {subscribed ? (
              <div className="bg-cherry text-charcoal p-3.5 border-2 border-white font-black text-xs uppercase flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Node Connected // Verification Relayed</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex bg-white/5 border-2 border-white/25 h-13 p-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL_ADDRESS"
                  className="bg-transparent border-none outline-none px-3 text-xs font-black w-full uppercase placeholder:text-gray-500 text-white"
                />
                <button
                  type="submit"
                  className="bg-cherry text-charcoal px-5 font-black text-xs uppercase hover:bg-sky-blue hover:text-charcoal transition-colors shrink-0"
                >
                  Connect
                </button>
              </form>
            )}

            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
              Join for unannounced sakura colorway drops & collector access.
            </p>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 bg-cherry border border-white"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              © 2026 <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> // TOKYO SPEC // SYSTEM STABLE
            </p>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <Link to="/privacy" className="hover:text-cherry transition-colors">Privacy_v1.4</Link>
            <Link to="/terms" className="hover:text-cherry transition-colors">Terms_root</Link>
            <Link to="/security" className="hover:text-cherry transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
