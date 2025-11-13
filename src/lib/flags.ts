// src/lib/flags.ts
export const FLAGS = {
  REWARDS: import.meta.env.VITE_FEATURE_REWARDS_ENABLED === 'true',
  DUO_REWARDS: import.meta.env.VITE_FEATURE_DUO_REWARDS_ENABLED === 'true',
  FAMILY_REWARDS: import.meta.env.VITE_FEATURE_FAMILY_REWARDS_ENABLED === 'true',
  ACCOUNT_LINKING: import.meta.env.VITE_FEATURE_ACCOUNT_LINKING_ENABLED === 'true',
  AI_INSIGHTS: import.meta.env.VITE_FEATURE_AI_INSIGHTS_ENABLED === 'true',
  GROUPS: import.meta.env.VITE_FEATURE_GROUPS_ENABLED !== 'false',
  PERKS: import.meta.env.VITE_FEATURE_PERKS_ENABLED === 'true',
  PRO: import.meta.env.VITE_FEATURE_PRO_ENABLED === 'true',
  TEMPLATE_PURCHASING: import.meta.env.VITE_FEATURE_TEMPLATE_PURCHASING_ENABLED === 'true',
  // Lovable Cloud AI Features
  LOVABLE_AI_CHAT: import.meta.env.VITE_FEATURE_LOVABLE_AI_CHAT !== 'false', // Default ON
  AI_STREAMING: import.meta.env.VITE_FEATURE_AI_STREAMING !== 'false', // Default ON
  // Friend Streaks
  FRIEND_STREAKS: import.meta.env.VITE_FEATURE_FRIEND_STREAKS_ENABLED !== 'false', // Default ON
  // Challenge Arena
  CHALLENGES: import.meta.env.VITE_FEATURE_CHALLENGES_ENABLED !== 'false', // Default ON
};

export function featureEnabled(key: keyof typeof FLAGS) {
  return !!FLAGS[key];
}