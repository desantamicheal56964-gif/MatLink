import { createClient } from '@supabase/supabase-js';
import {
  UserProfile,
  ConstructionSite,
  MaterialListing,
  PurchaseRequest,
  Transaction,
  NotificationItem,
  PlatformMetrics,
  MaterialCategory,
} from '../types';

// Check if live Supabase keys are configured
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ltxxdyepdgvvabxvitqt.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cOV0Yo3sWUdethXqeRQKyQ_ov7zapny';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (val?: string | null): boolean => Boolean(val && UUID_REGEX.test(val));

// ============================================================================
// DEFAULT SEED DATA (Pune Construction Corridor)
// ============================================================================
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_patil',
    email: 'rajesh.patil@kumarproperties.in',
    full_name: 'Rajesh Patil',
    phone_number: '+91 98220 11442',
    user_type: 'seller',
    company_name: 'Kumar Properties Pune',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    created_at: '2026-09-12T10:00:00Z',
  },
  {
    id: 'usr_kulkarni',
    email: 'amit.kulkarni@rohaninfra.com',
    full_name: 'Amit Kulkarni',
    phone_number: '+91 94223 99881',
    user_type: 'both',
    company_name: 'Rohan Builders & Infra',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    created_at: '2026-09-15T11:30:00Z',
  },
  {
    id: 'usr_deshmukh',
    email: 'sunita.deshmukh@greenbrick.org',
    full_name: 'Sunita Deshmukh',
    phone_number: '+91 99234 55667',
    user_type: 'buyer',
    company_name: 'Deshmukh Eco-Contractors',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    created_at: '2026-09-20T14:15:00Z',
  },
  {
    id: 'usr_shinde',
    email: 'vikram.shinde@shindeconstructions.in',
    full_name: 'Vikram Shinde',
    phone_number: '+91 98901 23456',
    user_type: 'seller',
    company_name: 'Shinde Infrastructure Ltd',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    created_at: '2026-10-01T09:00:00Z',
  },
  {
    id: 'usr_admin',
    email: 'admin.cell@circubuild.in',
    full_name: 'Dr. Neha Joshi (Platform Admin)',
    phone_number: '+91 98811 77665',
    user_type: 'admin',
    company_name: 'Pune Municipal Sustainable Cell',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    created_at: '2026-08-01T08:00:00Z',
  },
];

const INITIAL_SITES: ConstructionSite[] = [
  {
    id: 'site_hinjawadi',
    name: 'Hinjawadi IT Park Phase 3 Commercial Tower',
    developer_name: 'Kumar Properties Pune',
    address: 'Plot 42, Rajiv Gandhi Infotech Park, Hinjawadi Phase 3',
    area: 'Hinjawadi',
    city: 'Pune',
    latitude: 18.5913,
    longitude: 73.6983,
    status: 'active',
    seller_id: 'usr_patil',
    contact_person: 'Rajesh Patil',
    contact_phone: '+91 98220 11442',
    total_listings_count: 0,
  },
  {
    id: 'site_kharadi',
    name: 'Kharadi EON Gateway Towers',
    developer_name: 'Rohan Builders & Infra',
    address: 'Near World Trade Center, Kharadi Bypass Rd',
    area: 'Kharadi',
    city: 'Pune',
    latitude: 18.5514,
    longitude: 73.9535,
    status: 'active',
    seller_id: 'usr_kulkarni',
    contact_person: 'Amit Kulkarni',
    contact_phone: '+91 94223 99881',
    total_listings_count: 0,
  },
  {
    id: 'site_wakad',
    name: 'Wakad Green Valley Heights',
    developer_name: 'Shinde Infrastructure Ltd',
    address: 'Datta Mandir Rd, Shankar Kalat Nagar, Wakad',
    area: 'Wakad',
    city: 'Pune',
    latitude: 18.5987,
    longitude: 73.7629,
    status: 'active',
    seller_id: 'usr_shinde',
    contact_person: 'Vikram Shinde',
    contact_phone: '+91 98901 23456',
    total_listings_count: 0,
  },
  {
    id: 'site_baner',
    name: 'Baner High Street Commercial Hub',
    developer_name: 'Kumar Properties Pune',
    address: 'Baner - Pashan Link Rd, Baner',
    area: 'Baner',
    city: 'Pune',
    latitude: 18.5590,
    longitude: 73.7868,
    status: 'active',
    seller_id: 'usr_patil',
    contact_person: 'Rajesh Patil',
    contact_phone: '+91 98220 11442',
    total_listings_count: 0,
  },
  {
    id: 'site_kothrud',
    name: 'Kothrud Metro Interchange Complex',
    developer_name: 'Pune Infra Corp',
    address: 'Near Karve Statue, Paud Road, Kothrud',
    area: 'Kothrud',
    city: 'Pune',
    latitude: 18.5074,
    longitude: 73.8077,
    status: 'active',
    seller_id: 'usr_kulkarni',
    contact_person: 'Manoj Gaikwad',
    contact_phone: '+91 98230 44551',
    total_listings_count: 0,
  },
  {
    id: 'site_viman_nagar',
    name: 'Viman Nagar Aeromall Extension',
    developer_name: 'Rohan Builders & Infra',
    address: 'Symbiosis Road, Viman Nagar',
    area: 'Viman Nagar',
    city: 'Pune',
    latitude: 18.5679,
    longitude: 73.9143,
    status: 'active',
    seller_id: 'usr_kulkarni',
    contact_person: 'Amit Kulkarni',
    contact_phone: '+91 94223 99881',
    total_listings_count: 0,
  },
  {
    id: 'site_pimpri',
    name: 'Pimpri Auto Cluster Mega Logistics Shed',
    developer_name: 'Shinde Infrastructure Ltd',
    address: 'Old Mumbai-Pune Highway, Pimpri Colony',
    area: 'Pimpri',
    city: 'Pune',
    latitude: 18.6279,
    longitude: 73.8009,
    status: 'active',
    seller_id: 'usr_shinde',
    contact_person: 'Vikram Shinde',
    contact_phone: '+91 98901 23456',
    total_listings_count: 0,
  },
  {
    id: 'site_hadapsar',
    name: 'Hadapsar Eco-City Township Phase 2',
    developer_name: 'Green Earth Builders',
    address: 'Magarpatta City Perimeter, Hadapsar',
    area: 'Hadapsar',
    city: 'Pune',
    latitude: 18.5089,
    longitude: 73.9260,
    status: 'active',
    seller_id: 'usr_patil',
    contact_person: 'Vinayak Pawar',
    contact_phone: '+91 98221 66554',
    total_listings_count: 0,
  },
  {
    id: 'site_balewadi',
    name: 'Balewadi Smart Sports Arena & Commercial Boulevard',
    developer_name: 'Rohan Builders & Infra',
    address: 'Near Shree Shiv Chhatrapati Sports Complex, Balewadi High St',
    area: 'Balewadi',
    city: 'Pune',
    latitude: 18.5756,
    longitude: 73.7707,
    status: 'active',
    seller_id: 'usr_kulkarni',
    contact_person: 'Amit Kulkarni',
    contact_phone: '+91 94223 99881',
    total_listings_count: 0,
  },
  {
    id: 'site_magarpatta',
    name: 'Magarpatta Cybercity IT Tower 16 Expansion',
    developer_name: 'Kumar Properties Pune',
    address: 'Mundhwa - Hadapsar Bypass Rd, Magarpatta City',
    area: 'Magarpatta',
    city: 'Pune',
    latitude: 18.5147,
    longitude: 73.9298,
    status: 'active',
    seller_id: 'usr_patil',
    contact_person: 'Rajesh Patil',
    contact_phone: '+91 98220 11442',
    total_listings_count: 0,
  },
  {
    id: 'site_ravet',
    name: 'Ravet Expressway Gateway Twin Towers',
    developer_name: 'Shinde Infrastructure Ltd',
    address: 'Near Bhondve Circle, BRTS Corridor, Ravet, PCMC',
    area: 'Ravet',
    city: 'Pune',
    latitude: 18.6477,
    longitude: 73.7431,
    status: 'active',
    seller_id: 'usr_shinde',
    contact_person: 'Vikram Shinde',
    contact_phone: '+91 98901 23456',
    total_listings_count: 0,
  },
  {
    id: 'site_chakan',
    name: 'Chakan Industrial Logistics Mega Shed Phase 2',
    developer_name: 'Shinde Infrastructure Ltd',
    address: 'Talegaon - Chakan Rd, MIDC Phase 2, Chakan',
    area: 'Chakan',
    city: 'Pune',
    latitude: 18.7583,
    longitude: 73.8569,
    status: 'active',
    seller_id: 'usr_shinde',
    contact_person: 'Vikram Shinde',
    contact_phone: '+91 98901 23456',
    total_listings_count: 0,
  },
  {
    id: 'site_bavdhan',
    name: 'Bavdhan Nature Crest Eco-Residences',
    developer_name: 'Green Earth Builders',
    address: 'NDA Road, Ram Nagar, Bavdhan Khurd',
    area: 'Bavdhan',
    city: 'Pune',
    latitude: 18.5126,
    longitude: 73.7744,
    status: 'active',
    seller_id: 'usr_patil',
    contact_person: 'Vinayak Pawar',
    contact_phone: '+91 98221 66554',
    total_listings_count: 0,
  },
  {
    id: 'site_kalyani_nagar',
    name: 'Kalyani Nagar Riverside Commercial Plaza',
    developer_name: 'Rohan Builders & Infra',
    address: 'East Ave, Near Jogger’s Park, Kalyani Nagar',
    area: 'Kalyani Nagar',
    city: 'Pune',
    latitude: 18.5463,
    longitude: 73.9034,
    status: 'active',
    seller_id: 'usr_kulkarni',
    contact_person: 'Amit Kulkarni',
    contact_phone: '+91 94223 99881',
    total_listings_count: 0,
  },
  {
    id: 'site_moshi',
    name: 'Moshi PCMC International Convention Corridor',
    developer_name: 'Pune Infra Corp',
    address: 'Pune-Nashik Highway, Sector 4, Moshi Pradhikaran',
    area: 'Moshi',
    city: 'Pune',
    latitude: 18.6791,
    longitude: 73.8447,
    status: 'active',
    seller_id: 'usr_shinde',
    contact_person: 'Vikram Shinde',
    contact_phone: '+91 98901 23456',
    total_listings_count: 0,
  },
  {
    id: 'site_aundh',
    name: 'Aundh Metro Transit Urban Regeneration',
    developer_name: 'Kumar Properties Pune',
    address: 'Near Bremen Chowk, DP Road, Aundh',
    area: 'Aundh',
    city: 'Pune',
    latitude: 18.5580,
    longitude: 73.8073,
    status: 'active',
    seller_id: 'usr_patil',
    contact_person: 'Rajesh Patil',
    contact_phone: '+91 98220 11442',
    total_listings_count: 0,
  },
  {
    id: 'site_wagholi',
    name: 'Wagholi IT-Corridor Green Township',
    developer_name: 'Shinde Infrastructure Ltd',
    address: 'Bakori Road, Off Pune-Ahmednagar Highway, Wagholi',
    area: 'Wagholi',
    city: 'Pune',
    latitude: 18.5808,
    longitude: 73.9812,
    status: 'active',
    seller_id: 'usr_shinde',
    contact_person: 'Vikram Shinde',
    contact_phone: '+91 98901 23456',
    total_listings_count: 0,
  },
  {
    id: 'site_undri',
    name: 'Undri - Pisoli Forest Hills Residential Estate',
    developer_name: 'Kumar Properties Pune',
    address: 'Kad Nagar, Near Corinthian Club, Undri',
    area: 'Undri',
    city: 'Pune',
    latitude: 18.4618,
    longitude: 73.9082,
    status: 'active',
    seller_id: 'usr_patil',
    contact_person: 'Rajesh Patil',
    contact_phone: '+91 98220 11442',
    total_listings_count: 0,
  },
  {
    id: 'site_sb_road',
    name: 'Senapati Bapat Institutional Innovation Tower',
    developer_name: 'Pune Infra Corp',
    address: 'Near Symbiosis College, Senapati Bapat Road',
    area: 'Shivajinagar',
    city: 'Pune',
    latitude: 18.5314,
    longitude: 73.8298,
    status: 'active',
    seller_id: 'usr_kulkarni',
    contact_person: 'Manoj Gaikwad',
    contact_phone: '+91 98230 44551',
    total_listings_count: 0,
  },
  {
    id: 'site_swargate',
    name: 'Swargate Multi-Modal Underground Hub',
    developer_name: 'Pune Metro Infra',
    address: 'Jedhe Chowk, Swargate Central Hub',
    area: 'Swargate',
    city: 'Pune',
    latitude: 18.5018,
    longitude: 73.8586,
    status: 'active',
    seller_id: 'usr_kulkarni',
    contact_person: 'Amit Kulkarni',
    contact_phone: '+91 94223 99881',
    total_listings_count: 0,
  },
];

// Two minimal starter materials shown in Buyer Marketplace alongside live seller uploads
const INITIAL_MATERIALS: MaterialListing[] = [
  {
    id: 'mat_starter_bricks',
    seller_id: 'usr_kulkarni',
    seller_name: 'Amit Kulkarni',
    seller_phone: '+91 94223 99881',
    seller_company: 'Rohan Builders & Infra',
    site_id: 'site_kharadi',
    site_name: 'Kharadi EON Gateway Towers',
    title: 'High-Density Red Clay Wire-Cut Bricks',
    category: 'Bricks',
    description:
      'Surplus chamber-kiln burnt red clay bricks stacked cleanly on site. Sharp corners and consistent firing quality.',
    available_quantity: 4200,
    original_quantity: 4200,
    unit: 'Pieces',
    original_market_price: 7,
    selling_price: 7,
    condition: 'Excellent',
    status: 'available',
    location_name: 'Kharadi Bypass, Pune',
    latitude: 18.5514,
    longitude: 73.9535,
    ai_inspected: true,
    ai_inspection_notes: 'Sharp corners, consistent firing color, minimal chipping.',
    images: ['https://images.unsplash.com/photo-1584463699026-6a978f8cb64c?w=800&auto=format&fit=crop&q=80'],
    created_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'mat_starter_tiles',
    seller_id: 'usr_patil',
    seller_name: 'Rajesh Patil',
    seller_phone: '+91 98220 11442',
    seller_company: 'Kumar Properties Pune',
    site_id: 'site_baner',
    site_name: 'Baner High Street Commercial Hub',
    title: 'Vitrified Double Charge Floor Tiles (600x1200mm)',
    category: 'Tiles',
    description:
      'Unopened original boxes of ivory gloss vitrified floor tiles remaining after lobby completion.',
    available_quantity: 850,
    original_quantity: 850,
    unit: 'Sq. Ft',
    original_market_price: 48,
    selling_price: 48,
    condition: 'Excellent',
    status: 'available',
    location_name: 'Baner High Street, Pune',
    latitude: 18.559,
    longitude: 73.7868,
    ai_inspected: true,
    ai_inspection_notes: 'Factory boxes sealed; corner protectors intact.',
    images: ['https://images.unsplash.com/photo-1581404476143-fb31d742929f?w=800&auto=format&fit=crop&q=80'],
    created_at: '2026-10-14T10:00:00Z',
  },
];

const INITIAL_REQUESTS: PurchaseRequest[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const LEGACY_DEMO_MATERIAL_IDS = new Set([
  'mat_cement_hinj',
  'mat_steel_hinj',
  'mat_bricks_kharadi',
  'mat_tiles_kharadi',
  'mat_sand_wakad',
  'mat_pipes_wakad',
  'mat_wood_baner',
  'mat_electrical_viman',
  'mat_paint_pimpri',
  'mat_granite_hinj',
  'mat_steel_balewadi',
  'mat_stone_magarpatta',
  'mat_blocks_ravet',
  'mat_roofing_chakan',
  'mat_doors_bavdhan',
  'mat_pipes_moshi',
  'mat_tiles_kalyani',
  'mat_paint_wagholi',
  'mat_aggregate_undri',
  'mat_electrical_swargate',
  // Legacy seeded UUIDs from supabase/setup.sql so old 10-item seed does not flood reduced marketplace
  'c0000001-0000-0000-0000-000000000001',
  'c0000002-0000-0000-0000-000000000002',
  'c0000003-0000-0000-0000-000000000003',
  'c0000004-0000-0000-0000-000000000004',
  'c0000005-0000-0000-0000-000000000005',
  'c0000006-0000-0000-0000-000000000006',
  'c0000007-0000-0000-0000-000000000007',
  'c0000008-0000-0000-0000-000000000008',
  'c0000009-0000-0000-0000-000000000009',
  'c0000010-0000-0000-0000-000000000010',
]);

const LEGACY_DEMO_TX_IDS = new Set(['tx_001', 'tx_002', 'tx_003', 'tx_004', 'tx_005']);
const LEGACY_DEMO_REQ_IDS = new Set(['req_001', 'req_002', 'req_003', 'req_004']);
const LEGACY_DEMO_NOTIF_IDS = new Set(['notif_001', 'notif_002', 'notif_003']);

function emitMaterialsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('matlink:materials-updated'));
  }
}

function purgeLegacyDemoStorageOnce(): void {
  try {
    if (!localStorage.getItem('circubuild_demo_cleared_v1')) {
      const filterKey = (key: string, legacyIds: Set<string>) => {
        const raw = localStorage.getItem(`circubuild_${key}`);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((item: any) => !legacyIds.has(item?.id));
          localStorage.setItem(`circubuild_${key}`, JSON.stringify(cleaned));
        }
      };

      filterKey('materials', LEGACY_DEMO_MATERIAL_IDS);
      filterKey('transactions', LEGACY_DEMO_TX_IDS);
      filterKey('requests', LEGACY_DEMO_REQ_IDS);
      filterKey('notifications', LEGACY_DEMO_NOTIF_IDS);

      const rawSites = localStorage.getItem('circubuild_sites');
      if (rawSites) {
        const parsedSites = JSON.parse(rawSites);
        if (Array.isArray(parsedSites)) {
          const cleanedSites = parsedSites.map((s: any) =>
            String(s?.id || '').startsWith('site_') && !/^site_\d+$/.test(s.id)
              ? { ...s, status: 'active', total_listings_count: 0 }
              : s
          );
          localStorage.setItem('circubuild_sites', JSON.stringify(cleanedSites));
        }
      }

      localStorage.setItem('circubuild_demo_cleared_v1', 'true');
    }

    // Seed the 2 clean starter marketplace items once while preserving any user-uploaded materials
    if (!localStorage.getItem('matlink_starter_v2')) {
      const rawMats = localStorage.getItem('circubuild_materials');
      const existing: MaterialListing[] = rawMats ? JSON.parse(rawMats) : [];
      const existingIds = new Set(existing.map((m) => m.id));
      const toAdd = INITIAL_MATERIALS.filter((m) => !existingIds.has(m.id));
      localStorage.setItem('circubuild_materials', JSON.stringify([...existing, ...toAdd]));
      localStorage.setItem('matlink_starter_v2', 'true');
    }
  } catch (err) {
    console.warn('Demo storage cleanup skipped:', err);
  }
}

purgeLegacyDemoStorageOnce();

// Helper to get from local storage or initialize
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`circubuild_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
  }
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`circubuild_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// ============================================================================
// DATA ACCESS LAYER (HYBRID ENGINE: SUPABASE POSTGRES + LOCAL PERSISTENCE FALLBACK)
// ============================================================================
export const db = {
  // Check whether Supabase database schema tables are ready
  async checkSupabaseTablesReady(): Promise<{ ready: boolean; message?: string }> {
    if (!supabase) return { ready: false, message: 'Supabase client not configured.' };
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        return { ready: false, message: error.message };
      }
      return { ready: true };
    } catch (err: any) {
      return { ready: false, message: err?.message || 'Unable to reach Supabase.' };
    }
  },

  // Sync authenticated user profile and sign-in activity to Supabase tables
  async syncSupabaseUserRecord(
    profile: UserProfile,
    actionType?: 'signup' | 'signin' | 'profile_update'
  ): Promise<{ synced: boolean; schemaMissing?: boolean; error?: string }> {
    if (!supabase || !isUuid(profile.id)) {
      return { synced: false };
    }

    try {
      const now = new Date().toISOString();
      const { data: sessionData } = await supabase.auth.getSession();
      const activeUid = sessionData.session?.user?.id;

      // Only perform client RLS write when session is active for this user
      if (activeUid !== profile.id) {
        return { synced: false };
      }

      const { error: upsertErr } = await supabase.from('profiles').upsert(
        {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone_number: profile.phone_number || null,
          user_type: profile.user_type || 'both',
          company_name: profile.company_name || null,
          avatar_url: profile.avatar_url || null,
          is_verified: profile.is_verified ?? true,
          last_sign_in_at: now,
          updated_at: now,
        },
        { onConflict: 'id' }
      );

      if (upsertErr) {
        const isMissing =
          upsertErr.code === 'PGRST205' ||
          upsertErr.message?.includes('Could not find the table') ||
          upsertErr.code === '42P01';
        console.warn('Supabase profile upsert warning:', upsertErr.message);
        return { synced: false, schemaMissing: isMissing, error: upsertErr.message };
      }

      if (actionType) {
        const { error: logErr } = await supabase.from('sign_in_logs').insert({
          user_id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone_number: profile.phone_number || null,
          user_type: profile.user_type || 'both',
          company_name: profile.company_name || null,
          action_type: actionType,
          signed_in_at: now,
        });
        if (logErr) {
          console.warn('Supabase sign_in_logs insert warning:', logErr.message);
        }
      }

      return { synced: true };
    } catch (err: any) {
      console.warn('Supabase user sync error:', err);
      return { synced: false, error: err?.message };
    }
  },

  // Profiles
  async getProfiles(): Promise<UserProfile[]> {
    const localProfiles = getStored<UserProfile[]>('profiles', INITIAL_USERS);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mergedMap = new Map<string, UserProfile>();
          localProfiles.forEach((p) => mergedMap.set(p.email.toLowerCase(), p));
          data.forEach((row: any) => {
            mergedMap.set(String(row.email).toLowerCase(), {
              id: row.id,
              email: row.email,
              full_name: row.full_name,
              phone_number: row.phone_number || undefined,
              user_type: row.user_type,
              company_name: row.company_name || undefined,
              avatar_url: row.avatar_url || undefined,
              is_verified: row.is_verified,
              created_at: row.created_at,
            });
          });
          const merged = Array.from(mergedMap.values());
          setStored('profiles', merged);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase getProfiles fallback to local:', err);
      }
    }
    return localProfiles;
  },

  async getProfileById(id: string): Promise<UserProfile | null> {
    if (supabase && isUuid(id)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            phone_number: data.phone_number || undefined,
            user_type: data.user_type,
            company_name: data.company_name || undefined,
            avatar_url: data.avatar_url || undefined,
            is_verified: data.is_verified,
            created_at: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Supabase getProfileById fallback:', err);
      }
    }
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profiles = getStored<UserProfile[]>('profiles', INITIAL_USERS);
    const index = profiles.findIndex((p) => p.id === id);
    let resultProfile: UserProfile;

    if (index >= 0) {
      resultProfile = { ...profiles[index], ...updates };
      profiles[index] = resultProfile;
      setStored('profiles', profiles);
    } else {
      resultProfile = {
        id,
        email: updates.email || 'user@example.com',
        full_name: updates.full_name || 'Anonymous User',
        user_type: updates.user_type || 'both',
        ...updates,
      };
      profiles.push(resultProfile);
      setStored('profiles', profiles);
    }

    if (supabase && isUuid(id)) {
      await this.syncSupabaseUserRecord(resultProfile, 'profile_update');
    }

    return resultProfile;
  },

  // Construction Sites
  async getConstructionSites(): Promise<ConstructionSite[]> {
    const stored = getStored<ConstructionSite[]>('sites', INITIAL_SITES);
    const existingIds = new Set(stored.map((s) => s.id));
    const missing = INITIAL_SITES.filter((s) => !existingIds.has(s.id));
    let localMerged = stored;
    if (missing.length > 0) {
      localMerged = [...stored, ...missing];
      setStored('sites', localMerged);
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('construction_sites').select('*');
        if (!error && data && data.length > 0) {
          const map = new Map<string, ConstructionSite>();
          localMerged.forEach((s) => map.set(s.id, s));
          data.forEach((row: any) => {
            map.set(row.id, {
              id: row.id,
              name: row.name,
              developer_name: row.developer_name,
              address: row.address,
              area: row.area,
              city: row.city || 'Pune',
              latitude: Number(row.latitude),
              longitude: Number(row.longitude),
              status: row.status,
              seller_id: row.seller_id,
              contact_person: row.contact_person,
              contact_phone: row.contact_phone,
              total_listings_count: row.total_listings_count || 0,
              created_at: row.created_at,
            });
          });
          return Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase getConstructionSites fallback:', err);
      }
    }

    return localMerged;
  },

  async addConstructionSite(site: Omit<ConstructionSite, 'id'>): Promise<ConstructionSite> {
    const sites = await this.getConstructionSites();
    let newId = `site_${Date.now()}`;
    const createdAt = new Date().toISOString();

    if (supabase && isUuid(site.seller_id)) {
      try {
        const { data, error } = await supabase
          .from('construction_sites')
          .insert({
            name: site.name,
            developer_name: site.developer_name || null,
            address: site.address,
            area: site.area,
            city: site.city || 'Pune',
            latitude: site.latitude,
            longitude: site.longitude,
            status: site.status || 'active',
            seller_id: site.seller_id,
            contact_person: site.contact_person || null,
            contact_phone: site.contact_phone || null,
            total_listings_count: site.total_listings_count || 0,
          })
          .select('id')
          .single();
        if (!error && data?.id) {
          newId = data.id;
        }
      } catch (err) {
        console.warn('Supabase addConstructionSite fallback:', err);
      }
    }

    const newSite: ConstructionSite = {
      ...site,
      id: newId,
      created_at: createdAt,
    };
    sites.push(newSite);
    setStored('sites', sites);
    return newSite;
  },

  // Materials (Live Seller -> Buyer Marketplace sync)
  subscribeToMaterials(onUpdate: () => void): () => void {
    const handleCustom = () => onUpdate();
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'circubuild_materials' || e.key === 'circubuild_sites') {
        onUpdate();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('matlink:materials-updated', handleCustom);
      window.addEventListener('storage', handleStorage);
    }

    let channel: any = null;
    if (supabase) {
      try {
        channel = supabase
          .channel(`materials-sync-${Date.now()}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'materials' },
            () => onUpdate()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'material_images' },
            () => onUpdate()
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime subscription skipped:', err);
      }
    }

    // Background polling fallback so Buyer Mode stays automatically updated even if Realtime is disabled
    const pollInterval = setInterval(() => {
      onUpdate();
    }, 6000);

    return () => {
      clearInterval(pollInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('matlink:materials-updated', handleCustom);
        window.removeEventListener('storage', handleStorage);
      }
      if (supabase && channel) {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.warn('Supabase channel cleanup skipped:', err);
        }
      }
    };
  },

  async getMaterials(): Promise<MaterialListing[]> {
    const stored = getStored<MaterialListing[]>('materials', INITIAL_MATERIALS);
    const localFiltered = stored.filter((m) => !LEGACY_DEMO_MATERIAL_IDS.has(m.id));
    const map = new Map<string, MaterialListing>();
    localFiltered.forEach((m) => map.set(m.id, m));

    if (supabase) {
      try {
        let { data, error } = await supabase
          .from('materials')
          .select('*, material_images(image_url, is_primary), profiles(full_name, phone_number, company_name)')
          .order('created_at', { ascending: false });

        // Retry simple select if joined relation fails due to RLS or schema cache
        if (error) {
          const fallbackRes = await supabase
            .from('materials')
            .select('*, material_images(image_url, is_primary)')
            .order('created_at', { ascending: false });
          data = fallbackRes.data;
          error = fallbackRes.error;
        }

        if (!error && data && data.length > 0) {
          data.forEach((row: any) => {
            if (LEGACY_DEMO_MATERIAL_IDS.has(row.id)) return;
            const existingLocal = map.get(row.id);
            const imgs = Array.isArray(row.material_images)
              ? row.material_images.map((i: any) => i.image_url).filter(Boolean)
              : [];
            map.set(row.id, {
              id: row.id,
              seller_id: row.seller_id,
              seller_name: row.profiles?.full_name || existingLocal?.seller_name,
              seller_phone: row.profiles?.phone_number || existingLocal?.seller_phone,
              seller_company: row.profiles?.company_name || existingLocal?.seller_company,
              site_id: row.site_id || existingLocal?.site_id || undefined,
              site_name: existingLocal?.site_name,
              title: row.title,
              category: row.category,
              description: row.description || '',
              available_quantity: Number(row.available_quantity),
              original_quantity: Number(row.original_quantity),
              unit: row.unit,
              original_market_price: Number(row.original_market_price),
              selling_price: Number(row.selling_price),
              condition: row.condition,
              status: row.status,
              location_name: row.location_name,
              latitude:
                row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : 18.5204,
              longitude:
                row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : 73.8567,
              ai_inspected: Boolean(row.ai_inspected),
              ai_inspection_notes: row.ai_inspection_notes || undefined,
              images:
                imgs.length > 0
                  ? imgs
                  : existingLocal?.images && existingLocal.images.length > 0
                  ? existingLocal.images
                  : ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'],
              created_at: row.created_at,
              updated_at: row.updated_at,
            });
          });
        }
      } catch (err) {
        console.warn('Supabase getMaterials fallback:', err);
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getMaterialById(id: string): Promise<MaterialListing | null> {
    const materials = await this.getMaterials();
    return materials.find((m) => m.id === id) || null;
  },

  async addMaterial(listing: Omit<MaterialListing, 'id' | 'created_at'>): Promise<MaterialListing> {
    const materials = await this.getMaterials();
    let newId = `mat_${Date.now()}`;
    const createdAt = new Date().toISOString();

    if (supabase && isUuid(listing.seller_id)) {
      try {
        const { data, error } = await supabase
          .from('materials')
          .insert({
            seller_id: listing.seller_id,
            site_id: isUuid(listing.site_id) ? listing.site_id : null,
            title: listing.title,
            category: listing.category,
            description: listing.description,
            available_quantity: listing.available_quantity,
            original_quantity: listing.original_quantity,
            unit: listing.unit,
            original_market_price: listing.original_market_price,
            selling_price: listing.selling_price,
            condition: listing.condition,
            status: listing.status,
            location_name: listing.location_name,
            latitude: listing.latitude || null,
            longitude: listing.longitude || null,
            ai_inspected: listing.ai_inspected || false,
            ai_inspection_notes: listing.ai_inspection_notes || null,
          })
          .select('id')
          .single();

        if (!error && data?.id) {
          newId = data.id;
          if (listing.images && listing.images.length > 0) {
            const { error: imgErr } = await supabase.from('material_images').insert(
              listing.images.slice(0, 5).map((url, idx) => ({
                material_id: newId,
                image_url: url,
                is_primary: idx === 0,
              }))
            );
            if (imgErr) {
              console.warn('Supabase material_images insert warning:', imgErr.message);
            }
          }
        } else if (error) {
          console.warn('Supabase addMaterial insert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase addMaterial fallback:', err);
      }
    }

    const newListing: MaterialListing = {
      ...listing,
      id: newId,
      created_at: createdAt,
    };
    materials.unshift(newListing);
    setStored('materials', materials);

    // Update site's listing count and availability status if associated
    if (newListing.site_id) {
      const sites = await this.getConstructionSites();
      const site = sites.find((s) => s.id === newListing.site_id);
      if (site) {
        site.total_listings_count = (site.total_listings_count || 0) + 1;
        site.status = 'materials_available';
        setStored('sites', sites);
      }
    }

    // Add notification
    await this.addNotification({
      user_id: newListing.seller_id,
      title: 'Listing Published to Buyer Marketplace',
      message: `Your listing for "${newListing.title}" is now automatically visible in Buyer Mode.`,
      type: 'system',
      link: `/materials/${newListing.id}`,
    });

    emitMaterialsUpdated();
    return newListing;
  },

  async updateMaterial(id: string, updates: Partial<MaterialListing>): Promise<MaterialListing> {
    const materials = await this.getMaterials();
    const index = materials.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Material not found');

    const updated = { ...materials[index], ...updates, updated_at: new Date().toISOString() };
    if (updated.available_quantity <= 0) {
      updated.status = 'sold';
    }
    materials[index] = updated;
    setStored('materials', materials);

    if (supabase && isUuid(id)) {
      try {
        await supabase
          .from('materials')
          .update({
            title: updated.title,
            description: updated.description,
            available_quantity: updated.available_quantity,
            selling_price: updated.selling_price,
            condition: updated.condition,
            status: updated.status,
            updated_at: updated.updated_at,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateMaterial fallback:', err);
      }
    }

    emitMaterialsUpdated();
    return updated;
  },

  async deleteMaterial(id: string): Promise<boolean> {
    const materials = await this.getMaterials();
    const filtered = materials.filter((m) => m.id !== id);
    setStored('materials', filtered);

    if (supabase && isUuid(id)) {
      try {
        await supabase.from('materials').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteMaterial fallback:', err);
      }
    }

    emitMaterialsUpdated();
    return true;
  },

  // Purchase Requests & Transaction Workflow
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    const localReqs = getStored<PurchaseRequest[]>('requests', INITIAL_REQUESTS);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('purchase_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const map = new Map<string, PurchaseRequest>();
          localReqs.forEach((r) => map.set(r.id, r));
          data.forEach((row: any) => {
            map.set(row.id, {
              id: row.id,
              material_id: row.material_id,
              buyer_id: row.buyer_id,
              seller_id: row.seller_id,
              requested_quantity: Number(row.requested_quantity),
              unit: 'Units',
              offered_price_per_unit: Number(row.offered_price_per_unit),
              total_amount: Number(row.total_amount),
              delivery_preference: row.delivery_preference,
              message: row.message || '',
              status: row.status,
              rejection_reason: row.rejection_reason || undefined,
              created_at: row.created_at,
            });
          });
          return Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase getPurchaseRequests fallback:', err);
      }
    }
    return localReqs;
  },

  async createPurchaseRequest(data: Omit<PurchaseRequest, 'id' | 'created_at' | 'status'>): Promise<PurchaseRequest> {
    const requests = await this.getPurchaseRequests();
    const material = await this.getMaterialById(data.material_id);
    if (!material) throw new Error('Material not found');
    if (material.available_quantity < data.requested_quantity) {
      throw new Error(`Requested quantity exceeds available inventory (${material.available_quantity} ${material.unit})`);
    }

    let newId = `req_${Date.now()}`;
    if (supabase && isUuid(data.material_id) && isUuid(data.buyer_id) && isUuid(data.seller_id)) {
      try {
        const { data: inserted, error } = await supabase
          .from('purchase_requests')
          .insert({
            material_id: data.material_id,
            buyer_id: data.buyer_id,
            seller_id: data.seller_id,
            requested_quantity: data.requested_quantity,
            offered_price_per_unit: data.offered_price_per_unit,
            total_amount: data.total_amount,
            delivery_preference: data.delivery_preference,
            message: data.message,
            status: 'pending',
          })
          .select('id')
          .single();
        if (!error && inserted?.id) {
          newId = inserted.id;
        }
      } catch (err) {
        console.warn('Supabase createPurchaseRequest fallback:', err);
      }
    }

    const newRequest: PurchaseRequest = {
      ...data,
      id: newId,
      material_title: material.title,
      material_category: material.category,
      material_image: material.images[0],
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    setStored('requests', requests);

    // Notify seller
    await this.addNotification({
      user_id: data.seller_id,
      title: 'New Purchase Request',
      message: `${data.buyer_name || 'A buyer'} requested ${data.requested_quantity} ${data.unit} of "${material.title}".`,
      type: 'request_received',
      link: '/seller',
    });

    return newRequest;
  },

  async respondToPurchaseRequest(
    requestId: string,
    action: 'accept' | 'reject',
    reason?: string
  ): Promise<PurchaseRequest> {
    const requests = await this.getPurchaseRequests();
    const reqIndex = requests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) throw new Error('Purchase request not found');

    const req = requests[reqIndex];
    if (action === 'reject') {
      req.status = 'rejected';
      req.rejection_reason = reason || 'Declined by seller.';
      setStored('requests', requests);

      if (supabase && isUuid(requestId)) {
        try {
          await supabase
            .from('purchase_requests')
            .update({ status: 'rejected', rejection_reason: req.rejection_reason })
            .eq('id', requestId);
        } catch (err) {
          console.warn('Supabase reject request fallback:', err);
        }
      }

      // Notify buyer
      await this.addNotification({
        user_id: req.buyer_id,
        title: 'Purchase Request Declined',
        message: `Your request for ${req.requested_quantity} ${req.unit} of "${req.material_title}" was declined: ${req.rejection_reason}`,
        type: 'request_rejected',
        link: '/buyer',
      });
      return req;
    }

    // Action is 'accept' -> update inventory atomically and record transaction
    const material = await this.getMaterialById(req.material_id);
    if (!material) throw new Error('Material not found');
    if (material.available_quantity < req.requested_quantity) {
      throw new Error('Not enough quantity remaining to accept this request');
    }

    // Deduct quantity
    const newQty = material.available_quantity - req.requested_quantity;
    await this.updateMaterial(material.id, {
      available_quantity: newQty,
      status: newQty === 0 ? 'sold' : 'available',
    });

    req.status = 'completed';
    setStored('requests', requests);

    if (supabase && isUuid(requestId)) {
      try {
        await supabase
          .from('purchase_requests')
          .update({ status: 'completed' })
          .eq('id', requestId);
      } catch (err) {
        console.warn('Supabase complete request fallback:', err);
      }
    }

    // Calculate waste weight estimate based on category
    const weightPerUnitKg: Record<MaterialCategory, number> = {
      Cement: 50,
      Steel: 1000,
      Bricks: 3,
      Sand: 2500,
      Tiles: 15,
      'Wooden Materials': 25,
      Pipes: 4,
      'Electrical Materials': 0.3,
      Paint: 25,
      Stone: 30,
      'Doors and Windows': 45,
      'Other Construction Materials': 20,
    };

    const multiplier = weightPerUnitKg[material.category] || 10;
    const wasteDivertedKg = Math.round(req.requested_quantity * multiplier);
    const marketValue = material.original_market_price * req.requested_quantity;
    const totalPrice = req.total_amount;
    const moneySaved = Math.max(0, marketValue - totalPrice);

    // Record Transaction
    await this.recordTransaction({
      purchase_request_id: req.id,
      material_id: material.id,
      material_title: material.title,
      material_category: material.category,
      buyer_id: req.buyer_id,
      buyer_name: req.buyer_name || 'Buyer',
      seller_id: req.seller_id,
      seller_name: req.seller_name || 'Seller',
      quantity: req.requested_quantity,
      unit: req.unit,
      unit_price: req.offered_price_per_unit,
      total_price: totalPrice,
      market_value: marketValue,
      money_saved: moneySaved,
      waste_diverted_kg: wasteDivertedKg,
      status: 'completed',
      completion_date: new Date().toISOString(),
    });

    // Notify buyer
    await this.addNotification({
      user_id: req.buyer_id,
      title: 'Purchase Request Accepted!',
      message: `Your request for ${req.requested_quantity} ${req.unit} of "${material.title}" has been accepted! You saved ₹${moneySaved.toLocaleString('en-IN')}.`,
      type: 'request_accepted',
      link: '/buyer',
    });

    // Notify seller
    await this.addNotification({
      user_id: req.seller_id,
      title: 'Transaction Finalized',
      message: `Successfully sold ${req.requested_quantity} ${req.unit} of "${material.title}" to ${req.buyer_name}.`,
      type: 'transaction_completed',
      link: '/seller',
    });

    return req;
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const localTxs = getStored<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const map = new Map<string, Transaction>();
          localTxs.forEach((t) => map.set(t.id, t));
          data.forEach((row: any) => {
            map.set(row.id, {
              id: row.id,
              purchase_request_id: row.purchase_request_id || undefined,
              material_id: row.material_id,
              material_title: 'Material Order',
              material_category: 'Other Construction Materials',
              buyer_id: row.buyer_id,
              buyer_name: row.buyer_name || 'MatLink Buyer',
              seller_id: row.seller_id,
              seller_name: row.seller_name || 'MatLink Seller',
              quantity: Number(row.quantity),
              unit: 'Units',
              unit_price: Number(row.unit_price),
              total_price: Number(row.total_price),
              market_value: Number(row.market_value),
              money_saved: Number(row.money_saved),
              waste_diverted_kg: Number(row.waste_diverted_kg),
              status: row.status,
              completion_date: row.completion_date,
              created_at: row.created_at,
            });
          });
          return Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase getTransactions fallback:', err);
      }
    }
    return localTxs;
  },

  async recordTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const transactions = await this.getTransactions();
    let newId = `tx_${Date.now()}`;

    if (supabase && isUuid(tx.material_id) && isUuid(tx.buyer_id) && isUuid(tx.seller_id)) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            purchase_request_id: isUuid(tx.purchase_request_id) ? tx.purchase_request_id : null,
            material_id: tx.material_id,
            buyer_id: tx.buyer_id,
            seller_id: tx.seller_id,
            quantity: tx.quantity,
            unit_price: tx.unit_price,
            total_price: tx.total_price,
            market_value: tx.market_value,
            money_saved: tx.money_saved,
            waste_diverted_kg: tx.waste_diverted_kg,
            status: tx.status,
            completion_date: tx.completion_date,
          })
          .select('id')
          .single();
        if (!error && data?.id) {
          newId = data.id;
        }
      } catch (err) {
        console.warn('Supabase recordTransaction fallback:', err);
      }
    }

    const newTx: Transaction = {
      ...tx,
      id: newId,
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    setStored('transactions', transactions);
    return newTx;
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const all = getStored<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    if (supabase && userId && isUuid(userId)) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            message: row.message,
            type: row.type,
            link: row.link || undefined,
            is_read: Boolean(row.is_read),
            created_at: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getNotifications fallback:', err);
      }
    }
    if (!userId) return all;
    return all.filter((n) => n.user_id === userId);
  },

  async addNotification(notif: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>): Promise<NotificationItem> {
    const all = getStored<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    let newId = `notif_${Date.now()}`;

    if (supabase && isUuid(notif.user_id)) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: notif.user_id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            link: notif.link || null,
            is_read: false,
          })
          .select('id')
          .single();
        if (!error && data?.id) {
          newId = data.id;
        }
      } catch (err) {
        console.warn('Supabase addNotification fallback:', err);
      }
    }

    const newNotif: NotificationItem = {
      ...notif,
      id: newId,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    setStored('notifications', all);
    return newNotif;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const all = getStored<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    const notif = all.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      setStored('notifications', all);
    }
    if (supabase && isUuid(id)) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (err) {
        console.warn('Supabase markNotificationAsRead fallback:', err);
      }
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const all = getStored<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    all.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    setStored('notifications', all);

    if (supabase && isUuid(userId)) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase markAllNotificationsRead fallback:', err);
      }
    }
  },

  // Aggregated Impact & Platform Metrics (Live from database records)
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const materials = await this.getMaterials();
    const transactions = await this.getTransactions();
    const sites = await this.getConstructionSites();
    const profiles = await this.getProfiles();

    const activeListings = materials.filter((m) => m.status === 'available');
    const totalAvailableMaterialsCount = activeListings.reduce((sum, m) => sum + Number(m.available_quantity), 0);

    const totalMoneySaved = transactions.reduce((sum, t) => sum + Number(t.money_saved || 0), 0);
    const totalWasteKg = transactions.reduce((sum, t) => sum + Number(t.waste_diverted_kg || 0), 0);
    const co2DivertedKg = Math.round(totalWasteKg * 0.82);

    const buyers = profiles.filter((p) => p.user_type === 'buyer' || p.user_type === 'both');
    const sellers = profiles.filter((p) => p.user_type === 'seller' || p.user_type === 'both');

    return {
      totalActiveListings: activeListings.length,
      totalAvailableMaterialsCount: Math.round(totalAvailableMaterialsCount),
      totalBuyers: buyers.length,
      totalSellers: sellers.length,
      totalSuccessfulTransactions: transactions.length,
      totalMoneySaved,
      totalMaterialReusedKg: totalWasteKg,
      estimatedWasteReducedKg: totalWasteKg,
      co2DivertedKg,
      activeConstructionSitesCount: sites.length,
    };
  },
};
