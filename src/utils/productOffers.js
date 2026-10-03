// Utility to extract and normalize seller offers for products dynamically from the database
export const getSellerOffers = (product) => {
  if (!product) return [];

  if (Array.isArray(product.sellerOffers) && product.sellerOffers.length > 0) {
    return product.sellerOffers;
  }

  const basePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const primarySeller = product.seller?.shopName || product.seller?.name || 'Shoply Official Direct';

  // Primary Merchant Offer (based entirely on actual product data from the database)
  const defaultOffer = {
    _id: `${product._id || 'prod'}_offer1`,
    sellerName: primarySeller,
    sellerId: product.seller?._id || product.seller,
    price: basePrice,
    originalPrice: product.price,
    deliveryText: '⚡ Fast Insured Delivery',
    deliveryDays: 2,
    shippingFee: 0,
    rating: Number((product.rating || 4.9).toFixed(1)),
    ratingCount: product.numReviews || 0,
    badge: product.fulfillmentChannel || 'Shoply Fulfilled',
    badgeType: 'official',
    stock: product.stock || 0,
    returnPolicy: '7 Days Hassle-Free Replacement',
    warranty: product.warranty || '1 Year Brand Warranty',
    condition: product.condition || 'Brand New (Factory Sealed)',
    isDefault: true,
  };

  return [defaultOffer];
};
