import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Building,
  MapPin,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { MaterialCategory, MaterialUnit, MaterialCondition, ConstructionSite } from '../types';

interface ListMaterialProps {
  onNavigate: (page: string, params?: any) => void;
  prefillData?: any;
}

const CATEGORIES: MaterialCategory[] = [
  'Cement',
  'Bricks',
  'Sand',
  'Steel',
  'Tiles',
  'Wooden Materials',
  'Pipes',
  'Electrical Materials',
  'Paint',
  'Stone',
  'Doors and Windows',
  'Other Construction Materials',
];

const UNITS: MaterialUnit[] = [
  'Bags',
  'Pieces',
  'Tons',
  'Sq. Ft',
  'Meters',
  'Liters',
  'Truckloads',
  'Units',
];

const CONDITIONS: MaterialCondition[] = ['Excellent', 'Good', 'Average', 'Poor'];

const SAMPLE_MATERIAL_PHOTOS: Record<string, string[]> = {
  Cement: [
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
  ],
  Steel: [
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  ],
  Bricks: [
    'https://images.unsplash.com/photo-1584463699026-6a978f8cb64c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80',
  ],
  Tiles: [
    'https://images.unsplash.com/photo-1581404476143-fb31d742929f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  ],
  Sand: [
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
  ],
  Pipes: [
    'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&auto=format&fit=crop&q=80',
  ],
  'Wooden Materials': [
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80',
  ],
  'Electrical Materials': [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  ],
  Paint: [
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=80',
  ],
  Stone: [
    'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800&auto=format&fit=crop&q=80',
  ],
  'Doors and Windows': [
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80',
  ],
  'Other Construction Materials': [
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  ],
};

export const ListMaterial: React.FC<ListMaterialProps> = ({ onNavigate, prefillData }) => {
  const { user } = useAuth();
  const [sites, setSites] = useState<ConstructionSite[]>([]);

  // Form states
  const [title, setTitle] = useState(prefillData?.material_type || '');
  const [category, setCategory] = useState<MaterialCategory>(prefillData?.category || 'Cement');
  const [description, setDescription] = useState(prefillData?.ai_generated_description || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<MaterialUnit>('Bags');
  const [marketPrice, setMarketPrice] = useState<number>(400);
  const [sellingPrice, setSellingPrice] = useState<number>(260);
  const [condition, setCondition] = useState<MaterialCondition>(prefillData?.condition || 'Excellent');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [customLocation, setCustomLocation] = useState('Hinjawadi Phase 3, Pune');
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '+91 98220 11442');
  const [images, setImages] = useState<string[]>(
    prefillData?.image_url ? [prefillData.image_url] : SAMPLE_MATERIAL_PHOTOS['Cement']
  );
  const [isAiPrefilled, setIsAiPrefilled] = useState(Boolean(prefillData));
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSites() {
      const allSites = await db.getConstructionSites();
      setSites(allSites);
      if (allSites.length > 0) {
        setSelectedSiteId(allSites[0].id);
        setCustomLocation(allSites[0].address);
      }
    }
    loadSites();
  }, []);

  // Update default photos when category changes if user hasn't uploaded custom
  const handleCategoryChange = (newCat: MaterialCategory) => {
    setCategory(newCat);
    if (!prefillData?.image_url) {
      setImages(SAMPLE_MATERIAL_PHOTOS[newCat] || SAMPLE_MATERIAL_PHOTOS['Cement']);
    }
    // Update suggested unit
    if (newCat === 'Cement') setUnit('Bags');
    else if (newCat === 'Steel') setUnit('Tons');
    else if (newCat === 'Bricks') setUnit('Pieces');
    else if (newCat === 'Sand') setUnit('Truckloads');
    else if (newCat === 'Tiles' || newCat === 'Stone') setUnit('Sq. Ft');
    else if (newCat === 'Pipes') setUnit('Pieces');
    else if (newCat === 'Electrical Materials') setUnit('Meters');
    else if (newCat === 'Paint') setUnit('Units');
  };

  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId);
    const chosen = sites.find((s) => s.id === siteId);
    if (chosen) {
      setCustomLocation(chosen.address);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [event.target!.result as string, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }

    if (!title.trim() || quantity <= 0 || sellingPrice <= 0) {
      alert('Please fill out all required fields with valid quantities and prices.');
      return;
    }

    setSubmitting(true);
    try {
      const chosenSite = sites.find((s) => s.id === selectedSiteId);

      const newListing = await db.addMaterial({
        seller_id: user.id,
        seller_name: user.full_name,
        seller_phone: contactPhone,
        seller_company: user.company_name,
        site_id: selectedSiteId || undefined,
        site_name: chosenSite?.name,
        title: title.trim(),
        category,
        description: description.trim(),
        available_quantity: Number(quantity),
        original_quantity: Number(quantity),
        unit,
        original_market_price: Number(marketPrice),
        selling_price: Number(sellingPrice),
        condition,
        status: 'available',
        location_name: customLocation || chosenSite?.address || 'Pune',
        latitude: chosenSite ? Number(chosenSite.latitude) : 18.5204,
        longitude: chosenSite ? Number(chosenSite.longitude) : 73.8567,
        ai_inspected: isAiPrefilled,
        ai_inspection_notes: prefillData?.ai_generated_description
          ? `AI Inspector: ${prefillData.ai_generated_description}`
          : undefined,
        images: images.length > 0 ? images : SAMPLE_MATERIAL_PHOTOS[category],
      });

      setSuccessId(newListing.id);
    } catch (err: any) {
      alert(err.message || 'Error publishing material listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-[#252536]">
          Material Listed Successfully!
        </h2>
        <p className="text-xs text-[#8B8D98] max-w-md mx-auto">
          Your listing has been assigned ID <strong>#{successId}</strong> and is now live on the Pune Construction Material Exchange.
        </p>
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={() => onNavigate('material-details', { id: successId })}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7561A8] text-white shadow-sm"
          >
            View Live Listing
          </button>
          <button
            onClick={() => onNavigate('seller')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F1F2F5] text-[#51416F] hover:bg-gray-200"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  const savingsPercentage = marketPrice > 0 ? Math.round(((marketPrice - sellingPrice) / marketPrice) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <PlusCircle className="w-4 h-4" />
            Seller Portal
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            List Your Leftover Construction Material
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
            Turn surplus cement, steel, bricks, and tiles into working capital while preventing landfill waste.
          </p>
        </div>

        {/* AI Inspector CTA */}
        <button
          type="button"
          onClick={() => onNavigate('inspector')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#7561A8] to-[#72B9E8] text-white shadow-sm flex items-center gap-1.5 hover:scale-105 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Pre-Inspect with AI
        </button>
      </div>

      {isAiPrefilled && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start justify-between gap-3 text-xs text-sky-900">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-[#72B9E8] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">AI Inspector Autofilled Details</strong>
              <span>
                Material name, category, condition assessment, and description were populated by Gemini Vision AI. You can edit any field before submitting.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAiPrefilled(false)}
            className="text-[11px] font-bold text-sky-700 hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Listing Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-base text-[#252536] border-b border-gray-100 pb-2">
            1. Material Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">
                Material Name / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Surplus OPC 53 Grade UltraTech Cement Bags"
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">
                Material Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as MaterialCategory)}
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">
                Condition Assessment <span className="text-rose-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as MaterialCondition)}
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe batch manufacture dates, storage conditions (elevated pallets, indoor/outdoor), reason for surplus, and specifications..."
                className="w-full bg-[#F1F2F5] text-xs text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Quantity & Pricing */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-display font-bold text-base text-[#252536] border-b border-gray-100 pb-2">
            2. Quantity & Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#252536]">
                Available Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-bold"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#252536]">
                Unit of Measurement <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#252536]">
                Original Market Price (₹ per unit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={marketPrice}
                onChange={(e) => setMarketPrice(Number(e.target.value))}
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#252536]">
                Discounted Selling Price (₹ per unit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#7561A8] font-bold p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Pricing Incentive Badge */}
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between text-xs text-[#51416F]">
            <span>
              Buyer Savings: <strong className="text-emerald-700 font-bold">{savingsPercentage}% OFF</strong> market rate
            </span>
            <span>
              Expected Gross Revenue: <strong className="text-[#252536]">₹{(quantity * sellingPrice).toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>

        {/* Section 3: Location & Construction Site */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-display font-bold text-base text-[#252536] border-b border-gray-100 pb-2">
            3. Construction Site Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Associated Pune Site</label>
              <select
                value={selectedSiteId}
                onChange={(e) => handleSiteSelect(e.target.value)}
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.area})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Pickup Address / Landmark</label>
              <input
                type="text"
                required
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Hinjawadi Phase 3, Rajiv Gandhi Infotech Park"
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98220 11442"
                className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Material Photos */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[#252536]">
              4. Material Photographs
            </h3>
            <span className="text-xs text-[#8B8D98]">Multiple images supported</span>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#7561A8] transition-colors cursor-pointer relative bg-[#F1F2F5]/40">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <Upload className="w-8 h-8 text-[#7561A8] mx-auto" />
              <p className="text-xs font-semibold text-[#252536]">
                Click or drag & drop photographs of your leftover stock
              </p>
              <p className="text-[11px] text-[#8B8D98]">Supports JPG, PNG, WEBP (Max 10MB each)</p>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                    Photo {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('seller')}
            className="px-5 py-3 rounded-xl text-xs font-bold text-[#8B8D98] hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl font-bold text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-md shadow-[#7561A8]/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Publishing Listing...' : 'Publish Surplus Listing'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
