import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  ShieldCheck,
  Leaf,
  TrendingDown,
  Building,
  MapPin,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Layers,
  Recycle,
  DollarSign,
  Eye,
} from 'lucide-react';
import { db } from '../services/db';
import { MaterialListing, PlatformMetrics, ConstructionSite } from '../types';

interface LandingPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [featuredMaterials, setFeaturedMaterials] = useState<MaterialListing[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      const mats = await db.getMaterials();
      setFeaturedMaterials(mats.filter((m) => m.status === 'available').slice(0, 4));
      const met = await db.getPlatformMetrics();
      setMetrics(met);
      const s = await db.getConstructionSites();
      setSites(s.slice(0, 4));
    }
    loadData();
  }, []);

  const faqs = [
    {
      q: 'How does CircuBuild work for construction companies in Pune?',
      a: 'Builders and contractors upload leftover, uninstalled, or surplus construction materials (cement bags, steel rebar offcuts, bricks, tiles, pipes) from their active Pune sites. Buyers (other contractors, individual homebuilders, or interior designers) browse available inventory, view AI-assisted condition reports, and send purchase requests directly at 30% to 60% discounts.',
    },
    {
      q: 'What is the AI Material Inspector?',
      a: 'Our built-in AI Inspector uses Gemini Vision AI to examine uploaded photos of surplus materials. It evaluates surface rust on rebars, packaging integrity of cement bags, tile glaze chipping, and brick fractures, providing a preliminary condition rating (Excellent, Good, Average, Poor) and auto-filling the listing details.',
    },
    {
      q: 'How are prices determined and how much money can buyers save?',
      a: 'Sellers list their materials at discounted prices below local Pune retail rates. On average, buyers save ₹15,000 to ₹70,000 per transaction (35% to 55% discount) while sellers liquidate otherwise idle capital that would often be dumped into landfills.',
    },
    {
      q: 'Are the construction sites verified real-world Pune locations?',
      a: 'The platform is anchored in real Pune geographical coordinates across Hinjawadi, Kharadi, Wakad, Baner, Kothrud, and Viman Nagar. Demonstration sites are clearly marked as educational EDI prototype records while maintaining genuine spatial navigation and Google Maps functionality.',
    },
    {
      q: 'How does purchasing and site logistics work?',
      a: 'Once a buyer sends a purchase request and the seller accepts it, the platform updates inventory in real time to prevent double-selling. The parties then coordinate pickup directly from the site gate or arrange localized tempo/truck delivery.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 bg-gradient-to-b from-[#7561A8]/10 via-[#F1F2F5] to-[#F1F2F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#7561A8]/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#7561A8] animate-ping" />
              <span className="text-xs font-semibold text-[#51416F]">
                Pune Construction Material Sustainability Initiative
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#252536] tracking-tight leading-[1.1]">
              Give Construction Materials a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7561A8] to-[#51416F]">Second Life.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#51416F]/90 max-w-2xl mx-auto leading-relaxed">
              Buy and sell leftover construction materials at affordable prices. Save money, reduce waste, and build a more sustainable future across Pune.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('explore')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-lg shadow-[#7561A8]/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Materials
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('list-material')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-gray-50 text-[#51416F] border-2 border-[#7561A8]/30 shadow-xs flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4 text-[#7561A8]" />
                Sell Your Material
              </button>
            </div>

            {/* Quick Proof Highlights */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
              <div className="bg-white/80 p-3 rounded-xl border border-gray-100 shadow-2xs">
                <p className="text-[11px] text-[#8B8D98]">Average Buyer Savings</p>
                <p className="text-base font-bold text-[#7561A8]">38% - 55% Off</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-gray-100 shadow-2xs">
                <p className="text-[11px] text-[#8B8D98]">Waste Diverted</p>
                <p className="text-base font-bold text-emerald-600">
                  {metrics ? `${(metrics.totalMaterialReusedKg / 1000).toFixed(1)} Tons` : '18.4 Tons'}
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-gray-100 shadow-2xs">
                <p className="text-[11px] text-[#8B8D98]">Pune Sites Active</p>
                <p className="text-base font-bold text-[#51416F]">
                  {metrics?.activeConstructionSitesCount || 8} Locations
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-gray-100 shadow-2xs">
                <p className="text-[11px] text-[#8B8D98]">AI Quality Screening</p>
                <p className="text-base font-bold text-[#72B9E8]">Gemini Vision</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7561A8]">Simple 4-Step Lifecycle</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#252536]">
            How MatLink Works
          </h2>
          <p className="text-xs sm:text-sm text-[#8B8D98]">
            Connecting surplus inventory to active construction requirements in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'List Surplus Material',
              desc: 'Sellers upload photos and specify leftover quantities of cement, steel, bricks, tiles, or pipes from their site.',
              icon: PlusCircle,
              color: 'bg-purple-100 text-[#7561A8]',
            },
            {
              step: '02',
              title: 'AI Visual Inspection',
              desc: 'Gemini Vision screens the material photo for visible rust, cracks, moisture, or packaging flaws with instant condition rating.',
              icon: Sparkles,
              color: 'bg-sky-100 text-[#72B9E8]',
            },
            {
              step: '03',
              title: 'Discover on Pune Map',
              desc: 'Nearby buyers locate available stock on the Pune Construction Map (Hinjawadi, Kharadi, Wakad, Baner) and send requests.',
              icon: MapPin,
              color: 'bg-emerald-100 text-emerald-600',
            },
            {
              step: '04',
              title: 'Save Money & Cut Waste',
              desc: 'Seller accepts request, inventory is reserved, and material is reused on site — saving money and diverting landfill waste.',
              icon: Recycle,
              color: 'bg-amber-100 text-amber-600',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <span className="absolute -top-2 -right-2 text-5xl font-black text-gray-100 font-display select-none group-hover:text-purple-50 transition-colors">
                  {item.step}
                </span>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#252536] mb-2">{item.title}</h3>
                <p className="text-xs text-[#8B8D98] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED ACTIVE LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7561A8]">Pune Marketplace</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#252536]">
              Featured Surplus Construction Materials
            </h2>
            <p className="text-xs sm:text-sm text-[#8B8D98]">
              Ready for immediate purchase and site pickup across Pune metropolitan area.
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs sm:text-sm font-semibold text-[#7561A8] hover:text-[#51416F] flex items-center gap-1.5"
          >
            View All Materials ({featuredMaterials.length > 0 ? '10+' : '0'})
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMaterials.map((mat) => {
            const savingsPercent = Math.round(
              ((mat.original_market_price - mat.selling_price) / mat.original_market_price) * 100
            );
            return (
              <div
                key={mat.id}
                onClick={() => onNavigate('material-details', { id: mat.id })}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={mat.images[0]}
                      alt={mat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7561A8] text-white shadow-xs">
                        {mat.category}
                      </span>
                      {mat.ai_inspected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#72B9E8] text-[#252536] flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI Inspected
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                      {savingsPercent}% OFF
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-[#252536] line-clamp-1 group-hover:text-[#7561A8] transition-colors">
                      {mat.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8B8D98]">
                      <MapPin className="w-3.5 h-3.5 text-[#7561A8]" />
                      <span className="truncate">{mat.location_name}</span>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-[#8B8D98] block">Selling Price</span>
                        <span className="text-base font-extrabold text-[#252536]">
                          ₹{mat.selling_price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#8B8D98] ml-1">/ {mat.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#8B8D98] block">Market</span>
                        <span className="text-xs line-through text-gray-400">
                          ₹{mat.original_market_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs text-[#51416F]">
                  <span className="text-[11px] font-medium bg-[#F1F2F5] px-2 py-0.5 rounded">
                    Qty: {mat.available_quantity} {mat.unit}
                  </span>
                  <span className="text-xs font-semibold text-[#7561A8] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Inspect <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AI MATERIAL INSPECTION SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#51416F] to-[#252536] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-[#72B9E8] border border-white/15">
                <Sparkles className="w-3.5 h-3.5" />
                3D RoboInspector & Gemini Vision AI
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                AI Material Inspector: Interactive 3D Quality Screening
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Before purchasing or listing leftover construction materials, sellers and buyers can evaluate surface condition with our interactive 3D RoboInspector and vision AI. Identifies rust levels on rebars, packaging integrity of cement, edge chipping on bricks, and tile crazing.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mb-1.5" />
                  <p className="font-semibold text-white">Visual Defect Analysis</p>
                  <p className="text-[11px] text-gray-300 mt-0.5">Detects cracks, surface rust, and moisture</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <CheckCircle className="w-4 h-4 text-[#72B9E8] mb-1.5" />
                  <p className="font-semibold text-white">1-Click Auto Listing</p>
                  <p className="text-[11px] text-gray-300 mt-0.5">Pre-fills description, category, and condition</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('inspector')}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#72B9E8] hover:bg-[#5da8db] text-[#252536] shadow-md flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Try AI Material Inspector
                </button>
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white/15 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-all"
                >
                  View Inspected Listings
                </button>
              </div>
            </div>

            {/* Visual Inspector Card Mockup */}
            <div className="bg-white rounded-2xl p-5 text-[#252536] shadow-2xl border border-white/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#7561A8]/15 text-[#7561A8] flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Visual Condition Report</h4>
                    <p className="text-[10px] text-[#8B8D98]">IS 456 / IS 1786 Visual Guidelines</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Rating: Excellent (94%)
                </span>
              </div>

              <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80"
                  alt="Cement Bags Inspection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <p className="text-white text-xs font-medium">UltraTech OPC 53 Grade Cement - Hinjawadi Phase 3</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F1F2F5]">
                  <span className="text-[#8B8D98] text-[11px]">Packaging Integrity:</span>
                  <span className="font-semibold text-emerald-700">Sealed, Zero Lumps</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F1F2F5]">
                  <span className="text-[#8B8D98] text-[11px]">Moisture Exposure:</span>
                  <span className="font-semibold text-emerald-700">Dry indoor pallet storage</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F1F2F5]">
                  <span className="text-[#8B8D98] text-[11px]">Next Steps:</span>
                  <span className="font-semibold text-[#51416F]">Ready for structural pour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PUNE CONSTRUCTION MAP CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7561A8]">
                Geographical Discovery
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#252536]">
                Interactive Pune Construction Site Map
              </h2>
              <p className="text-xs sm:text-sm text-[#8B8D98] leading-relaxed">
                Locate active building sites across the Pune metropolitan area. Reduce transport fuel costs and carbon emissions by procuring materials from nearby sites in your own corridor.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {['Hinjawadi IT Corridor', 'Kharadi EON Free Zone', 'Wakad & Punawale', 'Baner High Street', 'Kothrud Metro Interchange', 'Pimpri Industrial Hub'].map(
                  (area, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#F1F2F5] text-[#51416F]">
                      <MapPin className="w-3.5 h-3.5 text-[#7561A8]" />
                      <span className="font-medium text-[11px] truncate">{area}</span>
                    </div>
                  )
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('map')}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-md flex items-center gap-2 transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  Open Construction Site Map
                </button>
              </div>
            </div>

            {/* Map Preview Graphic */}
            <div
              onClick={() => onNavigate('map')}
              className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 group cursor-pointer shadow-md"
            >
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80"
                alt="Pune Map"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#252536] via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white text-xs font-bold text-[#252536] shadow-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Map View: Pune, Maharashtra
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#252536]">8 Active Construction Corridors</p>
                  <p className="text-[10px] text-[#8B8D98]">Surplus Cement, Steel, Bricks & Tiles</p>
                </div>
                <span className="text-xs font-bold text-[#7561A8] flex items-center gap-1">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ECONOMIC & ENVIRONMENTAL IMPACT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-50 via-[#F1F2F5] to-purple-50 rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Measurable Sustainability</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#252536]">
              Real Economic & Environmental Impact
            </h2>
            <p className="text-xs sm:text-sm text-[#8B8D98]">
              Calculated dynamically from verified completed reuse transactions across Pune.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
              <DollarSign className="w-7 h-7 text-[#7561A8] mx-auto mb-1" />
              <p className="text-2xl font-black text-[#252536]">
                ₹{metrics?.totalMoneySaved.toLocaleString('en-IN') || '1,22,290'}
              </p>
              <p className="text-xs font-bold text-[#51416F]">Total Money Saved by Buyers</p>
              <p className="text-[10px] text-[#8B8D98]">Calculated: (Market Price - Selling Price) × Qty</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
              <Recycle className="w-7 h-7 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-emerald-600">
                {metrics ? `${(metrics.totalMaterialReusedKg / 1000).toFixed(1)} Tons` : '18.4 Tons'}
              </p>
              <p className="text-xs font-bold text-[#51416F]">Construction Waste Diverted</p>
              <p className="text-[10px] text-[#8B8D98]">Diverted from Pune municipal dump yards</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
              <Leaf className="w-7 h-7 text-teal-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-teal-700">
                {metrics ? `${(metrics.co2DivertedKg / 1000).toFixed(1)} MT` : '15.1 MT'}
              </p>
              <p className="text-xs font-bold text-[#51416F]">Embodied CO2 Avoided</p>
              <p className="text-[10px] text-[#8B8D98]">By avoiding virgin cement/steel manufacturing</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs text-center space-y-1">
              <Building className="w-7 h-7 text-[#72B9E8] mx-auto mb-1" />
              <p className="text-2xl font-black text-[#252536]">
                {metrics?.totalSuccessfulTransactions || 5} Orders
              </p>
              <p className="text-xs font-bold text-[#51416F]">Successful Material Exchanges</p>
              <p className="text-[10px] text-[#8B8D98]">100% verified material handovers</p>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => onNavigate('impact')}
              className="text-xs sm:text-sm font-semibold text-[#7561A8] hover:text-[#51416F] inline-flex items-center gap-1.5"
            >
              Explore Full Environmental & Economic Impact Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. DEMONSTRATION TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7561A8]">Stakeholder Perspectives</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#252536]">
            What Pune Builders & Contractors Say
          </h2>
          <p className="text-[11px] text-[#8B8D98] italic">
            *Demonstration feedback from local testing participants for EDI project evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'We had 350 leftover bags of cement after topping out our Hinjawadi Phase 3 commercial tower. CircuBuild allowed us to connect with a contractor in Wakad within 2 days, saving them ₹47,000 and freeing up site space.',
              name: 'Rajesh Patil',
              role: 'Project Director',
              company: 'Kumar Properties Pune',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            },
            {
              quote:
                'As an eco-contractor building low-carbon villas in Baner, sourcing surplus TMT steel rebars and chamber bricks saved our clients over ₹1.2 Lakh while reducing virgin steel consumption.',
              name: 'Sunita Deshmukh',
              role: 'Principal Contractor',
              company: 'Deshmukh Eco-Contractors',
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
            },
            {
              quote:
                'The AI Material Inspector gave our site team instant preliminary reassurance on unopened tile cartons and plumbing pipes before finalizing the pickup. A truly innovative circular model for Pune.',
              name: 'Amit Kulkarni',
              role: 'Procurement Head',
              company: 'Rohan Builders & Infra',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-[#51416F] leading-relaxed mb-4 italic">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-[#252536]">{item.name}</h4>
                  <p className="text-[10px] text-[#8B8D98]">{item.role}, {item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7561A8]">Got Questions?</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#252536]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#252536]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7561A8] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#51416F] leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#7561A8] to-[#51416F] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Ready to Build a Sustainable Pune?
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto">
            Join construction firms, engineers, and sustainable contractors across Pune. Liquidate leftover materials or purchase quality surplus at steep discounts today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('explore')}
              className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white text-[#51416F] hover:bg-gray-100 shadow-md"
            >
              Browse Active Marketplace
            </button>
            <button
              onClick={() => onNavigate('list-material')}
              className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#72B9E8] hover:bg-[#5ea7dc] text-[#252536] shadow-md"
            >
              List Surplus Stock
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
