import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeSelect from '@/features/onboarding/ModeSelect';
import StreamlinedOnboardingFlow from './StreamlinedOnboardingFlow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CompleteOnboardingProps {
  onComplete?: () => void;
}

export default function CompleteOnboarding({ onComplete }: CompleteOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<'mode' | 'onboarding'>('mode');
  const [selectedMode, setSelectedMode] = useState<'standard' | 'educational'>('standard');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleModeSelect = async (mode: 'standard' | 'educational') => {
    setSelectedMode(mode);
    
    // Save mode to user profile
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id,
            mode: mode,
            email: user.email || null
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error('Error saving mode:', error);
          toast({
            title: "Warning",
            description: "Failed to save mode preference, but continuing...",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error saving mode:', error);
      }
    }
    
    setCurrentStep('onboarding');
  };

  const handleOnboardingComplete = async () => {
    // The OnboardingFlow component already handles completion
    if (onComplete) {
      onComplete();
    } else {
      navigate('/');
    }
  };

  if (currentStep === 'mode') {
    return <ModeSelect onModeSelect={handleModeSelect} />;
  }

  return (
    <StreamlinedOnboardingFlow 
      onComplete={handleOnboardingComplete}
      mode={selectedMode}
    />
  );
}