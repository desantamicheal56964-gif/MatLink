import React, { useState, useEffect } from 'react';
import {
  Upload,
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  ArrowRight,
  Layers,
  Building,
  Phone,
  LogIn,
} from 'lucide-react';
import { db, isUuid, isSupabaseConfigured } from '../services/db';
import { useAuth } from '../context/AuthContext';
import {
  MaterialCategory,
  MaterialUnit,
  MaterialCondition,
  ConstructionSite,
  MaterialInspectionResult,
} from '../types';

interface SellerSellPageProps {
  onNavigate: (page: string, params?: any) => void;
  preselectedSiteId?: string;
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

/**
 * Resize and compress uploaded phone/camera images cleanly so they save reliably
 * to Supabase (`material_images`) and local storage without payload bloat.
 */
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Empty image data.'));
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 960;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const SellerSellPage: React.FC<SellerSellPageProps> = ({
  onNavigate,
  preselectedSiteId,
  prefillData,
}) => {
  const { user } = useAuth();
  const [sites, setSites] = useState<ConstructionSite[]>([]);

  // Uploaded photos state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(
    prefillData?.image_url ? [prefillData.image_url] : []
  );
  const [processingPhotos, setProcessingPhotos] = useState(false);

  // Optional AI autofill state
  const [scanningAi, setScanningAi] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(
    prefillData
      ? `AI Inspection Applied: ${prefillData.material_type || 'Material'} (${prefillData.condition || 'Good'} condition)`
      : null
  );
  const [isAiInspected, setIsAiInspected] = useState(Boolean(prefillData));

  // Material form fields
  const [title, setTitle] = useState(
    prefillData?.material_type ? `Surplus ${prefillData.material_type}` : ''
  );
  const [category, setCategory] = useState<MaterialCategory>(
    prefillData?.category && CATEGORIES.includes(prefillData.category)
      ? prefillData.category
      : 'Bricks'
  );
  const [condition, setCondition] = useState<MaterialCondition>(
    prefillData?.condition && CONDITIONS.includes(prefillData.condition)
      ? prefillData.condition
      : 'Excellent'
  );
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<MaterialUnit>('Pieces');
  const [sellingPrice, setSellingPrice] = useState<number>(250);
  const [description, setDescription] = useState(prefillData?.ai_generated_description || '');

  // Site selection
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '+91 98220 11442');

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<{
    id: string;
    title: string;
    photoCount: number;
    coverPhoto: string;
    quantity: number;
    unit: string;
    price: number;
    location: string;
    syncedCloud: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadSites() {
      const allSites = await db.getConstructionSites();
      setSites(allSites);

      if (preselectedSiteId) {
        const matched = allSites.find((s) => s.id === preselectedSiteId);
        if (matched) {
          setSelectedSiteId(matched.id);
          setPickupAddress(matched.address);
          if (matched.contact_phone) setContactPhone(matched.contact_phone);
          return;
        }
      }

      if (allSites.length > 0 && !selectedSiteId) {
        setSelectedSiteId(allSites[0].id);
        setPickupAddress(allSites[0].address);
      }
    }
    loadSites();
  }, [preselectedSiteId]);

  useEffect(() => {
    if (user?.phone_number) {
      setContactPhone(user.phone_number);
    }
  }, [user]);

  const handleCategoryChange = (newCat: MaterialCategory) => {
    setCategory(newCat);
    if (newCat === 'Cement') setUnit('Bags');
    else if (newCat === 'Steel') setUnit('Tons');
    else if (newCat === 'Bricks') setUnit('Pieces');
    else if (newCat === 'Sand') setUnit('Truckloads');
    else if (newCat === 'Tiles' || newCat === 'Stone') setUnit('Sq. Ft');
    else if (newCat === 'Pipes') setUnit('Pieces');
    else if (newCat === 'Electrical Materials') setUnit('Meters');
    else if (newCat === 'Paint') setUnit('Units');
  };

  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    const chosen = sites.find((s) => s.id === siteId);
    if (chosen) {
      setPickupAddress(chosen.address);
      if (chosen.contact_phone) setContactPhone(chosen.contact_phone);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setProcessingPhotos(true);
    try {
      const compressed = await Promise.all(Array.from(files).map(compressImageFile));
      setUploadedPhotos((prev) => [...prev, ...compressed].slice(0, 6));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to process selected picture.');
    } finally {
      setProcessingPhotos(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAutoInspectPhoto = async () => {
    if (uploadedPhotos.length === 0) {
      setErrorMsg('Please upload at least one material picture first.');
      return;
    }

    setScanningAi(true);
    setErrorMsg(null);
    setAiNote(null);

    try {
      const response = await fetch('/api/ai/inspect-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedPhotos[0],
          sampleType: 'custom',
        }),
      });

      const rawText = await response.text();
      let result: (MaterialInspectionResult & { error?: string }) | null = null;
      try {
        result = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error('AI photo check returned an unexpected response format.');
      }

      if (!response.ok || !result) {
        throw new Error(result?.error || 'AI photo check is temporarily unavailable.');
      }
      if (!result.is_construction_material) {
        setErrorMsg(
          result.simple_verdict ||
            'This picture does not appear to show a construction material. Please upload a clear photo of cement, steel, bricks, tiles, pipes, or timber.'
        );
        return;
      }

      if (!title.trim() && result.material_type) {
        setTitle(`Surplus ${result.material_type}`);
      }
      if (result.category && CATEGORIES.includes(result.category)) {
        handleCategoryChange(result.category);
      }
      if (result.condition && CONDITIONS.includes(result.condition)) {
        setCondition(result.condition);
      }
      if (!description.trim() && result.ai_generated_description) {
        setDescription(result.ai_generated_description);
      }

      setIsAiInspected(true);
      setAiNote(
        `Photo checked: ${result.material_type} (${result.condition} condition). Details filled below.`
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not inspect photo right now.');
    } finally {
      setScanningAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (uploadedPhotos.length === 0) {
      setErrorMsg('Please upload at least 1 picture of the material you want to sell.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter the material name.');
      return;
    }
    if (quantity <= 0 || sellingPrice <= 0) {
      setErrorMsg('Quantity and asking price must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const chosenSite = sites.find((s) => s.id === selectedSiteId);
      const sellerId = user?.id || 'usr_patil';
      const resolvedLocation = pickupAddress.trim() || chosenSite?.address || 'Pune';
      const created = await db.addMaterial({
        seller_id: sellerId,
        seller_name: user?.full_name || 'Seller',
        seller_phone: contactPhone.trim(),
        seller_company: user?.company_name,
        site_id: selectedSiteId || undefined,
        site_name: chosenSite?.name,
        title: title.trim(),
        category,
        description:
          description.trim() ||
          `Leftover ${title.trim()} (${condition} condition) available for site pickup at ${resolvedLocation}.`,
        available_quantity: Number(quantity),
        original_quantity: Number(quantity),
        unit,
        original_market_price: Number(sellingPrice),
        selling_price: Number(sellingPrice),
        condition,
        status: 'available',
        location_name: resolvedLocation,
        latitude: chosenSite ? Number(chosenSite.latitude) : 18.5204,
        longitude: chosenSite ? Number(chosenSite.longitude) : 73.8567,
        ai_inspected: isAiInspected,
        ai_inspection_notes: aiNote || undefined,
        images: uploadedPhotos,
      });

      setSavedRecord({
        id: created.id,
        title: created.title,
        photoCount: uploadedPhotos.length,
        coverPhoto: uploadedPhotos[0],
        quantity: created.available_quantity,
        unit: created.unit,
        price: created.selling_price,
        location: created.location_name,
        syncedCloud: isSupabaseConfigured && isUuid(sellerId) && isUuid(created.id),
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save material. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForNextUpload = () => {
    setSavedRecord(null);
    setUploadedPhotos([]);
    setTitle('');
    setDescription('');
    setAiNote(null);
    setIsAiInspected(false);
    setErrorMsg(null);
  };

  const expectedRevenue = Math.max(0, Number(quantity || 0) * Number(sellingPrice || 0));

  if (savedRecord) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-[#252536]">
              Material Uploaded &amp; Live for Buyers
            </h2>
            <p className="text-sm text-[#51416F]">
              <strong>{savedRecord.title}</strong> with {savedRecord.photoCount} uploaded{' '}
              {savedRecord.photoCount === 1 ? 'picture' : 'pictures'} is now automatically visible in{' '}
              <strong>Buyer Mode</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 text-left bg-[#F1F2F5] rounded-2xl p-3.5 max-w-md mx-auto">
            <img
              src={savedRecord.coverPhoto}
              alt={savedRecord.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200 bg-white"
            />
            <div className="min-w-0 flex-1 space-y-0.5 text-xs">
              <p className="font-bold text-[#252536] truncate">{savedRecord.title}</p>
              <p className="text-[#51416F] tabular-nums">
                {savedRecord.quantity} {savedRecord.unit} · ₹{savedRecord.price.toLocaleString('en-IN')} / {savedRecord.unit}
              </p>
              <p className="text-[#8B8D98] truncate">{savedRecord.location}</p>
            </div>
          </div>

          <p className="text-xs text-[#8B8D98] font-mono tabular-nums">
            Record ID: {savedRecord.id}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={resetForNextUpload}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white transition-colors"
            >
              Upload Another Material
            </button>
            <button
              type="button"
              onClick={() => onNavigate('seller')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#F1F2F5] hover:bg-gray-200 text-[#252536] transition-colors"
            >
              View My Uploads &amp; Requests
            </button>
            <button
              type="button"
              onClick={() => onNavigate('seller-map')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-gray-200 hover:border-[#7561A8] text-[#51416F] transition-colors"
            >
              Open Site Map Setting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Simple Seller Page Header */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#7561A8]">
            Seller Workspace · Sell Construction Materials
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            Upload &amp; Sell Leftover Materials
          </h1>
          <p className="text-xs sm:text-sm text-[#51416F]/85">
            Upload pictures of your surplus materials, enter quantity and price, and save directly to your backend inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('seller-map')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 hover:border-[#7561A8] text-[#252536] bg-[#F1F2F5] hover:bg-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <MapPin className="w-4 h-4 text-[#7561A8]" />
            <span>Site Map Setting</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('seller')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#252536] hover:bg-[#51416F] text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Layers className="w-4 h-4" />
            <span>My Uploads</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync Note when browsing with local demo profile */}
      {isSupabaseConfigured && !isUuid(user?.id) && (
        <div className="bg-white rounded-2xl border border-[#7561A8]/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-[#51416F]">
            <AlertCircle className="w-4 h-4 text-[#7561A8] shrink-0 mt-0.5" />
            <span>
              You are using a quick demo profile. Sign in with your account to sync uploaded photos and materials directly into your Supabase database tables.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#7561A8]/10 hover:bg-[#7561A8]/20 text-[#51416F] inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Error / AI Status Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {aiNote && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{aiNote}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Upload Material Pictures */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-[#252536]">
                1. Upload Material Pictures
              </h2>
              <p className="text-xs text-[#8B8D98]">
                Add up to 6 clear photos of the leftover material you want to sell.
              </p>
            </div>
            {uploadedPhotos.length > 0 && (
              <button
                type="button"
                disabled={scanningAi}
                onClick={handleAutoInspectPhoto}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#72B9E8]/20 hover:bg-[#72B9E8]/30 text-[#252536] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7561A8]" />
                <span>{scanningAi ? 'Checking Photo...' : 'Auto-Fill Details from Photo'}</span>
              </button>
            )}
          </div>

          <label className="block border-2 border-dashed border-gray-300 hover:border-[#7561A8] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#F1F2F5]/50">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto">
                {processingPhotos ? (
                  <Upload className="w-5 h-5 text-[#7561A8] animate-bounce" />
                ) : (
                  <Camera className="w-5 h-5 text-[#7561A8]" />
                )}
              </div>
              <p className="text-sm font-bold text-[#252536]">
                {processingPhotos
                  ? 'Optimizing your pictures...'
                  : 'Click here to choose material pictures'}
              </p>
              <p className="text-xs text-[#8B8D98]">
                Supports JPG, PNG, WEBP photos from phone or computer
              </p>
            </div>
          </label>

          {/* Uploaded Thumbnails */}
          {uploadedPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
              {uploadedPhotos.map((src, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group"
                >
                  <img
                    src={src}
                    alt={`Uploaded material ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    aria-label={`Remove photo ${idx + 1}`}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 bg-black/65 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    Photo {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Material Details & Pricing */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="font-display font-bold text-lg text-[#252536]">
              2. Material Details &amp; Price
            </h2>
            <p className="text-xs text-[#8B8D98]">
              Describe what you are selling, how much quantity is left, and your asking price.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">
                Material Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Red Clay Bricks or TMT Steel Bars"
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as MaterialCategory)}
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Material Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as MaterialCondition)}
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Quantity Available</label>
              <input
                type="number"
                required
                min={1}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-bold tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">
                Asking Price (₹ per {unit})
              </label>
              <input
                type="number"
                required
                min={1}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-[#F1F2F5] text-sm text-[#7561A8] font-bold p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden tabular-nums"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Short Notes / Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention storage condition, batch age, or pickup timings..."
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F1F2F5] flex flex-wrap items-center justify-between gap-2 text-xs text-[#51416F]">
            <span>Directly published to Buyer Mode upon upload</span>
            <span>
              Total value:{' '}
              <strong className="text-[#252536] font-mono tabular-nums">
                ₹{expectedRevenue.toLocaleString('en-IN')}
              </strong>
            </span>
          </div>
        </div>

        {/* Step 3: Select Construction Site */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-[#252536]">
                3. Construction Site Location
              </h2>
              <p className="text-xs text-[#8B8D98]">
                Pick a saved construction site or open Site Map Setting to pin a new site on the live map.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('seller-map')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7561A8]/10 hover:bg-[#7561A8]/20 text-[#51416F] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 text-[#7561A8]" />
              <span>Pin New Site on Live Map</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#7561A8]" />
                <span>Construction Site</span>
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.area})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#7561A8]" />
                <span>Site Contact Number</span>
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98220 11442"
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden tabular-nums"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">
                Site Address / Gate Landmark
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. Plot 42, Hinjawadi Phase 3, Pune"
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Final Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[#8B8D98]">
            Uploaded material pictures and details are saved directly to the MatLink backend.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-[#7561A8] hover:bg-[#51416F] disabled:opacity-50 text-white shadow-md shadow-[#7561A8]/25 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>{submitting ? 'Uploading to Backend...' : 'Upload & Save Material'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
