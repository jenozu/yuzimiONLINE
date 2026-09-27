import { Archive as ArchiveIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";

export function Archive() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <PageMeta title="Collection Archive" description="View current and past yuzimiONLINE art-print collections." />
      <header className="card-brutal bg-white p-8 md:p-14 border-4 border-charcoal shadow-[8px_8px_0px_0px_#FFB7C5] space-y-4">
        <span className="badge-brutal bg-cherry text-charcoal font-black">COLLECTION RECORD</span>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-charcoal leading-[0.88]">
          Release <span className="bg-cherry px-3 py-0.5 border-3 border-charcoal inline-block shadow-[4px_4px_0px_0px_#141414]">Archive</span>
        </h1>
        <p className="text-sm md:text-base font-bold text-charcoal/75 max-w-2xl">
          Retired and sold-out print collections will be documented here after their release closes. No fictional or placeholder releases are displayed.
        </p>
      </header>

      <section className="border-4 border-dashed border-charcoal/30 bg-white p-10 md:p-16 text-center">
        <ArchiveIcon className="mx-auto h-14 w-14 text-cherry-dark" />
        <h2 className="mt-5 text-3xl font-black uppercase">The archive is currently empty</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-charcoal/65">
          Collection 001 — Cherry Blossoms is still in active circulation. Its record will move here when the collection closes.
        </p>
        <Link to="/collections" className="inline-block btn-brutal mt-7 px-7 py-3 text-sm">View current collection</Link>
      </section>
    </div>
  );
}
