import React, { useState } from 'react';
import { featureEnabled } from '@/lib/flags';
import UpsellModal from './UpsellModal';
import { track } from '@/analytics/analytics';
import { Lock } from 'lucide-react';
interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  feature?: string;
}
export default function ProGate({
  children,
  fallback,
  feature
}: ProGateProps) {
  const [showModal, setShowModal] = useState(false);
  const isPro = featureEnabled('PRO');
  if (isPro) return <>{children}</>;
  const handleUnlock = () => {
    track('pro_upsell_view', {
      feature: feature || 'unknown'
    });
    setShowModal(true);
  };
  const handleCtaClick = () => {
    track('pro_upsell_click_cta', {
      feature: feature || 'unknown'
    });
    window.location.href = '/pricing';
  };
  return <>
      {fallback}
      
      {showModal && <UpsellModal onClose={() => setShowModal(false)} cta={handleCtaClick} />}
    </>;
}