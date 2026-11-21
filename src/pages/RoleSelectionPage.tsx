import React from 'react';
import {
  ShoppingBag,
  Upload,
  MapPin,
  ArrowRight,
  Building2,
  Camera,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface RoleSelectionPageProps {
  onSelectRole: (role: 'buyer' | 'seller') => void;
  onNavigate?: (page: string) => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({
  onSelectRole,
  onNavigate,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-[#F1F2F5]">
      <div className="max-w-4xl w-full space-y-10">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7561A8] to-[#51416F] flex items-center justify-center text-white mx-auto shadow-md shadow-[#7561A8]/20">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-[#7561A8]">
            Pune Sustainable Construction Material Platform
          </p>
          <h1
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-[#252536] tracking-tight leading-tight"
            style={{ textWrap: 'balance' }}
          >
            How would you like to proceed on{' '}
            <span className="text-black">
              Mat<span className="text-[#7561A8]">Link</span>
            </span>
            ?
          </h1>
          <p className="text-sm sm:text-base text-[#51416F]/85 leading-relaxed">
            Choose your role below so we can show you the exact tools built for your work.
          </p>
        </div>

        {/* Two Equal-Height Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Buyer Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-[#7561A8]/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#72B9E8]/15 text-[#252536] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#51416F]" />
                </div>
                <span className="text-xs font-medium text-[#8B8D98]">
                  Browse &amp; Purchase
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-display font-bold text-2xl text-[#252536]">
                  Proceed as a Buyer
                </h2>
                <p className="text-sm text-[#51416F]/90 leading-relaxed">
                  Find surplus cement, steel, bricks, tiles, and building materials from nearby Pune sites at discounted prices.
                </p>
              </div>

              <ul className="space-y-2.5 pt-2 border-t border-gray-100 text-xs sm:text-sm text-[#252536]">
                <li className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-[#7561A8] shrink-0" />
                  <span>Explore the live surplus material marketplace</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#7561A8] shrink-0" />
                  <span>Locate nearby sites with available stock on map</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#7561A8] shrink-0" />
                  <span>Inspect material quality and send purchase requests</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectRole('buyer')}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#252536] hover:bg-[#51416F] text-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Continue as Buyer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Seller Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-[#7561A8]/50 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#7561A8]/12 text-[#7561A8] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-[#8B8D98]">
                  Upload Stock &amp; Pin Site
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-display font-bold text-2xl text-[#252536]">
                  Proceed as a Seller
                </h2>
                <p className="text-sm text-[#51416F]/90 leading-relaxed">
                  Dedicated selling workspace without marketplace clutter. Upload material pictures and mark your site on the live map.
                </p>
              </div>

              <ul className="space-y-2.5 pt-2 border-t border-gray-100 text-xs sm:text-sm text-[#252536]">
                <li className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-[#7561A8] shrink-0" />
                  <span>Upload leftover material photos directly to backend</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#7561A8] shrink-0" />
                  <span>Indicate your construction site pin on the live map</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#7561A8] shrink-0" />
                  <span>Manage uploaded materials and incoming buyer offers</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectRole('seller')}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Continue as Seller</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional quick account sign in */}
        {onNavigate && (
          <p className="text-center text-xs text-[#8B8D98]">
            Already registered with a MatLink account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#7561A8] hover:underline"
            >
              Sign In
            </button>{' '}
            or{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-semibold text-[#7561A8] hover:underline"
            >
              Create an Account
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
