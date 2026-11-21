import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  Edit2,
  Trash2,
  Check,
  Building,
  MapPin,
  AlertCircle,
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
  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');
  const [statusError, setStatusError] = useState<string | null>(null);

  // Edit quantity modal
  const [editingMaterial, setEditingMaterial] = useState<MaterialListing | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  // Inline decline reason modal (replaces window.prompt)
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Inline delete / mark-sold confirmation modal (replaces window.confirm)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'sold' | 'delete';
    id: string;
    title: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const allMats = await db.getMaterials();
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

  const handleAcceptRequest = async (requestId: string) => {
    setStatusError(null);
    try {
      await db.respondToPurchaseRequest(requestId, 'accept');
      await loadData();
    } catch (err: any) {
      setStatusError(err?.message || 'Error accepting purchase request.');
    }
  };

  const handleConfirmDecline = async () => {
    if (!decliningRequestId) return;
    setStatusError(null);
    try {
      await db.respondToPurchaseRequest(
        decliningRequestId,
        'reject',
        declineReason.trim() || 'Material no longer available in this quantity.'
      );
      setDecliningRequestId(null);
      setDeclineReason('');
      await loadData();
    } catch (err: any) {
      setStatusError(err?.message || 'Error declining purchase request.');
    }
  };

  const handleUpdateQuantity = async () => {
    if (!editingMaterial) return;
    setStatusError(null);
    try {
      await db.updateMaterial(editingMaterial.id, {
        available_quantity: editQty,
      });
      setEditingMaterial(null);
      await loadData();
    } catch (err: any) {
      setStatusError(err?.message || 'Error updating quantity.');
    }
  };

  const handleConfirmListingAction = async () => {
    if (!confirmAction) return;
    setStatusError(null);
    try {
      if (confirmAction.type === 'sold') {
        await db.updateMaterial(confirmAction.id, { status: 'sold', available_quantity: 0 });
      } else {
        await db.deleteMaterial(confirmAction.id);
      }
      setConfirmAction(null);
      await loadData();
    } catch (err: any) {
      setStatusError(err?.message || 'Unable to update listing.');
    }
  };

  const pendingRequests = receivedRequests.filter((r) => r.status === 'pending');
  const completedRequests = receivedRequests.filter((r) => r.status === 'completed');
  const totalEarnings = transactions.reduce((sum, t) => sum + t.total_price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <Building className="w-4 h-4" />
            <span>Seller Inventory &amp; Requests</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            My Uploaded Materials
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
            Review the materials you have uploaded for sale, manage stock quantities, and respond to buyer inquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => onNavigate('seller-map')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs border border-gray-200 hover:border-[#7561A8] text-[#252536] bg-[#F1F2F5] hover:bg-white flex items-center gap-1.5 whitespace-nowrap"
          >
            <MapPin className="w-4 h-4 text-[#7561A8]" />
            <span>Site Map Setting</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('seller-sell')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        </div>
      </div>

      {statusError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{statusError}</span>
        </div>
      )}

      {/* 4 Seller Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Active Uploads</span>
            <Layers className="w-4 h-4 text-[#7561A8]" />
          </div>
          <p className="text-2xl font-black text-[#252536] tabular-nums">
            {loading ? '...' : myListings.filter((m) => m.status === 'available').length}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Ready for pickup</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 tabular-nums">
            {loading ? '...' : pendingRequests.length}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Action required</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Accepted &amp; Finalized</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 tabular-nums">
            {loading ? '...' : completedRequests.length}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Orders fulfilled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B8D98]">
            <span>Total Earnings</span>
            <DollarSign className="w-4 h-4 text-[#7561A8]" />
          </div>
          <p className="text-2xl font-black text-[#7561A8] tabular-nums">
            {loading ? '...' : `₹${totalEarnings.toLocaleString('en-IN')}`}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Recovered from surplus stock</p>
        </div>
      </div>

      {/* Tabs: Uploaded Materials vs Buyer Requests */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'listings'
              ? 'border-[#7561A8] text-[#7561A8]'
              : 'border-transparent text-[#8B8D98] hover:text-[#252536]'
          }`}
        >
          <span>My Uploaded Materials ({myListings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-[#7561A8] text-[#7561A8]'
              : 'border-transparent text-[#8B8D98] hover:text-[#252536]'
          }`}
        >
          <span>Buyer Inquiries ({receivedRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: My Uploaded Materials */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 space-y-3">
              <Layers className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-[#252536]">No Materials Uploaded Yet</h3>
              <p className="text-xs text-[#8B8D98] max-w-sm mx-auto">
                Upload photos and details of your leftover construction stock to save them to your backend inventory.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('seller-sell')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7561A8] text-white"
              >
                Upload First Material
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={mat.images[0]}
                        alt={mat.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8B8D98]">
                      <span className="font-semibold text-[#7561A8]">{mat.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          mat.status === 'available' ? 'text-emerald-700' : 'text-[#8B8D98]'
                        }`}
                      >
                        {mat.status === 'available' ? 'Available' : 'Sold'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[#252536] line-clamp-1">{mat.title}</h3>
                      <p className="text-xs text-[#8B8D98] line-clamp-1">{mat.location_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-[#F1F2F5]">
                        <span className="text-[10px] text-[#8B8D98] block">Available</span>
                        <span className="font-bold text-[#252536] tabular-nums">
                          {mat.available_quantity} {mat.unit}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F1F2F5]">
                        <span className="text-[10px] text-[#8B8D98] block">Selling Rate</span>
                        <span className="font-bold text-[#7561A8] tabular-nums">
                          ₹{mat.selling_price.toLocaleString('en-IN')} / {mat.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMaterial(mat);
                        setEditQty(mat.available_quantity);
                      }}
                      className="text-[#7561A8] font-bold hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Qty</span>
                    </button>

                    {mat.status !== 'sold' && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmAction({ type: 'sold', id: mat.id, title: mat.title })
                        }
                        className="text-amber-700 font-bold hover:underline"
                      >
                        Mark Sold
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({ type: 'delete', id: mat.id, title: mat.title })
                      }
                      className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Buyer Inquiries */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-[#252536]">No Buyer Inquiries Yet</h3>
              <p className="text-xs text-[#8B8D98] max-w-sm mx-auto">
                When buyers send inquiries for your uploaded surplus materials, they will appear here for your approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        req.material_image ||
                        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200'
                      }
                      alt={req.material_title || 'Material'}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-sm text-[#252536]">
                          {req.material_title}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold uppercase ${
                            req.status === 'completed'
                              ? 'text-emerald-700'
                              : req.status === 'pending'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#51416F] flex flex-wrap items-center gap-2">
                        <span>
                          Buyer: <strong>{req.buyer_name}</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Contact: {req.buyer_phone || req.buyer_email}</span>
                        <span aria-hidden="true">·</span>
                        <span>Delivery: {req.delivery_preference}</span>
                      </div>

                      {req.message && (
                        <p className="text-xs text-[#8B8D98] italic bg-[#F1F2F5] px-2.5 py-1 rounded-lg mt-1">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-semibold text-[#8B8D98]">Requested Amount</p>
                      <p className="text-lg font-black text-[#252536] tabular-nums">
                        {req.requested_quantity} {req.unit}
                      </p>
                      <p className="text-xs font-bold text-[#7561A8] tabular-nums">
                        ₹{req.total_amount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDecliningRequestId(req.id);
                            setDeclineReason('');
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-[#8B8D98]">
                        {req.status === 'completed'
                          ? 'Fulfilled & Inventory Updated'
                          : 'Inquiry Declined'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT QUANTITY MODAL */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#252536]">Update Available Inventory</h3>
            <p className="text-xs text-[#8B8D98]">{editingMaterial.title}</p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#252536]">
                Remaining Quantity ({editingMaterial.unit})
              </label>
              <input
                type="number"
                min={0}
                value={editQty}
                onChange={(e) => setEditQty(Number(e.target.value))}
                className="w-full bg-[#F1F2F5] p-3 rounded-xl text-sm font-bold border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden tabular-nums"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMaterial(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B8D98] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateQuantity}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7561A8] text-white shadow-xs"
              >
                Save Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECLINE REASON MODAL */}
      {decliningRequestId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#252536]">Decline Buyer Inquiry</h3>
            <p className="text-xs text-[#8B8D98]">
              Provide a short note explaining why this inquiry cannot be fulfilled.
            </p>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Stock already reserved for another project"
              className="w-full bg-[#F1F2F5] p-3 rounded-xl text-xs text-[#252536] border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDecliningRequestId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B8D98] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SOLD / DELETE MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#252536]">
              {confirmAction.type === 'sold' ? 'Mark Material as Sold?' : 'Remove Material Upload?'}
            </h3>
            <p className="text-xs text-[#51416F]">
              {confirmAction.type === 'sold'
                ? `This will set remaining stock of "${confirmAction.title}" to 0.`
                : `This will remove "${confirmAction.title}" from your uploaded inventory.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B8D98] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmListingAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
                  confirmAction.type === 'delete' ? 'bg-rose-600' : 'bg-[#7561A8]'
                }`}
              >
                {confirmAction.type === 'sold' ? 'Mark Sold' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
