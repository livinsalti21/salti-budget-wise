import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Contact, UserPlus, Flame, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isOnApp?: boolean;
  currentStreak?: number;
  isSponsor?: boolean;
}

export default function ContactSync() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();

  const requestContactsPermission = async () => {
    setSyncing(true);
    
    try {
      // In a real app, this would use the Capacitor Contacts plugin
      // For demo purposes, we'll simulate contact syncing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock contacts data
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          isOnApp: true,
          currentStreak: 12,
          isSponsor: false
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          isOnApp: true,
          currentStreak: 5,
          isSponsor: false
        },
        {
          id: '3',
          name: 'Mom',
          phone: '+1234567890',
          isOnApp: true,
          currentStreak: 23,
          isSponsor: true
        },
        {
          id: '4',
          name: 'Alex Smith',
          email: 'alex@example.com',
          isOnApp: false
        }
      ];
      
      setContacts(mockContacts);
      setHasPermission(true);
      
      toast({
        title: "Contacts Synced! 📱",
        description: `Found ${mockContacts.filter(c => c.isOnApp).length} friends already on Livin Salti`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const inviteFriend = (contact: Contact) => {
    toast({
      title: "Invitation Sent! 💌",
      description: `Invited ${contact.name} to join your Save n Stack journey`,
    });
  };

  if (!hasPermission) {
    return (
      <Card>
        <CardHeader className="text-center">
        <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
          <Contact className="h-8 w-8 text-primary" />
        </div>
          <CardTitle>Sync Your Contacts</CardTitle>
          <p className="text-muted-foreground">
            Find friends already on Livin Salti and see their streaks
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              We'll help you find friends who are already saving and stacking. 
              Your contacts are never stored on our servers.
            </p>
          </div>
          <Button onClick={requestContactsPermission} disabled={syncing} className="w-full">
            {syncing ? 'Syncing Contacts...' : 'Sync Contacts'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const friendsOnApp = contacts.filter(c => c.isOnApp);
  const friendsNotOnApp = contacts.filter(c => !c.isOnApp);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">👥 Your Save n Stack Network</h2>
        <p className="text-muted-foreground">Friends and family building wealth together</p>
      </div>

      {/* Friends on App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Friends with Streaks ({friendsOnApp.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friendsOnApp.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No friends on Livin Salti yet. Invite them to start saving together!
            </p>
          ) : (
            friendsOnApp.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{contact.name}</p>
                      {contact.isSponsor && (
                        <Heart className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contact.email || contact.phone}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                  <Flame className="h-3 w-3 mr-1" />
                  {contact.currentStreak} day{contact.currentStreak !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Friends not on App */}
      {friendsNotOnApp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-accent" />
              Invite Friends ({friendsNotOnApp.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {friendsNotOnApp.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted">
                      {contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.email || contact.phone}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => inviteFriend(contact)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button variant="outline" onClick={requestContactsPermission} disabled={syncing}>
          {syncing ? 'Refreshing...' : 'Refresh Contacts'}
        </Button>
      </div>
    </div>
  );
}