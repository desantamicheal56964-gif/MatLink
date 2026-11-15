-- ============================================================================
-- DIGITAL PLATFORM FOR SUSTAINABLE USE OF CONSTRUCTION MATERIAL (PUNE, INDIA)
-- Supabase PostgreSQL Schema, Auth Triggers & Row Level Security (RLS) Policies
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
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

-- Ensure last_sign_in_at exists if upgrading an existing table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- 1B. SIGN-IN & REGISTRATION LOGS TABLE
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

-- 2. CONSTRUCTION SITES TABLE (Focus on Pune regions)
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

-- INDEXES FOR PERFORMANCE
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

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sign-in Logs
DROP POLICY IF EXISTS "Users can view own sign in logs" ON public.sign_in_logs;
CREATE POLICY "Users can view own sign in logs" ON public.sign_in_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own sign in logs" ON public.sign_in_logs;
CREATE POLICY "Users can insert own sign in logs" ON public.sign_in_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Construction Sites
DROP POLICY IF EXISTS "Sites are viewable by everyone" ON public.construction_sites;
CREATE POLICY "Sites are viewable by everyone" ON public.construction_sites FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create sites" ON public.construction_sites;
CREATE POLICY "Authenticated users can create sites" ON public.construction_sites FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Owners can update sites" ON public.construction_sites;
CREATE POLICY "Owners can update sites" ON public.construction_sites FOR UPDATE USING (auth.uid() = seller_id);

-- Materials
DROP POLICY IF EXISTS "Materials viewable by everyone" ON public.materials;
CREATE POLICY "Materials viewable by everyone" ON public.materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Sellers can insert their materials" ON public.materials;
CREATE POLICY "Sellers can insert their materials" ON public.materials FOR INSERT WITH CHECK (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can update their materials" ON public.materials;
CREATE POLICY "Sellers can update their materials" ON public.materials FOR UPDATE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can delete their materials" ON public.materials;
CREATE POLICY "Sellers can delete their materials" ON public.materials FOR DELETE USING (auth.uid() = seller_id);

-- Images
DROP POLICY IF EXISTS "Material images viewable by everyone" ON public.material_images;
CREATE POLICY "Material images viewable by everyone" ON public.material_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Sellers can add material images" ON public.material_images;
CREATE POLICY "Sellers can add material images" ON public.material_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Purchase requests
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

-- Transactions
DROP POLICY IF EXISTS "Transaction participants can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Transactions are viewable for platform metrics" ON public.transactions;
CREATE POLICY "Transactions are viewable for platform metrics" ON public.transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Participants can insert transactions" ON public.transactions;
CREATE POLICY "Participants can insert transactions" ON public.transactions FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Material Inspections
DROP POLICY IF EXISTS "Inspections viewable by owner" ON public.material_inspections;
CREATE POLICY "Inspections viewable by owner" ON public.material_inspections FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own inspections" ON public.material_inspections;
CREATE POLICY "Users can insert own inspections" ON public.material_inspections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat Sessions
DROP POLICY IF EXISTS "Users manage own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users manage own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
