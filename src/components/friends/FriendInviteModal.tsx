import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Phone, 
  Mail, 
  Share2, 
  Copy, 
  Heart, 
  Zap, 
  Trophy, 
  UserPlus,
  MessageCircle,
  Flame,
  Target,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isOnApp?: boolean;
}

interface FriendInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FriendInviteModal({ open, onOpenChange }: FriendInviteModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [hasContactPermission, setHasContactPermission] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const benefits = [
    {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      title: "Save Together",
      description: "Match each other's saves for mutual motivation and accountability"
    },
    {
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      title: "Build Friend Streaks",
      description: "Create shared saving streaks and compete in healthy challenges"
    },
    {
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      title: "Celebrate Wins",
      description: "Share milestones and celebrate financial achievements together"
    },
    {
      icon: <Target className="h-5 w-5 text-blue-500" />,
      title: "Stay Accountable",
      description: "Get notifications when friends save and keep each other motivated"
    }
  ];

  const syncContacts = async () => {
    setSyncing(true);
    
    try {
      // Simulate contact access - in real app would use Capacitor Contacts plugin
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockContacts: Contact[] = [
        { id: '1', name: 'Sarah Johnson', phone: '+1234567890', email: 'sarah@example.com', isOnApp: false },
        { id: '2', name: 'Mike Chen', phone: '+1234567891', email: 'mike@example.com', isOnApp: false },
        { id: '3', name: 'Alex Rodriguez', phone: '+1234567892', email: 'alex@example.com', isOnApp: true },
        { id: '4', name: 'Emma Davis', phone: '+1234567893', email: 'emma@example.com', isOnApp: false },
      ];
      
      setContacts(mockContacts);
      setHasContactPermission(true);
      
      toast({
        title: "Contacts Synced! 📱",
        description: `Found ${mockContacts.length} contacts ready to invite`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to access contacts. Please try manual invite.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const inviteByPhone = async (phone: string, name?: string) => {
    try {
      // In real app, would use SMS API or native share
      const message = `Hey${name ? ` ${name}` : ''}! 🎯 I'm building wealth with Livin Salti and want you to join me! We can save together and build friend streaks. Check it out: ${generateReferralLink()}`;
      
      // Try native SMS if available
      if ('sms' in navigator) {
        window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
      } else {
        // Fallback to copy message
        await navigator.clipboard.writeText(message);
        toast({
          title: "Message Copied! 📱",
          description: `SMS text copied. Send to ${name || phone} manually`,
        });
      }
      
      // Track invitation
      trackInvitation('sms', phone);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const inviteByEmail = async (email: string, name?: string) => {
    try {
      const subject = "Join me on Livin Salti - Let's Save Together! 💰";
      const body = `Hey${name ? ` ${name}` : ''}!

I've been using Livin Salti to build my savings through their Save n Stack method, and it's been amazing! 🎯

I'd love for you to join me so we can:
• Match each other's saves for motivation
• Build friend streaks together
• Celebrate our financial wins
• Keep each other accountable

Use my referral link to get started: ${generateReferralLink()}

Let's build wealth together! 💪

Talk soon!`;

      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Track invitation
      trackInvitation('email', email);
      
      toast({
        title: "Email Opened! 📧",
        description: `Email invitation ready for ${name || email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open email",
        variant: "destructive",
      });
    }
  };

  const generateReferralLink = () => {
    return `${window.location.origin}?ref=${user?.id || 'STACK123'}`;
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(generateReferralLink());
      toast({
        title: "Copied! 🔗",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = async () => {
    const link = generateReferralLink();
    const text = `Join me on Livin Salti and let's save together! 🎯💰 ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Save Together on Livin Salti',
          text,
          url: link,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyReferralLink();
    }
  };

  const trackInvitation = async (method: string, contact: string) => {
    if (!user) return;
    
    try {
      await supabase.from('referral_events').insert({
        referral_id: user.id, // Simplified for demo
        event_type: 'sent',
        metadata: { method, contact }
      });
    } catch (error) {
      console.error('Failed to track invitation:', error);
    }
  };

  const handleManualInvite = () => {
    if (manualEmail) {
      inviteByEmail(manualEmail);
      setManualEmail('');
    } else if (manualPhone) {
      inviteByPhone(manualPhone);
      setManualPhone('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Friends to Save Together
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits Section */}
          <Card className="bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Why Save Together?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="mt-0.5">{benefit.icon}</div>
                    <div>
                      <p className="font-medium text-sm">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm text-purple-900">Real Example</span>
                </div>
                <p className="text-xs text-purple-800">
                  Sarah saved $50 → You match with $50 → Both get motivated → 
                  Build friend streaks → Celebrate $500 milestone together! 🎉
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invitation Methods */}
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contacts" className="text-xs">
                <Phone className="h-4 w-4 mr-1" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs">
                <UserPlus className="h-4 w-4 mr-1" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="share" className="text-xs">
                <Share2 className="h-4 w-4 mr-1" />
                Share Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="space-y-4 mt-4">
              {!hasContactPermission ? (
                <Card>
                  <CardContent className="text-center py-6">
                    <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-2">Sync Your Contacts</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Find friends in your contacts and invite them via SMS or email
                    </p>
                    <Button onClick={syncContacts} disabled={syncing} className="w-full">
                      {syncing ? 'Syncing...' : 'Sync Contacts'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <Card key={contact.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{contact.name}</p>
                              {contact.isOnApp && (
                                <Badge variant="secondary" className="text-xs">
                                  On App
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {contact.phone} • {contact.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {contact.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => inviteByPhone(contact.phone!, contact.name)}
                              disabled={contact.isOnApp}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              SMS
                            </Button>
                          )}
                          {contact.email && (
                            <Button
                              size="sm"
                              onClick={() => inviteByEmail(contact.email!, contact.name)}
                              disabled={contact.isOnApp}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Invite by Phone or Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="+1 (555) 123-4567"
                          value={manualPhone}
                          onChange={(e) => setManualPhone(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => inviteByPhone(manualPhone)}
                          disabled={!manualPhone}
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          SMS
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">or</div>
                    
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="friend@example.com"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => inviteByEmail(manualEmail)}
                          disabled={!manualEmail}
                          size="sm"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="share" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Share Your Referral Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={generateReferralLink()}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={copyReferralLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button onClick={shareReferralLink} className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share with Friends
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Share via text, social media, or any messaging app
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Start Building Wealth Together!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The more friends you invite, the stronger your saving network becomes
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}