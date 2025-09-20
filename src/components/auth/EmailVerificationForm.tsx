import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight, CheckCircle, PiggyBank } from 'lucide-react';

export default function EmailVerificationForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { sendVerificationEmail } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await sendVerificationEmail(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Email Sent!",
          description: "Check your inbox for the verification link.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">Check Your Email</CardTitle>
          <CardDescription>
            We sent a verification link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
            <div className="text-center space-y-2">
              <Mail className="h-5 w-5 text-primary mx-auto" />
              <p className="text-sm font-medium">What's Next?</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>1. Check your email inbox</div>
                <div>2. Click the verification link</div>
                <div>3. Start your savings journey!</div>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setEmailSent(false)}
            className="w-full"
          >
            Use Different Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <PiggyBank className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl">Start Your Savings Journey</CardTitle>
        <CardDescription>
          Enter your email to get started. We'll send you a secure verification link.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your preferred email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10" 
              required 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 text-white" 
            disabled={loading}
            size="lg"
          >
            {loading ? 'Sending...' : (
              <>
                Send Verification Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
          <div className="text-center space-y-2">
            <CheckCircle className="h-5 w-5 text-primary mx-auto" />
            <p className="text-sm font-medium">Why Email Verification?</p>
            <div className="text-xs text-muted-foreground">
              We keep your account secure and send you important savings updates.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}