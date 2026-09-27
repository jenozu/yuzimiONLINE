import { motion } from "motion/react";
import { ArrowRight, Sparkles, Compass, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_PRODUCTS } from "../types";

export function Lookbook() {
  const looks = [
    {
      id: "look-01",
      number: "LOOK // 01",
      title: "Atmospheric Strata",
      season: "Spring / Drop 01",
      location: "Shinjuku District // High-Line Node",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200",
      product: MOCK_PRODUCTS[1], // Zenith Blue Hoodie
      specNotes: "Heavy 480gsm terry matched with cherry blossom pink canvas accents. Engineered for windchill transitions between ground level and Tokyo rooftop nodes.",
      quote: "Where high-velocity anime color meets raw tactical utilitarian geometry."
    },
    {
      id: "look-02",
      number: "LOOK // 02",
      title: "Survey Protocol",
      season: "Recon // Spec 02",
      location: "Ueno Park Botanic Gateway",
      image: "https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=1200",
      product: MOCK_PRODUCTS[2], // Survey Tactical Pack
      specNotes: "Field-tested cordura ripstop in desaturated forest green wash. Aluminum cobra buckle closures tested for rapid equipment access.",
      quote: "Prepared for urban expeditions under blooming canopy skies."
    },
    {
      id: "look-03",
      number: "LOOK // 03",
      title: "Petal Horizon Spec",
      season: "Art // Node 03",
      location: "Daikanyama Gallery Terrace",
      image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=1200",
      product: MOCK_PRODUCTS[0], // Sakura Horizon Print
      specNotes: "Archival pigment ink on 310gsm museum cotton paper. Capturing midday cloud drift against soft spring cherry blossoms.",
      quote: "A visual anchor for living quarters calibrated to anime aesthetics."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
      {/* Editorial Header */}
      <div className="border-b-4 border-charcoal pb-12 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-brutal bg-cherry text-charcoal font-black">
            EDITORIAL EDIT 001
          </span>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-charcoal/60">
            <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> // VISUAL ARCHIVE
          </span>
        </div>

        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-charcoal leading-[0.88]">
            Lookbook <span className="bg-sky-blue text-charcoal px-3 py-0.5 border-3 border-charcoal inline-block shadow-[4px_4px_0px_0px_#141414]">2026</span>
          </h1>

          <p className="text-sm font-bold text-charcoal/80 max-w-md leading-relaxed">
            Documenting our spring seasonal drops in real Tokyo environments. High-contrast brutalist framing, cherry blossom pink accents, and clear sky palettes.
          </p>
        </div>
      </div>

      {/* Looks Stream */}
      <div className="space-y-24">
        {looks.map((look, index) => {
          const isEven = index % 2 === 1;
          return (
            <motion.div
              key={look.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                isEven ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image Frame */}
              <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : ""}`}>
                <div className="card-brutal bg-white p-4 md:p-6 shadow-[10px_10px_0px_0px_#FFB7C5] group relative overflow-hidden">
                  <div className="relative aspect-[4/3] bg-[#FFF0F4] border-3 border-charcoal overflow-hidden">
                    <img
                      src={look.image}
                      alt={look.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-charcoal text-white text-[10px] font-black uppercase px-2.5 py-1 border border-charcoal">
                        {look.number}
                      </span>
                      <span className="bg-cherry text-charcoal text-[10px] font-black uppercase px-2.5 py-1 border border-charcoal">
                        {look.season}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-white/95 border-2 border-charcoal px-3 py-1 text-[11px] font-black text-charcoal shadow-[2px_2px_0px_0px_#141414]">
                      📍 {look.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text & Product Link */}
              <div className={`lg:col-span-5 space-y-6 ${isEven ? "lg:order-1" : ""}`}>
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-cherry-dark">
                    Editorial Breakdown
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-charcoal">
                    {look.title}
                  </h2>
                </div>

                <blockquote className="border-l-4 border-cherry pl-4 italic text-base md:text-lg font-bold text-charcoal/90">
                  "{look.quote}"
                </blockquote>

                <p className="text-sm font-medium text-charcoal/70 leading-relaxed">
                  {look.specNotes}
                </p>

                {/* Featured Product Pill */}
                <div className="p-4 bg-white border-3 border-charcoal shadow-[4px_4px_0px_0px_#89CFF0] space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-charcoal/50">
                    Featured Unit in Look
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={look.product.image}
                        alt={look.product.name}
                        className="w-12 h-12 object-cover border-2 border-charcoal"
                      />
                      <div>
                        <p className="font-black text-xs uppercase text-charcoal truncate max-w-[150px]">
                          {look.product.name}
                        </p>
                        <p className="text-xs font-black text-cherry-dark">
                          ${look.product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/product/${look.product.id}`}
                      className="btn-brutal text-xs py-2 px-4 flex items-center gap-1 shrink-0"
                    >
                      <span>Acquire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="card-brutal bg-[#FFF0F4] border-4 border-charcoal p-8 md:p-12 text-center shadow-[8px_8px_0px_0px_#141414] space-y-4">
        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-charcoal">
          Want the full catalog experience?
        </h3>
        <p className="text-sm font-bold text-charcoal/70 max-w-md mx-auto">
          Explore all active units across Apparel, Prints, Accessories, and Home botanicals.
        </p>
        <Link to="/collections" className="inline-block btn-brutal text-sm py-4 px-8">
          Browse All Collections
        </Link>
      </div>
    </div>
  );
}
