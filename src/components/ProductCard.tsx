import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Product } from "../types";

export interface ProductCardProps {
  product: Product;
  index?: number;
  key?: string | number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="card-brutal aspect-[4/5] relative mb-5">
          <div className="w-full h-full p-3.5">
            <div className="w-full h-full bg-[#FFF2F5] border-2 border-charcoal/15 overflow-hidden relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-cherry/5 pointer-events-none group-hover:opacity-0 transition-opacity"></div>
            </div>
          </div>
          
          {product.badge && (
            <div className="absolute top-4 right-4 z-10 rotate-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0px_0px_#141414] ${
                product.badge === "New" 
                  ? "bg-sky-blue text-charcoal" 
                  : "bg-cherry text-charcoal"
              }`}>
                {product.badge}
              </span>
            </div>
          )}
          
          <span 
            aria-hidden="true"
            className="absolute bottom-5 right-5 w-12 h-12 bg-cherry border-2 border-charcoal flex items-center justify-center shadow-[3px_3px_0px_0px_#141414] transition-all hover:bg-sky-blue hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#141414] active:translate-x-0 active:translate-y-0 text-charcoal cursor-pointer z-10"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </span>
        </div>
        
        <div className="space-y-1.5 px-1">
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="text-xl font-black uppercase tracking-tighter leading-tight group-hover:text-cherry-dark transition-colors text-charcoal">
              {product.name}
            </h3>
          </div>
          <div className="flex justify-between items-center border-t-2 border-charcoal/30 pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/60">{["Prints", "Apparel", "Gear", "Home"].includes(product.category) ? product.name : product.category}</span>
            <span className="text-lg font-black italic tracking-tighter bg-white px-2.5 py-0.5 border border-charcoal shadow-[2px_2px_0px_0px_#FFB7C5] text-charcoal">
              ${Number.isInteger(product.price) ? product.price : product.price.toFixed(2)}+
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
