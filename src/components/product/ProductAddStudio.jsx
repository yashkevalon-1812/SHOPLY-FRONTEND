import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
import { handleImageError, SVG_FALLBACK } from '../../utils/imageHelper';
import {
  Package,
  Layers,
  Tag,
  Image as ImageIcon,
  ListPlus,
  Sliders,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info,
  Save,
  HelpCircle,
  Clock,
} from 'lucide-react';

const CATEGORIES = [
  'Luxury Watches',
  'Audio',
  'Electronics',
  'Fashion',
  'Shoes',
  'Accessories',
  'Home & Living',
  'Smartphones',
  'Cameras',
  'Gaming',
];

const PRESET_SAMPLE_IMAGES = [
  {
    label: 'Luxury Chronograph Watch',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfa4708ddf?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    label: 'Studio ANC Headphones',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    label: 'Mechanical Keyboard',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    label: 'Minimalist Runner Sneakers',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
    ],
  },
];

export const ProductAddStudio = ({
  mode = 'seller', // 'admin' | 'seller'
  initialData = null,
  isEditing = false,
  onSubmitProduct,
  backUrl = '/seller/products',
}) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('vital');
  const [submitting, setSubmitting] = useState(false);

  // Core Form State (Amazon-style schema)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    brand: initialData?.brand || (mode === 'admin' ? 'Shoply Selection' : ''),
    category: initialData?.category || 'Luxury Watches',
    sku: initialData?.sku || '',
    barcode: initialData?.barcode || '',
    hasNoBarcode: false,
    modelNumber: initialData?.modelNumber || '',
    price: initialData?.price ? String(initialData.price) : '',
    discountPrice: initialData?.discountPrice ? String(initialData.discountPrice) : '',
    stock: initialData?.stock !== undefined ? String(initialData.stock) : '15',
    condition: initialData?.condition || 'Brand New (Sealed)',
    fulfillmentChannel: initialData?.fulfillmentChannel || 'Shoply Fulfilled',
    maxOrderQty: '5',
    images: initialData?.images || [],
    heroImageInput: initialData?.images?.[0] || '',
    additionalImageInputs: initialData?.images?.slice(1) || ['', '', ''],
    bulletPoints:
      initialData?.bulletPoints && initialData.bulletPoints.length > 0
        ? initialData.bulletPoints
        : [
            'Engineered with premium aerospace-grade materials for enduring reliability',
            'Precision performance certified to international quality and safety benchmarks',
            'Designed with sleek minimalist ergonomics for effortless day-to-day utility',
            'Full compatibility with standard platform accessories and universal mounts',
            'Backed by official brand warranty and expedited Shoply customer support',
          ],
    description:
      initialData?.description ||
      'Experience exceptional craftsmanship and precision design with this flagship product. Hand-assembled using sustainable materials, rigorous performance testing, and an unyielding commitment to luxury standards.',
    specifications: initialData?.specifications || {
      Material: 'Stainless Steel & Top-Grain Leather',
      Color: 'Obsidian Black',
      Warranty: '2 Year Official Manufacturer Warranty',
      'Country of Origin': 'India',
    },
    isFeatured: Boolean(initialData?.isFeatured),
    isFlashDeal: Boolean(initialData?.isFlashDeal),
  });

  // Synchronize state when initialData updates (e.g. async fetch in edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        brand: initialData.brand || (mode === 'admin' ? 'Shoply Selection' : ''),
        category: initialData.category || 'Luxury Watches',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        hasNoBarcode: initialData.barcode === 'EXEMPT',
        modelNumber: initialData.modelNumber || '',
        price: initialData.price ? String(initialData.price) : '',
        discountPrice: initialData.discountPrice ? String(initialData.discountPrice) : '',
        stock: initialData.stock !== undefined ? String(initialData.stock) : '15',
        condition: initialData.condition || 'Brand New (Sealed)',
        fulfillmentChannel: initialData.fulfillmentChannel || 'Shoply Fulfilled',
        maxOrderQty: '5',
        images: initialData.images || [],
        heroImageInput: initialData.images?.[0] || '',
        additionalImageInputs: initialData.images?.slice(1) || ['', '', ''],
        bulletPoints:
          initialData.bulletPoints && initialData.bulletPoints.length > 0
            ? initialData.bulletPoints
            : [
                'Engineered with premium aerospace-grade materials for enduring reliability',
                'Precision performance certified to international quality and safety benchmarks',
                'Designed with sleek minimalist ergonomics for effortless day-to-day utility',
                'Full compatibility with standard platform accessories and universal mounts',
                'Backed by official brand warranty and expedited Shoply customer support',
              ],
        description:
          initialData.description ||
          'Experience exceptional craftsmanship and precision design with this flagship product. Hand-assembled using sustainable materials, rigorous performance testing, and an unyielding commitment to luxury standards.',
        specifications: initialData.specifications || {
          Material: 'Stainless Steel & Top-Grain Leather',
          Color: 'Obsidian Black',
          Warranty: '2 Year Official Manufacturer Warranty',
          'Country of Origin': 'India',
        },
        isFeatured: Boolean(initialData.isFeatured),
        isFlashDeal: Boolean(initialData.isFlashDeal),
      });
    }
  }, [initialData, mode]);

  // Custom specification builder state
  const [customSpecKey, setCustomSpecKey] = useState('');
  const [customSpecValue, setCustomSpecValue] = useState('');

  // Auto-generate SKU helper
  const handleGenerateSKU = () => {
    const prefix = mode === 'admin' ? 'SHP-ADM' : 'SHP-SLR';
    const catCode = (formData.category || 'GEN').substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${catCode}-${random}` }));
    addToast('Generated unique SKU code', 'info');
  };

  // Add bullet point
  const handleAddBulletPoint = () => {
    if (formData.bulletPoints.length >= 8) {
      addToast('Maximum 8 key feature bullet points recommended', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      bulletPoints: [...prev.bulletPoints, ''],
    }));
  };

  const handleUpdateBulletPoint = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.bulletPoints];
      updated[index] = value;
      return { ...prev, bulletPoints: updated };
    });
  };

  const handleRemoveBulletPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index),
    }));
  };

  // Handle Specifications Add/Remove
  const handleAddSpecification = () => {
    if (!customSpecKey.trim() || !customSpecValue.trim()) {
      addToast('Please enter both attribute name and value', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [customSpecKey.trim()]: customSpecValue.trim(),
      },
    }));
    setCustomSpecKey('');
    setCustomSpecValue('');
  };

  const handleRemoveSpecification = (keyToRemove) => {
    setFormData((prev) => {
      const copy = { ...prev.specifications };
      delete copy[keyToRemove];
      return { ...prev, specifications: copy };
    });
  };

  // Handle Additional Image URL changes
  const handleUpdateAdditionalImage = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.additionalImageInputs];
      updated[index] = value;
      return { ...prev, additionalImageInputs: updated };
    });
  };

  const handleAddImageSlot = () => {
    if (formData.additionalImageInputs.length >= 6) {
      addToast('Maximum 6 additional gallery slots allowed', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      additionalImageInputs: [...prev.additionalImageInputs, ''],
    }));
  };

  const handleApplyPresetImages = (preset) => {
    setFormData((prev) => ({
      ...prev,
      heroImageInput: preset.images[0] || '',
      additionalImageInputs: preset.images.slice(1).concat(['']),
    }));
    addToast(`Applied image preset for ${preset.label}`, 'success');
  };

  // Computed assembled image array
  const allImages = useMemo(() => {
    const list = [formData.heroImageInput, ...formData.additionalImageInputs]
      .map((url) => (url ? url.trim() : ''))
      .filter(Boolean);
    return list.length > 0
      ? list
      : ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80'];
  }, [formData.heroImageInput, formData.additionalImageInputs]);

  // Tab validation checks for status indicators
  const tabStatus = useMemo(() => {
    const vitalValid = Boolean(formData.title.trim() && formData.category && formData.brand.trim());
    const offerValid = Boolean(
      formData.price && Number(formData.price) > 0 && formData.stock !== ''
    );
    const mediaValid = Boolean(formData.heroImageInput.trim() || allImages.length > 0);
    const descValid = Boolean(
      formData.description.trim() && formData.bulletPoints.some((b) => b.trim())
    );
    const specsValid = Object.keys(formData.specifications).length > 0;

    return {
      vital: vitalValid,
      offer: offerValid,
      media: mediaValid,
      desc: descValid,
      specs: specsValid,
      preview: vitalValid && offerValid && mediaValid,
    };
  }, [formData, allImages]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      setActiveTab('vital');
      addToast('Product Title is required in Vital Info', 'error');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setActiveTab('offer');
      addToast('A valid regular price is required in Offer & Pricing', 'error');
      return;
    }
    if (
      formData.discountPrice &&
      Number(formData.discountPrice) >= Number(formData.price)
    ) {
      setActiveTab('offer');
      addToast('Sale price must be lower than the standard regular price', 'error');
      return;
    }
    if (allImages.length === 0) {
      setActiveTab('media');
      addToast('Please provide at least one product image', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        category: formData.category,
        brand: formData.brand.trim() || (mode === 'admin' ? 'Shoply Selection' : 'Merchant Store'),
        stock: Number(formData.stock) || 0,
        images: allImages,
        sku: formData.sku.trim(),
        barcode: formData.hasNoBarcode ? 'EXEMPT' : formData.barcode.trim(),
        condition: formData.condition,
        fulfillmentChannel: formData.fulfillmentChannel,
        bulletPoints: formData.bulletPoints.map((b) => b.trim()).filter(Boolean),
        specifications: formData.specifications,
        warranty: formData.specifications['Warranty'] || '1 Year Brand Warranty',
        isFeatured: Boolean(formData.isFeatured),
        isFlashDeal: Boolean(formData.isFlashDeal),
      };

      await onSubmitProduct(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const TABS = [
    { id: 'vital', label: 'Vital Info', icon: Package, valid: tabStatus.vital },
    { id: 'offer', label: 'Offer & Pricing', icon: Tag, valid: tabStatus.offer },
    { id: 'media', label: 'Images & Gallery', icon: ImageIcon, valid: tabStatus.media },
    { id: 'desc', label: 'Description & Features', icon: ListPlus, valid: tabStatus.desc },
    { id: 'specs', label: 'Specifications', icon: Sliders, valid: tabStatus.specs },
    { id: 'preview', label: 'Listing Preview', icon: Eye, valid: tabStatus.preview },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in font-sans">
      {/* Top Breadcrumb & Controls Bar */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <Link to={backUrl} className="hover:text-amber-500 transition-colors">
                {mode === 'admin' ? 'Admin Portal' : 'Seller Studio'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to={backUrl} className="hover:text-amber-500 transition-colors">
                Products
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-amber-600 dark:text-amber-400">
                {isEditing ? 'Edit Listing' : 'Amazon-Style Product Studio'}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {isEditing ? `Edit: ${formData.title || 'Product'}` : 'Create New Product Listing'}
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Amazon Listing Wizard
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-medium">
              Structure complete vital data, Amazon-standard 5 bullet points, high-definition photo gallery, and pricing with instant storefront preview.
            </p>

            {mode === 'seller' && (
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Admin Moderation Policy: New seller listings will be reviewed by administrators before going live on the storefront.
                </span>
              </div>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              to={backUrl}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : mode === 'seller'
                  ? 'Submit for Approval'
                  : 'Publish Listing'}
              </span>
            </button>
          </div>
        </div>

        {/* Amazon-Style Multi-Tab Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? 'bg-white/20 dark:bg-slate-950/20 text-current'
                        : tab.valid
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.valid ? '✓' : idx + 1}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Studio Body Content based on Active Tab */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:p-8 shadow-sm transition-colors">
        {/* ========================================================================= */}
        {/* TAB 1: VITAL INFO */}
        {/* ========================================================================= */}
        {activeTab === 'vital' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Product Identity & Vital Attributes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Provide essential brand classification, title, and tracking identifiers according to Amazon catalog standards.
              </p>
            </div>

            {/* Product Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Item Title / Name <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[10px] font-bold ${
                    formData.title.length > 150
                      ? 'text-amber-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {formData.title.length} / 200 characters
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={200}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Shoply Chronograph Noir Heritage Luxury Swiss Automatic Watch - 42mm Sapphire Glass"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-500 shrink-0" />
                Amazon formula: [Brand] + [Series/Model] + [Product Type] + [Key Material/Feature/Color]
              </p>
            </div>

            {/* Brand & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Shoply Selection, NP Creation, Apple, Nike"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Storefront Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors font-bold cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SKU and Barcode (GTIN / EAN / UPC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Seller SKU (Inventory Code)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    + Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. SHP-WAT-4921"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Product ID / Barcode (EAN / UPC / GTIN)
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasNoBarcode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasNoBarcode: e.target.checked,
                          barcode: e.target.checked ? 'EXEMPT' : '',
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>GTIN Exemption</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={formData.hasNoBarcode}
                  value={formData.hasNoBarcode ? 'EXEMPT (No barcode required)' : formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="e.g. 8901234567890"
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs transition-colors font-mono ${
                    formData.hasNoBarcode
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OFFER & PRICING */}
        {/* ========================================================================= */}
        {activeTab === 'offer' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                Offer & Commercial Terms
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure standard price, promotional sale discount, inventory units, and order constraints.
              </p>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-black text-slate-900 dark:text-white mb-1.5">
                  Standard List Price (MRP in ₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2999"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Preview: {formData.price ? formatINR(Number(formData.price)) : '₹0'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-900 dark:text-white">
                    Sale / Promotional Price (₹)
                  </label>
                  {formData.price &&
                    formData.discountPrice &&
                    Number(formData.discountPrice) < Number(formData.price) && (
                      <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {Math.round(
                          ((Number(formData.price) - Number(formData.discountPrice)) /
                            Number(formData.price)) *
                            100
                        )}
                        % OFF DEAL
                      </span>
                    )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="Optional (e.g. 2499)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave empty if selling at regular standard list price
                </p>
              </div>
            </div>

            {/* Inventory Stock & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Stock Units Available <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="10"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Item Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-bold"
                >
                  <option value="Brand New (Sealed)">Brand New (Sealed)</option>
                  <option value="Open Box / Like New">Open Box / Like New</option>
                  <option value="Certified Refurbished">Certified Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Max Order Qty Per Buyer
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxOrderQty}
                  onChange={(e) => setFormData({ ...formData, maxOrderQty: e.target.value })}
                  placeholder="5"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Fulfillment Channel Radio Selector */}
            <div className="pt-2">
              <label className="block text-xs font-black text-slate-900 dark:text-white mb-3">
                Fulfillment Channel (Delivery SLA)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, fulfillmentChannel: 'Shoply Fulfilled' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.fulfillmentChannel === 'Shoply Fulfilled'
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                    <span className="font-black text-xs text-slate-900 dark:text-white">
                      Shoply Express Fulfilled (Recommended)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pl-7">
                    Items dispatched via Shoply Logistics Hub with Next-Day Delivery badge and prime customer guarantee.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, fulfillmentChannel: 'Merchant Fulfilled' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.fulfillmentChannel === 'Merchant Fulfilled'
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-slate-500 shrink-0" />
                    <span className="font-black text-xs text-slate-900 dark:text-white">
                      Merchant Direct Fulfillment (Self-Ship)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pl-7">
                    You package and ship the order using your preferred local courier service within standard 3-5 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: IMAGES & GALLERY */}
        {/* ========================================================================= */}
        {activeTab === 'media' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  Product Imagery & Multi-Angle Gallery
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Amazon standard: High-resolution images on pure or clean backgrounds. Paste direct image URLs or select one of our curated sample presets.
                </p>
              </div>

              {/* Sample Preset dropdown/buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                {PRESET_SAMPLE_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPresetImages(preset)}
                    className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Hero Image */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-black text-slate-900 dark:text-white">
                Main Hero Image (Primary Showcase) <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {formData.heroImageInput ? (
                    <img
                      src={formData.heroImageInput}
                      alt="Hero preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, formData.heroImageInput)}
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[9px] block">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 w-full space-y-2">
                  <input
                    type="url"
                    value={formData.heroImageInput}
                    onChange={(e) => setFormData({ ...formData, heroImageInput: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    This image will appear in search results, catalog cards, and as the hero display on the product details page.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Multi-Angle Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Additional Angle Image Slots
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Include back angle, closeup texture, lifestyle, and size scale.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddImageSlot}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Angle Slot</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.additionalImageInputs.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={`Slot ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, imgUrl)}
                        />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">Slot {idx + 1}</span>
                      )}
                    </div>

                    <input
                      type="url"
                      value={imgUrl}
                      onChange={(e) => handleUpdateAdditionalImage(idx, e.target.value)}
                      placeholder={`Angle ${idx + 1} Image URL...`}
                      className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
                    />

                    {formData.additionalImageInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            additionalImageInputs: prev.additionalImageInputs.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        title="Remove slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DESCRIPTION & 5 BULLET POINTS */}
        {/* ========================================================================= */}
        {activeTab === 'desc' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-amber-500" />
                Key Product Features & Detailed Description
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Amazon's signature "About this item" bullet points appear at the top near the buy box. These drive the highest conversion.
              </p>
            </div>

            {/* Amazon-Style 5 Bullet Points */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Key Product Features ("About this item" Bullet Points)</span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                      High Impact
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Buyers read these bullet points first. Write clear benefits starting with short capitalized headers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddBulletPoint}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bullet Point</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.bulletPoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="w-6 text-center text-xs font-black text-amber-500 shrink-0">
                      • {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handleUpdateBulletPoint(idx, e.target.value)}
                      placeholder={`Key Feature ${idx + 1} (e.g. ULTRA-DURABLE TITANIUM BEZEL: Crafted from...)`}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                    />
                    {formData.bulletPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBulletPoint(idx)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Bullet Point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Long Description Textarea */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <label className="block text-xs font-black text-slate-900 dark:text-white mb-1.5">
                Comprehensive Product Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Elaborate on the craftsmanship, technical performance, warranty, and package contents..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 leading-relaxed font-medium"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: TECHNICAL SPECIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'specs' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                Technical Specifications & Attribute Pairs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Structured specification table rendered on the storefront (e.g. Dimensions, Weight, Materials, Origin).
              </p>
            </div>

            {/* Current Specifications Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-1/3">Technical Attribute</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {Object.entries(formData.specifications).map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{key}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {val}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(key)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Custom Specification Row */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Add Specification Attribute
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={customSpecKey}
                  onChange={(e) => setCustomSpecKey(e.target.value)}
                  placeholder="Attribute (e.g. Battery Life, Weight, Material)"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium"
                />
                <input
                  type="text"
                  value={customSpecValue}
                  onChange={(e) => setCustomSpecValue(e.target.value)}
                  placeholder="Value (e.g. Up to 48 Hours, 185g, Titanium)"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddSpecification}
                  className="bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:opacity-90 shrink-0 cursor-pointer"
                >
                  + Add Spec
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: LIVE STOREFRONT PREVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                Live Customer Storefront Mockup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualizing how this listing will render to customers on the public Shoply marketplace.
              </p>
            </div>

            {/* Split View Mockup */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Gallery Carousel Column */}
              <div className="space-y-3">
                <div className="w-full aspect-square rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs flex items-center justify-center">
                  <img
                    src={allImages[0]}
                    alt="Main Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, allImages[0])}
                  />
                </div>

                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-2xs"
                      >
                        <img
                          src={img}
                          alt={`Thumb ${i}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, img)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Buy Box Column */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      {formData.brand || 'Brand'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formData.category}
                    </span>
                  </div>

                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {formData.title || 'Untitled Product Item'}
                  </h2>

                  {/* Rating Stars Mock */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-500 font-bold">★★★★★</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">5.0</span>
                    <span className="text-slate-400">(New Release)</span>
                  </div>

                  {/* Pricing Box */}
                  <div className="py-2 border-y border-slate-200 dark:border-slate-800 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formData.discountPrice && Number(formData.discountPrice) > 0
                        ? formatINR(Number(formData.discountPrice))
                        : formData.price
                        ? formatINR(Number(formData.price))
                        : '₹0'}
                    </span>

                    {formData.discountPrice && Number(formData.discountPrice) > 0 && (
                      <>
                        <span className="text-sm line-through text-slate-400">
                          {formatINR(Number(formData.price))}
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          Save{' '}
                          {formatINR(Number(formData.price) - Number(formData.discountPrice))}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      ✓ In Stock ({formData.stock} units)
                    </span>
                    <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-500" />
                      {formData.fulfillmentChannel}
                    </span>
                  </div>

                  {/* Bullet Points Preview */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      About this item:
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {formData.bulletPoints
                        .filter((b) => b.trim())
                        .map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold shrink-0">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {submitting ? 'Publishing...' : 'Looks Great — Publish to Marketplace'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3.5 px-6 sm:px-10 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to={backUrl}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </Link>

          <span className="text-xs text-slate-400 font-medium hidden md:inline">
            Step {TABS.findIndex((t) => t.id === activeTab) + 1} of {TABS.length}:{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {TABS.find((t) => t.id === activeTab)?.label}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Previous Step Button */}
          {activeTab !== 'vital' && (
            <button
              type="button"
              onClick={() => {
                const curIdx = TABS.findIndex((t) => t.id === activeTab);
                if (curIdx > 0) setActiveTab(TABS[curIdx - 1].id);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Previous
            </button>
          )}

          {/* Next Step Button */}
          {activeTab !== 'preview' ? (
            <button
              type="button"
              onClick={() => {
                const curIdx = TABS.findIndex((t) => t.id === activeTab);
                if (curIdx < TABS.length - 1) setActiveTab(TABS[curIdx + 1].id);
              }}
              className="flex items-center gap-1.5 bg-slate-950 text-white dark:bg-slate-800 dark:text-white hover:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}

          {/* Final Submit / Publish Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-black shadow-md hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish Listing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
