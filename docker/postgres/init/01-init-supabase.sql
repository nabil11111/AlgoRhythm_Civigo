-- Initialize Supabase database with all migrations and demo data
-- This script consolidates all migrations from supabase/supabase/migrations/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema if not exists (usually handled by Supabase, but ensuring it exists)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS graphql_public;
CREATE SCHEMA IF NOT EXISTS extensions;

-- Basic roles that may be needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres SUPERUSER;
    END IF;
END
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Create public schema tables based on your migrations
-- Note: This is a simplified version - you should copy your actual migration content here

-- Core tables from your migrations
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'admin')),
    full_name TEXT,
    email TEXT,
    nic TEXT,
    gov_id TEXT UNIQUE,
    verified_status TEXT DEFAULT 'pending',
    phone TEXT,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    department_id UUID REFERENCES public.departments(id),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.service_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    service_id UUID REFERENCES public.services(id),
    slot_at TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER DEFAULT 1,
    booked_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    citizen_gov_id TEXT NOT NULL,
    service_id UUID REFERENCES public.services(id),
    slot_id UUID REFERENCES public.service_slots(id),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    reference_code TEXT UNIQUE,
    notes TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo data for judges
INSERT INTO public.departments (id, name, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Department of Motor Traffic', 'Vehicle registration and licensing services'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Immigration Department', 'Passport and visa services'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Department of Registration', 'Birth, death, and marriage certificates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, department_id, name, description, duration_minutes) VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Driving License Application', 'Apply for new driving license', 45),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Vehicle Registration', 'Register a new vehicle', 30),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Passport Application', 'Apply for new passport', 60),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Birth Certificate', 'Obtain birth certificate', 20)
ON CONFLICT (id) DO NOTHING;

-- Create some demo slots for the next 7 days
INSERT INTO public.service_slots (service_id, slot_at, capacity) 
SELECT 
    s.id,
    generate_series(
        DATE_TRUNC('hour', NOW() + INTERVAL '1 day'),
        DATE_TRUNC('hour', NOW() + INTERVAL '7 days'),
        INTERVAL '1 hour'
    ) as slot_time,
    CASE 
        WHEN EXTRACT(hour FROM generate_series(
            DATE_TRUNC('hour', NOW() + INTERVAL '1 day'),
            DATE_TRUNC('hour', NOW() + INTERVAL '7 days'),
            INTERVAL '1 hour'
        )) BETWEEN 9 AND 17 THEN 5
        ELSE 0
    END as capacity
FROM public.services s
WHERE EXTRACT(hour FROM generate_series(
    DATE_TRUNC('hour', NOW() + INTERVAL '1 day'),
    DATE_TRUNC('hour', NOW() + INTERVAL '7 days'),
    INTERVAL '1 hour'
)) BETWEEN 9 AND 17
ON CONFLICT DO NOTHING;

-- Insert demo profiles (these will be linked to auth users created by the app)
INSERT INTO public.profiles (id, role, full_name, email, gov_id) VALUES 
    ('770e8400-e29b-41d4-a716-446655440001', 'admin', 'Demo Admin', 'admin@demo.com', 'ADMIN001'),
    ('770e8400-e29b-41d4-a716-446655440002', 'officer', 'Demo Officer', 'officer@demo.com', 'OFFICER001'),
    ('770e8400-e29b-41d4-a716-446655440003', 'citizen', 'Demo Citizen', 'citizen@demo.com', 'CITIZEN001')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (simplified for demo)
-- Citizens can read their own profiles
CREATE POLICY "Citizens can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Everyone can read departments and services
CREATE POLICY "Public read departments" ON public.departments
    FOR SELECT TO public USING (true);

CREATE POLICY "Public read services" ON public.services
    FOR SELECT TO public USING (true);

-- Citizens can read active slots
CREATE POLICY "Citizens can read active slots" ON public.service_slots
    FOR SELECT TO public USING (active = true AND slot_at >= NOW());

-- Citizens can read their own appointments
CREATE POLICY "Citizens can read own appointments" ON public.appointments
    FOR SELECT USING (citizen_gov_id IN (
        SELECT gov_id FROM public.profiles WHERE id = auth.uid()
    ));

-- Create basic functions
CREATE OR REPLACE FUNCTION public.book_appointment_slot(
    p_slot_id UUID,
    p_citizen_gov_id TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appointment_id UUID;
    v_reference_code TEXT;
    v_service_id UUID;
BEGIN
    -- Generate reference code
    v_reference_code := 'CIV' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    
    -- Get service_id from slot
    SELECT service_id INTO v_service_id
    FROM public.service_slots
    WHERE id = p_slot_id;
    
    -- Create appointment
    INSERT INTO public.appointments (
        citizen_gov_id,
        service_id,
        slot_id,
        reference_code,
        notes
    ) VALUES (
        p_citizen_gov_id,
        v_service_id,
        p_slot_id,
        v_reference_code,
        p_notes
    ) RETURNING id INTO v_appointment_id;
    
    -- Update slot booked count
    UPDATE public.service_slots
    SET booked_count = booked_count + 1
    WHERE id = p_slot_id;
    
    RETURN v_appointment_id;
END;
$$;
