import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Archive as ArchiveIcon, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

export function Archive() {
  const archives = [
    {
      code: "DROP-001",
      season: "Season 01 // Spring Equinox",
      date: "March 2026",
      status: "Active Circulation",
      statusColor: "bg-cherry",
      title: "The Sakura Sky Foundation",
      description: "Initial manifesto drop synthesizing Tokyo sky blue tones and cherry blossom pink silhouettes into functional everyday apparel and prints.",
      units: ["Sakura Horizon Print", "Zenith Blue Hoodie", "Survey Tactical Pack"],
      verifiedCount: "250 Units Produced"
    },
    {
      code: "DROP-000",
      season: "Season 00 // Zero Prototype",
      date: "November 2025",
      status: "Vault Sealed (Sold Out)",
      statusColor: "bg-charcoal text-white",
      title: "Tokyo Underground Prototype",
      description: "Restricted test batch distributed to select Shinjuku atelier members. Heavy monochrome silhouettes with early pastel dye tests.",
      units: ["Prototype Rain Parka", "Subway Grid Canvas", "Steel Carabiner Keychain"],
      verifiedCount: "50 Units // Archived"
    },
    {
      code: "COLLAB-K1",
      season: "Special Capsule // Kyoto Botanic",
      date: "January 2026",
      status: "Limited Repress",
      statusColor: "bg-sky-blue",
      title: "Kyoto Artisan Ceramics & Sencha",
      description: "Collaboration with third-generation Uji tea masters and Kyoto clay artisans incorporating traditional kiln firings with brutalist typography.",
      units: ["Petal Ceramic Set", "Blossom Sencha Tin", "Ceramic Matcha Whisk Holder"],
      verifiedCount: "100 Units Worldwide"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="card-brutal bg-white p-8 md:p-14 border-4 border-charcoal shadow-[8px_8px_0px_0px_#FFB7C5] space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-brutal bg-cherry text-charcoal font-black">
            HISTORICAL VAULT
          </span>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-charcoal/60">
            <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span> // PERMANENT LOGS
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-charcoal leading-[0.88]">
          Release <span className="bg-cherry text-charcoal px-3 py-0.5 border-3 border-charcoal inline-block shadow-[4px_4px_0px_0px_#141414]">Archive</span>
        </h1>

        <p className="text-sm md:text-base font-bold text-charcoal/80 max-w-2xl leading-relaxed">
          The permanent immutable record of all yuzimiONLINE seasonal drops, experimental capsules, and collector editions. Every drop is produced in numbered runs without unannounced restocks.
        </p>
      </div>

      {/* Archive Logs Timeline */}
      <div className="space-y-8">
        {archives.map((drop, idx) => (
          <motion.div
            key={drop.code}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-brutal bg-white p-6 md:p-10 border-4 border-charcoal shadow-[6px_6px_0px_0px_#141414] space-y-6"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-3 border-charcoal pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-black uppercase bg-[#FFF0F4] border-2 border-charcoal px-3 py-1 text-charcoal">
                  {drop.code}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-charcoal/60">
                  {drop.season}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-black uppercase px-3 py-1 border-2 border-charcoal shadow-[2px_2px_0px_0px_#141414] ${drop.statusColor}`}>
                  {drop.status}
                </span>
                <span className="text-xs font-bold text-charcoal/50">
                  {drop.date}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-charcoal">
                {drop.title}
              </h2>
              <p className="text-sm md:text-base font-medium text-charcoal/80 max-w-3xl leading-relaxed">
                {drop.description}
              </p>
            </div>

            {/* Units list */}
            <div className="pt-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-charcoal/50 mb-3">
                Cataloged Units Produced
              </div>
              <div className="flex flex-wrap gap-2">
                {drop.units.map((unit) => (
                  <span
                    key={unit}
                    className="bg-[#FFF4F7] border-2 border-charcoal px-3 py-1 text-xs font-black uppercase text-charcoal shadow-[2px_2px_0px_0px_#FFB7C5]"
                  >
                    • {unit}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-4 border-t-2 border-charcoal/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-charcoal/60">
                Authentication Batch: {drop.verifiedCount}
              </span>
              <Link
                to="/collections"
                className="btn-sky text-xs py-2 px-5 flex items-center gap-1.5"
              >
                <span>Check Available Inventory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
