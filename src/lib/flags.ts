// src/lib/flags.ts
export const FLAGS = {
  REWARDS: import.meta.env.VITE_FEATURE_REWARDS_ENABLED === 'true',
  DUO_REWARDS: import.meta.env.VITE_FEATURE_DUO_REWARDS_ENABLED === 'true',
  FAMILY_REWARDS: import.meta.env.VITE_FEATURE_FAMILY_REWARDS_ENABLED === 'true',
  ACCOUNT_LINKING: import.meta.env.VITE_FEATURE_ACCOUNT_LINKING_ENABLED === 'true',
  AI_INSIGHTS: import.meta.env.VITE_FEATURE_AI_INSIGHTS_ENABLED === 'true',
  GROUPS: import.meta.env.VITE_FEATURE_GROUPS_ENABLED !== 'false',
  PERKS: import.meta.env.VITE_FEATURE_PERKS_ENABLED === 'true',
};

export function featureEnabled(key: keyof typeof FLAGS) {
  return !!FLAGS[key];
}