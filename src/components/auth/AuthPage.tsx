import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Flame, PiggyBank, Shield, CheckCircle } from 'lucide-react';
import EmailVerificationForm from './EmailVerificationForm';
export default function AuthPage() {
  const [animatedStats, setAnimatedStats] = useState({
    totalSaved: 2547,
    activeUsers: 12847,
    dailySavings: 2547
  });

  // Animate stats for engagement
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        totalSaved: prev.totalSaved + Math.floor(Math.random() * 10),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        dailySavings: prev.dailySavings + Math.floor(Math.random() * 15)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-2xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          
          {/* Hero Stats Section */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-sm">
                ✌🏽
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Livin Salti
              </h1>
            </div>
            
            {/* Real-time animated stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-3">
                <div className="text-center">
                  <Users className="h-4 w-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-primary animate-pulse">
                    {animatedStats.activeUsers.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Savers</div>
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 p-3">
                <div className="text-center">
                  <PiggyBank className="h-4 w-4 text-success mx-auto mb-1" />
                  <div className="text-lg font-bold text-success animate-pulse">
                    ${animatedStats.totalSaved.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Saved Today</div>
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 p-3">
                <div className="text-center">
                  <Flame className="h-4 w-4 text-accent mx-auto mb-1" />
                  <div className="text-lg font-bold text-accent">7</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </Card>
            </div>

            {/* Social proof and excitement builder */}
            <div className="space-y-2">
              
              
            </div>
          </div>

          {/* Email Verification Form */}
          <EmailVerificationForm />

          {/* Trust badges */}
          <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Bank Security
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Free Forever
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              12K+ Users
            </div>
          </div>

          {/* Success stories ticker */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              💡 "Best decision I made for my financial future" - Sarah M.
            </p>
          </div>
        </div>
      </div>
    </div>;
}