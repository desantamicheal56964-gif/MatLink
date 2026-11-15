import React, { useState } from 'react';
import { User, Mail, Phone, Building, ShieldCheck, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const UserProfilePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [userType, setUserType] = useState<UserRole>(user?.user_type || 'both');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      phone_number: phoneNumber,
      company_name: companyName,
      user_type: userType,
      avatar_url: avatarUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
            alt=""
            className="w-16 h-16 rounded-full object-cover ring-4 ring-[#7561A8]/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-[#252536]">
                {user?.full_name || 'User Profile'}
              </h1>
              {user?.is_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-[#8B8D98]">{user?.email}</p>
            <span className="inline-block mt-1 text-[11px] font-semibold text-[#7561A8]">
              Role: {user?.user_type?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Profile updated successfully!
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
        <h3 className="font-display font-bold text-base text-[#252536] border-b border-gray-100 pb-3">
          Account & Company Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#252536]">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#252536]">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-gray-100 text-xs sm:text-sm text-gray-500 p-3 rounded-xl cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#252536]">Contact Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98220 11442"
              className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#252536]">Company / Firm Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Rohan Builders & Infra"
              className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-[#252536]">User Persona / Role</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserRole)}
              className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
            >
              <option value="seller">Material Seller (Builders, Contractors with surplus)</option>
              <option value="buyer">Material Buyer (Contractors, Architects procuring stock)</option>
              <option value="both">Both Buyer and Seller</option>
              <option value="admin">Platform Administrator</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-[#252536]">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-[#F1F2F5] text-xs sm:text-sm text-[#252536] p-3 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-md shadow-[#7561A8]/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};
