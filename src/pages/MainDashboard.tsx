import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  MapPin,
  BarChart3,
  Recycle,
  Users,
  Building,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Layers,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { MaterialListing, ConstructionSite, PlatformMetrics } from '../types';

interface MainDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<MaterialListing[]>([]);
  const [nearbySites, setNearbySites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const met = await db.getPlatformMetrics();
    setMetrics(met);

    const mats = await db.getMaterials();
    setRecentMaterials(mats.filter((m) => m.status === 'available').slice(0, 3));

    const s = await db.getConstructionSites();
    setNearbySites(s.slice(0, 4));
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData(false);
    const unsubscribe = db.subscribeToMaterials(() => {
      loadDashboardData(true);
    });
    return unsubscribe;
  }, [loadDashboardData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. WELCOME SECTION */}
      <div className="bg-gradient-to-r from-[#51416F] via-[#635091] to-[#7561A8] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-[#72B9E8] border border-white/20">
            <Leaf className="w-3.5 h-3.5" />
            Pune Circular Construction Exchange
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
            Welcome to Sustainable Construction!
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
            Buy, sell, and reuse construction materials while saving money and reducing construction waste.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-purple-200">
            <span>Logged in as:</span>
            <strong className="text-white font-semibold">{user?.full_name}</strong>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase font-bold text-white">
              {user?.user_type}
            </span>
          </div>

          {/* Quick Actions Buttons */}
          <div className="pt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('list-material')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#72B9E8] hover:bg-[#5ca5d9] text-[#252536] shadow-sm flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Sell Your Material
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Materials
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-4 h-4" />
              View Nearby Sites
            </button>
            <button
              onClick={() => onNavigate('impact')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              View Impact Dashboard
            </button>
          </div>
        </div>

        {/* Decorative backdrop graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />
      </div>

      {/* 2. EIGHT REQUIRED DASHBOARD CARDS (LIVE DATA FROM DATABASE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[#252536] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7561A8]" />
            Platform Key Metrics
          </h2>
          <span className="text-xs text-[#8B8D98]">Live database aggregation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Active Material Listings */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Active Listings</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7561A8] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#252536]">
              {loading ? '...' : metrics?.totalActiveListings}
            </p>
            <p className="text-[11px] text-[#8B8D98] mt-1">Available for purchase now</p>
          </div>

          {/* Card 2: Total Available Construction Materials */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Total Available Quantity</span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#72B9E8] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#252536]">
              {loading ? '...' : `${metrics?.totalAvailableMaterialsCount.toLocaleString('en-IN')} Units`}
            </p>
            <p className="text-[11px] text-[#8B8D98] mt-1">Across 12 material categories</p>
          </div>

          {/* Card 3: Total Buyers */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Total Registered Buyers</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#252536]">
              {loading ? '...' : metrics?.totalBuyers}
            </p>
            <p className="text-[11px] text-[#8B8D98] mt-1">Contractors & individual builders</p>
          </div>

          {/* Card 4: Total Sellers */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Total Registered Sellers</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#51416F] flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#252536]">
              {loading ? '...' : metrics?.totalSellers}
            </p>
            <p className="text-[11px] text-[#8B8D98] mt-1">Developers & site managers</p>
          </div>

          {/* Card 5: Total Successful Transactions */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Successful Exchanges</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#252536]">
              {loading ? '...' : metrics?.totalSuccessfulTransactions}
            </p>
            <p className="text-[11px] text-[#8B8D98] mt-1">Verified handovers completed</p>
          </div>

          {/* Card 6: Total Money Saved */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Total Money Saved</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#7561A8] tabular-nums">
              {loading ? '...' : `₹${(metrics?.totalMoneySaved ?? 0).toLocaleString('en-IN')}`}
            </p>
            <p className="text-[11px] text-[#8B8D98] font-medium mt-1">No demo orders sold yet</p>
          </div>

          {/* Card 7: Total Material Reused */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Total Material Reused</span>
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Recycle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              {loading ? '...' : `${((metrics?.totalMaterialReusedKg || 0) / 1000).toFixed(1)} MT`}
            </p>
            <p className="text-[11px] text-[#8B8D98] mt-1">Metric tons recirculated</p>
          </div>

          {/* Card 8: Estimated Waste Reduced */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#7561A8]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B8D98]">Estimated Waste Reduced</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#51416F] flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#51416F]">
              {loading ? '...' : `${((metrics?.estimatedWasteReducedKg || 0) / 1000).toFixed(1)} Tons`}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Diverted from Pune landfills</p>
          </div>
        </div>
      </div>

      {/* 3. RECENTLY ADDED MATERIALS & NEARBY SITES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recently Added Materials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#252536] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#7561A8]" />
              Recently Added Surplus Materials
            </h2>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-semibold text-[#7561A8] hover:text-[#51416F] flex items-center gap-1"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentMaterials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#7561A8]/10 text-[#7561A8] flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#252536]">
                The materials are coming soon
              </h3>
              <p className="text-xs text-[#8B8D98] max-w-md mx-auto">
                No materials are sold or listed as a demo right now. Surplus stock uploaded by Pune sellers will appear here soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentMaterials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => onNavigate('material-details', { id: mat.id })}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="relative h-32 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={mat.images[0]}
                        alt={mat.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7561A8] text-white">
                        {mat.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#252536] line-clamp-1 group-hover:text-[#7561A8] transition-colors">
                        {mat.title}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-[#8B8D98] mt-1">
                        <MapPin className="w-3 h-3 text-[#7561A8]" />
                        <span className="truncate">{mat.location_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 bg-[#F1F2F5]/60 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-semibold text-[#51416F] tabular-nums">
                      {mat.available_quantity} {mat.unit}
                    </span>
                    <span className="text-[10px] font-semibold text-[#7561A8] tabular-nums">
                      {mat.selling_price > 0
                        ? `₹${mat.selling_price.toLocaleString('en-IN')}/${mat.unit}`
                        : `Condition: ${mat.condition}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Construction Sites Around Pune */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#252536] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#7561A8]" />
              Active Pune Sites
            </h2>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-semibold text-[#7561A8] hover:text-[#51416F] flex items-center gap-1"
            >
              Open Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs space-y-3">
            {nearbySites.map((site) => (
              <div
                key={site.id}
                onClick={() => onNavigate('map', { siteId: site.id })}
                className="p-3 rounded-xl hover:bg-[#F1F2F5] transition-colors cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#252536] line-clamp-1">{site.name}</h4>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      site.status === 'materials_available'
                        ? 'bg-blue-100 text-blue-800'
                        : site.status === 'reused_completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {site.status === 'materials_available'
                      ? 'Available Stock'
                      : site.status === 'reused_completed'
                      ? 'Reused'
                      : 'Active Site'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8B8D98] mt-1 line-clamp-1">{site.address}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[10px] text-[#51416F]">
                  <span>Developer: {site.developer_name}</span>
                  <span className="font-semibold text-[#7561A8]">{site.total_listings_count} listings</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate('map')}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#7561A8]/10 hover:bg-[#7561A8]/20 text-[#51416F] transition-colors"
            >
              View All Construction Sites on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
