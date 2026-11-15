export type UserRole = 'seller' | 'buyer' | 'both' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  user_type: UserRole;
  company_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  created_at?: string;
}

export type MaterialCategory =
  | 'Cement'
  | 'Bricks'
  | 'Sand'
  | 'Steel'
  | 'Tiles'
  | 'Wooden Materials'
  | 'Pipes'
  | 'Electrical Materials'
  | 'Paint'
  | 'Stone'
  | 'Doors and Windows'
  | 'Other Construction Materials';

export type MaterialUnit =
  | 'Bags'
  | 'Pieces'
  | 'Tons'
  | 'Sq. Ft'
  | 'Meters'
  | 'Liters'
  | 'Truckloads'
  | 'Units';

export type MaterialCondition = 'Excellent' | 'Good' | 'Average' | 'Poor';

export type MaterialStatus = 'available' | 'reserved' | 'sold' | 'unlisted';

export interface ConstructionSite {
  id: string;
  name: string;
  developer_name?: string;
  address: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'materials_available' | 'reused_completed';
  seller_id?: string;
  contact_person?: string;
  contact_phone?: string;
  total_listings_count: number;
  created_at?: string;
}

export interface MaterialListing {
  id: string;
  seller_id: string;
  seller_name?: string;
  seller_phone?: string;
  seller_company?: string;
  site_id?: string;
  site_name?: string;
  title: string;
  category: MaterialCategory;
  description: string;
  available_quantity: number;
  original_quantity: number;
  unit: MaterialUnit;
  original_market_price: number;
  selling_price: number;
  condition: MaterialCondition;
  status: MaterialStatus;
  location_name: string;
  latitude: number;
  longitude: number;
  ai_inspected: boolean;
  ai_inspection_notes?: string;
  images: string[];
  created_at: string;
  updated_at?: string;
}

export interface PurchaseRequest {
  id: string;
  material_id: string;
  material_title?: string;
  material_category?: MaterialCategory;
  material_image?: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  seller_id: string;
  seller_name?: string;
  seller_phone?: string;
  requested_quantity: number;
  unit: MaterialUnit;
  offered_price_per_unit: number;
  total_amount: number;
  delivery_preference: 'Self Pickup from Site' | 'Site Delivery Required' | 'Third-Party Logistics';
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  rejection_reason?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  purchase_request_id?: string;
  material_id: string;
  material_title: string;
  material_category: MaterialCategory;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  quantity: number;
  unit: MaterialUnit;
  unit_price: number;
  total_price: number;
  market_value: number;
  money_saved: number;
  waste_diverted_kg: number;
  status: 'completed' | 'in_transit' | 'disputed';
  completion_date: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'request_received' | 'request_accepted' | 'request_rejected' | 'listing_sold' | 'transaction_completed' | 'system';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface MaterialInspectionResult {
  is_construction_material: boolean;
  material_type: string;
  category: MaterialCategory;
  condition: MaterialCondition;
  quality_grade?: 'Excellent' | 'Good' | 'Average' | 'Worst' | 'Not Construction Material';
  is_usable_for_construction?: boolean;
  simple_verdict?: string;
  detected_object_name?: string;
  simple_advice?: string;
  confidence_score: number;
  visible_damage: string[];
  cracks_or_breakage: string;
  rust_or_corrosion: string;
  surface_quality: string;
  visible_contamination: string;
  suitability_for_reuse: string;
  ai_generated_description: string;
  recommended_next_steps: string[];
  disclaimer: string;
}

export interface PlatformMetrics {
  totalActiveListings: number;
  totalAvailableMaterialsCount: number;
  totalBuyers: number;
  totalSellers: number;
  totalSuccessfulTransactions: number;
  totalMoneySaved: number;
  totalMaterialReusedKg: number;
  estimatedWasteReducedKg: number;
  co2DivertedKg: number;
  activeConstructionSitesCount: number;
}
