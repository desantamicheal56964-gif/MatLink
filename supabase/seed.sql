-- ============================================================================
-- SEED DATA: PUNE SUSTAINABLE CONSTRUCTION MATERIAL REUSE NETWORK
-- Realistic Pune construction sites, verified material listings, and historical transactions
-- ============================================================================

-- 1. SEED PROFILES
INSERT INTO public.profiles (id, email, full_name, phone_number, user_type, company_name, is_verified)
VALUES
('a0000001-0000-0000-0000-000000000001', 'rajesh.patil@kumarbuilders.in', 'Rajesh Patil', '+91 98220 11442', 'seller', 'Kumar Properties Pune', true),
('a0000002-0000-0000-0000-000000000002', 'amit.kulkarni@rohaninfra.com', 'Amit Kulkarni', '+91 94223 99881', 'both', 'Rohan Builders & Infra', true),
('a0000003-0000-0000-0000-000000000003', 'sunita.deshmukh@greenbrick.org', 'Sunita Deshmukh', '+91 99234 55667', 'buyer', 'Deshmukh Eco-Contractors', true),
('a0000004-0000-0000-0000-000000000004', 'vikram.shinde@shindeconstructions.in', 'Vikram Shinde', '+91 98901 23456', 'seller', 'Shinde Infrastructure Ltd', true),
('a0000005-0000-0000-0000-000000000005', 'neha.joshi@punesmartinfra.gov.in', 'Neha Joshi (Admin)', '+91 98811 77665', 'admin', 'Pune Municipal Eco-Cell', true),
('a0000006-0000-0000-0000-000000000006', 'prasad.more@moreinteriors.com', 'Prasad More', '+91 97654 32109', 'buyer', 'More Architectural Interiors', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CONSTRUCTION SITES IN PUNE
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

-- 3. SEED MATERIALS (Leftover materials across Pune sites)
INSERT INTO public.materials (id, seller_id, site_id, title, category, description, available_quantity, original_quantity, unit, original_market_price, selling_price, condition, status, location_name, latitude, longitude, ai_inspected, ai_inspection_notes)
VALUES
('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
 'Surplus OPC 53 Grade UltraTech Cement Bags', 'Cement',
 'Factory-sealed surplus cement bags stored indoors on dry wooden pallets. Batch manufactured within the last 4 weeks. Ideal for slab casting, foundation, or masonry work.',
 350, 500, 'Bags', 410.00, 275.00, 'Excellent', 'available', 'Hinjawadi Phase 3, Pune', 18.5913, 73.6983, true, 'AI Visual Inspection: Packaging intact, no moisture lumps or hardening detected. Dry sealed state confirmed.'),

('c0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
 'TMT Steel Rebars (Fe 550D) 12mm & 16mm Offcuts', 'Steel',
 'Primary Tata Tiscon TMT rebars remaining after column work. Straight lengths between 3m to 6m, clean with negligible surface dust. Stored under tarpaulin cover.',
 8.5, 12, 'Tons', 68000.00, 48000.00, 'Good', 'available', 'Hinjawadi Phase 3, Pune', 18.5913, 73.6983, true, 'AI Visual Inspection: No deep pitting or structural deformation. Negligible oxide layer; full structural integrity visually verified.'),

('c0000003-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002',
 'High-Density Red Clay Wire-Cut Bricks', 'Bricks',
 'Surplus chamber-kiln burnt red clay bricks from external facade walling. Excellent edge sharpness and uniform compressive strength.',
 4200, 6000, 'Pieces', 11.50, 7.20, 'Excellent', 'available', 'Kharadi Bypass, Pune', 18.5514, 73.9535, true, 'AI Visual Inspection: Sharp corners, consistent firing color, zero noticeable spalling or fracture lines.'),

('c0000004-0000-0000-0000-000000000004', 'a0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002',
 'Vitrified Double Charge Floor Tiles (600x1200mm)', 'Tiles',
 'Kajaria premium ivory gloss vitrified floor tiles. Unopened original boxes leftover from luxury residential model flats.',
 850, 1000, 'Sq. Ft', 85.00, 48.00, 'Excellent', 'available', 'Kharadi Bypass, Pune', 18.5514, 73.9535, true, 'AI Visual Inspection: Factory boxes sealed; corner protectors intact; zero chipping on sample unpack.'),

('c0000005-0000-0000-0000-000000000005', 'a0000004-0000-0000-0000-000000000004', 'b0000003-0000-0000-0000-000000000003',
 'Washed River Sand for Plastering & Masonry', 'Sand',
 'Triple-washed screened coarse river sand. Silt content below 4%. Perfect for high-grade mortar and ceiling plaster.',
 4, 6, 'Truckloads', 18500.00, 12000.00, 'Good', 'available', 'Wakad Datta Mandir Rd, Pune', 18.5987, 73.7629, false, NULL),

('c0000006-0000-0000-0000-000000000006', 'a0000004-0000-0000-0000-000000000004', 'b0000003-0000-0000-0000-000000000003',
 'CPVC & UPVC Plumbing Pipes & Heavy Fittings', 'Pipes',
 'Astral Pipes Schedule 80 and SDR 11 pipes (1 inch and 1.5 inch diameters). Includes elbows, couplers, and brass tees. Leftover from plumbing installation.',
 120, 150, 'Pieces', 450.00, 260.00, 'Good', 'available', 'Wakad Datta Mandir Rd, Pune', 18.5987, 73.7629, true, 'AI Visual Inspection: No sun embrittlement or wall cracking. Pipe ends clean with intact threading.'),

('c0000007-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000004',
 'Teak Wood Scaffolding Runners & Shuttering Planks', 'Wooden Materials',
 'Heavy-duty marine-grade shuttering plywood sheets (18mm) and treated teakwood batten runners. Used once during slab setting, cleaned and oiled for reuse.',
 95, 120, 'Pieces', 1600.00, 850.00, 'Good', 'available', 'Baner High Street, Pune', 18.5590, 73.7868, true, 'AI Visual Inspection: Minimal surface concrete residue, no delamination in 90% of area; well-suited for multiple cycles.'),

('c0000008-0000-0000-0000-000000000008', 'a0000002-0000-0000-0000-000000000002', 'b0000006-0000-0000-0000-000000000006',
 'Polycab FRLS Copper Armoured Cables (4 sq mm)', 'Electrical Materials',
 'Industrial-grade flexible multi-strand copper wiring drums. High insulation resistance, unopened packaging.',
 600, 800, 'Meters', 92.00, 58.00, 'Excellent', 'available', 'Viman Nagar, Pune', 18.5679, 73.9143, true, 'AI Visual Inspection: Factory seals on drum drum flange intact, PVC sheath pristine.'),

('c0000009-0000-0000-0000-000000000009', 'a0000004-0000-0000-0000-000000000004', 'b0000007-0000-0000-0000-000000000007',
 'Asian Paints Apex Ultima Exterior Emulsion (20L Buckets)', 'Paint',
 'Weather-proof exterior acrylic paint buckets. Color: Classic Beige and Off-White. Sealed manufacturer lids.',
 18, 25, 'Units', 4800.00, 3100.00, 'Excellent', 'available', 'Pimpri Industrial Hub, Pune', 18.6279, 73.8009, true, 'AI Visual Inspection: Metal rim clips unopened, manufactured 3 months ago.'),

('c0000010-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
 'Polished Black Granite Slabs (Counters & Sills)', 'Stone',
 'Telephone black fine-grain granite slabs. Pre-cut to 2.5 ft width. Zero hairline cracks. Great for kitchen counters or staircase treads.',
 320, 450, 'Sq. Ft', 160.00, 95.00, 'Good', 'available', 'Hinjawadi Phase 3, Pune', 18.5913, 73.6983, true, 'AI Visual Inspection: Uniform mirror polish, no veining flaws, edges chamfered.')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED TRANSACTIONS & PROVEN SAVINGS
INSERT INTO public.transactions (id, material_id, buyer_id, seller_id, quantity, unit_price, total_price, market_value, money_saved, waste_diverted_kg, status, completion_date)
VALUES
('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 150, 275.00, 41250.00, 61500.00, 20250.00, 7500.00, 'completed', NOW() - INTERVAL '3 days'),
('d0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 3.5, 48000.00, 168000.00, 238000.00, 70000.00, 3500.00, 'completed', NOW() - INTERVAL '8 days'),
('d0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000006', 'a0000002-0000-0000-0000-000000000002', 1800, 7.20, 12960.00, 20700.00, 7740.00, 5400.00, 'completed', NOW() - INTERVAL '15 days'),
('d0000004-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004', 'a0000006-0000-0000-0000-000000000006', 'a0000002-0000-0000-0000-000000000002', 150, 48.00, 7200.00, 12750.00, 5550.00, 1200.00, 'completed', NOW() - INTERVAL '22 days'),
('d0000005-0000-0000-0000-000000000005', 'c0000007-0000-0000-0000-000000000007', 'a0000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 25, 850.00, 21250.00, 40000.00, 18750.00, 750.00, 'completed', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED NOTIFICATIONS
INSERT INTO public.notifications (id, user_id, title, message, type, link, is_read)
VALUES
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Purchase Request Accepted', 'Deshmukh Eco-Contractors accepted delivery for 150 Bags of UltraTech Cement at Hinjawadi Phase 3 site.', 'request_accepted', '/seller/requests', false),
('e0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'New Inquiry Received', 'A buyer is inquiring about your Tata Tiscon TMT rebars at Hinjawadi Phase 3.', 'request_received', '/seller/requests', false),
('e0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', 'Savings Milestone Reached!', 'You have saved over ₹1,22,290 and diverted 18.3 tons of waste across your completed material reuse orders.', 'system', '/impact', true)
ON CONFLICT (id) DO NOTHING;
