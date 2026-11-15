import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { db } from '../services/db';
import { MaterialListing, MaterialCategory, MaterialCondition } from '../types';

interface ExploreMaterialsProps {
  onNavigate: (page: string, params?: any) => void;
  initialCategory?: string;
}

const CATEGORIES: ('All' | MaterialCategory)[] = [
  'All',
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

const PUNE_LOCATIONS = [
  'All Locations',
  'Hinjawadi',
  'Kharadi',
  'Wakad',
  'Baner',
  'Balewadi',
  'Kothrud',
  'Viman Nagar',
  'Magarpatta',
  'Kalyani Nagar',
  'Aundh',
  'Shivajinagar',
  'Swargate',
  'Pimpri',
  'Ravet',
  'Moshi',
  'Chakan',
  'Bavdhan',
  'Hadapsar',
  'Wagholi',
  'Undri',
];

const CONDITIONS: ('All' | MaterialCondition)[] = ['All', 'Excellent', 'Good', 'Average', 'Poor'];

export const ExploreMaterials: React.FC<ExploreMaterialsProps> = ({ onNavigate, initialCategory }) => {
  const [materials, setMaterials] = useState<MaterialListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | MaterialCategory>(
    (initialCategory as any) || 'All'
  );
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCondition, setSelectedCondition] = useState<'All' | MaterialCondition>('All');
  const [maxPrice, setMaxPrice] = useState<number>(75000);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'discount'>('newest');
  const [onlyAiInspected, setOnlyAiInspected] = useState(false);

  useEffect(() => {
    async function loadMaterials() {
      setLoading(true);
      const data = await db.getMaterials();
      setMaterials(data);
      setLoading(false);
    }
    loadMaterials();
  }, []);

  const filteredMaterials = useMemo(() => {
    return materials
      .filter((m) => {
        // Status filter: only available or reserved
        if (m.status === 'sold') return false;

        // Search query
        if (
          searchQuery &&
          !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !m.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !m.category.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && m.category !== selectedCategory) {
          return false;
        }

        // Location filter
        if (
          selectedLocation !== 'All Locations' &&
          !m.location_name.toLowerCase().includes(selectedLocation.toLowerCase())
        ) {
          return false;
        }

        // Condition filter
        if (selectedCondition !== 'All' && m.condition !== selectedCondition) {
          return false;
        }

        // Max price filter
        if (m.selling_price > maxPrice) {
          return false;
        }

        // AI inspection filter
        if (onlyAiInspected && !m.ai_inspected) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.selling_price - b.selling_price;
        if (sortBy === 'price_high') return b.selling_price - a.selling_price;
        if (sortBy === 'discount') {
          const discA = (a.original_market_price - a.selling_price) / a.original_market_price;
          const discB = (b.original_market_price - b.selling_price) / b.original_market_price;
          return discB - discA;
        }
        // default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [
    materials,
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedCondition,
    maxPrice,
    sortBy,
    onlyAiInspected,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setSelectedCondition('All');
    setMaxPrice(75000);
    setSortBy('newest');
    setOnlyAiInspected(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <ShoppingBag className="w-4 h-4" />
            Pune Construction Exchange
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            Explore Surplus Construction Materials
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
            Quality-checked reusable surplus materials from active Pune builder sites at significant discounts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('list-material')}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-sm transition-all"
        >
          + List Your Leftover Stock
        </button>
      </div>

      {/* Search and Quick Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B8D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by material (e.g. UltraTech Cement, TMT steel, red bricks, tiles, pipes)..."
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

          {/* Location Dropdown */}
          <select
            aria-label="Filter by Pune Location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-xs sm:text-sm bg-[#F1F2F5] text-[#252536] border border-transparent focus:border-[#7561A8] rounded-xl px-3 py-2.5 font-medium focus:outline-hidden"
          >
            {PUNE_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Condition Dropdown */}
          <select
            aria-label="Filter by Condition"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value as any)}
            className="text-xs sm:text-sm bg-[#F1F2F5] text-[#252536] border border-transparent focus:border-[#7561A8] rounded-xl px-3 py-2.5 font-medium focus:outline-hidden"
          >
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                Condition: {cond}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            aria-label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs sm:text-sm bg-[#F1F2F5] text-[#252536] border border-transparent focus:border-[#7561A8] rounded-xl px-3 py-2.5 font-medium focus:outline-hidden"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_low">Sort: Lowest Price</option>
            <option value="price_high">Sort: Highest Price</option>
            <option value="discount">Sort: Highest Discount %</option>
          </select>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {CATEGORIES.map((cat) => {
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

        {/* Sub-Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 text-xs text-[#51416F]">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAiInspected}
                onChange={(e) => setOnlyAiInspected(e.target.checked)}
                className="w-4 h-4 rounded text-[#7561A8] accent-[#7561A8]"
              />
              <span className="font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#72B9E8]" />
                Only AI Inspected Listings
              </span>
            </label>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#8B8D98]">Max Price:</span>
              <input
                type="range"
                min="50"
                max="75000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 accent-[#7561A8]"
              />
              <span className="font-semibold text-[#252536]">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#8B8D98]">
              Showing <strong className="text-[#252536]">{filteredMaterials.length}</strong> materials
            </span>
            {(searchQuery ||
              selectedCategory !== 'All' ||
              selectedLocation !== 'All Locations' ||
              selectedCondition !== 'All' ||
              onlyAiInspected) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#7561A8] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#7561A8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8B8D98]">Loading Pune marketplace inventory...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#7561A8] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#252536]">No Materials Found Matching Your Filters</h3>
          <p className="text-xs text-[#8B8D98] max-w-md mx-auto">
            Try adjusting your search keywords, location radius, or category to find active surplus materials in Pune.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7561A8] text-white"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map((mat) => {
            const savingsPercent = Math.round(
              ((mat.original_market_price - mat.selling_price) / mat.original_market_price) * 100
            );
            return (
              <div
                key={mat.id}
                onClick={() => onNavigate('material-details', { id: mat.id })}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={mat.images[0] || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600'}
                      alt={mat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7561A8] text-white shadow-xs">
                        {mat.category}
                      </span>
                      {mat.ai_inspected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#72B9E8] text-[#252536] flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI Verified
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
                      {savingsPercent}% OFF
                    </span>
                  </div>

                  {/* Info Body */}
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

                    {/* Condition & Seller */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[#252536] font-medium">
                        Condition: <strong className="text-[#7561A8]">{mat.condition}</strong>
                      </span>
                      <span className="text-[#8B8D98] truncate max-w-[120px]">
                        By {mat.seller_company || mat.seller_name || 'Verified Seller'}
                      </span>
                    </div>

                    {/* Price Comparison */}
                    <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-[#8B8D98] block">Platform Price</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-[#252536]">
                            ₹{mat.selling_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-[#8B8D98]">/ {mat.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#8B8D98] block">Market Price</span>
                        <span className="text-xs line-through text-gray-400">
                          ₹{mat.original_market_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 py-3 bg-[#F1F2F5]/60 border-t border-gray-100 flex items-center justify-between text-xs text-[#51416F]">
                  <span className="font-semibold text-[11px] text-[#252536]">
                    Available: {mat.available_quantity} {mat.unit}
                  </span>
                  <span className="font-bold text-xs text-[#7561A8] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
