import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  Building,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { PurchaseRequest, MaterialListing, Transaction } from '../types';

interface BuyerDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recommendedMaterials, setRecommendedMaterials] = useState<MaterialListing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const allReqs = await db.getPurchaseRequests();
    const myReqs = allReqs.filter(
      (r) => r.buyer_id === user?.id || user?.user_type === 'both' || user?.user_type === 'buyer'
    );
    setRequests(myReqs);

    const allTxs = await db.getTransactions();
    const myTxs = allTxs.filter(
      (t) => t.buyer_id === user?.id || user?.user_type === 'both' || user?.user_type === 'buyer'
    );
    setTransactions(myTxs);

    const allMats = await db.getMaterials();
    setRecommendedMaterials(allMats.filter((m) => m.status === 'available').slice(0, 3));
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    loadData(false);
    const unsubscribe = db.subscribeToMaterials(() => {
      loadData(true);
    });
    return unsubscribe;
  }, [user]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const completedCount = requests.filter((r) => r.status === 'completed' || r.status === 'accepted').length;
  const totalSaved = transactions.reduce((sum, t) => sum + (t.money_saved || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <ShoppingBag className="w-4 h-4" />
            Buyer Procurement Portal
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            Buyer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
            Track your active purchase requests, coordinate pickup logistics with sellers, and view cumulative cost savings.
          </p>
        </div>

        <button
          onClick={() => onNavigate('explore')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-sm flex items-center gap-1.5"
        >
          Explore Marketplace
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-[11px] text-[#8B8D98]">Awaiting seller confirmation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Fulfilled Purchases</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
          <p className="text-[11px] text-[#8B8D98]">Orders accepted & completed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Total Money Saved</span>
            <DollarSign className="w-4 h-4 text-[#7561A8]" />
          </div>
          <p className="text-2xl font-black text-[#7561A8]">
            ₹{totalSaved.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">Compared to Pune retail index</p>
        </div>
      </div>

      {/* Main Requests Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-display font-bold text-base text-[#252536]">
            My Purchase Requests ({requests.length})
          </h3>
          <span className="text-xs text-[#8B8D98]">Real-time status updates</span>
        </div>

        {requests.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="font-bold text-sm text-[#252536]">No Purchase Requests Submitted</h4>
            <p className="text-xs text-[#8B8D98] max-w-sm mx-auto">
              Browse surplus construction materials across Pune to find discounted inventory and send purchase requests.
            </p>
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2 bg-[#7561A8] text-white text-xs font-bold rounded-xl"
            >
              Browse Materials
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-[#7561A8]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={req.material_image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200'}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#252536]">{req.material_title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status === 'completed'
                          ? 'ACCEPTED & COMPLETED'
                          : req.status === 'pending'
                          ? 'PENDING APPROVAL'
                          : 'DECLINED'}
                      </span>
                    </div>

                    <div className="text-xs text-[#51416F] flex flex-wrap items-center gap-3">
                      <span>Seller: <strong>{req.seller_name}</strong></span>
                      <span>•</span>
                      <span>Delivery: {req.delivery_preference}</span>
                      <span>•</span>
                      <span>Date: {new Date(req.created_at).toLocaleDateString('en-IN')}</span>
                    </div>

                    {req.status === 'completed' && req.seller_phone && (
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2 font-medium mt-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Seller Phone for pickup coordination: <strong>{req.seller_phone}</strong></span>
                      </div>
                    )}

                    {req.rejection_reason && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg mt-1">
                        Seller note: {req.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <span className="text-[11px] text-[#8B8D98] block">Total Amount</span>
                  <p className="text-base font-extrabold text-[#7561A8]">
                    ₹{req.total_amount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] font-semibold text-[#252536]">
                    {req.requested_quantity} {req.unit} @ ₹{req.offered_price_per_unit}/{req.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Surplus Materials */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-base text-[#252536]">
          Recommended Materials for Your Next Site
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {recommendedMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onNavigate('material-details', { id: mat.id })}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group p-3 space-y-2"
            >
              <div className="h-32 rounded-xl overflow-hidden bg-gray-100">
                <img src={mat.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h4 className="font-bold text-xs text-[#252536] line-clamp-1">{mat.title}</h4>
              <p className="text-[11px] text-[#8B8D98]">{mat.location_name}</p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                <span className="font-black text-[#7561A8]">₹{mat.selling_price} /{mat.unit}</span>
                <span className="text-[10px] text-emerald-600 font-bold">Qty: {mat.available_quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
