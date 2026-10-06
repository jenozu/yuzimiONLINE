import { Link } from "react-router-dom";

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M12 2C6.48 2 2 6.03 2 11c0 3.73 2.49 6.95 6.05 8.33-.08-.71-.15-1.79.03-2.56.16-.69 1.03-4.37 1.03-4.37s-.26-.53-.26-1.31c0-1.23.71-2.15 1.6-2.15.75 0 1.12.57 1.12 1.25 0 .76-.48 1.89-.73 2.94-.21.88.44 1.6 1.31 1.6 1.57 0 2.78-1.66 2.78-4.05 0-2.12-1.52-3.6-3.7-3.6-2.52 0-4 1.89-4 3.85 0 .76.29 1.58.66 2.02.07.09.08.17.06.27-.07.28-.22.88-.25 1-.04.16-.13.19-.3.12-1.12-.52-1.82-2.16-1.82-3.48 0-2.83 2.06-5.43 5.93-5.43 3.11 0 5.53 2.22 5.53 5.19 0 3.09-1.95 5.58-4.65 5.58-.91 0-1.76-.47-2.05-1.03l-.56 2.12c-.2.78-.75 1.76-1.12 2.36.84.26 1.73.4 2.65.4 5.52 0 10-4.03 10-9S17.52 2 12 2Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.95 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.41 4.05H6.56L17.8 19.84Z" />
    </svg>
  );
}

function TumblrIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M14.56 21.5c-3.77 0-5.22-2.78-5.22-4.75V11.3H7.5V8.55c2.77-1 3.86-3.45 4.03-5.55h2.64v4.86h3.62v3.44h-3.62v4.74c0 1.42.72 2.14 1.94 2.14.66 0 1.25-.16 1.79-.48v3.28c-.75.34-1.78.52-3.34.52Z" />
    </svg>
  );
}

const socialLinks = [
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/yuzimiONLINE/",
    icon: <PinterestIcon />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/yuzimiONLINE",
    icon: <TwitterIcon />,
  },
  {
    label: "Tumblr",
    href: "https://yuzimiONLINE.tumblr.com/",
    icon: <TumblrIcon />,
  },
];

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
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${social.label} — @yuzimiONLINE`}
                  title={`${social.label}: @yuzimiONLINE`}
                  className="w-10 h-10 border-2 border-white/70 flex items-center justify-center text-white hover:text-charcoal hover:bg-cherry hover:border-cherry transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
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
