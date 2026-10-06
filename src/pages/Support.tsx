import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Truck, RotateCcw, ShieldCheck, Mail, CheckCircle, HelpCircle } from "lucide-react";

export function Support() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "shipping";
  const [activeTab, setActiveTab] = useState(tabParam);

  // Contact form state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", inquiry: "Shipping Question", message: "", website: "" });

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/support-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not send your message.");
      setFormSubmitted(true);
      setFormData({ name: "", email: "", inquiry: "Shipping Question", message: "", website: "" });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not send your message.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const tabs = [
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "returns", label: "Returns & Replacements", icon: RotateCcw },
    { id: "authenticity", label: "Print Quality", icon: ShieldCheck },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "faq", label: "FAQ", icon: HelpCircle }
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
Everything you need to know about art-print production, shipping, replacements, print care, and contacting yuzimiONLINE.
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
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Guide // 01</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Art Print Shipping
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Processing Time", value: "2–5 Business Days", text: "Every art print is made to order. Processing happens before the parcel is handed to the carrier." },
                { label: "United States", value: "Free Shipping", text: "Standard shipping is free on every U.S. order. Tracking is emailed as soon as your print ships." },
                { label: "International", value: "Delivery Varies", text: "Delivery estimates appear at checkout and depend on the destination, carrier, and customs processing." }
              ].map((item, index) => (
                <div key={item.label} className={`p-6 border-3 border-charcoal space-y-2 ${index === 0 ? "bg-[#FFF2F5] shadow-[4px_4px_0px_0px_#FFB7C5]" : index === 1 ? "bg-[#EEF8FD] shadow-[4px_4px_0px_0px_#89CFF0]" : "bg-white shadow-[4px_4px_0px_0px_#141414]"}`}>
                  <span className="text-xs font-black uppercase tracking-widest text-charcoal/60">{item.label}</span>
                  <p className="text-2xl font-black text-charcoal">{item.value}</p>
                  <p className="text-xs font-semibold text-charcoal/70">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border-3 border-charcoal bg-[#FFF8FA] space-y-3">
                <h3 className="text-lg font-black uppercase text-charcoal">Protected Print Packaging</h3>
                <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                  Prints are protected in rigid mailers or durable shipping tubes depending on their size and fulfillment route. Carefully flatten rolled prints before framing.
                </p>
              </div>
              <div className="p-6 border-3 border-charcoal bg-[#EEF8FD] space-y-3">
                <h3 className="text-lg font-black uppercase text-charcoal">European Shipping</h3>
                <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                  Yes, we ship to Europe except Russia, Belarus, and Ukraine. Import taxes, VAT, or customs fees may be collected locally and are the buyer’s responsibility.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* RETURNS TAB */}
        {activeTab === "returns" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Guide // 02</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Returns & Replacements
              </h2>
            </div>

            <p className="text-sm md:text-base font-semibold text-charcoal/80 max-w-3xl leading-relaxed">
              Each art print is made specifically for your order. If it arrives damaged, misprinted, or incorrect, contact us within 30 days of delivery so we can make it right.
            </p>

            <div className="space-y-4">
              {[
                { step: "01", title: "Photograph the Issue", text: "Take clear photos of the print, packaging, shipping label, and any visible damage or printing defect." },
                { step: "02", title: "Contact Support", text: "Send your order number, a short description of the issue, and the photos through the Contact tab." },
                { step: "03", title: "Replacement or Refund", text: "After review, eligible damaged, defective, or incorrect orders will receive a replacement or refund at no additional cost." }
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

            <div className="p-5 border-3 border-charcoal bg-[#FFF2F5]">
              <p className="text-xs md:text-sm font-semibold text-charcoal/75 leading-relaxed">
                Because prints are made to order, we cannot accept returns for a change of mind, an accidentally selected size, or an incorrect address entered during checkout. Contact us as quickly as possible if you notice an order mistake.
              </p>
            </div>
          </motion.div>
        )}

        {/* PRINT QUALITY TAB */}
        {activeTab === "authenticity" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Guide // 03</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Print Quality & Care
              </h2>
            </div>

            <p className="text-sm md:text-base font-semibold text-charcoal/80 max-w-3xl leading-relaxed">
              Every design is produced as a made-to-order art print. The exact paper stock and finish are listed on the product page whenever multiple materials are available.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Colour Expectations", text: "Screens display colour differently, so slight differences in brightness and tone between your device and the finished print are normal." },
                { title: "Handling", text: "Handle the print with clean, dry hands and avoid touching the printed surface whenever possible." },
                { title: "Display & Storage", text: "Keep prints dry and away from prolonged direct sunlight. For long-term protection, use a frame with archival backing and UV-protective glazing." }
              ].map((item) => (
                <div key={item.title} className="p-6 border-3 border-charcoal bg-white shadow-[4px_4px_0px_0px_#141414] space-y-2">
                  <h3 className="font-black text-sm uppercase text-charcoal">{item.title}</h3>
                  <p className="text-xs font-semibold text-charcoal/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Protocol // 04</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Contact Us
              </h2>
            </div>

            {formSubmitted ? (
              <div className="p-8 border-3 border-charcoal bg-[#FFF2F5] shadow-[6px_6px_0px_0px_#FFB7C5] text-center space-y-4">
                <div className="w-14 h-14 bg-cherry border-3 border-charcoal mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-charcoal" />
                </div>
                <h3 className="text-2xl font-black uppercase text-charcoal">Message Received</h3>
                <p className="text-sm font-semibold text-charcoal/70 max-w-md mx-auto">
                  Thanks for reaching out. We’ll review your message and respond within 1–2 business days.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="btn-brutal text-xs py-2 px-6"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5 max-w-xl">
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-charcoal">Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="YOUR NAME"
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
                      placeholder="you@example.com"
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
                    <option>Shipping Question</option>
                    <option>Damaged or Misprinted Order</option>
                    <option>Print Size or Material</option>
                    <option>Order Change or Cancellation</option>
                    <option>Wholesale or Licensing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-charcoal">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="HOW CAN WE HELP?"
                    className="w-full bg-white border-3 border-charcoal p-3 text-xs font-bold uppercase outline-none shadow-[3px_3px_0px_0px_#141414] focus:border-cherry"
                  />
                </div>

                {formError && (
                  <p role="alert" className="border-3 border-charcoal bg-red-100 p-3 text-xs font-bold text-charcoal">
                    {formError}
                  </p>
                )}

                <button disabled={formSubmitting} type="submit" className="btn-brutal text-sm py-4 px-8 w-full disabled:opacity-60">
                  {formSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* FAQ TAB */}
        {activeTab === "faq" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-2 border-b-3 border-charcoal pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-cherry-dark">Guide // 05</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "HOW LONG DOES PROCESSING TAKE?", a: "Art prints are made to order and normally require 2–5 business days of processing before shipment. Delivery time begins after processing is complete." },
                { q: "DO YOU SHIP TO EUROPE?", a: "Yes. We currently ship to European destinations except Russia, Belarus, and Ukraine. Local VAT, import taxes, or customs fees may apply." },
                { q: "HOW WILL MY PRINT BE PACKAGED?", a: "Depending on size and fulfillment route, prints are sent in a rigid mailer or a protective shipping tube designed to prevent creasing and moisture damage." },
                { q: "DOES THE PRINT INCLUDE A FRAME?", a: "No. Prints are sold unframed unless a product listing clearly states otherwise. The listed dimensions are the dimensions of the print itself." },
                { q: "WHAT IF MY PRINT ARRIVES DAMAGED OR MISPRINTED?", a: "Contact us within 30 days of delivery with your order number and clear photos. Eligible orders will receive a replacement or refund." },
                { q: "CAN I CHANGE OR CANCEL MY ORDER?", a: "Contact us immediately. Because each print is made to order, changes or cancellations are only possible before production begins." },
                { q: "WILL THE COLOURS MATCH MY SCREEN EXACTLY?", a: "Not always. Screen settings vary, so minor differences in colour, brightness, and contrast are normal." }
              ].map((faq) => (
                <div key={faq.q} className="p-5 border-3 border-charcoal bg-[#FFF9FA] space-y-2 shadow-[3px_3px_0px_0px_#141414]">
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
