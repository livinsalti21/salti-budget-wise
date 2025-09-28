import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickOnboarding from './QuickOnboarding';

interface CompleteOnboardingProps {
  onComplete?: () => void;
}

export default function CompleteOnboarding({ onComplete }: CompleteOnboardingProps) {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/app');
    }
  };

  return <QuickOnboarding onComplete={handleOnboardingComplete} />;
}