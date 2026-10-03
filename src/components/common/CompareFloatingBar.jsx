import { useCompare } from '../../context/CompareContext';
import { formatINR } from '../../utils/format';
import { ArrowLeftRight, X, Trash2 } from 'lucide-react';

export const CompareFloatingBar = () => {
  const { compareItems, removeFromCompare, clearCompare, openCompare } = useCompare();

  if (!compareItems || compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-zinc-950/95 dark:bg-[#0f172a]/95 text-white backdrop-blur-md border border-zinc-700/60 dark:border-slate-700/80 rounded-2xl shadow-2xl p-2.5 sm:p-3 transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-2.5 overflow-x-auto min-w-0 pr-2">
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-none">Compare</p>
              <p className="text-[10px] text-zinc-400 font-medium">
                {compareItems.length} of 4 items
              </p>
            </div>
            <span className="sm:hidden text-xs font-bold bg-zinc-800 px-1.5 py-0.5 rounded">
              {compareItems.length}/4
            </span>
          </div>

          {/* Product Thumbnails */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {compareItems.map((item) => {
              const imgUrl =
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : typeof item.images === 'string'
                  ? item.images
                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';

              const price = item.discountPrice > 0 ? item.discountPrice : item.price;

              return (
                <div
                  key={item._id}
                  className="relative group w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0"
                  title={`${item.title} - ${formatINR(price)}`}
                >
                  <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFromCompare(item._id)}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white hover:text-rose-400"
                    title="Remove from compare"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Clear & Compare CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors text-xs flex items-center gap-1"
            title="Clear compare list"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Clear</span>
          </button>

          <button
            onClick={openCompare}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-2.5 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare Now</span>
            <span className="sm:hidden">Compare</span>
          </button>
        </div>
      </div>
    </div>
  );
};
