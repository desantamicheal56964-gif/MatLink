import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { db } from '../services/db';
import { MaterialListing } from '../types';

interface ExploreMaterialsProps {
  onNavigate: (page: string, params?: any) => void;
  initialCategory?: string;
}

export const ExploreMaterials: React.FC<ExploreMaterialsProps> = ({
  onNavigate,
  initialCategory,
}) => {
  const [materials, setMaterials] = useState<MaterialListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

  const loadMaterials = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const data = await db.getMaterials();
    setMaterials(data);
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadMaterials(false);
    const unsubscribe = db.subscribeToMaterials(() => {
      loadMaterials(true);
    });
    return unsubscribe;
  }, [loadMaterials]);

  const availableMaterials = useMemo(
    () => materials.filter((m) => m.status !== 'sold' && m.status !== 'unlisted'),
    [materials]
  );

  // Only show categories that actually exist in active inventory
  const dynamicCategories = useMemo(() => {
    const unique = Array.from(new Set(availableMaterials.map((m) => m.category)));
    return ['All', ...unique];
  }, [availableMaterials]);

  const filteredMaterials = useMemo(() => {
    return availableMaterials
      .filter((m) => {
        if (
          searchQuery &&
          !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !m.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !m.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !m.location_name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (selectedCategory !== 'All' && m.category !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [availableMaterials, searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Clean Buyer Marketplace Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
          <ShoppingBag className="w-4 h-4" />
          Pune Construction Marketplace
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
          Available Construction Materials
        </h1>
        <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
          Materials uploaded by sellers with site photos and details appear here automatically.
        </p>
      </div>

      {/* Simple Search & Active Category Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B8D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials or Pune area..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] placeholder-[#8B8D98] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B8D98] hover:text-[#252536]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[#8B8D98] px-1">
            <span>
              Showing <strong className="text-[#252536]">{filteredMaterials.length}</strong>{' '}
              {filteredMaterials.length === 1 ? 'material' : 'materials'}
            </span>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#7561A8] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {dynamicCategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {dynamicCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#7561A8] text-white shadow-xs'
                      : 'bg-[#F1F2F5] text-[#51416F] hover:bg-[#7561A8]/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#7561A8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8B8D98]">Loading marketplace inventory...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#7561A8]/10 text-[#7561A8] flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#252536]">
            The materials are coming soon
          </h3>
          <p className="text-xs sm:text-sm text-[#8B8D98] max-w-md mx-auto">
            No matching materials are available right now. New materials uploaded by sellers will appear here automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F1F2F5] text-[#252536]"
              >
                Show All Materials
              </button>
            )}
            <button
              onClick={() => onNavigate('map')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7561A8] hover:bg-[#51416F] text-white transition-colors"
            >
              View Pune Site Map
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onNavigate('material-details', { id: mat.id })}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Picture & Category Badge */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <img
                    src={
                      mat.images[0] ||
                      'https://images.unsplash.com/photo-1584463699026-6a978f8cb64c?w=600'
                    }
                    alt={mat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7561A8] text-white shadow-xs">
                      {mat.category}
                    </span>
                    {mat.ai_inspected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#72B9E8] text-[#252536] flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Seller-Uploaded Details */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-[#252536] line-clamp-1 group-hover:text-[#7561A8] transition-colors">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-[#8B8D98] line-clamp-2 mt-1">{mat.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#51416F]">
                    <MapPin className="w-3.5 h-3.5 text-[#7561A8] shrink-0" />
                    <span className="truncate">{mat.location_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-[#252536] font-medium">
                      Condition: <strong className="text-[#7561A8]">{mat.condition}</strong>
                    </span>
                    <span className="text-[#8B8D98] truncate max-w-[140px]">
                      By {mat.seller_company || mat.seller_name || 'Verified Seller'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Quantity, Asking Price & View Action */}
              <div className="px-4 py-3 bg-[#F1F2F5]/60 border-t border-gray-100 flex items-center justify-between gap-2 text-xs text-[#51416F]">
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-semibold text-[11px] text-[#252536]">
                    {mat.available_quantity} {mat.unit}
                  </span>
                  {mat.selling_price > 0 && (
                    <span className="font-bold text-[11px] text-[#7561A8]">
                      · ₹{mat.selling_price.toLocaleString('en-IN')}/{mat.unit}
                    </span>
                  )}
                </div>
                <span className="font-bold text-xs text-[#7561A8] flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

