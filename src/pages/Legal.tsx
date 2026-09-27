import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";

const policies = {
  privacy: {
    title: "Privacy Policy",
    description: "A plain-language summary of how yuzimiONLINE handles storefront and order information.",
    sections: [
      ["Information used", "When checkout is enabled, information needed to process an order may include contact details, shipping address, purchased items, destination, and transaction identifiers. Payment-card details are entered on Stripe’s hosted checkout and are not stored by this website."],
      ["Service providers", "Order information is processed only through services needed to operate the store, including Vercel, Neon, Cloudflare R2, Stripe, the selected print provider, carriers, and customer-support or email services once configured."],
      ["Retention and requests", "Production retention periods, deletion procedures, business contact details, and the process for privacy requests must be approved and published before live checkout is enabled."],
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "The rules that will govern purchases and use of the yuzimiONLINE storefront.",
    sections: [
      ["Orders and payment", "An order is accepted only after its payment is successfully verified. Prices, available sizes, shipping destinations, and delivery estimates are shown during the buying process and may change before an order is placed."],
      ["Made-to-order prints", "Art prints are produced for each order. Customers should verify the selected size and shipping address before checkout. Damage, defect, cancellation, and return remedies will follow the final published store policy."],
      ["Intellectual property", "Store artwork, photography, branding, and site content may not be reproduced or sold without permission from the applicable rights holder."],
    ],
  },
  security: {
    title: "Store Security",
    description: "Technical safeguards used to protect storefront, administration, and checkout activity.",
    sections: [
      ["Payment security", "Checkout uses Stripe’s hosted payment page. The storefront validates product prices and availability on the server and reconciles paid sessions before an order is marked paid."],
      ["Account and upload security", "Admin access uses signed, secure cookies, strict origin checks, rate limits, and validated image uploads. Service credentials are stored in deployment environment variables rather than the repository."],
      ["Responsible reporting", "A monitored security contact and response procedure must be published before launch. Do not include passwords, card details, access keys, or sensitive customer information in an initial report."],
    ],
  },
} as const;

export function Legal() {
  const { pathname } = useLocation();
  const policy = pathname.includes("privacy") ? policies.privacy : pathname.includes("terms") ? policies.terms : policies.security;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-cherry-dark transition-colors">
        <ArrowLeft className="w-4 h-4" /> Return to storefront
      </Link>
      <div className="card-brutal bg-white p-8 md:p-12 border-4 border-charcoal shadow-[8px_8px_0px_0px_#FFB7C5] space-y-4">
        <div className="flex items-center gap-2 text-cherry-dark text-xs font-black uppercase tracking-widest"><Shield className="w-4 h-4" /><span>yuzimiONLINE // Policy</span></div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-charcoal">{policy.title}</h1>
        <p className="text-sm font-semibold text-charcoal/70 leading-relaxed">{policy.description}</p>
      </div>
      <div className="border-3 border-amber-800 bg-amber-50 p-5 flex items-start gap-3 text-amber-950">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm font-bold">Prelaunch draft: business details, jurisdiction, retention periods, and final remedies still require owner or legal review before live payments are enabled.</p>
      </div>
      <div className="card-brutal bg-white p-8 md:p-12 border-4 border-charcoal shadow-[6px_6px_0px_0px_#141414] space-y-8 text-charcoal">
        {policy.sections.map(([heading, copy], index) => (
          <section className="space-y-3" key={heading}>
            <h2 className="text-xl font-black uppercase tracking-tight border-b-2 border-charcoal pb-2">{String(index + 1).padStart(2, "0")} // {heading}</h2>
            <p className="text-sm font-medium text-charcoal/80 leading-relaxed">{copy}</p>
          </section>
        ))}
        <div className="p-6 bg-[#FFF2F5] border-3 border-charcoal">
          <p className="text-sm font-semibold text-charcoal/75">Questions about an order or these draft policies can be started through the <Link to="/support?tab=contact" className="font-black underline">support page</Link>.</p>
        </div>
      </div>
    </div>
  );
}
