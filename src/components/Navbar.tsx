import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Sparkles,
  BarChart3,
  Bell,
  User,
  PlusCircle,
  Menu,
  X,
  LogOut,
  ShoppingBag,
  ChevronDown,
  ShieldCheck,
  Upload,
  Layers,
  Repeat,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { NotificationItem } from '../types';

interface NavbarProps {
  currentPage: string;
  portalMode: 'buyer' | 'seller' | null;
  onNavigate: (page: string, params?: any) => void;
  onSwitchRole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  portalMode,
  onNavigate,
  onSwitchRole,
}) => {
  const { user, logout, switchPersona, availableProfiles } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    async function loadNotifs() {
      const data = await db.getNotifications(user?.id);
      setNotifications(data);
    }
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (user) {
      await db.markAllNotificationsRead(user.id);
      setNotifications(await db.getNotifications(user.id));
    }
  };

  // Seller mode navigation contains ZERO marketplace or buyer links
  const sellerNavLinks = [
    { id: 'seller-sell', label: 'Sell Material', icon: Upload },
    { id: 'seller-map', label: 'Site Map Setting', icon: MapPin },
    { id: 'seller', label: 'My Uploads', icon: Layers },
    { id: 'inspector', label: 'AI Inspector', icon: Sparkles },
  ];

  // Buyer mode preserves the marketplace & platform tools
  const buyerNavLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'explore', label: 'Marketplace', icon: ShoppingBag },
    { id: 'map', label: 'Site Map', icon: MapPin },
    { id: 'inspector', label: 'AI Inspector', icon: Sparkles },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
  ];

  const navLinks = portalMode === 'seller' ? sellerNavLinks : portalMode === 'buyer' ? buyerNavLinks : [];

  const handleBrandClick = () => {
    if (portalMode === 'seller') onNavigate('seller-sell');
    else if (portalMode === 'buyer') onNavigate('landing');
    else onSwitchRole();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#7561A8]/15 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden whitespace-nowrap shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7561A8] to-[#51416F] flex items-center justify-center text-white shadow-md shadow-[#7561A8]/25 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-lg text-black tracking-tight">
                    Mat<span className="text-[#7561A8]">Link</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#72B9E8]/20 text-[#252536]">
                    Pune
                  </span>
                </div>
                <p className="text-[10px] text-[#8B8D98] -mt-0.5 hidden sm:block">
                  {portalMode === 'seller'
                    ? 'Seller Portal'
                    : portalMode === 'buyer'
                    ? 'Buyer Marketplace'
                    : 'Sustainable Construction Exchange'}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav */}
          {navLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#7561A8]/10 text-[#51416F] font-semibold'
                        : 'text-[#252536]/80 hover:text-[#51416F] hover:bg-[#F1F2F5]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#7561A8]' : 'text-[#8B8D98]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Area (shown after user enters Buyer or Seller interface) */}
          {portalMode !== null && (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Switch Role Button */}
              <button
                type="button"
                onClick={onSwitchRole}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F1F2F5] hover:bg-gray-200 text-[#51416F] transition-colors whitespace-nowrap shrink-0"
                title="Switch between Buyer and Seller mode"
              >
                <Repeat className="w-3.5 h-3.5 text-[#7561A8]" />
                <span>{portalMode === 'seller' ? 'Seller Mode' : 'Buyer Mode'}</span>
              </button>

              {/* Seller Quick CTA */}
              {portalMode === 'seller' && (
                <button
                  onClick={() => onNavigate('seller-sell')}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#7561A8] hover:bg-[#51416F] text-white shadow-sm shadow-[#7561A8]/25 transition-all whitespace-nowrap shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload Stock</span>
                </button>
              )}

              {/* Persona Switcher */}
              <div className="hidden xl:flex items-center">
                <select
                  aria-label="Switch Persona"
                  value={user?.id || ''}
                  onChange={(e) => switchPersona(e.target.value)}
                  className="text-xs bg-[#F1F2F5] text-[#252536] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-[#7561A8] font-medium max-w-[165px]"
                >
                  {availableProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user_type === 'admin'
                        ? `Admin: ${p.full_name}`
                        : `${p.full_name} (${p.user_type})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-lg text-[#252536]/80 hover:bg-[#F1F2F5] transition-colors focus:outline-hidden"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-[#252536]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#252536]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] text-[#7561A8] font-bold">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[#7561A8] hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#8B8D98]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setShowNotifs(false);
                              if (item.link) {
                                if (item.link.startsWith('/seller')) onNavigate('seller');
                                else if (item.link.startsWith('/buyer') && portalMode === 'buyer')
                                  onNavigate('buyer');
                                else if (item.link.startsWith('/impact') && portalMode === 'buyer')
                                  onNavigate('impact');
                                else onNavigate('notifications');
                              }
                            }}
                            className={`p-3.5 hover:bg-[#F1F2F5]/70 cursor-pointer transition-colors ${
                              !item.is_read ? 'bg-[#7561A8]/5' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-[#252536]">{item.title}</p>
                              <span className="text-[10px] text-[#8B8D98] whitespace-nowrap">
                                {new Date(item.created_at).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-[#51416F]/90 mt-1 line-clamp-2">
                              {item.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 pt-2 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          setShowNotifs(false);
                          onNavigate('notifications');
                        }}
                        className="text-xs text-[#7561A8] hover:text-[#51416F] font-semibold"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile / Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F1F2F5] transition-colors focus:outline-hidden"
                  >
                    <img
                      src={
                        user.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#7561A8]/30"
                    />
                    <span className="text-xs font-medium text-[#252536] hidden xl:block max-w-[110px] truncate">
                      {user.full_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8B8D98]" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-[#252536] truncate">{user.full_name}</p>
                        <p className="text-[11px] text-[#8B8D98] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-[#7561A8] uppercase">
                          Account: {user.user_type}
                        </span>
                      </div>

                      <div className="py-1 text-xs text-[#252536]">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('profile');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#F1F2F5] flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-[#8B8D98]" />
                          <span>My Profile</span>
                        </button>

                        {portalMode !== 'buyer' && (
                          <>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('seller-sell');
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#F1F2F5] flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4 text-[#8B8D98]" />
                              <span>Sell &amp; Upload Material</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('seller-map');
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#F1F2F5] flex items-center gap-2"
                            >
                              <MapPin className="w-4 h-4 text-[#8B8D98]" />
                              <span>Site Map Setting</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('seller');
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#F1F2F5] flex items-center gap-2"
                            >
                              <Layers className="w-4 h-4 text-[#8B8D98]" />
                              <span>My Uploads</span>
                            </button>
                          </>
                        )}

                        {portalMode === 'buyer' && (
                          <>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('buyer');
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#F1F2F5] flex items-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4 text-[#8B8D98]" />
                              <span>Buyer Dashboard</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('transactions');
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#F1F2F5] flex items-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4 text-[#8B8D98]" />
                              <span>My Transactions</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onSwitchRole();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#F1F2F5] flex items-center gap-2 font-semibold text-[#7561A8]"
                        >
                          <Repeat className="w-4 h-4" />
                          <span>Switch Buyer / Seller</span>
                        </button>

                        {user.user_type === 'admin' && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-purple-50 text-purple-700 font-semibold flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            <span>Admin Console</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            onNavigate('login');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3 py-1.5 text-xs font-semibold text-[#51416F] hover:bg-[#F1F2F5] rounded-lg whitespace-nowrap"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#7561A8] hover:bg-[#51416F] text-white rounded-lg shadow-xs whitespace-nowrap"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              {navLinks.length > 0 && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 md:hidden text-[#252536] hover:bg-[#F1F2F5] rounded-lg"
                  aria-label="Toggle Menu"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && navLinks.length > 0 && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setShowMobileMenu(false);
                onNavigate(item.id);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentPage === item.id
                  ? 'bg-[#7561A8]/10 text-[#51416F] font-semibold'
                  : 'text-[#252536] hover:bg-[#F1F2F5]'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setShowMobileMenu(false);
                onSwitchRole();
              }}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#F1F2F5] text-[#51416F] flex items-center justify-center gap-2"
            >
              <Repeat className="w-4 h-4 text-[#7561A8]" />
              <span>Switch Buyer / Seller Role</span>
            </button>

            <div className="pt-1">
              <label className="text-[11px] font-semibold text-[#8B8D98] block mb-1">
                Switch Persona
              </label>
              <select
                aria-label="Switch Persona"
                value={user?.id || ''}
                onChange={(e) => switchPersona(e.target.value)}
                className="w-full text-xs bg-[#F1F2F5] text-[#252536] border border-gray-200 rounded-lg p-2 font-medium"
              >
                {availableProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.user_type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
