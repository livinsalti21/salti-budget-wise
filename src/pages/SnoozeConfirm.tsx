import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SnoozeConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [pushId, setPushId] = useState<string | null>(null);
  const [duration, setDuration] = useState(24);
  const [loading, setLoading] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>('');

  useEffect(() => {
    const pushIdParam = searchParams.get('push_id');
    const durationParam = parseInt(searchParams.get('duration_hours') || '24');

    setPushId(pushIdParam);
    setDuration(durationParam);

    // Calculate reminder time
    const reminderDate = new Date();
    reminderDate.setHours(reminderDate.getHours() + durationParam);
    setReminderTime(reminderDate.toLocaleString());
  }, [searchParams]);

  const snoozeNotification = async () => {
    if (!pushId) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('notify-snooze', {
        body: {
          push_id: pushId,
          duration_hours: duration
        }
      });

      if (error) throw error;

      setSnoozed(true);
      toast({
        title: "Notification Snoozed",
        description: `We'll remind you again in ${duration} hours.`
      });

      // Auto navigate after confirmation
      setTimeout(() => {
        navigate('/app');
      }, 2000);

    } catch (error) {
      console.error('Error snoozing notification:', error);
      toast({
        title: "Snooze Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (snoozed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Notification Snoozed</h2>
            <p className="text-muted-foreground mb-4">
              We'll remind you again at:
            </p>
            <Badge variant="secondary" className="text-sm">
              {reminderTime}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/app')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Snooze Notification
            </CardTitle>
            <CardDescription>
              We'll remind you again later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Snooze Info */}
            <div className="text-center p-6 bg-gradient-to-r from-secondary/10 to-secondary/20 rounded-lg">
              <div className="text-2xl font-bold mb-2">
                {duration} Hour{duration !== 1 ? 's' : ''}
              </div>
              <p className="text-sm text-muted-foreground">
                Next reminder at:
              </p>
              <Badge variant="outline" className="mt-2">
                {reminderTime}
              </Badge>
            </div>

            {/* Duration Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Choose snooze duration:</p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 4, 12, 24].map(hours => (
                  <Button
                    key={hours}
                    variant={duration === hours ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setDuration(hours);
                      const newTime = new Date();
                      newTime.setHours(newTime.getHours() + hours);
                      setReminderTime(newTime.toLocaleString());
                    }}
                  >
                    {hours}h
                  </Button>
                ))}
              </div>
            </div>

            {/* Confirm Snooze */}
            <Button
              onClick={snoozeNotification}
              disabled={loading || !pushId}
              className="w-full"
              size="lg"
            >
              {loading ? "Snoozing..." : `Snooze for ${duration} Hours`}
            </Button>

            {/* Cancel */}
            <Button
              variant="outline"
              onClick={() => navigate('/app')}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}