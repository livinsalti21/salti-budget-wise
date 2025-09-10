-- Fix critical security issues - extensions only since RLS policies already exist

-- Move extensions from public schema to extensions schema
-- Move uuid-ossp extension
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;

-- Move pgcrypto extension 
ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;