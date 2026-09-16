import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Truck, RotateCcw, ShieldCheck, Mail, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";

export function Support() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "shipping";
  const [activeTab, setActiveTab] = useState(tabParam);

  // Authenticity checker state
  const [serialCode, setSerialCode] = useState("");
  const [authResult, setAuthResult] = useState<{ verified: boolean; message: string; date?: string } | null>(null);

  // Contact form state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", inquiry: "Shipping Query", message: "" });

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const verifySerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialCode.trim()) return;

    const clean = serialCode.trim().toUpperCase();
    if (clean.startsWith("YZM") || clean.startsWith("SAKURA") || clean.length >= 6) {
      setAuthResult({
        verified: true,
        message: `VALIDATED: Unit [${clean}] is an authentic yuzimiONLINE production drop verified from Tokyo Central Atelier.`,
        date: "Production Cycle: Spring 2026 // Status: Certified"
      });
    } else {
      setAuthResult({
        verified: false,
        message: `UNRECOGNIZED: Code [${clean}] does not match standard yuzimiONLINE serial registry. Please check your certificate tag.`
      });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", inquiry: "Shipping Query", message: "" });
    }, 500);
  };

  const tabs = [
    { id: "shipping", label: "Shipping Protocol", icon: Truck },
    { id: "returns", label: "Return Logic", icon: RotateCcw },
    { id: "authenticity", label: "Authenticity Check", icon: ShieldCheck },
    { id: "contact", label: "Direct Node Contact", icon: Mail },
    { id: "faq", label: "FAQ Database", icon: HelpCircle }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      {/* Header */}
      <div className="card-brutal bg-white p-8 md:p-14 border-4 border-charcoal shadow-[8px_8px_0px_0px_#89CFF0] space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-brutal bg-cherry text-charcoal font-black">
            CLIENT SERVICES
          </span>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-charcoal/60">
            <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> // OPERATIONS PROTOCOL
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-charcoal leading-[0.88]">
          Support & <span className="bg-sky-blue text-charcoal px-3 py-0.5 border-3 border-charcoal inline-block shadow-[4px_4px_0px_0px_#141414]">Protocol</span>
        </h1>

        <p className="text-sm md:text-base font-bold text-charcoal/80 max-w-2xl leading-relaxed">
          Operational logistics, worldwide courier routing, garment care directives, and cryptographic product authenticity verification.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 border-b-4 border-charcoal pb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider px-5 py-3 border-3 border-charcoal transition-all ${
                isActive
                  ? "bg-cherry text-charcoal shadow-[4px_4px_0px_0px_#141414] translate-x-0.5 translate-y-0.5"
                  : "bg-white text-charcoal hover:bg-cherry/30 shadow-[2px_2px_0px_0px_#141414]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="card-brutal bg-white p-6 md:p-12 border-4 border-charcoal shadow-[8px_8px_0px_0px_#FFB7C5]">
        {/* SHIPPING TAB */}
        {activeTab === "shipping" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Protocol // 01</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Worldwide Dispatch Guidelines
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#FFF2F5] border-3 border-charcoal shadow-[4px_4px_0px_0px_#FFB7C5] space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-charcoal/60">Tier 1: Domestic Japan</span>
                <p className="text-2xl font-black text-charcoal">1-2 Business Days</p>
                <p className="text-xs font-semibold text-charcoal/70">Via Yamato Transport tracked express service. Flat $8 or free over $150.</p>
              </div>

              <div className="p-6 bg-[#EEF8FD] border-3 border-charcoal shadow-[4px_4px_0px_0px_#89CFF0] space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-charcoal/60">Tier 2: International Air</span>
                <p className="text-2xl font-black text-charcoal">3-5 Business Days</p>
                <p className="text-xs font-semibold text-charcoal/70">DHL Express / FedEx Air directly from Tokyo Narita hub. Customs clearance handled.</p>
              </div>

              <div className="p-6 bg-white border-3 border-charcoal shadow-[4px_4px_0px_0px_#141414] space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-charcoal/60">Packaging Standard</span>
                <p className="text-2xl font-black text-charcoal">UV-Safe Sealed</p>
                <p className="text-xs font-semibold text-charcoal/70">Every apparel and print drop is vacuum-sealed with anti-humidity silica packets.</p>
              </div>
            </div>

            <div className="p-6 border-3 border-charcoal bg-[#FFF8FA] space-y-3">
              <h3 className="text-lg font-black uppercase text-charcoal">Discreet Protective Outer Shell</h3>
              <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                All external mailer boxes are plain heavy recycled cardboard with reinforced water-activated tape. No external branding is visible on the outer carton for parcel security.
              </p>
            </div>
          </motion.div>
        )}

        {/* RETURNS TAB */}
        {activeTab === "returns" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Protocol // 02</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                30-Day Inspection Window
              </h2>
            </div>

            <p className="text-sm md:text-base font-semibold text-charcoal/80 max-w-2xl leading-relaxed">
              We stand unconditionally behind the materials, stitching, and printing precision of every yuzimiONLINE piece. If sizing or condition does not meet your standard:
            </p>

            <div className="space-y-4">
              {[
                { step: "01", title: "Unworn Condition", text: "Garments must retain all original silicone tags, spare buttons, and botanical insert cards." },
                { step: "02", title: "Generate Return Slip", text: "Contact our dispatch node with your order number. A pre-paid international return label is issued." },
                { step: "03", title: "Inspection & Full Refund", text: "Upon receipt at our Tokyo atelier, items are inspected within 24 hours and credited to your original payment method." }
              ].map((item) => (
                <div key={item.step} className="p-5 border-3 border-charcoal bg-white flex gap-4 items-start shadow-[3px_3px_0px_0px_#141414]">
                  <span className="w-10 h-10 bg-cherry text-charcoal border-2 border-charcoal font-black flex items-center justify-center shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-black text-sm uppercase text-charcoal">{item.title}</h3>
                    <p className="text-xs font-semibold text-charcoal/70 mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AUTHENTICITY TAB */}
        {activeTab === "authenticity" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Protocol // 03</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Authenticity Verification
              </h2>
            </div>

            <p className="text-sm font-medium text-charcoal/80 max-w-2xl">
              Every yuzimiONLINE item contains a micro-woven authentication label with an 8-character verification serial. Enter your unit code below to query the production registry:
            </p>

            <form onSubmit={verifySerial} className="space-y-4 max-w-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={serialCode}
                  onChange={(e) => setSerialCode(e.target.value)}
                  placeholder="e.g. YZM-2026-SAKURA"
                  className="flex-1 bg-white border-3 border-charcoal px-4 py-3 text-sm font-black uppercase placeholder:text-charcoal/30 outline-none shadow-[4px_4px_0px_0px_#141414] focus:border-cherry"
                />
                <button type="submit" className="btn-brutal text-xs py-3 px-6 shrink-0">
                  Verify Serial
                </button>
              </div>
              <p className="text-[11px] font-bold text-charcoal/50 uppercase">
                Tip: Try typing "YZM-2026-SAKURA" or any serial on your certificate tag.
              </p>
            </form>

            {authResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 border-3 border-charcoal ${
                  authResult.verified ? "bg-[#EEF8FD] shadow-[6px_6px_0px_0px_#89CFF0]" : "bg-[#FFF0F4] shadow-[6px_6px_0px_0px_#FFB7C5]"
                } space-y-2`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${authResult.verified ? "bg-sky-blue" : "bg-cherry"}`}>
                    {authResult.verified ? "✓" : "!"}
                  </span>
                  <p className="font-black text-sm uppercase text-charcoal">{authResult.message}</p>
                </div>
                {authResult.date && (
                  <p className="text-xs font-bold text-charcoal/70 pl-8">{authResult.date}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Protocol // 04</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Direct Node Transmission
              </h2>
            </div>

            {formSubmitted ? (
              <div className="p-8 border-3 border-charcoal bg-[#FFF2F5] shadow-[6px_6px_0px_0px_#FFB7C5] text-center space-y-4">
                <div className="w-14 h-14 bg-cherry border-3 border-charcoal mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-charcoal" />
                </div>
                <h3 className="text-2xl font-black uppercase text-charcoal">Packet Transmitted</h3>
                <p className="text-sm font-semibold text-charcoal/70 max-w-md mx-auto">
                  Your inquiry has been relayed to our Tokyo support desk. Expect an encrypted response within 6 hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="btn-brutal text-xs py-2 px-6"
                >
                  Send Another Transmission
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-charcoal">Client Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="TAKASHI K."
                      className="w-full bg-white border-3 border-charcoal p-3 text-xs font-bold uppercase outline-none shadow-[3px_3px_0px_0px_#141414] focus:border-cherry"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-charcoal">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="OPERATOR@DOMAIN.COM"
                      className="w-full bg-white border-3 border-charcoal p-3 text-xs font-bold uppercase outline-none shadow-[3px_3px_0px_0px_#141414] focus:border-cherry"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-charcoal">Inquiry Category</label>
                  <select
                    value={formData.inquiry}
                    onChange={(e) => setFormData({ ...formData, inquiry: e.target.value })}
                    className="w-full bg-white border-3 border-charcoal p-3 text-xs font-black uppercase outline-none shadow-[3px_3px_0px_0px_#141414]"
                  >
                    <option>Shipping Query</option>
                    <option>Sizing & Fit Verification</option>
                    <option>Authenticity Check</option>
                    <option>Wholesale & Editorial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-charcoal">Transmission Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="ENTER QUERY SPECIFICATIONS..."
                    className="w-full bg-white border-3 border-charcoal p-3 text-xs font-bold uppercase outline-none shadow-[3px_3px_0px_0px_#141414] focus:border-cherry"
                  />
                </div>

                <button type="submit" className="btn-brutal text-sm py-4 px-8 w-full">
                  Transmit Inquiry to <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span>
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* FAQ TAB */}
        {activeTab === "faq" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Protocol // 05</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Frequently Asked Inquiries
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "WHEN DO SAKURA DROPS RESTOCK?", a: "yuzimiONLINE drops operate on strictly limited production runs. Once a batch is sealed into the Archive, it is never restocked in identical dye formulations." },
                { q: "HOW SHOULD I WASH THE ZENITH BLUE HOODIE?", a: "Cold wash inside out (30°C max). Hang dry in shade away from direct heat to protect the anime pigment wash and custom hardware." },
                { q: "WHAT IS THE CANVAS MATERIAL FOR PRINTS?", a: "All art prints are produced on 310gsm museum cotton rag using 12-color archival pigment ink systems rated for 100+ years of lightfastness." },
                { q: "DO YOU SHIP TO MILITARY BASES & P.O. BOXES?", a: "Yes. All domestic and APO/FPO addresses are fully supported via tracked postal routing." }
              ].map((faq, i) => (
                <div key={i} className="p-5 border-3 border-charcoal bg-[#FFF9FA] space-y-2 shadow-[3px_3px_0px_0px_#141414]">
                  <h3 className="font-black text-sm uppercase text-charcoal flex items-center gap-2">
                    <span className="text-cherry-dark">Q:</span> {faq.q}
                  </h3>
                  <p className="text-xs font-semibold text-charcoal/70 leading-relaxed pl-4 border-l-2 border-charcoal/20">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
