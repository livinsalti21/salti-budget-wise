import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  mode: 'standard' | 'educational';
  birth_year?: number;
  parent_email?: string;
}

export function isEducational(profile?: UserProfile | null): boolean {
  return profile?.mode === 'educational';
}

export function isStandard(profile?: UserProfile | null): boolean {
  return profile?.mode === 'standard' || !profile?.mode;
}

export function canAccessPlaid(profile?: UserProfile | null): boolean {
  return isStandard(profile);
}

export function canAccessStripe(profile?: UserProfile | null): boolean {
  return isStandard(profile);
}

export function canAccessBankFeatures(profile?: UserProfile | null): boolean {
  return isStandard(profile);
}

export function getNotificationScope(profile?: UserProfile | null): 'standard' | 'educational' {
  return isEducational(profile) ? 'educational' : 'standard';
}

export function getUserAgeGroup(profile?: UserProfile | null): 'child' | 'teen' | 'adult' {
  if (!profile?.birth_year) return 'adult';
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - profile.birth_year;
  
  if (age < 13) return 'child';
  if (age < 16) return 'teen';
  return 'adult';
}