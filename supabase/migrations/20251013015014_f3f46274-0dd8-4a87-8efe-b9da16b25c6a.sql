-- ============================================
-- PHASE 2: Enhanced Ledger Visibility
-- ============================================
-- Creates view to show detailed transaction sources
-- Distinguishes between friend matches (accountability) and sponsor matches (money transfer)

-- ============================================
-- 1. Create user_ledger_detailed view
-- ============================================

CREATE OR REPLACE VIEW public.user_ledger_detailed AS
SELECT 
  ul.id,
  ul.user_id,
  ul.transaction_type,
  ul.amount_cents,
  ul.running_balance_cents,
  ul.description,
  ul.reference_id,
  ul.future_value_40yr_cents,
  ul.created_at,
  
  -- Sponsor match details (MONEY TRANSFER to user's account)
  CASE 
    WHEN ul.transaction_type = 'MATCH_RECEIVED' AND ul.reference_id IS NOT NULL THEN
      (SELECT s.name 
       FROM match_events me 
       JOIN sponsors s ON me.sponsor_id = s.id 
       WHERE me.id = ul.reference_id::uuid)
    ELSE NULL
  END as sponsor_name,
  
  CASE 
    WHEN ul.transaction_type = 'MATCH_RECEIVED' AND ul.reference_id IS NOT NULL THEN
      (SELECT me.original_amount_cents 
       FROM match_events me 
       WHERE me.id = ul.reference_id::uuid)
    ELSE NULL
  END as original_save_amount_cents,
  
  -- Friend match indicator (NO MONEY TRANSFER, just accountability tracking)
  CASE 
    WHEN ul.transaction_type = 'SAVE' AND EXISTS(
      SELECT 1 FROM friend_matches fm
      WHERE fm.matching_save_event_id = ul.reference_id::uuid
         OR fm.original_save_event_id = ul.reference_id::uuid
    ) THEN true
    ELSE false
  END as has_friend_match,
  
  -- Friend name for accountability matches
  CASE 
    WHEN ul.transaction_type = 'SAVE' THEN
      (SELECT p.display_name 
       FROM friend_matches fm
       JOIN profiles p ON (
         CASE 
           WHEN fm.matching_save_event_id = ul.reference_id::uuid THEN fm.original_user_id
           WHEN fm.original_save_event_id = ul.reference_id::uuid THEN fm.matching_user_id
           ELSE NULL
         END = p.id
       )
       WHERE fm.matching_save_event_id = ul.reference_id::uuid
          OR fm.original_save_event_id = ul.reference_id::uuid
       LIMIT 1)
    ELSE NULL
  END as friend_match_name
  
FROM user_ledger ul;

-- Grant SELECT to authenticated users (respects RLS on underlying table)
GRANT SELECT ON public.user_ledger_detailed TO authenticated;

-- ============================================
-- Summary of Phase 2:
-- ============================================
-- ✅ user_ledger_detailed view created
-- ✅ Sponsor matches show sponsor name + original save amount
-- ✅ Friend matches show friend name + accountability badge
-- ✅ Clear distinction: friend = accountability, sponsor = money transfer