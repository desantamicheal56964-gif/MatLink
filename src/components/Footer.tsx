import React from 'react';
import { Building2, Shield, Leaf, Heart, ArrowUpRight, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#252536] text-white border-t border-white/10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7561A8] to-[#72B9E8] flex items-center justify-center text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Mat<span className="text-[#72B9E8]">Link</span> Pune
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Digital Platform for Sustainable Use of Construction Material. Connecting construction sites with surplus materials to nearby sites in need across Pune, Maharashtra — cutting construction costs and diverting tons of landfill waste.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Leaf className="w-3.5 h-3.5" />
                Circular Economy
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#72B9E8]/20 text-[#72B9E8] border border-[#72B9E8]/30">
                <Shield className="w-3.5 h-3.5" />
                Verified Sites
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-[#72B9E8] transition-colors">
                  Explore Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('map')} className="hover:text-[#72B9E8] transition-colors">
                  Pune Construction Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('inspector')} className="hover:text-[#72B9E8] transition-colors flex items-center gap-1">
                  AI Material Inspector
                  <span className="text-[9px] bg-[#7561A8] text-white px-1.5 py-0.2 rounded-full">Vision</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('impact')} className="hover:text-[#72B9E8] transition-colors">
                  Environmental Impact
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('list-material')} className="hover:text-[#72B9E8] transition-colors">
                  List Surplus Material
                </button>
              </li>
            </ul>
          </div>

          {/* Dashboards & Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Portals</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-[#72B9E8] transition-colors">
                  Main Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller')} className="hover:text-[#72B9E8] transition-colors">
                  Seller Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('buyer')} className="hover:text-[#72B9E8] transition-colors">
                  Buyer Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('transactions')} className="hover:text-[#72B9E8] transition-colors">
                  Transaction Ledger
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-[#72B9E8] transition-colors">
                  Admin Console
                </button>
              </li>
            </ul>
          </div>

          {/* Academic & Pune Context */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">EDI Project</h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              Engineering Design & Innovation (EDI) Project on Sustainable Construction & Municipal Solid Waste Reduction.
            </p>
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#72B9E8]" />
                <span>Pune, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#72B9E8]" />
                <span>circubuild.pune@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 CircuBuild. Academic EDI Project - Sustainable Construction Technology.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => onNavigate('about')} className="hover:text-white">
              About Project
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white">
              Contact Us
            </button>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Pune Construction Material Exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
