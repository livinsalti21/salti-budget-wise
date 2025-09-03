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

export default function ProGate({ children, fallback, feature }: ProGateProps) {
  const [showModal, setShowModal] = useState(false);
  const isPro = featureEnabled('PRO');
  
  if (isPro) return <>{children}</>;

  const handleUnlock = () => {
    track('pro_upsell_view', { feature: feature || 'unknown' });
    setShowModal(true);
  };

  const handleCtaClick = () => {
    track('pro_upsell_click_cta', { feature: feature || 'unknown' });
    window.location.href = '/pricing';
  };

  return (
    <>
      {fallback ?? (
        <div className="border border-border rounded-xl p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-card-foreground">Pro feature</div>
                <div className="text-sm text-muted-foreground">
                  Unlock advanced tools to accelerate your savings.
                </div>
              </div>
            </div>
            <button 
              className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              onClick={handleUnlock}
            >
              Unlock
            </button>
          </div>
        </div>
      )}
      
      {showModal && (
        <UpsellModal 
          onClose={() => setShowModal(false)}
          cta={handleCtaClick}
        />
      )}
    </>
  );
}