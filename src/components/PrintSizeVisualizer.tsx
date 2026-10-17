import { motion, useReducedMotion } from "motion/react";
import { Ruler } from "lucide-react";
const DIMENSIONS:Record<string,[number,number]>={
 "8 × 10 in":[8,10],"11 × 14 in":[11,14],"12 × 18 in":[12,18],"16 × 20 in":[16,20],
 "18 × 24 in":[18,24],"20 × 30 in":[20,30],"24 × 32 in":[24,32],"24 × 36 in":[24,36]
};
export function PrintSizeVisualizer({size,image,name}:{size:string;image:string;name:string}) {
 const reduced=useReducedMotion();
 const [width,height]=DIMENSIONS[size]||DIMENSIONS["8 × 10 in"];
 return <section aria-label="Relative print size illustration" className="bg-sky-light border border-charcoal/15 p-5 sm:p-8">
  <div className="flex justify-between gap-3 items-start mb-6"><div><p className="editorial-eyebrow mb-2">On the wall / scale guide</p><h3 className="font-black uppercase text-xl tracking-tight">See its size</h3></div><Ruler size={25}/></div>
  <div className="relative w-full aspect-[3/2] bg-[#FFF4F7] overflow-hidden border border-charcoal/15" role="img" aria-label={"Illustration of "+width+" by "+height+" inch artwork on a 72 by 48 inch reference wall"}>
    <div className="absolute inset-0 opacity-35" style={{backgroundImage:"linear-gradient(#14141410 1px, transparent 1px),linear-gradient(90deg,#14141410 1px,transparent 1px)",backgroundSize:"12.5% 12.5%"}}/>
    <span className="absolute top-3 left-3 text-[10px] font-bold bg-white px-2 py-1 z-10">72 × 48 in reference area</span>
    <motion.div layout transition={reduced?{duration:0}:{type:"spring",stiffness:170,damping:23}} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-[6px_8px_25px_rgba(20,20,20,.22)] p-[1%]" style={{width:String(width/72*100)+"%",height:String(height/48*100)+"%"}}>
      {image&&<img src={image} alt={name+" size preview"} className="w-full h-full object-contain"/>}
    </motion.div>
    <div className="absolute bottom-3 right-3 editorial-eyebrow bg-charcoal text-white px-2 py-1">{size}</div>
  </div>
  <div className="flex justify-between gap-3 mt-4 text-xs font-semibold"><span>Print: {width} × {height} inches</span><span>{Math.round(width*2.54)} × {Math.round(height*2.54)} cm (approx.)</span></div>
  <p className="text-xs mt-3 leading-relaxed text-charcoal/60">Relative dimensions are accurate within an illustrated 72 × 48 inch wall area. Screen size is not real-world scale. This is a print-only guide, not a framing option.</p>
 </section>;
}
