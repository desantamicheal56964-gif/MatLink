import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Layers,
  Edit2,
  Trash2,
  Check,
  Building,
  User,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { MaterialListing, PurchaseRequest, Transaction } from '../types';

interface SellerDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<MaterialListing[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PurchaseRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'listings'>('requests');

  // Edit quantity modal
  const [editingMaterial, setEditingMaterial] = useState<MaterialListing | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    const allMats = await db.getMaterials();
    // In demo mode, if current user has few, show listings where seller_id matches or default seller listings
    const userMats = allMats.filter(
      (m) => m.seller_id === user?.id || user?.user_type === 'both' || user?.user_type === 'seller'
    );
    setMyListings(userMats);

    const allRequests = await db.getPurchaseRequests();
    const myReqs = allRequests.filter(
      (r) => r.seller_id === user?.id || user?.user_type === 'both' || user?.user_type === 'seller'
    );
    setReceivedRequests(myReqs);

    const allTxs = await db.getTransactions();
    const myTxs = allTxs.filter(
      (t) => t.seller_id === user?.id || user?.user_type === 'both' || user?.user_type === 'seller'
    );
    setTransactions(myTxs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRespondRequest = async (requestId: string, action: 'accept' | 'reject') => {
    let reason: string | undefined;
    if (action === 'reject') {
      const promptReason = window.prompt('Please enter a reason for declining this request:');
      if (promptReason === null) return;
      reason = promptReason || 'Material no longer available in this quantity.';
    }

    try {
      await db.respondToPurchaseRequest(requestId, action, reason);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating request');
    }
  };

  const handleUpdateQuantity = async () => {
    if (!editingMaterial) return;
    try {
      await db.updateMaterial(editingMaterial.id, {
        available_quantity: editQty,
      });
      setEditingMaterial(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating quantity');
    }
  };

  const handleMarkAsSold = async (id: string) => {
    if (!window.confirm('Mark this material listing as completely sold out?')) return;
    await db.updateMaterial(id, { status: 'sold', available_quantity: 0 });
    await loadData();
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing from the marketplace?')) return;
    await db.deleteMaterial(id);
    await loadData();
  };

  const pendingRequests = receivedRequests.filter((r) => r.status === 'pending');
  const completedRequests = receivedRequests.filter((r) => r.status === 'completed');
  const rejectedRequests = receivedRequests.filter((r) => r.status === 'rejected');
  const totalEarnings = transactions.reduce((sum, t) => sum + t.total_price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <Building className="w-4 h-4" />
            Seller Management Portal
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            Seller Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
            Manage your leftover material inventory, approve incoming purchase requests, and track realized revenues.
          </p>
        </div>

        <button
          onClick={() => onNavigate('list-material')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          List New Material
        </button>
      </div>

      {/* 4 Seller Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Active Listings</span>
            <Layers className="w-4 h-4 text-[#7561A8]" />
          </div>
          <p className="text-2xl font-black text-[#252536]">
            {myListings.filter((m) => m.status === 'available').length}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Currently on marketplace</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {pendingRequests.length}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Action required</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Accepted & Finalized</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {completedRequests.length}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Orders fulfilled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Total Earnings</span>
            <DollarSign className="w-4 h-4 text-[#7561A8]" />
          </div>
          <p className="text-2xl font-black text-[#7561A8]">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Recovered from surplus stock</p>
        </div>
      </div>

      {/* Tabs: Requests vs Listings */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-[#7561A8] text-[#7561A8]'
              : 'border-transparent text-[#8B8D98] hover:text-[#252536]'
          }`}
        >
          Incoming Purchase Requests ({receivedRequests.length})
          {pendingRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'border-[#7561A8] text-[#7561A8]'
              : 'border-transparent text-[#8B8D98] hover:text-[#252536]'
          }`}
        >
          My Listed Materials ({myListings.length})
        </button>
      </div>

      {/* Tab 1: Incoming Purchase Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-[#252536]">No Purchase Requests Received Yet</h3>
              <p className="text-xs text-[#8B8D98] max-w-sm mx-auto">
                When buyers across Pune request your surplus materials, their inquiries will appear here for your review and acceptance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={req.material_image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200'}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#252536]">{req.material_title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs text-[#51416F] flex flex-wrap items-center gap-3">
                        <span>Buyer: <strong>{req.buyer_name}</strong></span>
                        <span>•</span>
                        <span>Contact: {req.buyer_phone || req.buyer_email}</span>
                        <span>•</span>
                        <span>Delivery: {req.delivery_preference}</span>
                      </div>

                      {req.message && (
                        <p className="text-xs text-[#8B8D98] italic bg-[#F1F2F5] px-2.5 py-1 rounded-lg mt-1">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity, Total and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-semibold text-[#8B8D98]">Requested Amount</p>
                      <p className="text-lg font-black text-[#252536]">
                        {req.requested_quantity} {req.unit}
                      </p>
                      <p className="text-xs font-bold text-[#7561A8]">
                        ₹{req.total_amount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondRequest(req.id, 'reject')}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'accept')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept Request
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-[#8B8D98]">
                        {req.status === 'completed' ? 'Fulfilled & Inventory Deducted' : 'Request Declined'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Listed Materials */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                    <img src={mat.images[0]} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7561A8] text-white">
                      {mat.category}
                    </span>
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        mat.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {mat.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#252536]">{mat.title}</h3>
                    <p className="text-xs text-[#8B8D98] line-clamp-1">{mat.location_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-[#F1F2F5]">
                      <span className="text-[10px] text-[#8B8D98] block">Available</span>
                      <span className="font-bold text-[#252536]">
                        {mat.available_quantity} {mat.unit}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F1F2F5]">
                      <span className="text-[10px] text-[#8B8D98] block">Selling Rate</span>
                      <span className="font-bold text-[#7561A8]">
                        ₹{mat.selling_price} /{mat.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setEditingMaterial(mat);
                      setEditQty(mat.available_quantity);
                    }}
                    className="text-[#7561A8] font-bold hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Qty
                  </button>

                  {mat.status !== 'sold' && (
                    <button
                      onClick={() => handleMarkAsSold(mat.id)}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      Mark Sold
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteListing(mat.id)}
                    className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT QUANTITY MODAL */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#252536]">Update Available Inventory</h3>
            <p className="text-xs text-[#8B8D98]">{editingMaterial.title}</p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#252536]">Remaining Quantity ({editingMaterial.unit})</label>
              <input
                type="number"
                min={0}
                value={editQty}
                onChange={(e) => setEditQty(Number(e.target.value))}
                className="w-full bg-[#F1F2F5] p-3 rounded-xl text-sm font-bold border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingMaterial(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B8D98] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuantity}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7561A8] text-white shadow-xs"
              >
                Save Quantity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
