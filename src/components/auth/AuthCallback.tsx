import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PiggyBank, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Email verification failed. The link may have expired or been used already.');
          
          toast({
            title: "Verification Failed", 
            description: "Your email verification link is invalid or has expired.",
            variant: "destructive"
          });
          
          // Redirect to auth page after 3 seconds
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (data.session) {
          console.log('Auth callback success, user authenticated');
          
          // Check user profile and onboarding status
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('completed_onboarding')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            // Error fetching profile (not including "no rows" error)
            console.error('Error fetching profile:', profileError);
            setStatus('error');
            setMessage('Unable to verify your account. Please try signing in again.');
            setTimeout(() => navigate('/auth'), 3000);
            return;
          }

          setStatus('success');
          
          // If no profile exists or onboarding not completed, go to onboarding
          if (!profile || !profile.completed_onboarding) {
            setMessage('Email verified! Setting up your account...');
            setTimeout(() => navigate('/onboarding'), 500);
          } else {
            // User has completed onboarding, go to app
            setMessage('Welcome back!');
            setTimeout(() => navigate('/app'), 500);
          }
        } else {
          // No session found, but no error - might be an edge case
          setStatus('error');
          setMessage('Unable to verify your email. Please try signing in again.');
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 text-center space-y-4">
        {status === 'verifying' && (
          <>
            <PiggyBank className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <h1 className="text-xl font-semibold text-foreground">Verifying Email</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Email Verified!</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}