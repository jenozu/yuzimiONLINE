import { motion } from "motion/react";
import { ArrowRight, Images } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { PageMeta } from "../components/PageMeta";

export function Lookbook() {
  const { products, loading, error } = useProducts();
  const featured = products.filter((product) => product.image).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      <PageMeta title="Art Print Lookbook" description="Explore the current yuzimiONLINE art-print collection in the visual lookbook." />
      <header className="border-b-4 border-charcoal pb-10 space-y-5">
        <span className="badge-brutal bg-cherry text-charcoal font-black">COLLECTION 001</span>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-charcoal leading-[0.88]">
          Print <span className="bg-sky-blue px-3 py-0.5 border-3 border-charcoal inline-block shadow-[4px_4px_0px_0px_#141414]">Lookbook</span>
        </h1>
        <p className="text-sm md:text-base font-bold text-charcoal/75 max-w-2xl">
          A closer look at the artwork currently available from the Cherry Blossoms collection. Every image shown here comes from the live product catalog.
        </p>
      </header>

      {loading ? (
        <div className="py-20 text-center font-black uppercase tracking-widest">Loading lookbook…</div>
      ) : error ? (
        <div role="alert" className="border-3 border-charcoal bg-red-100 p-8 font-bold">{error}</div>
      ) : featured.length === 0 ? (
        <div className="border-4 border-dashed border-charcoal/30 bg-white p-12 text-center">
          <Images className="mx-auto w-12 h-12 text-cherry-dark" />
          <h2 className="mt-4 text-2xl font-black uppercase">Lookbook coming soon</h2>
          <p className="mt-2 text-sm font-semibold text-charcoal/60">Published print images will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-10">
          {featured.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="card-brutal bg-white p-4 md:p-6 shadow-[8px_8px_0px_0px_#FFB7C5]"
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden border-3 border-charcoal bg-cherry-light">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="pt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/55">{product.category}</p>
                    <h2 className="mt-1 text-2xl font-black uppercase leading-tight">{product.name}</h2>
                    <p className="mt-2 text-sm font-black text-cherry-dark">From ${product.price.toFixed(2)}</p>
                  </div>
                  <span className="btn-brutal !p-3" aria-hidden="true"><ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}

      <div className="card-brutal bg-cherry-light border-4 border-charcoal p-8 md:p-12 text-center shadow-[8px_8px_0px_0px_#141414]">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Choose your print size</h2>
        <p className="mt-3 text-sm font-bold text-charcoal/70">Every published artwork is available in eight dimensions from 8 × 10 to 24 × 36 inches.</p>
        <Link to="/collections" className="inline-block btn-brutal text-sm py-4 px-8 mt-6">Browse all prints</Link>
      </div>
    </div>
  );
}
