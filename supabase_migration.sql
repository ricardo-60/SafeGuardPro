-- SafeGuard Pro - Supabase Migration (PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT, -- Note: If using Supabase Auth, this might not be needed
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    nif TEXT,
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vigilantes Table
CREATE TABLE IF NOT EXISTS vigilantes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    bi_number TEXT UNIQUE NOT NULL,
    birth_date DATE,
    address TEXT,
    phone TEXT,
    nif TEXT,
    inss TEXT,
    contract_type TEXT,
    status TEXT DEFAULT 'active',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Weapons Table
CREATE TABLE IF NOT EXISTS weapons (
    id SERIAL PRIMARY KEY,
    serial_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    model TEXT,
    caliber TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    serial_number TEXT UNIQUE,
    type TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    client_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Occurrences Table
CREATE TABLE IF NOT EXISTS occurrences (
    id SERIAL PRIMARY KEY,
    date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    post_id INTEGER REFERENCES posts(id),
    vigilante_id INTEGER REFERENCES vigilantes(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate TEXT UNIQUE NOT NULL,
    model TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scales (Shifts) Table
CREATE TABLE IF NOT EXISTS scales (
    id SERIAL PRIMARY KEY,
    vigilante_id INTEGER REFERENCES vigilantes(id),
    post_id INTEGER REFERENCES posts(id),
    shift_start TIMESTAMP WITH TIME ZONE NOT NULL,
    shift_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    type TEXT NOT NULL, -- 'income' or 'expense'
    category TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (Optional but recommended)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vigilantes ENABLE ROW LEVEL SECURITY;
-- ... add policies as needed
