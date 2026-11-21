import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Search,
  Filter,
  Layers,
  Building,
  Phone,
  Navigation,
  ExternalLink,
  ShoppingBag,
  List,
  Map as MapIcon,
  CheckCircle,
  AlertCircle,
  Crosshair,
} from 'lucide-react';
import { db } from '../services/db';
import { ConstructionSite, MaterialListing } from '../types';

interface ConstructionSiteMapProps {
  onNavigate: (page: string, params?: any) => void;
  selectedSiteId?: string;
}

const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

export const ConstructionSiteMap: React.FC<ConstructionSiteMapProps> = ({
  onNavigate,
  selectedSiteId: initialSiteId,
}) => {
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [materials, setMaterials] = useState<MaterialListing[]>([]);
  const [selectedSite, setSelectedSite] = useState<ConstructionSite | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mapCenter, setMapCenter] = useState(PUNE_CENTER);
  const [mapZoom, setMapZoom] = useState(12);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [quotaReached, setQuotaReached] = useState(false);

  // Listen for Google Maps quota event (Tier 2 quota defense)
  useEffect(() => {
    const handleQuota = () => setQuotaReached(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const loadData = async (applyInitial = false) => {
    const s = await db.getConstructionSites();
    const m = await db.getMaterials();
    setSites(s);
    setMaterials(m);

    if (applyInitial && initialSiteId) {
      const found = s.find((x) => x.id === initialSiteId);
      if (found) {
        setSelectedSite(found);
        setMapCenter({ lat: Number(found.latitude), lng: Number(found.longitude) });
        setMapZoom(14);
      }
    }
  };

  useEffect(() => {
    loadData(true);
    const unsubscribe = db.subscribeToMaterials(() => {
      loadData(false);
    });
    return unsubscribe;
  }, [initialSiteId]);

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Filter sites based on category or type
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      // Search
      if (
        searchQuery &&
        !site.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !site.area.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !site.address.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter tabs
      if (activeFilter === 'selling') {
        return site.status === 'materials_available';
      }
      if (activeFilter === 'reused') {
        return site.status === 'reused_completed';
      }
      if (activeFilter === 'it_corridor') {
        const itKeywords = ['hinjawadi', 'kharadi', 'magarpatta', 'balewadi', 'viman nagar', 'wakad', 'baner'];
        return itKeywords.some((k) => site.area.toLowerCase().includes(k) || site.name.toLowerCase().includes(k));
      }
      if (activeFilter === 'pcmc') {
        const pcmcKeywords = ['pimpri', 'ravet', 'moshi', 'chakan', 'pradhikaran'];
        return pcmcKeywords.some((k) => site.area.toLowerCase().includes(k) || site.name.toLowerCase().includes(k) || site.address.toLowerCase().includes(k));
      }
      if (activeFilter === 'cement') {
        const siteMaterials = materials.filter((m) => m.site_id === site.id && m.category === 'Cement');
        return siteMaterials.length > 0;
      }
      if (activeFilter === 'steel') {
        const siteMaterials = materials.filter((m) => m.site_id === site.id && m.category === 'Steel');
        return siteMaterials.length > 0;
      }
      if (activeFilter === 'bricks') {
        const siteMaterials = materials.filter((m) => m.site_id === site.id && m.category === 'Bricks');
        return siteMaterials.length > 0;
      }

      return true;
    });
  }, [sites, materials, searchQuery, activeFilter]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter(loc);
        setMapZoom(13);
        setLoadingLocation(false);
      },
      (err) => {
        console.warn('Geolocation warning:', err);
        // Fallback to Pune center
        setMapCenter(PUNE_CENTER);
        setLoadingLocation(false);
      }
    );
  };

  const getMarkerColor = (status: ConstructionSite['status']) => {
    if (status === 'materials_available') return '#72B9E8'; // Blue: Available stock
    if (status === 'reused_completed') return '#10B981'; // Green: Successfully reused
    return '#7561A8'; // Purple: Active construction site
  };

  const getMarkerGlyph = (status: ConstructionSite['status']) => {
    if (status === 'materials_available') return '📦';
    if (status === 'reused_completed') return '♻️';
    return '🏗️';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <MapPin className="w-4 h-4" />
            Pune Spatial Exchange
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            Construction Site Map: Pune Corridors
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
            Locate 20+ active builder sites across Pune & PCMC (Hinjawadi, Kharadi, Wakad, Baner, Balewadi, Magarpatta, Ravet, Chakan, Bavdhan, Kalyani Nagar, Moshi, and more) with surplus materials.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-[#F1F2F5] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'map' ? 'bg-white text-[#7561A8] shadow-xs' : 'text-[#8B8D98]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-white text-[#7561A8] shadow-xs' : 'text-[#8B8D98]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Quota Defense Banner if triggered */}
      {quotaReached && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs md:text-sm shadow-xs flex items-center justify-between">
          <span>
            Google Maps Platform demo quota reached (100 req/day). Visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for account instructions.
          </span>
          <button
            onClick={() => setQuotaReached(false)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B8D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 20+ Pune sites by name, area (Hinjawadi, Kharadi, Balewadi, Chakan, Ravet)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleLocateMe}
            disabled={loadingLocation}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F1F2F5] hover:bg-gray-200 text-[#51416F] flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Crosshair className={`w-4 h-4 text-[#7561A8] ${loadingLocation ? 'animate-spin' : ''}`} />
            {loadingLocation ? 'Locating...' : 'My Location'}
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {[
            { id: 'all', label: `All Sites (${sites.length})` },
            { id: 'selling', label: 'Surplus Stock Available' },
            { id: 'it_corridor', label: 'IT Corridors (Hinjawadi, Kharadi, Balewadi)' },
            { id: 'pcmc', label: 'PCMC & Industrial (Chakan, Ravet, Moshi, Pimpri)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#7561A8] text-white shadow-xs'
                  : 'bg-[#F1F2F5] text-[#51416F] hover:bg-[#7561A8]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 text-[11px] text-[#51416F]">
          <span className="font-semibold text-[#252536]">Marker Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#7561A8]" />
            <span>Active Site</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#72B9E8]" />
            <span>Surplus Stock Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Material Successfully Reused</span>
          </div>
          <span className="text-[#8B8D98] text-[10px] ml-auto">
            *Demonstration records modeled on Pune corridors for academic EDI evaluation.
          </span>
        </div>
      </div>

      {/* Main Map & Sidebar Area */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
          {/* Map Container (8 Cols) */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-gray-200 shadow-md relative h-full">
            <APIProvider apiKey={mapsApiKey}>
              <Map
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                center={mapCenter}
                zoom={mapZoom}
                onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
                gestureHandling="greedy"
                className="w-full h-full min-h-[500px]"
              >
                {/* Site Markers */}
                {filteredSites.map((site) => {
                  const lat = Number(site.latitude);
                  const lng = Number(site.longitude);
                  const isSelected = selectedSite?.id === site.id;
                  const color = getMarkerColor(site.status);

                  return (
                    <AdvancedMarker
                      key={site.id}
                      position={{ lat, lng }}
                      onClick={() => setSelectedSite(site)}
                      title={site.name}
                    >
                      <Pin
                        background={color}
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        glyph={getMarkerGlyph(site.status)}
                        scale={isSelected ? 1.3 : 1.0}
                      />
                    </AdvancedMarker>
                  );
                })}

                {/* User Geolocation Marker if available */}
                {userLocation && (
                  <AdvancedMarker position={userLocation} title="Your Current Location">
                    <div className="w-4 h-4 bg-rose-500 rounded-full border-2 border-white ring-4 ring-rose-500/30 animate-pulse" />
                  </AdvancedMarker>
                )}

                {/* Selected Marker InfoWindow */}
                {selectedSite && (
                  <InfoWindow
                    position={{
                      lat: Number(selectedSite.latitude),
                      lng: Number(selectedSite.longitude),
                    }}
                    onCloseClick={() => setSelectedSite(null)}
                  >
                    <div className="p-1 max-w-[260px] space-y-2 text-[#252536]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            selectedSite.status === 'materials_available'
                              ? 'bg-blue-100 text-blue-800'
                              : selectedSite.status === 'reused_completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {selectedSite.status === 'materials_available'
                            ? 'Stock Available'
                            : selectedSite.status === 'reused_completed'
                            ? 'Reused'
                            : 'Active Site'}
                        </span>
                        <span className="text-[10px] text-[#8B8D98]">{selectedSite.area}</span>
                      </div>

                      <h4 className="font-bold text-xs text-[#252536] leading-snug">
                        {selectedSite.name}
                      </h4>
                      <p className="text-[11px] text-[#51416F] line-clamp-2">
                        {selectedSite.address}
                      </p>

                      <div className="pt-1 border-t border-gray-100 text-[10px] text-[#8B8D98]">
                        <p>Developer: <strong>{selectedSite.developer_name}</strong></p>
                        <p>Contact: {selectedSite.contact_person} ({selectedSite.contact_phone})</p>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#7561A8]">
                          {selectedSite.total_listings_count} Active Listings
                        </span>
                        <button
                          onClick={() => onNavigate('explore', { location: selectedSite.area })}
                          className="px-2.5 py-1 bg-[#7561A8] hover:bg-[#51416F] text-white rounded-lg text-[10px] font-bold"
                        >
                          View Materials
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>

          {/* Sidebar: Nearby Construction Sites (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-5 shadow-xs flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <h3 className="font-display font-bold text-sm text-[#252536] flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#7561A8]" />
                Nearby Active Sites ({filteredSites.length})
              </h3>
              <span className="text-[10px] text-[#8B8D98]">Click site to center</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-2 mt-2">
              {filteredSites.map((site) => {
                const isSelected = selectedSite?.id === site.id;
                const siteMats = materials.filter((m) => m.site_id === site.id);

                return (
                  <div
                    key={site.id}
                    onClick={() => {
                      setSelectedSite(site);
                      setMapCenter({ lat: Number(site.latitude), lng: Number(site.longitude) });
                      setMapZoom(14);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#7561A8]/10 border border-[#7561A8]/30'
                        : 'hover:bg-[#F1F2F5] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-[#252536] leading-tight line-clamp-1">
                        {site.name}
                      </h4>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: getMarkerColor(site.status) }}
                      />
                    </div>
                    <p className="text-[11px] text-[#8B8D98] mt-1 line-clamp-1">{site.address}</p>

                    {/* Available Categories Badges */}
                    {siteMats.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {siteMats.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-[#51416F]"
                          >
                            {m.category}
                          </span>
                        ))}
                        {siteMats.length > 3 && (
                          <span className="text-[9px] text-[#8B8D98]">+{siteMats.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[10px] text-[#51416F]">
                      <span>{site.developer_name}</span>
                      <span className="font-bold text-[#7561A8]">{site.total_listings_count} Listings</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => {
            const siteMats = materials.filter((m) => m.site_id === site.id);
            return (
              <div
                key={site.id}
                className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7561A8]/10 text-[#7561A8]">
                      {site.area}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        site.status === 'materials_available'
                          ? 'bg-blue-100 text-blue-800'
                          : site.status === 'reused_completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {site.status === 'materials_available'
                        ? 'Surplus Stock'
                        : site.status === 'reused_completed'
                        ? 'Reused'
                        : 'Active Site'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#252536]">{site.name}</h3>
                  <p className="text-xs text-[#8B8D98]">{site.address}</p>

                  <div className="text-xs text-[#51416F] space-y-1 pt-2 border-t border-gray-100">
                    <p>Developer: <strong>{site.developer_name}</strong></p>
                    <p>Contact: {site.contact_person} ({site.contact_phone})</p>
                    <p>Coordinates: {site.latitude}, {site.longitude}</p>
                  </div>

                  {siteMats.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-[#8B8D98] block mb-1">
                        Surplus Stock Available Here:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {siteMats.map((m) => (
                          <span
                            key={m.id}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#7561A8]"
                          >
                            {m.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedSite(site);
                      setMapCenter({ lat: Number(site.latitude), lng: Number(site.longitude) });
                      setMapZoom(14);
                      setViewMode('map');
                    }}
                    className="text-xs font-bold text-[#7561A8] hover:text-[#51416F] flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Locate on Map
                  </button>
                  <button
                    onClick={() => onNavigate('explore', { location: site.area })}
                    className="text-xs font-bold bg-[#7561A8] hover:bg-[#51416F] text-white px-3 py-1.5 rounded-xl shadow-2xs"
                  >
                    View Materials ({site.total_listings_count})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
