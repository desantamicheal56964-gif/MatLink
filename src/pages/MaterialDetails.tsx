import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Calendar,
  Layers,
  TrendingDown,
  CheckCircle,
  Truck,
  Share2,
  DollarSign,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { MaterialListing, ConstructionSite } from '../types';

interface MaterialDetailsProps {
  materialId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const MaterialDetails: React.FC<MaterialDetailsProps> = ({ materialId, onNavigate }) => {
  const { user } = useAuth();
  const [material, setMaterial] = useState<MaterialListing | null>(null);
  const [site, setSite] = useState<ConstructionSite | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Purchase request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestQty, setRequestQty] = useState<number>(1);
  const [deliveryPref, setDeliveryPref] = useState<
    'Self Pickup from Site' | 'Site Delivery Required' | 'Third-Party Logistics'
  >('Self Pickup from Site');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await db.getMaterialById(materialId);
      if (data) {
        setMaterial(data);
        setSelectedImage(data.images[0] || '');
        if (data.site_id) {
          const sites = await db.getConstructionSites();
          const s = sites.find((x) => x.id === data.site_id);
          if (s) setSite(s);
        }
        // Set initial request quantity to minimum
        setRequestQty(Math.min(data.available_quantity, 10));
      }
      setLoading(false);
    }
    loadData();
  }, [materialId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#7561A8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#8B8D98] mt-3">Loading material specifications...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#252536]">Material Listing Not Found</h2>
        <p className="text-xs text-[#8B8D98]">The requested material may have been sold or removed.</p>
        <button
          onClick={() => onNavigate('explore')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7561A8] text-white"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const savingsPercent = Math.round(
    ((material.original_market_price - material.selling_price) / material.original_market_price) * 100
  );
  const totalOfferedPrice = requestQty * material.selling_price;
  const totalMarketPrice = requestQty * material.original_market_price;
  const totalSavings = totalMarketPrice - totalOfferedPrice;

  const handleSendPurchaseRequest = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    if (requestQty <= 0 || requestQty > material.available_quantity) {
      alert(`Please enter a quantity between 1 and ${material.available_quantity}`);
      return;
    }

    setSubmitting(true);
    try {
      await db.createPurchaseRequest({
        material_id: material.id,
        buyer_id: user.id,
        buyer_name: user.full_name,
        buyer_email: user.email,
        buyer_phone: user.phone_number || '+91 99234 55667',
        seller_id: material.seller_id,
        seller_name: material.seller_name || 'Seller',
        seller_phone: material.seller_phone,
        requested_quantity: requestQty,
        unit: material.unit,
        offered_price_per_unit: material.selling_price,
        total_amount: totalOfferedPrice,
        delivery_preference: deliveryPref,
        message: message.trim() || 'Interested in procuring this surplus stock for our site.',
      });

      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        onNavigate('buyer');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to submit purchase request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('explore')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#7561A8] hover:text-[#51416F] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        {/* Left: Images Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={selectedImage || material.images[0]}
              alt={material.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#7561A8] text-white shadow-xs">
              {material.category}
            </span>
            <span className="absolute bottom-3 right-3 px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
              {savingsPercent}% DISCOUNT
            </span>
          </div>

          {/* Thumbnails */}
          {material.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {material.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img ? 'border-[#7561A8] scale-105' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Security Guarantee */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-[#51416F] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#7561A8] shrink-0" />
            <span>
              Direct builder procurement. Verified surplus from active Pune construction sites.
            </span>
          </div>
        </div>

        {/* Right: Info Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7561A8] mb-1">
                <span>Listing ID: #{material.id}</span>
                <span>•</span>
                <span className="text-[#8B8D98]">
                  Listed {new Date(material.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536] leading-tight">
                {material.title}
              </h1>
            </div>

            {/* Location & Condition Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F1F2F5] text-[#252536] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#7561A8]" />
                <span>{material.location_name}</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                Condition: <strong className="font-bold">{material.condition}</strong>
              </div>
              {material.ai_inspected && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-sky-800 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#72B9E8]" />
                  <span>AI Inspected Quality</span>
                </div>
              )}
            </div>

            {/* Pricing Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/80 to-sky-50/80 border border-purple-100 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="text-xs text-[#8B8D98] block">Discounted Platform Price</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-[#252536]">
                    ₹{material.selling_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#8B8D98]">per {material.unit}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#8B8D98] block">Standard Market Price</span>
                <span className="text-sm line-through text-gray-400 font-semibold">
                  ₹{material.original_market_price.toLocaleString('en-IN')}
                </span>
                <span className="block text-xs font-bold text-emerald-700">
                  Save ₹{(material.original_market_price - material.selling_price).toLocaleString('en-IN')} ({savingsPercent}%)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8D98]">Description & Specifications</h3>
              <p className="text-xs sm:text-sm text-[#51416F] leading-relaxed whitespace-pre-line">
                {material.description}
              </p>
            </div>

            {/* AI Inspection Notes if present */}
            {material.ai_inspected && material.ai_inspection_notes && (
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                  <Sparkles className="w-4 h-4 text-[#72B9E8]" />
                  Gemini Vision Preliminary Assessment
                </div>
                <p className="text-xs text-sky-800 leading-relaxed">
                  {material.ai_inspection_notes}
                </p>
              </div>
            )}

            {/* Inventory Specs Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F1F2F5]">
                <span className="text-[11px] text-[#8B8D98] block">Available Inventory</span>
                <span className="text-sm font-bold text-[#252536]">
                  {material.available_quantity} {material.unit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F1F2F5]">
                <span className="text-[11px] text-[#8B8D98] block">Original Batch Size</span>
                <span className="text-sm font-bold text-[#252536]">
                  {material.original_quantity || material.available_quantity} {material.unit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F1F2F5]">
                <span className="text-[11px] text-[#8B8D98] block">Status</span>
                <span className="text-sm font-bold text-emerald-700 uppercase">
                  {material.status}
                </span>
              </div>
            </div>

            {/* Seller & Construction Site Information */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-3">
              <h4 className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#7561A8]" />
                Construction Site & Seller Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8B8D98] block text-[11px]">Developer / Seller:</span>
                  <p className="font-semibold text-[#252536]">
                    {material.seller_company || material.seller_name || 'Kumar Properties Pune'}
                  </p>
                  <p className="text-[#8B8D98] text-[11px]">Contact: {material.seller_phone || '+91 98220 11442'}</p>
                </div>
                <div>
                  <span className="text-[#8B8D98] block text-[11px]">Active Site Name:</span>
                  <p className="font-semibold text-[#252536]">
                    {material.site_name || site?.name || 'Hinjawadi IT Park Phase 3 Commercial Tower'}
                  </p>
                  <button
                    onClick={() => onNavigate('map', { siteId: material.site_id })}
                    className="text-[11px] text-[#7561A8] hover:underline font-medium flex items-center gap-1 mt-0.5"
                  >
                    <MapPin className="w-3 h-3" />
                    View site coordinates on Pune Map
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-md shadow-[#7561A8]/30 transition-all flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Send Purchase Request
            </button>
            <button
              onClick={() => onNavigate('map', { siteId: material.site_id })}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-bold text-sm bg-[#F1F2F5] hover:bg-gray-200 text-[#51416F] transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Site Map Location
            </button>
          </div>
        </div>
      </div>

      {/* PURCHASE REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {requestSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#252536]">Purchase Request Submitted!</h3>
                <p className="text-xs text-[#8B8D98] max-w-xs mx-auto">
                  The seller has received your request. You will be redirected to your Buyer Dashboard to track approval.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#252536]">
                      Send Purchase Request
                    </h3>
                    <p className="text-xs text-[#8B8D98]">{material.title}</p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Quantity selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#252536] flex justify-between">
                    <span>Required Quantity ({material.unit})</span>
                    <span className="text-[#8B8D98]">Max Available: {material.available_quantity} {material.unit}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={material.available_quantity}
                      value={requestQty}
                      onChange={(e) => setRequestQty(Number(e.target.value))}
                      className="w-full bg-[#F1F2F5] text-sm text-[#252536] font-bold p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setRequestQty(material.available_quantity)}
                      className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-[#7561A8] font-semibold text-xs rounded-xl shrink-0"
                    >
                      Buy All
                    </button>
                  </div>
                </div>

                {/* Delivery Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#252536]">Delivery Preference</label>
                  <select
                    value={deliveryPref}
                    onChange={(e) => setDeliveryPref(e.target.value as any)}
                    className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
                  >
                    <option value="Self Pickup from Site">Self Pickup from Site (Buyer arranges vehicle)</option>
                    <option value="Site Delivery Required">Site Delivery Required (Seller arranges tempo)</option>
                    <option value="Third-Party Logistics">Third-Party Logistics Partner (Porter/Blowhorn)</option>
                  </select>
                </div>

                {/* Note / Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#252536]">Message to Seller (Optional)</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify target delivery date, vehicle details, or any questions..."
                    className="w-full bg-[#F1F2F5] text-xs text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2 text-xs">
                  <div className="flex justify-between text-[#8B8D98]">
                    <span>Market Value:</span>
                    <span className="line-through">₹{totalMarketPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#252536] text-sm">
                    <span>Your Total Price ({requestQty} {material.unit}):</span>
                    <span className="text-[#7561A8]">₹{totalOfferedPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-purple-200">
                    <span>Estimated Money Saved:</span>
                    <span>₹{totalSavings.toLocaleString('en-IN')} ({savingsPercent}%)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-bold text-[#8B8D98] hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendPurchaseRequest}
                    disabled={submitting}
                    className="flex-2 py-3 rounded-xl text-xs font-bold bg-[#7561A8] hover:bg-[#51416F] text-white shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Request...' : 'Confirm & Send Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
