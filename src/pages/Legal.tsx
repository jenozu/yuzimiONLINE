import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Lock } from "lucide-react";

export function Legal() {
  const location = useLocation();
  const path = location.pathname;

  const isPrivacy = path.includes("privacy");
  const isTerms = path.includes("terms");

  const title = isPrivacy
    ? "Privacy Directive v1.4"
    : isTerms
    ? "Terms of Service // Root Protocol"
    : "Security & Encryption Standard";

  const description = isPrivacy
    ? "How yuzimiONLINE protects and manages client telemetry, shipping identifiers, and encrypted transaction metadata."
    : isTerms
    ? "Rules of engagement, limited edition acquisition protocols, and customer conduct on yuzimiONLINE systems."
    : "Security infrastructure, SSL/TLS handshake configurations, and physical atelier security standards.";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-cherry-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Root Node
      </Link>

      <div className="card-brutal bg-white p-8 md:p-12 border-4 border-charcoal shadow-[8px_8px_0px_0px_#FFB7C5] space-y-4">
        <div className="flex items-center gap-2 text-cherry-dark text-xs font-black uppercase tracking-widest">
          <Shield className="w-4 h-4" />
          <span>LEGAL LOG // <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span></span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-charcoal">
          {title}
        </h1>

        <p className="text-sm font-semibold text-charcoal/70 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="card-brutal bg-white p-8 md:p-12 border-4 border-charcoal shadow-[6px_6px_0px_0px_#141414] space-y-8 text-charcoal">
        <div className="space-y-3">
          <h2 className="text-xl font-black uppercase tracking-tight border-b-2 border-charcoal pb-2">
            01 // Data Sovereignity & Processing
          </h2>
          <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
            All order transmissions processed via yuzimiONLINE are strictly utilized for delivery orchestration, customs compliance, and client notification. We do not sell, rent, or distribute client telemetry to third-party ad brokers or advertising syndicates.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-black uppercase tracking-tight border-b-2 border-charcoal pb-2">
            02 // Limited Drop Acquisition Fair-Play
          </h2>
          <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
            To ensure human collectors receive priority during limited seasonal drops, automated script injection, headless browser checkouts, and bot proxies are actively detected and purged from the order queue. Maximum 2 units of any single SKU per household.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-black uppercase tracking-tight border-b-2 border-charcoal pb-2">
            03 // Intellectual Property & Design Rights
          </h2>
          <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
            All anime brutalist graphics, cherry blossom color grading formulations, product schematics, and editorial media are the exclusive copyright of yuzimiONLINE Tokyo. Unauthorized duplication or resale of counterfeit units will be met with legal dispatch.
          </p>
        </div>

        <div className="p-6 bg-[#FFF2F5] border-3 border-charcoal space-y-2">
          <div className="flex items-center gap-2 font-black text-xs uppercase text-charcoal">
            <Lock className="w-4 h-4 text-cherry-dark" />
            <span>Cryptographic Verification Node</span>
          </div>
          <p className="text-xs font-semibold text-charcoal/70">
            For legal inquiries or audit requests, contact legal@yuzimionline.tokyo with your signed PGP certificate.
          </p>
        </div>
      </div>
    </div>
  );
}
