import React from 'react';
import { X } from 'lucide-react';

interface UpsellModalProps {
  onClose: () => void;
  cta?: () => void;
  title?: string;
  body?: string;
}

export default function UpsellModal({ 
  onClose, 
  cta, 
  title = 'Go Pro to unlock this',
  body = 'Advanced insights, automation, and elite streak tools. Cancel anytime.'
}: UpsellModalProps) {
  const handleCta = () => {
    if (cta) {
      cta();
    } else {
      window.location.href = '/pricing';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50" onClick={onClose}>
      <div 
        className="bg-card rounded-xl p-6 w-[460px] max-w-[90vw] shadow-xl border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {body}
        </p>
        
        <ul className="text-sm space-y-2 mb-6 text-card-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>AI Expense Coach & personalized budgets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Enhanced Save Stack + streak boosters</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Goals projections & net worth simulations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Create Pods & Challenges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Priority support & early feature access</span>
          </li>
        </ul>
        
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors flex-1"
            onClick={onClose}
          >
            Not now
          </button>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex-1"
            onClick={handleCta}
          >
            View Pro plans
          </button>
        </div>
      </div>
    </div>
  );
}