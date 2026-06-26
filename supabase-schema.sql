-- CarbonRush AI — Supabase Database Schema (v2 — 3-Role System)
-- Run this in Supabase SQL Editor

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Profiles table (extends Supabase auth.users)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'grower' CHECK (role IN ('buyer', 'grower', 'ngo_verifier')),
  organization_name TEXT,
  avatar_url TEXT,
  carbon_balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  fiat_balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "NGO verifiers can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Role Requests (for signup role selection tracking)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.role_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role TEXT CHECK (requested_role IN ('buyer', 'grower', 'ngo_verifier')),
  organization_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own role request" ON public.role_requests;
CREATE POLICY "Users can insert own role request"
  ON public.role_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own role requests" ON public.role_requests;
CREATE POLICY "Users can read own role requests"
  ON public.role_requests FOR SELECT
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. Verification Chain Tables
-- ══════════════════════════════════════════════════════════════════════════════

-- ━━━ TABLE: ngo_profiles ━━━
CREATE TABLE public.ngo_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
  org_name TEXT NOT NULL,
  org_type TEXT CHECK (org_type IN ('ngo', 'eco_club', 'trust', 'cooperative')) NOT NULL,
  registration_number TEXT,
  state TEXT NOT NULL,
  district TEXT,
  pin_code TEXT,
  specialization TEXT[],
  -- e.g. ['mangrove','wetland','forest','seagrass']
  verified_projects_count INT DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  avg_turnaround_days INT DEFAULT 14,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  description TEXT,
  profile_photo_url TEXT,
  is_platform_approved BOOLEAN DEFAULT false,
  -- Admin must approve NGO before they appear in directory
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ━━━ TABLE: land_listings ━━━
CREATE TABLE public.land_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grower_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  area_hectares NUMERIC(10,2) NOT NULL,
  ecosystem_type TEXT CHECK (ecosystem_type IN (
    'mangrove','wetland','seagrass','forest','grassland','saltmarsh'
  )) NOT NULL,
  trees_planted INT,
  planting_start_date DATE,
  evidence_photo_urls TEXT[],
  -- GPS-tagged photos uploaded by farmer
  status TEXT CHECK (status IN (
    'listed',        -- farmer posted, available for booking
    'booked',        -- company has booked it
    'ngo_assigned',  -- company picked an NGO
    'under_review',  -- NGO is actively verifying
    'verified',      -- NGO approved, credits issued
    'rejected',      -- NGO rejected
    'more_evidence'  -- NGO asked for more proof
  )) DEFAULT 'listed',
  estimated_carbon_tons NUMERIC(10,2),
  -- Rough estimate shown to buyer before verification
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ━━━ TABLE: verification_assignments ━━━
CREATE TABLE public.verification_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.land_listings(id) NOT NULL,
  company_id UUID REFERENCES public.profiles(id) NOT NULL,
  ngo_id UUID REFERENCES public.ngo_profiles(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  deadline_date DATE,
  -- Company can set a deadline for the NGO
  ngo_accepted BOOLEAN DEFAULT false,
  ngo_accepted_at TIMESTAMPTZ,
  status TEXT CHECK (status IN (
    'pending_ngo_accept',
    'in_progress',
    'report_submitted',
    'company_reviewed',
    'completed',
    'disputed'
  )) DEFAULT 'pending_ngo_accept',
  company_notes TEXT,
  -- Company can leave instructions for the NGO
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ━━━ TABLE: verification_reports ━━━
CREATE TABLE public.verification_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.verification_assignments(id) NOT NULL,
  ngo_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  field_visit_date DATE NOT NULL,
  gps_lat_recorded NUMERIC(10,7),
  gps_lng_recorded NUMERIC(10,7),
  -- Actual GPS where NGO stood during visit
  field_photo_urls TEXT[],
  drone_photo_urls TEXT[],
  survey_document_url TEXT,
  trees_confirmed INT,
  area_confirmed_hectares NUMERIC(10,2),
  ecosystem_condition TEXT CHECK (ecosystem_condition IN (
    'excellent','good','fair','poor'
  )),
  carbon_estimate_tons NUMERIC(10,2),
  -- NGO's own carbon calculation
  ai_fraud_score INT,
  -- Platform AI fills this after report is submitted (0-100, lower = safer)
  ndvi_before NUMERIC(5,4),
  ndvi_after NUMERIC(5,4),
  -- Satellite NDVI values pulled from Google Earth Engine
  authenticity_score INT,
  coordinate_match_score INT,
  ngo_verdict TEXT CHECK (ngo_verdict IN ('approved','rejected','needs_more_evidence')),
  ngo_comments TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- ━━━ TABLE: ngo_reviews ━━━
CREATE TABLE public.ngo_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.verification_assignments(id) NOT NULL,
  company_id UUID REFERENCES public.profiles(id) NOT NULL,
  ngo_profile_id UUID REFERENCES public.ngo_profiles(id) NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  timeliness_score INT CHECK (timeliness_score BETWEEN 1 AND 5),
  accuracy_score INT CHECK (accuracy_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ━━━ RLS POLICIES ━━━

-- Farmers can only see/edit their own listings, but anyone authenticated can view all listings
ALTER TABLE public.land_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grower_own_listings" ON public.land_listings;
DROP POLICY IF EXISTS "buyer_read_listings" ON public.land_listings;
DROP POLICY IF EXISTS "allow_select_all_listings" ON public.land_listings;
CREATE POLICY "allow_select_all_listings" ON public.land_listings
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "grower_insert_listings" ON public.land_listings;
CREATE POLICY "grower_insert_listings" ON public.land_listings
  FOR INSERT WITH CHECK (grower_id = auth.uid());

DROP POLICY IF EXISTS "allow_update_all_listings" ON public.land_listings;
CREATE POLICY "allow_update_all_listings" ON public.land_listings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Verification Assignments policies (Growers, Buyers, and NGOs need access to read and update)
ALTER TABLE public.verification_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ngo_read_assignments" ON public.verification_assignments;
DROP POLICY IF EXISTS "company_own_assignments" ON public.verification_assignments;
DROP POLICY IF EXISTS "allow_select_all_assignments" ON public.verification_assignments;
CREATE POLICY "allow_select_all_assignments" ON public.verification_assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "allow_insert_assignments" ON public.verification_assignments;
CREATE POLICY "allow_insert_assignments" ON public.verification_assignments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "allow_update_assignments" ON public.verification_assignments;
CREATE POLICY "allow_update_assignments" ON public.verification_assignments
  FOR UPDATE USING (auth.uid() IS NOT NULL);


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Carbon Projects
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.carbon_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_district TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  ecosystem_type TEXT CHECK (ecosystem_type IN ('Mangrove', 'Wetland', 'Seagrass', 'Forest', 'Saltmarsh')),
  area_hectares DOUBLE PRECISION,
  trees_count INTEGER DEFAULT 0,
  start_date DATE,
  supporting_ngo TEXT,
  status TEXT NOT NULL DEFAULT 'pending_ai_review'
    CHECK (status IN ('pending_ai_review', 'pending_ngo_review', 'verified', 'rejected')),
  ai_fraud_score DOUBLE PRECISION,
  ai_carbon_estimate_tons DOUBLE PRECISION,
  ngo_adjusted_tons DOUBLE PRECISION,
  ngo_verifier_id UUID REFERENCES public.profiles(id),
  ngo_rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);



ALTER TABLE public.carbon_projects ENABLE ROW LEVEL SECURITY;

-- Growers can read/write only their own projects
DROP POLICY IF EXISTS "Growers can read own projects" ON public.carbon_projects;
CREATE POLICY "Growers can read own projects"
  ON public.carbon_projects FOR SELECT
  USING (auth.uid() = grower_id);

DROP POLICY IF EXISTS "Growers can insert own projects" ON public.carbon_projects;
CREATE POLICY "Growers can insert own projects"
  ON public.carbon_projects FOR INSERT
  WITH CHECK (auth.uid() = grower_id);

DROP POLICY IF EXISTS "Growers can update own projects" ON public.carbon_projects;
CREATE POLICY "Growers can update own projects"
  ON public.carbon_projects FOR UPDATE
  USING (auth.uid() = grower_id);

-- Buyers can read all verified projects
DROP POLICY IF EXISTS "Buyers can read verified projects" ON public.carbon_projects;
CREATE POLICY "Buyers can read verified projects"
  ON public.carbon_projects FOR SELECT
  USING (
    status = 'verified'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'buyer'
    )
  );

-- NGO verifiers can read all projects
DROP POLICY IF EXISTS "NGO verifiers can read all projects" ON public.carbon_projects;
CREATE POLICY "NGO verifiers can read all projects"
  ON public.carbon_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ngo_verifier'
    )
  );

-- NGO verifiers can update verification status
DROP POLICY IF EXISTS "NGO verifiers can update verification" ON public.carbon_projects;
CREATE POLICY "NGO verifiers can update verification"
  ON public.carbon_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ngo_verifier'
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Carbon Passports (NFTs)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.carbon_passports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.land_listings(id) ON DELETE CASCADE,
  passport_number TEXT NOT NULL UNIQUE, -- CR-YEAR-XXX format
  carbon_tons DOUBLE PRECISION NOT NULL,
  blockchain_tx_hash TEXT,
  polygon_token_id TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  issuer_ngo_id UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.carbon_passports ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read passports
DROP POLICY IF EXISTS "Authenticated users can read passports" ON public.carbon_passports;
CREATE POLICY "Authenticated users can read passports"
  ON public.carbon_passports FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- NGO verifiers can insert passports
DROP POLICY IF EXISTS "NGO verifiers can insert passports" ON public.carbon_passports;
CREATE POLICY "NGO verifiers can insert passports"
  ON public.carbon_passports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ngo_verifier'
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. Carbon Purchases (Buyer transactions)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.carbon_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  passport_id UUID REFERENCES public.carbon_passports(id),
  project_name TEXT NOT NULL,
  credits_bought DOUBLE PRECISION NOT NULL,
  price_per_credit DOUBLE PRECISION NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_provider TEXT DEFAULT 'mock',
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.carbon_purchases ENABLE ROW LEVEL SECURITY;

-- Buyers can read/write their own purchases
DROP POLICY IF EXISTS "Buyers can read own purchases" ON public.carbon_purchases;
CREATE POLICY "Buyers can read own purchases"
  ON public.carbon_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers can insert purchases" ON public.carbon_purchases;
CREATE POLICY "Buyers can insert purchases"
  ON public.carbon_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. Evidence Uploads
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.evidence_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.land_listings(id) ON DELETE CASCADE,
  grower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('image/jpeg', 'image/png', 'application/pdf')),
  file_name TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evidence_uploads ENABLE ROW LEVEL SECURITY;

-- Growers can read/write their own uploads
DROP POLICY IF EXISTS "Growers can read own uploads" ON public.evidence_uploads;
CREATE POLICY "Growers can read own uploads"
  ON public.evidence_uploads FOR SELECT
  USING (auth.uid() = grower_id);

DROP POLICY IF EXISTS "Growers can insert uploads" ON public.evidence_uploads;
CREATE POLICY "Growers can insert uploads"
  ON public.evidence_uploads FOR INSERT
  WITH CHECK (auth.uid() = grower_id);

-- NGO verifiers can read all uploads
DROP POLICY IF EXISTS "NGO verifiers can read all uploads" ON public.evidence_uploads;
CREATE POLICY "NGO verifiers can read all uploads"
  ON public.evidence_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ngo_verifier'
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. Payouts (Grower earnings)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.land_listings(id),
  amount DOUBLE PRECISION NOT NULL,
  payout_method TEXT CHECK (payout_method IN ('bank_transfer', 'upi')),
  bank_account_last4 TEXT,
  upi_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Growers can read their own payouts
DROP POLICY IF EXISTS "Growers can read own payouts" ON public.payouts;
CREATE POLICY "Growers can read own payouts"
  ON public.payouts FOR SELECT
  USING (auth.uid() = grower_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. Auto-create profile on signup
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, carbon_balance, fiat_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'grower'),
    0,
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'grower') = 'buyer' THEN 5000000 
      ELSE 0 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. Updated_at auto-update
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- 11. Transactional Green Economy Functions (RPCs)
-- ══════════════════════════════════════════════════════════════════════════════

-- Function to complete verification, pay grower, pay NGO, transfer credits and mint passport
CREATE OR REPLACE FUNCTION public.complete_verification_payout(
  p_assignment_id UUID,
  p_buyer_id UUID,
  p_grower_id UUID,
  p_ngo_id UUID,
  p_credits DOUBLE PRECISION,
  p_price_per_credit DOUBLE PRECISION,
  p_verification_fee DOUBLE PRECISION
) RETURNS BOOLEAN AS $$
DECLARE
  v_buyer_fiat DOUBLE PRECISION;
  v_total_cost DOUBLE PRECISION;
  v_listing_id UUID;
BEGIN
  v_total_cost := (p_credits * p_price_per_credit) + p_verification_fee;
  
  -- Get listing ID
  SELECT listing_id INTO v_listing_id FROM public.verification_assignments WHERE id = p_assignment_id;
  
  -- Check buyer balance
  SELECT fiat_balance INTO v_buyer_fiat FROM public.profiles WHERE id = p_buyer_id;
  IF v_buyer_fiat < v_total_cost THEN
    RAISE EXCEPTION 'Insufficient buyer funds';
  END IF;
  
  -- Update buyer (debit fiat, credit carbon)
  UPDATE public.profiles
  SET fiat_balance = fiat_balance - v_total_cost,
      carbon_balance = carbon_balance + p_credits
  WHERE id = p_buyer_id;
  
  -- Update grower (credit fiat)
  UPDATE public.profiles
  SET fiat_balance = fiat_balance + (p_credits * p_price_per_credit)
  WHERE id = p_grower_id;
  
  -- Update NGO (credit fiat)
  UPDATE public.profiles
  SET fiat_balance = fiat_balance + p_verification_fee
  WHERE id = p_ngo_id;
  
  -- Update assignment status
  UPDATE public.verification_assignments
  SET status = 'completed'
  WHERE id = p_assignment_id;
  
  -- Update listing status
  UPDATE public.land_listings
  SET status = 'verified'
  WHERE id = v_listing_id;
  
  -- Mint carbon passport NFT record
  INSERT INTO public.carbon_passports (project_id, passport_number, carbon_tons, blockchain_tx_hash, polygon_token_id, issued_at, issuer_ngo_id)
  VALUES (
    v_listing_id,
    'CR-' || to_char(NOW(), 'YYYY') || '-' || substring(p_assignment_id::text, 1, 6),
    p_credits,
    '0x' || encode(hmac(p_assignment_id::text, 'blockchain', 'sha256'), 'hex'),
    (100 + floor(random() * 900))::text,
    NOW(),
    p_ngo_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for grower to request withdrawal/payout
CREATE OR REPLACE FUNCTION public.request_grower_payout(
  p_grower_id UUID,
  p_project_id UUID,
  p_amount DOUBLE PRECISION,
  p_method TEXT,
  p_upi_id TEXT DEFAULT NULL,
  p_bank_account_last4 TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_grower_fiat DOUBLE PRECISION;
BEGIN
  -- Check grower balance
  SELECT fiat_balance INTO v_grower_fiat FROM public.profiles WHERE id = p_grower_id;
  IF v_grower_fiat < p_amount THEN
    RAISE EXCEPTION 'Insufficient grower funds';
  END IF;
  
  -- Deduct from grower balance
  UPDATE public.profiles
  SET fiat_balance = fiat_balance - p_amount
  WHERE id = p_grower_id;
  
  -- Insert payout request
  INSERT INTO public.payouts (grower_id, project_id, amount, payout_method, bank_account_last4, upi_id, status)
  VALUES (p_grower_id, p_project_id, p_amount, p_method, p_bank_account_last4, p_upi_id, 'pending');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for buyer to retire carbon passport credits
CREATE OR REPLACE FUNCTION public.retire_carbon_passport(
  p_buyer_id UUID,
  p_passport_id UUID,
  p_burn_tx_hash TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_passport_credits DOUBLE PRECISION;
BEGIN
  -- Get credits from passport
  SELECT carbon_tons INTO v_passport_credits FROM public.carbon_passports WHERE id = p_passport_id;
  
  -- Deduct from buyer carbon balance
  UPDATE public.profiles
  SET carbon_balance = carbon_balance - v_passport_credits
  WHERE id = p_buyer_id;
  
  -- Update passport NFT token ID (simulate burn by updating polygon_token_id/tx_hash)
  UPDATE public.carbon_passports
  SET blockchain_tx_hash = p_burn_tx_hash,
      polygon_token_id = '0x000...Burn'
  WHERE id = p_passport_id;

  -- Create a record in carbon_purchases representing the retirement (or negative entry)
  INSERT INTO public.carbon_purchases (buyer_id, passport_id, project_name, credits_bought, price_per_credit, total_amount, payment_status, payment_provider)
  VALUES (
    p_buyer_id, 
    p_passport_id, 
    'RETIRED: ' || (SELECT title FROM public.land_listings WHERE id = (SELECT project_id FROM public.carbon_passports WHERE id = p_passport_id)), 
    -v_passport_credits, 
    0, 
    0, 
    'completed', 
    'retirement'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
