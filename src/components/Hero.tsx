import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3.5 h-3.5 bg-cherry rounded-full border border-charcoal/20 opacity-40"
            initial={{ y: -20, x: `${10 + i * 11}%`, rotate: 0, scale: 0.7 + (i % 3) * 0.2 }}
            animate={{ y: 700, x: `+=${i % 2 === 0 ? 60 : -60}px`, rotate: 360 }}
            transition={{ duration: 12 + (i % 4) * 3, repeat: Infinity, ease: "linear", delay: i * 1.2 }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 min-h-[520px] relative z-10">
        <div className="bg-cherry border-3 border-charcoal p-8 sm:p-12 md:p-16 flex flex-col justify-center relative overflow-hidden shadow-brutal-large">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-sky-blue border-3 border-charcoal rounded-full z-0 shadow-[4px_4px_0px_0px_#141414]"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-charcoal text-white px-3 py-1 text-xs font-black uppercase tracking-widest border border-charcoal">Collection 001</span>
              <span className="inline-flex items-center gap-1 bg-sky-blue text-charcoal border-2 border-charcoal px-2.5 py-0.5 text-[11px] font-black uppercase">
                <Sparkles className="w-3 h-3 fill-charcoal" />
                Cherry Blossoms
              </span>
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black uppercase leading-[0.88] tracking-tighter text-charcoal">
              Vivid<br />Sakura<br />
              <span className="bg-white text-charcoal px-3 py-0.5 border-3 border-charcoal inline-block mt-2 shadow-[4px_4px_0px_0px_#141414]">Art Prints</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl font-bold max-w-md leading-snug text-charcoal/85">
              Bold anime-inspired wall art built around cherry blossom pinks, crisp sky blues, and dramatic graphic composition.
            </p>

            <Link
              to="/collections"
              className="w-fit bg-sky-blue text-charcoal border-3 border-charcoal px-8 py-4 font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_#141414] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#141414] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 group text-base sm:text-lg cursor-pointer"
            >
              <span>Shop Art Prints</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-white border-3 border-charcoal flex items-center justify-center shadow-[8px_8px_0px_0px_#FFB7C5] relative overflow-hidden min-h-[380px] p-6">
          <div className="w-full h-full border-2 border-dashed border-charcoal/30 flex items-center justify-center -rotate-1 bg-[repeating-linear-gradient(45deg,#FFF0F4,#FFF0F4_12px,#ffffff_12px,#ffffff_24px)] p-4 relative">
            <img
              src="/src/assets/images/hero_sakura_sky_1779206360576.png"
              alt="Cherry blossom artwork from the YUZIMI collection"
              className="w-full h-full object-cover border-2 border-charcoal shadow-[4px_4px_0px_0px_#FFB7C5]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
