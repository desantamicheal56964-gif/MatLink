/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';
import { isUuid } from './services/db';

// Pages
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { SellerSellPage } from './pages/SellerSellPage';
import { SellerSiteMapPage } from './pages/SellerSiteMapPage';
import { LandingPage } from './pages/LandingPage';
import { MainDashboard } from './pages/MainDashboard';
import { ExploreMaterials } from './pages/ExploreMaterials';
import { MaterialDetails } from './pages/MaterialDetails';
import { ListMaterial } from './pages/ListMaterial';
import { AIMaterialInspector } from './pages/AIMaterialInspector';
import { ConstructionSiteMap } from './pages/ConstructionSiteMap';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MyTransactions } from './pages/MyTransactions';
import { NotificationsPage } from './pages/NotificationsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AuthPages } from './pages/AuthPages';
import { AboutPage, ContactPage } from './pages/AboutAndContact';

type PortalMode = 'buyer' | 'seller' | null;

const SELLER_ALLOWED_PAGES = new Set([
  'seller-sell',
  'seller-map',
  'seller',
  'inspector',
  'notifications',
  'profile',
  'login',
  'signup',
  'forgot',
  'about',
  'contact',
]);

function AppContent() {
  const { user, switchPersona, availableProfiles } = useAuth();
  const [portalMode, setPortalMode] = useState<PortalMode>(null);
  const [currentPage, setCurrentPage] = useState<string>('role-select');
  const [pageParams, setPageParams] = useState<any>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  // Scroll to top on navigation, enforcing Buyer vs Seller boundary
  const handleNavigate = (page: string, params?: any) => {
    if (page === 'list-material' && portalMode === 'seller') {
      setCurrentPage('seller-sell');
      setPageParams(params || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (portalMode === 'seller' && !SELLER_ALLOWED_PAGES.has(page)) {
      // Never show Marketplace or Buyer pages inside Seller mode
      setCurrentPage('seller-sell');
      setPageParams(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    setPageParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // First-step Buyer / Seller role chooser
  const handleSelectRole = async (role: 'buyer' | 'seller') => {
    setPortalMode(role);

    // For local demo personas (non-UUID), select an appropriate role persona
    if (user && !isUuid(user.id) && availableProfiles.length > 0) {
      if (role === 'buyer' && user.user_type === 'seller') {
        const buyerProfile =
          availableProfiles.find((p) => p.user_type === 'buyer') ||
          availableProfiles.find((p) => p.user_type === 'both');
        if (buyerProfile) await switchPersona(buyerProfile.id);
      } else if (role === 'seller' && user.user_type === 'buyer') {
        const sellerProfile =
          availableProfiles.find((p) => p.user_type === 'seller') ||
          availableProfiles.find((p) => p.user_type === 'both');
        if (sellerProfile) await switchPersona(sellerProfile.id);
      }
    }

    if (role === 'seller') {
      setCurrentPage('seller-sell');
    } else {
      setCurrentPage('landing');
    }
    setPageParams(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetRole = () => {
    setPortalMode(null);
    setCurrentPage('role-select');
    setPageParams(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Google Maps Demo Quota Listener (Tier 2 defense)
  useEffect(() => {
    const handleQuota = () => setQuotaReached(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Render active page based on selected role (Buyer vs Seller)
  const renderPage = () => {
    // Allow auth pages even before selecting role
    if (currentPage === 'login') {
      return (
        <AuthPages
          mode="login"
          onNavigate={(target) => {
            if (target === 'dashboard' && portalMode === null) {
              handleResetRole();
            } else if (target === 'dashboard' && portalMode === 'seller') {
              handleNavigate('seller-sell');
            } else {
              handleNavigate(target);
            }
          }}
        />
      );
    }
    if (currentPage === 'signup') {
      return (
        <AuthPages
          mode="signup"
          onNavigate={(target) => {
            if (target === 'dashboard' && portalMode === null) {
              handleResetRole();
            } else if (target === 'dashboard' && portalMode === 'seller') {
              handleNavigate('seller-sell');
            } else {
              handleNavigate(target);
            }
          }}
        />
      );
    }
    if (currentPage === 'forgot') {
      return <AuthPages mode="forgot" onNavigate={handleNavigate} />;
    }

    // Step 1: Role Selection Gate before showing Buyer or Seller interface
    if (portalMode === null || currentPage === 'role-select') {
      return <RoleSelectionPage onSelectRole={handleSelectRole} onNavigate={handleNavigate} />;
    }

    // Dedicated Seller Interface (NO marketplace)
    if (portalMode === 'seller') {
      switch (currentPage) {
        case 'seller-sell':
          return (
            <SellerSellPage
              onNavigate={handleNavigate}
              preselectedSiteId={pageParams?.siteId}
              prefillData={pageParams?.prefill}
            />
          );
        case 'seller-map':
          return <SellerSiteMapPage onNavigate={handleNavigate} />;
        case 'seller':
          return <SellerDashboard onNavigate={handleNavigate} />;
        case 'inspector':
          return <AIMaterialInspector onNavigate={handleNavigate} />;
        case 'notifications':
          return <NotificationsPage onNavigate={handleNavigate} />;
        case 'profile':
          return <UserProfilePage onNavigate={handleNavigate} />;
        case 'about':
          return <AboutPage onNavigate={handleNavigate} />;
        case 'contact':
          return <ContactPage onNavigate={handleNavigate} />;
        default:
          return <SellerSellPage onNavigate={handleNavigate} />;
      }
    }

    // Buyer Interface (Marketplace & existing website experience)
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <MainDashboard onNavigate={handleNavigate} />;
      case 'explore':
        return (
          <ExploreMaterials
            onNavigate={handleNavigate}
            initialCategory={pageParams?.category}
          />
        );
      case 'material-details':
        return (
          <MaterialDetails
            materialId={pageParams?.id || 'mat_starter_bricks'}
            onNavigate={handleNavigate}
          />
        );
      case 'list-material':
        return (
          <ListMaterial
            onNavigate={handleNavigate}
            prefillData={pageParams?.prefill}
          />
        );
      case 'inspector':
        return <AIMaterialInspector onNavigate={handleNavigate} />;
      case 'map':
        return (
          <ConstructionSiteMap
            onNavigate={handleNavigate}
            selectedSiteId={pageParams?.siteId}
          />
        );
      case 'impact':
        return <ImpactDashboard onNavigate={handleNavigate} />;
      case 'seller':
        return <SellerDashboard onNavigate={handleNavigate} />;
      case 'buyer':
        return <BuyerDashboard onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'transactions':
        return <MyTransactions onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <UserProfilePage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F2F5] text-[#252536]">
      {/* Google Maps Demo Quota Notification Bar (Mandatory Section 8 Case A) */}
      {quotaReached && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
          <button
            onClick={() => setQuotaReached(false)}
            className="text-amber-800 hover:text-black font-bold text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        portalMode={portalMode}
        onNavigate={handleNavigate}
        onSwitchRole={handleResetRole}
      />

      {/* Page Content View */}
      <main className="flex-1">{renderPage()}</main>

      {/* Global Floating AI Assistant (hidden on initial role gate) */}
      {portalMode !== null && <Chatbot onNavigate={handleNavigate} />}

      {/* Site Footer */}
      {portalMode !== null && (
        <Footer
          onNavigate={handleNavigate}
          portalMode={portalMode}
          onSwitchRole={handleResetRole}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
