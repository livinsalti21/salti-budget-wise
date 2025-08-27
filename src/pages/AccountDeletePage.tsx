import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MobileSafeArea } from '@/components/ui/mobile-safe-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountDeletePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [agreesToDeletion, setAgreesToDeletion] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user || confirmText !== 'DELETE' || !agreesToDeletion) return;

    setIsDeleting(true);
    
    try {
      // Call the account deletion function
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { user_id: user.id }
      });

      if (error) {
        throw error;
      }

      setIsDeleted(true);
      
      // Sign out the user after successful deletion
      setTimeout(async () => {
        await signOut();
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting your account. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return (
      <MobileSafeArea className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Account Deleted Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your account and all associated data have been permanently deleted.
              </p>
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">Timeline:</p>
                <ul className="text-left space-y-1">
                  <li>• Personal data: Deleted immediately</li>
                  <li>• Financial records: Deleted immediately</li>
                  <li>• Account access: Revoked immediately</li>
                  <li>• Backup data: Purged within 30 days</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to the homepage shortly...
              </p>
            </CardContent>
          </Card>
        </div>
      </MobileSafeArea>
    );
  }

  return (
    <MobileSafeArea className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Delete Account</h1>
        </div>

        <div className="space-y-6">
          {/* Warning Card */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Permanent Account Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-red-700">
                This action cannot be undone. Deleting your account will permanently remove:
              </p>
              <ul className="text-red-700 text-sm space-y-1 ml-4">
                <li>• All your saved amounts and transaction history</li>
                <li>• Your streak data and achievements</li>
                <li>• Budget and projection settings</li>
                <li>• Account preferences and settings</li>
                <li>• All personal data and profile information</li>
              </ul>
            </CardContent>
          </Card>

          {/* Confirmation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Confirm Account Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Type <strong>DELETE</strong> to confirm:
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="font-mono"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree"
                  checked={agreesToDeletion}
                  onCheckedChange={(checked) => setAgreesToDeletion(checked === true)}
                />
                <Label htmlFor="agree" className="text-sm">
                  I understand this action is permanent and cannot be undone
                </Label>
              </div>

              <Button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || !agreesToDeletion || isDeleting}
                variant="destructive"
                className="w-full"
              >
                {isDeleting ? (
                  "Deleting Account..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account Permanently
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Support Info */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Need help or have questions? Contact us at{' '}
                <a 
                  href="mailto:livinsalti21@gmail.com" 
                  className="text-primary underline"
                >
                  livinsalti21@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileSafeArea>
  );
}