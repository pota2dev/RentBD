-- Enable UUID extension just in case we need to generate them
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUM DEFINITIONS
-- ==========================================

CREATE TYPE user_role AS ENUM ('TENANT', 'LANDLORD', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');
CREATE TYPE auth_type AS ENUM ('PASSWORD', 'TWO_FACTOR', 'PASSKEY', 'GOOGLE', 'GITHUB');
CREATE TYPE property_type AS ENUM ('APARTMENT', 'HOUSE', 'CONDO', 'STUDIO', 'ROOM');
CREATE TYPE property_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_BANKING', 'SSLCOMMERZ');
CREATE TYPE report_type AS ENUM ('PROPERTY', 'USER', 'REVIEW', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');
CREATE TYPE notification_type AS ENUM ('BOOKING_REQUEST', 'BOOKING_ACCEPTED', 'BOOKING_REJECTED', 'MESSAGE_RECEIVED', 'REVIEW_POSTED', 'PAYMENT_RECEIVED');
CREATE TYPE email_type AS ENUM ('VERIFICATION', 'BOOKING_CONFIRMATION', 'PASSWORD_RESET', 'REMINDER', 'NOTIFICATION');
CREATE TYPE rule_type AS ENUM ('NO_SMOKING', 'NO_PETS', 'NO_PARTIES', 'CHECK_IN_TIME', 'CHECK_OUT_TIME', 'OTHER');

-- ==========================================
-- 2. CORE USER TABLES
-- ==========================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    -- This links to Supabase internal auth.users
    supabase_auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Optional if using Supabase Auth exclusively
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    profile_picture TEXT,
    role user_role DEFAULT 'TENANT',
    verification_status verification_status DEFAULT 'UNVERIFIED',
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE auth_methods (
    auth_method_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type auth_type NOT NULL,
    identifier TEXT NOT NULL,
    credential_data TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. ROLE SPECIFIC PROFILES
-- ==========================================

CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    occupation TEXT,
    number_of_previous_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00
);

CREATE TABLE landlords (
    landlord_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    business_name TEXT,
    tax_id TEXT,
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    average_rating DECIMAL(3, 2) DEFAULT 0.00
);

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    permissions TEXT -- Could be a JSONB array for flexibility
);

-- ==========================================
-- 4. PROPERTY MANAGEMENT
-- ==========================================

CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    landlord_id INTEGER REFERENCES landlords(landlord_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type property_type NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    zip_code TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL(10, 2), -- Square feet/meters
    price_per_night DECIMAL(10, 2) NOT NULL,
    max_guests INTEGER,
    status property_status DEFAULT 'DRAFT',
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE property_amenities (
    amenity_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    amenity_name TEXT NOT NULL,
    amenity_type TEXT
);

CREATE TABLE property_images (
    image_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE property_rules (
    rule_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL,
    rule_type rule_type
);

CREATE TABLE availabilities (
    availability_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    price_override DECIMAL(10, 2)
);

-- ==========================================
-- 5. BOOKINGS & TRANSACTIONS
-- ==========================================

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE SET NULL,
    tenant_id INTEGER REFERENCES tenants(tenant_id) ON DELETE SET NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'PENDING',
    special_requests TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'PENDING',
    method payment_method,
    transaction_id TEXT UNIQUE,
    processed_at TIMESTAMP WITH TIME ZONE,
    gateway_response TEXT
);

-- ==========================================
-- 6. INTERACTIONS (Messages, Reviews, Reports)
-- ==========================================

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    receiver_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES tenants(tenant_id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_moderated BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saved_properties (
    saved_property_id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, property_id)
);

CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    type report_type NOT NULL,
    target_id INTEGER NOT NULL, -- ID of the entity being reported (Polymorphic conceptual reference)
    reason TEXT,
    description TEXT,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 7. SYSTEM LOGS
-- ==========================================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_id TEXT, -- e.g., "booking_123"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_logs (
    email_log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    type email_type NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    status TEXT, -- 'SENT', 'FAILED'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. TRIGGERS (Auto-update timestamps)
-- ==========================================

-- Function to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for Properties
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS) - ENABLED
-- ==========================================
-- Standard practice for Supabase is to enable RLS by default
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;