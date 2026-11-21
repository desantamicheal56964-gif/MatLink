import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMapView,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  Building,
  Upload,
  Phone,
  User,
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { ConstructionSite } from '../types';

interface SellerSiteMapPageProps {
  onNavigate: (page: string, params?: any) => void;
}

const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

const PUNE_AREAS = [
  { name: 'Hinjawadi', lat: 18.5913, lng: 73.6983 },
  { name: 'Kharadi', lat: 18.5514, lng: 73.9535 },
  { name: 'Wakad', lat: 18.5987, lng: 73.7629 },
  { name: 'Baner', lat: 18.559, lng: 73.7868 },
  { name: 'Kothrud', lat: 18.5074, lng: 73.8077 },
  { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143 },
  { name: 'Pimpri', lat: 18.6279, lng: 73.8009 },
  { name: 'Hadapsar', lat: 18.5089, lng: 73.926 },
];

export const SellerSiteMapPage: React.FC<SellerSiteMapPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [selectedExistingSite, setSelectedExistingSite] = useState<ConstructionSite | null>(null);

  // Live map camera & seller site pin position
  const [mapCenter, setMapCenter] = useState(PUNE_CENTER);
  const [mapZoom, setMapZoom] = useState(12);
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>(PUNE_CENTER);
  const [locating, setLocating] = useState(false);

  // Site form fields
  const [siteName, setSiteName] = useState('');
  const [developerName, setDeveloperName] = useState(user?.company_name || '');
  const [area, setArea] = useState('Baner');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState(user?.full_name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '+91 98220 11442');
  const [siteStatus, setSiteStatus] = useState<'materials_available' | 'active'>(
    'materials_available'
  );

  // UI feedback
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSite, setSavedSite] = useState<ConstructionSite | null>(null);

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const loadSites = async () => {
    const allSites = await db.getConstructionSites();
    setSites(allSites);
  };

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (user) {
      if (!developerName && user.company_name) setDeveloperName(user.company_name);
      if (!contactPerson && user.full_name) setContactPerson(user.full_name);
      if (user.phone_number) setContactPhone(user.phone_number);
    }
  }, [user]);

  const handleMapClick = (ev: any) => {
    const latLng = ev?.detail?.latLng;
    if (!latLng) return;
    const lat = Number(latLng.lat);
    const lng = Number(latLng.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setPinCoords({ lat, lng });
      setSelectedExistingSite(null);
      setSavedSite(null);
    }
  };

  const handlePinDragEnd = (ev: any) => {
    const latLng = ev?.latLng;
    if (!latLng) return;
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : Number(latLng.lat);
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : Number(latLng.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setPinCoords({ lat, lng });
      setSavedSite(null);
    }
  };

  const handleJumpToArea = (preset: { name: string; lat: number; lng: number }) => {
    setArea(preset.name);
    setPinCoords({ lat: preset.lat, lng: preset.lng });
    setMapCenter({ lat: preset.lat, lng: preset.lng });
    setMapZoom(14);
    setSelectedExistingSite(null);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Browser location is not available. Please click directly on the map instead.');
      return;
    }
    setLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCoords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        setPinCoords(nextCoords);
        setMapCenter(nextCoords);
        setMapZoom(15);
        setLocating(false);
      },
      () => {
        setErrorMsg(
          'Could not read your GPS location. Please click any spot on the map to place your site pin.'
        );
        setLocating(false);
      }
    );
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!siteName.trim() || !address.trim()) {
      setErrorMsg('Please enter both your Site Name and Address before saving.');
      return;
    }

    setSaving(true);
    try {
      const created = await db.addConstructionSite({
        name: siteName.trim(),
        developer_name: developerName.trim() || user?.company_name || 'Independent Seller',
        address: address.trim(),
        area: area.trim() || 'Pune',
        city: 'Pune',
        latitude: Number(pinCoords.lat.toFixed(6)),
        longitude: Number(pinCoords.lng.toFixed(6)),
        status: siteStatus,
        seller_id: user?.id || 'usr_patil',
        contact_person: contactPerson.trim() || user?.full_name || 'Site Engineer',
        contact_phone: contactPhone.trim(),
        total_listings_count: 0,
      });

      setSavedSite(created);
      await loadSites();
      setMapCenter({ lat: Number(created.latitude), lng: Number(created.longitude) });
      setMapZoom(14);
      setSiteName('');
      setAddress('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save construction site location.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#7561A8]">
            Seller Site Map Setting
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            Pin Your Construction Site on the Live Map
          </h1>
          <p className="text-xs sm:text-sm text-[#51416F]/85">
            Click anywhere on the map or drag the purple pin to set your site coordinates, then save your site details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('seller-sell')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white transition-colors inline-flex items-center gap-1.5 self-start md:self-auto whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>Sell Material</span>
        </button>
      </div>

      {/* Quick Area Jump & GPS Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold text-[#252536] whitespace-nowrap shrink-0">
            Quick Area:
          </span>
          {PUNE_AREAS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleJumpToArea(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                area === preset.name
                  ? 'bg-[#7561A8] text-white'
                  : 'bg-[#F1F2F5] text-[#51416F] hover:bg-gray-200'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#252536] hover:bg-[#51416F] text-white inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Getting Location...' : 'Use My Current Location'}</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {savedSite && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Site Location Saved: {savedSite.name}</p>
              <p className="text-emerald-800">
                Pinned at {Number(savedSite.latitude).toFixed(5)}, {Number(savedSite.longitude).toFixed(5)} ({savedSite.area}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('seller-sell', { siteId: savedSite.id })}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 self-start sm:self-auto whitespace-nowrap"
          >
            Upload Material for This Site
          </button>
        </div>
      )}

      {/* Main 2-Column Live Map + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Live Map (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between text-xs">
            <span className="font-bold text-[#252536]">
              Click on map or drag the purple pin to set your site
            </span>
            <span className="font-mono tabular-nums text-[#7561A8] font-semibold">
              {pinCoords.lat.toFixed(5)}, {pinCoords.lng.toFixed(5)}
            </span>
          </div>

          <div className="h-[460px] lg:h-full min-h-[460px] w-full relative">
            <APIProvider apiKey={mapsApiKey} libraries={['marker']}>
              <GoogleMapView
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                center={mapCenter}
                zoom={mapZoom}
                onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
                onClick={handleMapClick}
                gestureHandling="greedy"
                className="w-full h-full"
              >
                {/* Draggable Seller Site Pin */}
                <AdvancedMarker
                  position={pinCoords}
                  draggable={true}
                  onDragEnd={handlePinDragEnd}
                  title="Your New Construction Site Location"
                >
                  <Pin
                    background="#7561A8"
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={1.35}
                  />
                </AdvancedMarker>

                {/* Existing Saved Construction Sites */}
                {sites.map((site) => (
                  <AdvancedMarker
                    key={site.id}
                    position={{ lat: Number(site.latitude), lng: Number(site.longitude) }}
                    onClick={() => setSelectedExistingSite(site)}
                    title={site.name}
                  >
                    <Pin
                      background="#72B9E8"
                      borderColor="#ffffff"
                      glyphColor="#252536"
                      scale={0.95}
                    />
                  </AdvancedMarker>
                ))}

                {selectedExistingSite && (
                  <InfoWindow
                    position={{
                      lat: Number(selectedExistingSite.latitude),
                      lng: Number(selectedExistingSite.longitude),
                    }}
                    onCloseClick={() => setSelectedExistingSite(null)}
                  >
                    <div className="p-1 max-w-[230px] space-y-2 text-[#252536]">
                      <h4 className="font-bold text-xs">{selectedExistingSite.name}</h4>
                      <p className="text-[11px] text-[#51416F]">{selectedExistingSite.address}</p>
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate('seller-sell', { siteId: selectedExistingSite.id })
                        }
                        className="w-full py-1.5 px-2.5 bg-[#7561A8] hover:bg-[#51416F] text-white rounded-lg text-[11px] font-bold"
                      >
                        Upload Material for This Site
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMapView>
            </APIProvider>
          </div>
        </div>

        {/* Site Details Form (5 cols) */}
        <form
          onSubmit={handleSaveSite}
          className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="font-display font-bold text-lg text-[#252536]">
                Save Your Site Details
              </h2>
              <p className="text-xs text-[#8B8D98]">
                Selected map coordinates will be saved with this site.
              </p>
            </div>

            {/* Live Selected Coordinates Box */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F1F2F5]">
              <div>
                <span className="text-[11px] text-[#8B8D98] block">Latitude</span>
                <span className="text-xs font-bold font-mono tabular-nums text-[#252536]">
                  {pinCoords.lat.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#8B8D98] block">Longitude</span>
                <span className="text-xs font-bold font-mono tabular-nums text-[#252536]">
                  {pinCoords.lng.toFixed(6)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#7561A8]" />
                <span>Site / Project Name *</span>
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Emerald Park Tower B"
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#252536]">Area / Locality *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Baner"
                  className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#252536]">Builder / Company</label>
                <input
                  type="text"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  placeholder="e.g. Patil Constructions"
                  className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Full Street Address *</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot number, road name, nearby landmark..."
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#252536] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#7561A8]" />
                  <span>Contact Person</span>
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Site Engineer"
                  className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#252536] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#7561A8]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98220 11442"
                  className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#252536]">Site Status</label>
              <select
                value={siteStatus}
                onChange={(e) =>
                  setSiteStatus(e.target.value as 'materials_available' | 'active')
                }
                className="w-full bg-[#F1F2F5] text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="materials_available">Surplus Materials Available</option>
                <option value="active">Active Construction Site</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-sm bg-[#7561A8] hover:bg-[#51416F] disabled:opacity-50 text-white shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>{saving ? 'Saving Site Location...' : 'Save Site Location to Map'}</span>
          </button>
        </form>
      </div>

      {/* Saved Construction Sites List */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-display font-bold text-base text-[#252536]">
            Saved Construction Sites ({sites.length})
          </h3>
          <span className="text-xs text-[#8B8D98]">Click any site to view on map or upload stock</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.slice(0, 9).map((site) => (
            <div
              key={site.id}
              className="p-4 rounded-2xl border border-gray-200/80 hover:border-[#7561A8]/50 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#8B8D98]">
                  <span>{site.area}</span>
                  <span className="font-mono tabular-nums text-[11px]">
                    {Number(site.latitude).toFixed(3)}, {Number(site.longitude).toFixed(3)}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#252536] line-clamp-1">{site.name}</h4>
                <p className="text-xs text-[#51416F] line-clamp-1">{site.address}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMapCenter({ lat: Number(site.latitude), lng: Number(site.longitude) });
                    setMapZoom(15);
                    setSelectedExistingSite(site);
                  }}
                  className="font-semibold text-[#7561A8] hover:underline"
                >
                  Center Map
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('seller-sell', { siteId: site.id })}
                  className="font-semibold text-[#252536] hover:text-[#7561A8]"
                >
                  Sell From Here
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
