interface UserProfile {
  id: string;
  plan?: string;
  pro_access_until?: string;
  bonus_access_until?: string;
  timezone?: string;
}

function nowInUserTZ(timezone: string = 'UTC'): Date {
  // Simple timezone handling - in production, use proper timezone library
  return new Date();
}

export function hasProAccess(user?: UserProfile | null): boolean {
  if (!user) return false;
  
  const now = nowInUserTZ(user.timezone || 'UTC');
  
  return (
    (user.plan === "Pro" || user.plan === "Family") ||
    (user.pro_access_until && new Date(user.pro_access_until) > now) ||
    (user.bonus_access_until && new Date(user.bonus_access_until) > now)
  );
}

export function hasFamilyAccess(user?: UserProfile | null): boolean {
  if (!user) return false;
  
  return user.plan === "Family" || hasProAccess(user);
}

export function canAccessFeature(feature: 'pro' | 'family', user?: UserProfile | null): boolean {
  if (feature === 'family') return hasFamilyAccess(user);
  return hasProAccess(user);
}