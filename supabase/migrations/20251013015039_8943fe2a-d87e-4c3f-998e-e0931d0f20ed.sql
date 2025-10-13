-- ============================================
-- PHASE 4: Fix Function Search Path Issues
-- ============================================
-- Adds SET search_path = public to security-critical functions
-- Prevents potential privilege escalation attacks

-- ============================================
-- 1. Update has_role function
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- ============================================
-- 2. Update verify_deep_link_signature function
-- ============================================

CREATE OR REPLACE FUNCTION public.verify_deep_link_signature(
  amount_cents integer,
  source text,
  push_id uuid,
  expires_at timestamp with time zone,
  provided_sig text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_key TEXT;
  calculated_sig TEXT;
  payload TEXT;
BEGIN
  -- Get secret from vault (in production this would use proper key management)
  SELECT COALESCE(current_setting('app.hmac_secret', true), 'secure_default_hmac_key_2025') INTO secret_key;
  
  -- Create payload for signature verification
  payload := amount_cents::TEXT || '|' || 
             COALESCE(source, '') || '|' || 
             COALESCE(push_id::TEXT, '') || '|' || 
             COALESCE(expires_at::TEXT, '');
  
  -- Calculate HMAC-SHA256 signature
  calculated_sig := encode(
    hmac(payload::bytea, secret_key::bytea, 'sha256'),
    'hex'
  );
  
  -- Return true if signatures match
  RETURN calculated_sig = provided_sig;
END;
$$;

-- ============================================
-- 3. Update encrypt_sensitive_data function
-- ============================================

CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(plain_text text, key_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
  iv TEXT;
  encrypted_data TEXT;
BEGIN
  -- Generate random IV
  iv := encode(gen_random_bytes(16), 'hex');
  
  -- Get encryption key (in production, retrieve from secure vault)
  SELECT COALESCE(current_setting('app.encryption_key', true), 'secure_encryption_key_32_chars_123') INTO encryption_key;
  
  -- Use pgcrypto for encryption
  encrypted_data := encode(
    encrypt_iv(plain_text::bytea, encryption_key::bytea, decode(iv, 'hex'), 'aes'),
    'base64'
  );
  
  RETURN jsonb_build_object(
    'encrypted', encrypted_data,
    'iv', iv,
    'algorithm', 'AES-256-CBC'
  );
END;
$$;

-- ============================================
-- 4. Update decrypt_sensitive_data function
-- ============================================

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_obj jsonb, key_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_data TEXT;
BEGIN
  -- Get encryption key (in production, retrieve from secure vault)
  SELECT COALESCE(current_setting('app.encryption_key', true), 'secure_encryption_key_32_chars_123') INTO encryption_key;
  
  -- Use pgcrypto for decryption
  decrypted_data := convert_from(
    decrypt_iv(
      decode(encrypted_obj->>'encrypted', 'base64'),
      encryption_key::bytea,
      decode(encrypted_obj->>'iv', 'hex'),
      'aes'
    ),
    'UTF8'
  );
  
  RETURN decrypted_data;
END;
$$;

-- ============================================
-- 5. Update check_rate_limit function
-- ============================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_id_param uuid,
  action_type text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.security_audit_log
  WHERE user_id = user_id_param
    AND event_type = action_type
    AND created_at > (now() - (window_minutes || ' minutes')::interval);
  
  -- Return false if limit exceeded
  RETURN attempt_count < max_attempts;
END;
$$;

-- ============================================
-- 6. Update is_parent_of function
-- ============================================

CREATE OR REPLACE FUNCTION public.is_parent_of(child uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM family_group_members m_parent
    JOIN family_group_members m_child
      ON m_parent.group_id = m_child.group_id
    WHERE m_parent.user_id = auth.uid()
      AND m_parent.role = 'parent'
      AND m_child.user_id = child
      AND m_child.role = 'child'
  );
$$;

-- ============================================
-- 7. Update log_security_event function
-- ============================================

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text DEFAULT 'info'::text,
  p_event_details jsonb DEFAULT '{}'::jsonb,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    severity,
    event_details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_severity,
    p_event_details,
    NULL, -- Will be filled by application layer
    NULL  -- Will be filled by application layer
  );
  
  -- Create alert for high severity events
  IF p_severity IN ('high', 'critical') THEN
    INSERT INTO public.security_alerts (
      alert_type,
      severity,
      user_id,
      event_details
    ) VALUES (
      p_event_type,
      p_severity,
      p_user_id,
      p_event_details
    );
  END IF;
END;
$$;

-- ============================================
-- Summary of Phase 4:
-- ============================================
-- ✅ has_role() secured with search_path
-- ✅ verify_deep_link_signature() secured
-- ✅ encrypt_sensitive_data() secured
-- ✅ decrypt_sensitive_data() secured
-- ✅ check_rate_limit() secured
-- ✅ is_parent_of() secured
-- ✅ log_security_event() secured
-- ✅ Prevents privilege escalation attacks