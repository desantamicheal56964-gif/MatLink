import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  Building,
  CheckCircle2,
  Trash2,
  Lock,
  Search,
  Eye,
  Check,
  Ban,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { UserProfile, MaterialListing, ConstructionSite, Transaction } from '../types';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [materials, setMaterials] = useState<MaterialListing[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'materials' | 'sites'>('users');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const u = await db.getProfiles();
    const m = await db.getMaterials();
    const s = await db.getConstructionSites();
    const t = await db.getTransactions();
    setUsers(u);
    setMaterials(m);
    setSites(s);
    setTransactions(t);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Strict Role-Based Access Control check
  if (user?.user_type !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-[#252536]">Admin Access Restricted</h2>
        <p className="text-xs text-[#8B8D98]">
          You are currently logged in as a <strong>{user?.user_type || 'guest'}</strong>. This section is restricted to Platform Administrators and Pune Municipal Eco-Cell personnel.
        </p>
        <p className="text-xs text-purple-700 font-medium">
          Tip: You can switch to the Admin persona using the top navigation persona selector to test this console.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7561A8] text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleToggleVerifyUser = async (targetUser: UserProfile) => {
    await db.updateProfile(targetUser.id, { is_verified: !targetUser.is_verified });
    await loadAll();
  };

  const handleDeleteListing = async (matId: string) => {
    if (window.confirm('Delete this listing permanently as administrator?')) {
      await db.deleteMaterial(matId);
      await loadAll();
    }
  };

  const handleToggleListingStatus = async (mat: MaterialListing) => {
    const nextStatus = mat.status === 'available' ? 'unlisted' : 'available';
    await db.updateMaterial(mat.id, { status: nextStatus as any });
    await loadAll();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-[#51416F] text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-200 mb-1">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Administrative Control Panel (Pune Region)
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl">
            Platform Administration Console
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Manage registered contractors, audit material listings, oversee construction sites, and enforce verification standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/20">
            Admin: {user.full_name}
          </span>
        </div>
      </div>

      {/* 4 Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-[#7561A8]" />
          </div>
          <p className="text-2xl font-black text-[#252536]">{users.length}</p>
          <p className="text-[11px] text-[#8B8D98]">Across Pune builder ecosystem</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Total Marketplace Listings</span>
            <ShoppingBag className="w-4 h-4 text-[#72B9E8]" />
          </div>
          <p className="text-2xl font-black text-[#252536]">{materials.length}</p>
          <p className="text-[11px] text-[#8B8D98]">Active, reserved & completed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Registered Construction Sites</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{sites.length}</p>
          <p className="text-[11px] text-[#8B8D98]">Mapped with GPS coordinates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Completed Transactions</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-[#7561A8]">{transactions.length}</p>
          <p className="text-[11px] text-[#8B8D98]">Audited reuse handovers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-[#7561A8] text-[#7561A8]'
              : 'border-transparent text-[#8B8D98] hover:text-[#252536]'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'materials'
              ? 'border-[#7561A8] text-[#7561A8]'
              : 'border-transparent text-[#8B8D98] hover:text-[#252536]'
          }`}
        >
          Material Listings Audit ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('sites')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'sites'
              ? 'border-[#7561A8] text-[#7561A8]'
              : 'border-transparent text-[#8B8D98] hover:text-[#252536]'
          }`}
        >
          Construction Sites ({sites.length})
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252536]">Registered Accounts</h3>
            <span className="text-xs text-[#8B8D98]">Role-based access view</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F2F5] text-[#8B8D98] uppercase font-semibold">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email / Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Company / Org</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80">
                    <td className="p-3.5 font-bold text-[#252536] flex items-center gap-2">
                      <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span>{u.full_name}</span>
                    </td>
                    <td className="p-3.5 text-[#51416F]">
                      <p>{u.email}</p>
                      <p className="text-[10px] text-[#8B8D98]">{u.phone_number || 'N/A'}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7561A8]/10 text-[#7561A8] uppercase">
                        {u.user_type}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#51416F] font-medium">{u.company_name || 'Individual'}</td>
                    <td className="p-3.5">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleVerifyUser(u)}
                        className="text-xs text-[#7561A8] hover:underline font-bold"
                      >
                        {u.is_verified ? 'Revoke Verification' : 'Verify Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Material Listings Audit */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252536]">Marketplace Inventory Audit</h3>
            <span className="text-xs text-[#8B8D98]">Administrative moderation</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F2F5] text-[#8B8D98] uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Material</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Seller</th>
                  <th className="p-3.5">Price & Qty</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/80">
                    <td className="p-3.5 font-bold text-[#252536]">
                      <div className="flex items-center gap-2.5">
                        <img src={m.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="line-clamp-1">{m.title}</p>
                          <p className="text-[10px] text-[#8B8D98]">{m.location_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-[#51416F]">{m.category}</td>
                    <td className="p-3.5 text-[#51416F]">{m.seller_company || m.seller_name}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-[#7561A8]">₹{m.selling_price} /{m.unit}</p>
                      <p className="text-[10px] text-[#8B8D98]">Stock: {m.available_quantity} {m.unit}</p>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'sold'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleListingStatus(m)}
                        className="text-xs text-[#7561A8] hover:underline font-bold"
                      >
                        {m.status === 'available' ? 'Unlist' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => handleDeleteListing(m.id)}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Construction Sites */}
      {activeTab === 'sites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7561A8]/10 text-[#7561A8]">
                  {s.area}
                </span>
                <span className="text-[10px] font-bold text-[#8B8D98]">{s.city}</span>
              </div>
              <h4 className="font-bold text-sm text-[#252536]">{s.name}</h4>
              <p className="text-xs text-[#8B8D98]">{s.address}</p>
              <div className="pt-2 text-xs text-[#51416F] border-t border-gray-100 space-y-1">
                <p>Developer: <strong>{s.developer_name}</strong></p>
                <p>Contact: {s.contact_person} ({s.contact_phone})</p>
                <p className="text-[11px] text-[#8B8D98]">GPS: {s.latitude}, {s.longitude}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
