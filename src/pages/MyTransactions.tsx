import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  Recycle,
  CheckCircle,
  Download,
  Calendar,
  Building,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';

export const MyTransactions: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const all = await db.getTransactions();
      // Filter for current user as buyer or seller
      const userTxs = all.filter(
        (t) =>
          t.buyer_id === user?.id ||
          t.seller_id === user?.id ||
          user?.user_type === 'both' ||
          user?.user_type === 'admin'
      );
      setTransactions(userTxs);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const totalValue = transactions.reduce((sum, t) => sum + t.total_price, 0);
  const totalSaved = transactions.reduce((sum, t) => sum + t.money_saved, 0);
  const totalWasteKg = transactions.reduce((sum, t) => sum + t.waste_diverted_kg, 0);

  const handlePrintReceipt = (tx: Transaction) => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <FileText className="w-4 h-4" />
            Audited Ledger
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#252536]">
            Transaction History & Savings Receipts
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8D98] mt-1">
            Complete record of verified construction material handovers with economic savings and landfill diversion metrics.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#8B8D98]">Total Exchanged Value</span>
          <p className="text-2xl font-black text-[#252536]">
            ₹{totalValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#8B8D98]">Across {transactions.length} verified handovers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#8B8D98]">Total Money Saved</span>
          <p className="text-2xl font-black text-[#7561A8]">
            ₹{totalSaved.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">Direct buyer procurement savings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#8B8D98]">Waste Diverted from Landfills</span>
          <p className="text-2xl font-black text-emerald-600">
            {(totalWasteKg / 1000).toFixed(2)} MT
          </p>
          <p className="text-[11px] text-[#8B8D98]">Metric tons of C&D waste recycled</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#252536]">Verified Exchange Ledger</h3>
          <span className="text-xs text-[#8B8D98]">Immutable completion records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8B8D98]">
            No completed transactions on record.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#252536]">{tx.material_title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7561A8]/10 text-[#7561A8]">
                      {tx.material_category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Completed
                    </span>
                  </div>

                  <div className="text-xs text-[#51416F] flex flex-wrap items-center gap-3">
                    <span>Buyer: <strong>{tx.buyer_name}</strong></span>
                    <span>•</span>
                    <span>Seller: <strong>{tx.seller_name}</strong></span>
                    <span>•</span>
                    <span>Quantity: <strong>{tx.quantity} {tx.unit}</strong></span>
                    <span>•</span>
                    <span>Date: {new Date(tx.completion_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="text-xs text-emerald-700 flex items-center gap-3 pt-1">
                    <span>Landfill Waste Diverted: <strong>{tx.waste_diverted_kg} kg</strong></span>
                    <span>•</span>
                    <span>CO₂ Avoided: <strong>{Math.round(tx.waste_diverted_kg * 0.82)} kg</strong></span>
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 space-y-1">
                  <span className="text-[10px] text-[#8B8D98] block">Total Transacted Price</span>
                  <p className="text-base font-extrabold text-[#252536]">
                    ₹{tx.total_price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs font-bold text-emerald-600">
                    Saved ₹{tx.money_saved.toLocaleString('en-IN')}
                  </p>
                  <button
                    onClick={() => handlePrintReceipt(tx)}
                    className="text-[11px] font-semibold text-[#7561A8] hover:underline inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
