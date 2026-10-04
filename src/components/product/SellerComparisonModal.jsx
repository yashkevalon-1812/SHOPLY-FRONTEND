import { X, Check, Star, Truck, ShieldCheck, ArrowRight, Store, Sparkles, Award } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';

export const SellerComparisonModal = ({
  isOpen,
  onClose,
  product,
  offers = [],
  activeOffer,
  onSelectOffer,
}) => {
  if (!isOpen || !product) return null;

  // Find lowest price
  const lowestPrice = Math.min(...offers.map((o) => o.price));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-slate-800 flex items-center justify-between bg-zinc-50 dark:bg-[#131d2e]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 overflow-hidden shrink-0">
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, product.images?.[0])}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                  Multi-Seller Comparison
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-slate-400 font-medium">
                  {offers.length} Sellers Available
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white line-clamp-1 mt-0.5">
                Compare Sellers for: {product.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Reassurance Alert */}
        <div className="bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40 px-4 sm:px-6 py-2.5 flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-300">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Shoply Buyer Protection:</strong> All sellers are KYC-verified. You receive the exact same 100% genuine product with guaranteed brand warranty regardless of seller choice.
          </span>
        </div>

        {/* Comparison Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {offers.map((offer) => {
              const isSelected = activeOffer?._id === offer._id;
              const isLowestPrice = offer.price === lowestPrice;

              return (
                <div
                  key={offer._id}
                  className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-600/20'
                      : 'border-zinc-200 dark:border-slate-800 bg-zinc-50/50 dark:bg-[#131d2e]/60 hover:border-zinc-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-1 mb-3">
                    {isLowestPrice ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full shadow-xs">
                        <Sparkles className="w-3 h-3" /> Lowest Price
                      </span>
                    ) : offer.isDefault ? (
                      <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full shadow-xs">
                        <Award className="w-3 h-3" /> Recommended
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                        Alternative Offer
                      </span>
                    )}

                    {isSelected && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>

                  {/* Seller Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                        {offer.sellerName}
                      </h3>
                    </div>

                    {/* Seller Rating */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span className="font-bold text-amber-900 dark:text-amber-300 text-[11px]">
                          {offer.rating}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-slate-400">
                        ({offer.ratingCount} seller reviews)
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-1">
                      {offer.badge}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0c1421] border border-zinc-200/80 dark:border-slate-800 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-zinc-950 dark:text-white">
                        {formatINR(offer.price)}
                      </span>
                      {offer.originalPrice > offer.price && (
                        <span className="text-xs text-zinc-400 dark:text-slate-500 line-through">
                          {formatINR(offer.originalPrice)}
                        </span>
                      )}
                    </div>
                    {offer.originalPrice > offer.price && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Save {formatINR(offer.originalPrice - offer.price)} with this seller
                      </p>
                    )}
                  </div>

                  {/* Comparison Feature List */}
                  <div className="space-y-2.5 text-xs mb-5">
                    {/* Delivery */}
                    <div className="flex items-start gap-2 text-zinc-700 dark:text-slate-300">
                      <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{offer.deliveryText}</span>
                        <p className="text-[10px] text-zinc-500 dark:text-slate-400">
                          {offer.shippingFee === 0 ? 'FREE Shipping' : `+ ${formatINR(offer.shippingFee)} Shipping`}
                        </p>
                      </div>
                    </div>

                    {/* Return Policy */}
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{offer.returnPolicy}</span>
                    </div>

                    {/* Warranty */}
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{offer.warranty}</span>
                    </div>

                    {/* Stock */}
                    <div className="text-[11px] text-zinc-500 dark:text-slate-400 pt-1">
                      Stock: <span className="font-semibold text-zinc-800 dark:text-slate-200">{offer.stock} units available</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onSelectOffer(offer);
                      onClose();
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-zinc-200 dark:bg-slate-800 text-zinc-700 dark:text-slate-200 cursor-default'
                        : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Currently Active Seller</span>
                      </>
                    ) : (
                      <>
                        <span>Choose This Seller</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-[#131d2e] border-t border-zinc-200 dark:border-slate-800 flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
          <span>Need help choosing? Select any verified seller with full Shoply warranty protection.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-800 dark:text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
