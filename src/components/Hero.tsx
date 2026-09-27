import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Floating Cherry Blossom Petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3.5 h-3.5 bg-cherry rounded-full border border-charcoal/20 opacity-40"
            initial={{ 
              y: -20,
              x: `${10 + i * 11}%`,
              rotate: 0,
              scale: 0.7 + (i % 3) * 0.2
            }}
            animate={{ 
              y: 700,
              x: `+=${(i % 2 === 0 ? 60 : -60)}px`,
              rotate: 360
            }}
            transition={{ 
              duration: 12 + (i % 4) * 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.2
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 min-h-[520px] relative z-10">
        {/* Left Side: Primary Pink Hero Card */}
        <div className="bg-cherry border-3 border-charcoal p-8 sm:p-12 md:p-16 flex flex-col justify-center relative overflow-hidden shadow-brutal-large">
          {/* Secondary Sky Blue Graphic Circle */}
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-sky-blue border-3 border-charcoal rounded-full z-0 shadow-[4px_4px_0px_0px_#141414]"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-charcoal text-white px-3 py-1 text-xs font-black uppercase tracking-widest border border-charcoal">
                Limited Drop 001
              </span>
              <span className="inline-flex items-center gap-1 bg-sky-blue text-charcoal border-2 border-charcoal px-2.5 py-0.5 text-[11px] font-black uppercase">
                <Sparkles className="w-3 h-3 fill-charcoal" />
                Cherry Blossoms
              </span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black uppercase leading-[0.88] tracking-tighter text-charcoal">
              Cherry<br />
              Blossom<br />
              <span className="bg-white text-charcoal px-3 py-0.5 border-3 border-charcoal inline-block mt-2 shadow-[4px_4px_0px_0px_#141414]">
                Prints
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl font-bold max-w-md leading-snug text-charcoal/85">
              Anime-inspired artwork framed by cherry blossom pink, clear-sky blue, and bold brutalist lines. Available as made-to-order prints in eight sizes.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/collections" 
                className="bg-sky-blue text-charcoal border-3 border-charcoal px-8 py-4 font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_#141414] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#141414] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 group text-base sm:text-lg cursor-pointer"
              >
                <span>Shop Prints</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/lookbook" 
                className="bg-white text-charcoal border-3 border-charcoal px-6 py-4 font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_#141414] hover:bg-sky-blue hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#141414] transition-all text-base sm:text-lg cursor-pointer"
              >
                Archive Lookbook
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right Side: Image/Visual Pane with Tertiary White and Pink Shadow */}
        <div className="bg-white border-3 border-charcoal flex items-center justify-center shadow-[8px_8px_0px_0px_#FFB7C5] relative overflow-hidden min-h-[380px] p-6">
          <div className="w-full h-full border-2 border-dashed border-charcoal/30 flex items-center justify-center -rotate-1 bg-[repeating-linear-gradient(45deg,#FFF0F4,#FFF0F4_12px,#ffffff_12px,#ffffff_24px)] p-4 relative">
            <img 
               src="/src/assets/images/hero_sakura_sky_1779206360576.png"
               alt="Anime-inspired figure beneath pink cherry blossoms and a blue spring sky"
               decoding="async"
               fetchPriority="high"
               sizes="(min-width: 1024px) 40vw, 92vw"
               className="w-full h-full object-cover border-2 border-charcoal shadow-[4px_4px_0px_0px_#FFB7C5]"
            />
            
            <div className="absolute top-6 left-6 rotate-2">
              <span className="bg-cherry text-charcoal border-2 border-charcoal px-2.5 py-1 text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#141414]">
                Spring Cel-01
              </span>
            </div>
          </div>
          
          <div className="absolute bottom-3 right-4 bg-white/90 border border-charcoal px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest text-charcoal/80 shadow-[2px_2px_0px_0px_#89CFF0]">
            Viewport // <span className="normal-case"><span className="lowercase">yuzimi</span>ONLINE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
