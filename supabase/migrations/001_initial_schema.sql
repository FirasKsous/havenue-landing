-- =============================================================================
-- CateringOS Landing Page — Initial Database Schema
-- Migration 001: Core tables, ENUMs, functions, triggers, RLS, indexes
-- PRD Reference: CateringOS_Backend_Infrastructure_PRD.md v1.1
-- =============================================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE lead_stage AS ENUM (
  'anonymous',
  'lead',
  'mql',
  'sql',
  'trial',
  'customer',
  'churned'
);

CREATE TYPE subscription_status AS ENUM (
  'none',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'paused'
);

CREATE TYPE plan_tier AS ENUM (
  'starter',
  'pro',
  'enterprise'
);

CREATE TYPE billing_interval AS ENUM (
  'monthly',
  'annual'
);

-- ============================================================
-- CONTACTS TABLE (CRM-Grade Lead/Customer Record)
-- ============================================================

CREATE TABLE contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identity
  anonymous_id text,
  email text UNIQUE,
  full_name text,
  company_name text,
  job_title text,
  phone text,

  -- Pipeline
  stage lead_stage NOT NULL DEFAULT 'anonymous',

  -- Lead Intelligence
  lead_score int NOT NULL DEFAULT 0,
  lead_tier text NOT NULL DEFAULT 'cold'
    CHECK (lead_tier IN ('cold', 'warm', 'hot', 'sales_qualified')),
  capture_source text,

  -- Source Attribution (write-once for first-touch preservation)
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_page text,

  -- Stripe Integration
  stripe_customer_id text UNIQUE,
  subscription_id text,
  subscription_status subscription_status NOT NULL DEFAULT 'none',
  plan_tier plan_tier,
  billing_interval billing_interval,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  mrr_cents int DEFAULT 0,

  -- Email
  is_subscribed boolean NOT NULL DEFAULT true,
  email_verified boolean NOT NULL DEFAULT false,
  loops_contact_id text,

  -- Extensibility
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',

  -- Timestamps
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  converted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- LEAD EVENTS TABLE (Behavioral Tracking — Append-Only)
-- ============================================================

CREATE TABLE lead_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  score_delta int NOT NULL DEFAULT 0,
  page_url text,
  referrer text,
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- CONTACT ACTIVITIES TABLE (CRM Activity Log — Append-Only)
-- ============================================================

CREATE TABLE contact_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  title text NOT NULL,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- CONSENTS TABLE (GDPR Audit Trail)
-- ============================================================

CREATE TABLE consents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  anonymous_id text,
  consent_type text NOT NULL
    CHECK (consent_type IN (
      'analytics_cookies',
      'marketing_cookies',
      'marketing_email',
      'terms_of_service',
      'data_processing'
    )),
  granted boolean NOT NULL,
  consent_text text NOT NULL,
  consent_version text NOT NULL DEFAULT '1.0',
  ip_address inet,
  user_agent text,
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- ============================================================
-- CHECKOUT SESSIONS TABLE (Stripe Reconciliation)
-- ============================================================

CREATE TABLE checkout_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id text UNIQUE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  contact_id uuid REFERENCES contacts(id),
  email text NOT NULL,
  plan_tier plan_tier NOT NULL,
  billing_interval billing_interval NOT NULL,
  amount_total int,
  currency text NOT NULL DEFAULT 'gbp',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'complete', 'expired')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_anonymous_id ON contacts(anonymous_id);
CREATE INDEX idx_contacts_stage ON contacts(stage);
CREATE INDEX idx_contacts_lead_tier ON contacts(lead_tier);
CREATE INDEX idx_contacts_stripe_customer ON contacts(stripe_customer_id);
CREATE INDEX idx_contacts_subscription_status ON contacts(subscription_status);
CREATE INDEX idx_contacts_last_seen ON contacts(last_seen_at);

CREATE INDEX idx_lead_events_anonymous_id ON lead_events(anonymous_id);
CREATE INDEX idx_lead_events_contact_id ON lead_events(contact_id);
CREATE INDEX idx_lead_events_type ON lead_events(event_type);
CREATE INDEX idx_lead_events_created ON lead_events(created_at DESC);

CREATE INDEX idx_activities_contact ON contact_activities(contact_id, created_at DESC);
CREATE INDEX idx_activities_type ON contact_activities(activity_type);

CREATE INDEX idx_consents_contact ON consents(contact_id);
CREATE INDEX idx_consents_anonymous ON consents(anonymous_id);

CREATE INDEX idx_checkout_stripe_session ON checkout_sessions(stripe_session_id);
CREATE INDEX idx_checkout_contact ON checkout_sessions(contact_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Lead events: anon can INSERT (behavioral tracking), cannot read
CREATE POLICY "anon_insert_lead_events"
  ON lead_events FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_no_read_lead_events"
  ON lead_events FOR SELECT TO anon USING (false);

-- Consents: anon can INSERT (cookie/email consent), cannot read
CREATE POLICY "anon_insert_consents"
  ON consents FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_no_read_consents"
  ON consents FOR SELECT TO anon USING (false);

-- Contacts: no anonymous access
CREATE POLICY "no_anon_contacts"
  ON contacts FOR ALL TO anon USING (false);

-- Activities: no anonymous access
CREATE POLICY "no_anon_activities"
  ON contact_activities FOR ALL TO anon USING (false);

-- Checkout sessions: no anonymous access
CREATE POLICY "no_anon_checkout"
  ON checkout_sessions FOR ALL TO anon USING (false);

-- ============================================================
-- FUNCTION: Calculate lead score from events
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_lead_score(p_anonymous_id text)
RETURNS int AS $$
DECLARE
  v_score int;
BEGIN
  SELECT COALESCE(SUM(score_delta), 0) INTO v_score
  FROM lead_events
  WHERE anonymous_id = p_anonymous_id;
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Get lead tier from score
-- ============================================================

CREATE OR REPLACE FUNCTION get_lead_tier(p_score int)
RETURNS text AS $$
BEGIN
  RETURN CASE
    WHEN p_score >= 71 THEN 'sales_qualified'
    WHEN p_score >= 46 THEN 'hot'
    WHEN p_score >= 21 THEN 'warm'
    ELSE 'cold'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- FUNCTION: Stage promotion (handles churned→customer cycle)
-- ============================================================

CREATE OR REPLACE FUNCTION promote_stage(
  p_current lead_stage,
  p_new lead_stage
) RETURNS lead_stage AS $$
DECLARE
  stage_rank jsonb := '{
    "anonymous": 0,
    "lead": 1,
    "mql": 2,
    "sql": 3,
    "trial": 4,
    "customer": 5,
    "churned": 6
  }';
BEGIN
  -- Churned users can reactivate to customer or trial
  IF p_current = 'churned' AND p_new IN ('customer', 'trial') THEN
    RETURN p_new;
  END IF;

  -- Normal: only promote to higher rank
  IF (stage_rank->>p_new::text)::int > (stage_rank->>p_current::text)::int THEN
    RETURN p_new;
  END IF;
  RETURN p_current;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- FUNCTION: Upsert contact with first-touch UTM preservation
-- ============================================================

CREATE OR REPLACE FUNCTION upsert_contact_preserve_utm(
  p_email text,
  p_anonymous_id text DEFAULT NULL,
  p_stage lead_stage DEFAULT 'lead',
  p_lead_score int DEFAULT 0,
  p_lead_tier text DEFAULT 'cold',
  p_capture_source text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_utm_term text DEFAULT NULL,
  p_utm_content text DEFAULT NULL,
  p_is_subscribed boolean DEFAULT false
) RETURNS uuid AS $$
DECLARE
  v_contact_id uuid;
BEGIN
  INSERT INTO contacts (
    email, anonymous_id, stage, lead_score, lead_tier, capture_source,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, is_subscribed
  ) VALUES (
    p_email, p_anonymous_id, p_stage, p_lead_score, p_lead_tier, p_capture_source,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content, p_is_subscribed
  )
  ON CONFLICT (email) DO UPDATE SET
    anonymous_id = COALESCE(contacts.anonymous_id, EXCLUDED.anonymous_id),
    stage = promote_stage(contacts.stage, EXCLUDED.stage),
    lead_score = GREATEST(contacts.lead_score, EXCLUDED.lead_score),
    lead_tier = CASE
      WHEN EXCLUDED.lead_score > contacts.lead_score THEN EXCLUDED.lead_tier
      ELSE contacts.lead_tier
    END,
    capture_source = COALESCE(contacts.capture_source, EXCLUDED.capture_source),
    -- UTM: Write-once (first-touch attribution preserved)
    utm_source = COALESCE(contacts.utm_source, EXCLUDED.utm_source),
    utm_medium = COALESCE(contacts.utm_medium, EXCLUDED.utm_medium),
    utm_campaign = COALESCE(contacts.utm_campaign, EXCLUDED.utm_campaign),
    utm_term = COALESCE(contacts.utm_term, EXCLUDED.utm_term),
    utm_content = COALESCE(contacts.utm_content, EXCLUDED.utm_content),
    is_subscribed = EXCLUDED.is_subscribed OR contacts.is_subscribed,
    last_seen_at = now(),
    updated_at = now()
  RETURNING id INTO v_contact_id;

  RETURN v_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Update contact score on lead_event INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION on_lead_event_insert()
RETURNS trigger AS $$
DECLARE
  v_contact_id uuid;
  v_new_score int;
  v_new_tier text;
  v_old_tier text;
BEGIN
  SELECT id, lead_tier INTO v_contact_id, v_old_tier
  FROM contacts
  WHERE anonymous_id = NEW.anonymous_id
  LIMIT 1;

  IF v_contact_id IS NOT NULL THEN
    v_new_score := calculate_lead_score(NEW.anonymous_id);
    v_new_tier := get_lead_tier(v_new_score);

    UPDATE contacts
    SET lead_score = v_new_score,
        lead_tier = v_new_tier,
        last_seen_at = now(),
        updated_at = now()
    WHERE id = v_contact_id;

    -- Link this event to the contact
    UPDATE lead_events SET contact_id = v_contact_id WHERE id = NEW.id;

    -- Log tier change
    IF v_new_tier != v_old_tier THEN
      INSERT INTO contact_activities (contact_id, activity_type, title, data)
      VALUES (
        v_contact_id,
        'score_changed',
        format('Lead tier changed: %s → %s (score: %s)', v_old_tier, v_new_tier, v_new_score),
        jsonb_build_object('old_tier', v_old_tier, 'new_tier', v_new_tier, 'score', v_new_score)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_lead_event_score
  AFTER INSERT ON lead_events
  FOR EACH ROW
  EXECUTE FUNCTION on_lead_event_insert();

-- ============================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
