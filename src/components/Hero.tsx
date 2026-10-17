import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Product } from "../types";
import sakura from "../assets/images/hero_sakura_sky_1779206360576.png";

export function Hero({ featured }: { featured?: Product }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start","end start"] });
  const imageY = useTransform(scrollYProgress,[0,1],[0,-65]);
  return <motion.section ref={ref} className="relative bg-cherry overflow-hidden" aria-label="Cherry blossoms art collection">
    <div className="editorial-shell pt-12 sm:pt-18 pb-12 lg:pb-24">
      <div className="editorial-eyebrow flex justify-between gap-4 flex-wrap mb-10"><span>Collection 001 — Cherry Blossoms</span><span>Original art for your everyday / Est. 2026</span></div>
      <div className="relative min-h-[650px] lg:min-h-[740px]">
        <motion.h1 initial={reduced ? false : {opacity:0,y:45}} animate={{opacity:1,y:0}} transition={{duration:.85}} className="editorial-display relative z-20 text-[clamp(5rem,14.5vw,15rem)] pointer-events-none">MAKE<br/>ROOM <span className="text-white">FOR</span><br/>ART<span className="text-[.25em] align-top ml-3">*</span></motion.h1>
        <motion.div style={reduced ? undefined : {y:imageY}} className="absolute z-10 top-[20%] right-[-7%] sm:right-[2%] lg:right-[7%] w-[56%] min-w-[230px] max-w-[570px] aspect-[3/4] rotate-[6deg]">
          <div className="bg-white w-full h-full p-[5%] pb-[13%] editorial-paper"><img src={featured?.image || sakura} alt={featured ? featured.name : "Cherry blossom artwork from YUZIMI"} className="w-full h-full object-contain" fetchPriority="high"/></div>
          <div className="absolute -bottom-5 -right-3 sm:-right-9 rounded-full bg-sky-blue border border-charcoal w-23 h-23 sm:w-30 sm:h-30 flex items-center justify-center rotate-[-17deg] text-center text-xs sm:text-sm font-black uppercase leading-tight">Art<br/>lives<br/>here</div>
        </motion.div>
        <div className="absolute z-20 top-[52%] sm:top-[60%] left-0 max-w-[250px] sm:max-w-[375px]"><p className="text-base sm:text-xl font-semibold leading-snug mb-6">A little dramatic. A lot of feeling. Art prints that change the way a wall feels.</p><Link to="/collections" className="editorial-button">Explore the prints <ArrowUpRight size={18}/></Link></div>
        <div className="absolute bottom-0 left-0 right-0 z-20 editorial-eyebrow flex justify-between items-end gap-3"><span>Sakura season, all year long.</span><a href="#discover" className="inline-flex items-center gap-2 hover:underline">Scroll to discover <ArrowDownRight size={17}/></a></div>
      </div>
    </div>
  </motion.section>;
}
