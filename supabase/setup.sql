-- ============================================================================
-- MATLINK: COMPLETE SUPABASE SETUP SCRIPT (SCHEMA + AUTH TRIGGER + RLS + SEED)
-- Run this entire script once in your Supabase Dashboard -> SQL Editor
-- Project ID: ltxxdyepdgvvabxvitqt
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Stores registered users and sign-in metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    user_type TEXT NOT NULL DEFAULT 'both' CHECK (user_type IN ('seller', 'buyer', 'both', 'admin')),
    company_name TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- 1B. SIGN-IN & REGISTRATION LOGS TABLE (Tracks every sign-up & sign-in submission)
CREATE TABLE IF NOT EXISTS public.sign_in_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    user_type TEXT,
    company_name TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN ('signup', 'signin', 'profile_update')),
    signed_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONSTRUCTION SITES TABLE (Pune regions)
CREATE TABLE IF NOT EXISTS public.construction_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    developer_name TEXT,
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT DEFAULT 'Pune',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'materials_available', 'reused_completed')),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    contact_person TEXT,
    contact_phone TEXT,
    total_listings_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.construction_sites(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Cement', 'Bricks', 'Sand', 'Steel', 'Tiles', 'Wooden Materials',
        'Pipes', 'Electrical Materials', 'Paint', 'Stone', 'Doors and Windows', 'Other Construction Materials'
    )),
    description TEXT,
    available_quantity NUMERIC(12, 2) NOT NULL CHECK (available_quantity >= 0),
    original_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL CHECK (unit IN ('Bags', 'Pieces', 'Tons', 'Sq. Ft', 'Meters', 'Liters', 'Truckloads', 'Units')),
    original_market_price NUMERIC(12, 2) NOT NULL CHECK (original_market_price > 0),
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    condition TEXT NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Average', 'Poor')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'unlisted')),
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    ai_inspected BOOLEAN DEFAULT FALSE,
    ai_inspection_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATERIAL IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.material_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PURCHASE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_quantity NUMERIC(12, 2) NOT NULL CHECK (requested_quantity > 0),
    offered_price_per_unit NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    delivery_preference TEXT DEFAULT 'Self Pickup from Site' CHECK (delivery_preference IN (
        'Self Pickup from Site', 'Site Delivery Required', 'Third-Party Logistics'
    )),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_request_id UUID REFERENCES public.purchase_requests(id) ON DELETE SET NULL,
    material_id UUID NOT NULL REFERENCES public.materials(id),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    quantity NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    market_value NUMERIC(12, 2) NOT NULL,
    money_saved NUMERIC(12, 2) NOT NULL,
    waste_diverted_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_transit', 'disputed')),
    completion_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('request_received', 'request_accepted', 'request_rejected', 'listing_sold', 'transaction_completed', 'system')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MATERIAL INSPECTIONS TABLE (AI Image Analysis records)
CREATE TABLE IF NOT EXISTS public.material_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    material_type_detected TEXT NOT NULL,
    condition_assessment TEXT NOT NULL CHECK (condition_assessment IN ('Excellent', 'Good', 'Average', 'Poor')),
    confidence_score NUMERIC(5, 2),
    visible_defects TEXT[],
    surface_quality TEXT,
    cracks_breakage TEXT,
    corrosion_rust TEXT,
    recommended_next_steps TEXT,
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUTH TRIGGER: Automatically store user info in public.profiles & sign_in_logs
-- whenever anyone signs up via Supabase Auth (even before email confirmation)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_user_type TEXT;
  v_company TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_phone := NEW.raw_user_meta_data->>'phone_number';
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'both');
  IF v_user_type NOT IN ('seller', 'buyer', 'both', 'admin') THEN
    v_user_type := 'both';
  END IF;
  v_company := NEW.raw_user_meta_data->>'company_name';

  INSERT INTO public.profiles (
    id, email, full_name, phone_number, user_type, company_name, is_verified, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    NEW.id, NEW.email, v_full_name, v_phone, v_user_type, v_company, TRUE, NOW(), NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
    company_name = COALESCE(EXCLUDED.company_name, public.profiles.company_name),
    last_sign_in_at = NOW(),
    updated_at = NOW();

  INSERT INTO public.sign_in_logs (
    user_id, email, full_name, phone_number, user_type, company_name, action_type, signed_in_at
  )
  VALUES (
    NEW.id, NEW.email, v_full_name, v_phone, v_user_type, v_company, 'signup', NOW()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_signin_logs_user ON public.sign_in_logs(user_id, signed_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON public.materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_seller ON public.materials(seller_id);
CREATE INDEX IF NOT EXISTS idx_materials_site ON public.materials(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_coords ON public.construction_sites(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_requests_buyer ON public.purchase_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_requests_seller ON public.purchase_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sign_in_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own sign in logs" ON public.sign_in_logs;
CREATE POLICY "Users can view own sign in logs" ON public.sign_in_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own sign in logs" ON public.sign_in_logs;
CREATE POLICY "Users can insert own sign in logs" ON public.sign_in_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sites are viewable by everyone" ON public.construction_sites;
CREATE POLICY "Sites are viewable by everyone" ON public.construction_sites FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create sites" ON public.construction_sites;
CREATE POLICY "Authenticated users can create sites" ON public.construction_sites FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Owners can update sites" ON public.construction_sites;
CREATE POLICY "Owners can update sites" ON public.construction_sites FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Materials viewable by everyone" ON public.materials;
CREATE POLICY "Materials viewable by everyone" ON public.materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Sellers can insert their materials" ON public.materials;
CREATE POLICY "Sellers can insert their materials" ON public.materials FOR INSERT WITH CHECK (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can update their materials" ON public.materials;
CREATE POLICY "Sellers can update their materials" ON public.materials FOR UPDATE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can delete their materials" ON public.materials;
CREATE POLICY "Sellers can delete their materials" ON public.materials FOR DELETE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Material images viewable by everyone" ON public.material_images;
CREATE POLICY "Material images viewable by everyone" ON public.material_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Sellers can add material images" ON public.material_images;
CREATE POLICY "Sellers can add material images" ON public.material_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Parties can view their purchase requests" ON public.purchase_requests;
CREATE POLICY "Parties can view their purchase requests" ON public.purchase_requests FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);
DROP POLICY IF EXISTS "Buyers can create purchase requests" ON public.purchase_requests;
CREATE POLICY "Buyers can create purchase requests" ON public.purchase_requests FOR INSERT WITH CHECK (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Participants can update purchase requests" ON public.purchase_requests;
CREATE POLICY "Participants can update purchase requests" ON public.purchase_requests FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);

DROP POLICY IF EXISTS "Transaction participants can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Transactions are viewable for platform metrics" ON public.transactions;
CREATE POLICY "Transactions are viewable for platform metrics" ON public.transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Participants can insert transactions" ON public.transactions;
CREATE POLICY "Participants can insert transactions" ON public.transactions FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Inspections viewable by owner" ON public.material_inspections;
CREATE POLICY "Inspections viewable by owner" ON public.material_inspections FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own inspections" ON public.material_inspections;
CREATE POLICY "Users can insert own inspections" ON public.material_inspections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users manage own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INITIAL PUNE SEED DATA (Optional demo profiles, sites, materials, transactions)
-- ============================================================================
INSERT INTO public.profiles (id, email, full_name, phone_number, user_type, company_name, is_verified)
VALUES
('a0000001-0000-0000-0000-000000000001', 'rajesh.patil@kumarbuilders.in', 'Rajesh Patil', '+91 98220 11442', 'seller', 'Kumar Properties Pune', true),
('a0000002-0000-0000-0000-000000000002', 'amit.kulkarni@rohaninfra.com', 'Amit Kulkarni', '+91 94223 99881', 'both', 'Rohan Builders & Infra', true),
('a0000003-0000-0000-0000-000000000003', 'sunita.deshmukh@greenbrick.org', 'Sunita Deshmukh', '+91 99234 55667', 'buyer', 'Deshmukh Eco-Contractors', true),
('a0000004-0000-0000-0000-000000000004', 'vikram.shinde@shindeconstructions.in', 'Vikram Shinde', '+91 98901 23456', 'seller', 'Shinde Infrastructure Ltd', true),
('a0000005-0000-0000-0000-000000000005', 'neha.joshi@punesmartinfra.gov.in', 'Neha Joshi (Admin)', '+91 98811 77665', 'admin', 'Pune Municipal Eco-Cell', true),
('a0000006-0000-0000-0000-000000000006', 'prasad.more@moreinteriors.com', 'Prasad More', '+91 97654 32109', 'buyer', 'More Architectural Interiors', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.construction_sites (id, name, developer_name, address, area, city, latitude, longitude, status, seller_id, contact_person, contact_phone, total_listings_count)
VALUES
('b0000001-0000-0000-0000-000000000001', 'Hinjawadi IT Park Phase 3 Commercial Tower', 'Kumar Properties Pune', 'Plot 42, Rajiv Gandhi Infotech Park, Hinjawadi Phase 3', 'Hinjawadi', 'Pune', 18.5913, 73.6983, 'materials_available', 'a0000001-0000-0000-0000-000000000001', 'Rajesh Patil', '+91 98220 11442', 3),
('b0000002-0000-0000-0000-000000000002', 'Kharadi EON Gateway Towers', 'Rohan Builders & Infra', 'Near World Trade Center, Kharadi Bypass Rd', 'Kharadi', 'Pune', 18.5514, 73.9535, 'materials_available', 'a0000002-0000-0000-0000-000000000002', 'Amit Kulkarni', '+91 94223 99881', 2),
('b0000003-0000-0000-0000-000000000003', 'Wakad Green Valley Heights', 'Shinde Infrastructure Ltd', 'Datta Mandir Rd, Shankar Kalat Nagar, Wakad', 'Wakad', 'Pune', 18.5987, 73.7629, 'materials_available', 'a0000004-0000-0000-0000-000000000004', 'Vikram Shinde', '+91 98901 23456', 3),
('b0000004-0000-0000-0000-000000000004', 'Baner High Street Commercial Hub', 'Kumar Properties Pune', 'Baner - Pashan Link Rd, Baner', 'Baner', 'Pune', 18.5590, 73.7868, 'active', 'a0000001-0000-0000-0000-000000000001', 'Suresh Jagtap', '+91 98220 88771', 1),
('b0000005-0000-0000-0000-000000000005', 'Kothrud Metro Interchange Complex', 'Pune Infra Corp', 'Near Karve Statue, Paud Road, Kothrud', 'Kothrud', 'Pune', 18.5074, 73.8077, 'reused_completed', 'a0000002-0000-0000-0000-000000000002', 'Manoj Gaikwad', '+91 98230 44551', 1),
('b0000006-0000-0000-0000-000000000006', 'Viman Nagar Aeromall Extension', 'Rohan Builders & Infra', 'Symbiosis Road, Viman Nagar', 'Viman Nagar', 'Pune', 18.5679, 73.9143, 'materials_available', 'a0000002-0000-0000-0000-000000000002', 'Amit Kulkarni', '+91 94223 99881', 2),
('b0000007-0000-0000-0000-000000000007', 'Pimpri Auto Cluster Mega Logistics Shed', 'Shinde Infrastructure Ltd', 'Old Mumbai-Pune Highway, Pimpri Colony', 'Pimpri', 'Pune', 18.6279, 73.8009, 'materials_available', 'a0000004-0000-0000-0000-000000000004', 'Vikram Shinde', '+91 98901 23456', 2),
('b0000008-0000-0000-0000-000000000008', 'Hadapsar Eco-City Township Phase 2', 'Green Earth Builders', 'Magarpatta City Perimeter, Hadapsar', 'Hadapsar', 'Pune', 18.5089, 73.9260, 'reused_completed', 'a0000001-0000-0000-0000-000000000001', 'Vinayak Pawar', '+91 98221 66554', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.materials (id, seller_id, site_id, title, category, description, available_quantity, original_quantity, unit, original_market_price, selling_price, condition, status, location_name, latitude, longitude, ai_inspected, ai_inspection_notes)
VALUES
('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
 'Surplus OPC 53 Grade UltraTech Cement Bags', 'Cement',
 'Factory-sealed surplus cement bags stored indoors on dry wooden pallets. Batch manufactured within the last 4 weeks.',
 350, 500, 'Bags', 410.00, 275.00, 'Excellent', 'available', 'Hinjawadi Phase 3, Pune', 18.5913, 73.6983, true, 'AI Visual Inspection: Packaging intact, no moisture lumps or hardening detected.'),
('c0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
 'TMT Steel Rebars (Fe 550D) 12mm & 16mm Offcuts', 'Steel',
 'Primary Tata Tiscon TMT rebars remaining after column work. Straight lengths between 3m to 6m.',
 8.5, 12, 'Tons', 68000.00, 48000.00, 'Good', 'available', 'Hinjawadi Phase 3, Pune', 18.5913, 73.6983, true, 'AI Visual Inspection: No deep pitting or structural deformation.'),
('c0000003-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002',
 'High-Density Red Clay Wire-Cut Bricks', 'Bricks',
 'Surplus chamber-kiln burnt red clay bricks from external facade walling.',
 4200, 6000, 'Pieces', 11.50, 7.20, 'Excellent', 'available', 'Kharadi Bypass, Pune', 18.5514, 73.9535, true, 'AI Visual Inspection: Sharp corners, consistent firing color.'),
('c0000004-0000-0000-0000-000000000004', 'a0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002',
 'Vitrified Double Charge Floor Tiles (600x1200mm)', 'Tiles',
 'Kajaria premium ivory gloss vitrified floor tiles. Unopened original boxes.',
 850, 1000, 'Sq. Ft', 85.00, 48.00, 'Excellent', 'available', 'Kharadi Bypass, Pune', 18.5514, 73.9535, true, 'AI Visual Inspection: Factory boxes sealed; corner protectors intact.'),
('c0000005-0000-0000-0000-000000000005', 'a0000004-0000-0000-0000-000000000004', 'b0000003-0000-0000-0000-000000000003',
 'Washed River Sand for Plastering & Masonry', 'Sand',
 'Triple-washed screened coarse river sand. Silt content below 4%.',
 4, 6, 'Truckloads', 18500.00, 12000.00, 'Good', 'available', 'Wakad Datta Mandir Rd, Pune', 18.5987, 73.7629, false, NULL),
('c0000006-0000-0000-0000-000000000006', 'a0000004-0000-0000-0000-000000000004', 'b0000003-0000-0000-0000-000000000003',
 'CPVC & UPVC Plumbing Pipes & Heavy Fittings', 'Pipes',
 'Astral Pipes Schedule 80 and SDR 11 pipes.',
 120, 150, 'Pieces', 450.00, 260.00, 'Good', 'available', 'Wakad Datta Mandir Rd, Pune', 18.5987, 73.7629, true, 'AI Visual Inspection: No sun embrittlement or wall cracking.'),
('c0000007-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000004',
 'Teak Wood Scaffolding Runners & Shuttering Planks', 'Wooden Materials',
 'Heavy-duty marine-grade shuttering plywood sheets (18mm) and treated teakwood batten runners.',
 95, 120, 'Pieces', 1600.00, 850.00, 'Good', 'available', 'Baner High Street, Pune', 18.5590, 73.7868, true, 'AI Visual Inspection: Minimal surface concrete residue, no delamination.'),
('c0000008-0000-0000-0000-000000000008', 'a0000002-0000-0000-0000-000000000002', 'b0000006-0000-0000-0000-000000000006',
 'Polycab FRLS Copper Armoured Cables (4 sq mm)', 'Electrical Materials',
 'Industrial-grade flexible multi-strand copper wiring drums.',
 600, 800, 'Meters', 92.00, 58.00, 'Excellent', 'available', 'Viman Nagar, Pune', 18.5679, 73.9143, true, 'AI Visual Inspection: Factory seals intact, PVC sheath pristine.'),
('c0000009-0000-0000-0000-000000000009', 'a0000004-0000-0000-0000-000000000004', 'b0000007-0000-0000-0000-000000000007',
 'Asian Paints Apex Ultima Exterior Emulsion (20L Buckets)', 'Paint',
 'Weather-proof exterior acrylic paint buckets. Sealed manufacturer lids.',
 18, 25, 'Units', 4800.00, 3100.00, 'Excellent', 'available', 'Pimpri Industrial Hub, Pune', 18.6279, 73.8009, true, 'AI Visual Inspection: Metal rim clips unopened.'),
('c0000010-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
 'Polished Black Granite Slabs (Counters & Sills)', 'Stone',
 'Telephone black fine-grain granite slabs. Pre-cut to 2.5 ft width.',
 320, 450, 'Sq. Ft', 160.00, 95.00, 'Good', 'available', 'Hinjawadi Phase 3, Pune', 18.5913, 73.6983, true, 'AI Visual Inspection: Uniform mirror polish, zero hairline cracks.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transactions (id, material_id, buyer_id, seller_id, quantity, unit_price, total_price, market_value, money_saved, waste_diverted_kg, status, completion_date)
VALUES
('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 150, 275.00, 41250.00, 61500.00, 20250.00, 7500.00, 'completed', NOW() - INTERVAL '3 days'),
('d0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 3.5, 48000.00, 168000.00, 238000.00, 70000.00, 3500.00, 'completed', NOW() - INTERVAL '8 days'),
('d0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000006', 'a0000002-0000-0000-0000-000000000002', 1800, 7.20, 12960.00, 20700.00, 7740.00, 5400.00, 'completed', NOW() - INTERVAL '15 days'),
('d0000004-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004', 'a0000006-0000-0000-0000-000000000006', 'a0000002-0000-0000-0000-000000000002', 150, 48.00, 7200.00, 12750.00, 5550.00, 1200.00, 'completed', NOW() - INTERVAL '22 days'),
('d0000005-0000-0000-0000-000000000005', 'c0000007-0000-0000-0000-000000000007', 'a0000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 25, 850.00, 21250.00, 40000.00, 18750.00, 750.00, 'completed', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, user_id, title, message, type, link, is_read)
VALUES
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Purchase Request Accepted', 'Deshmukh Eco-Contractors accepted delivery for 150 Bags of UltraTech Cement at Hinjawadi Phase 3 site.', 'request_accepted', '/seller/requests', false),
('e0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'New Inquiry Received', 'A buyer is inquiring about your Tata Tiscon TMT rebars at Hinjawadi Phase 3.', 'request_received', '/seller/requests', false),
('e0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', 'Savings Milestone Reached!', 'You have saved over ₹1,22,290 and diverted 18.3 tons of waste across your completed material reuse orders.', 'system', '/impact', true)
ON CONFLICT (id) DO NOTHING;
