// src/components/core/FeatureGate.tsx
import React from 'react';
import { featureEnabled } from '@/lib/flags';

interface FeatureGateProps {
  flag: keyof typeof import('@/lib/flags').FLAGS;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ flag, fallback = null, children }) => {
  return featureEnabled(flag) ? <>{children}</> : <>{fallback}</>;
};