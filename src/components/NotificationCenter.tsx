import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Check, X, Users, Award, Flame, PiggyBank } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: any;
  read: boolean;
  created_at: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadNotifications = async () => {
    if (!user) return;

    // TODO: Remove mock data once notifications table is created
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'save_recorded',
        title: 'Save recorded!',
        message: 'You saved $20 today - that\'s worth $201 in 20 years',
        payload: {},
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2', 
        type: 'match_invite',
        title: 'Match invitation',
        message: 'Alex invited you to match their $15 save',
        payload: {},
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    // TODO: Implement once notifications table is created
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // TODO: Implement once notifications table is created
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast({
      title: "All notifications marked as read",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'save_recorded':
        return <PiggyBank className="h-4 w-4 text-primary" />;
      case 'match_invite':
        return <Users className="h-4 w-4 text-accent" />;
      case 'badge_earned':
        return <Award className="h-4 w-4 text-warning" />;
      case 'streak_milestone':
        return <Flame className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'save_recorded':
        return 'border-l-primary';
      case 'match_invite':
        return 'border-l-accent';
      case 'badge_earned':
        return 'border-l-warning';
      case 'streak_milestone':
        return 'border-l-destructive';
      default:
        return 'border-l-muted';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Stay updated with your saves, streaks, and social activities
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">Save your first amount to get started!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleDateString()} at{' '}
                          {new Date(notification.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;