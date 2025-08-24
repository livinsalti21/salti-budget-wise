import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { analytics } from '@/analytics/analytics';

const PricingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleCheckout = async (plan: string, period?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive"
      });
      return;
    }

    setLoading(plan + (period || ''));
    
    try {
      analytics.track('pricing_cta_clicked', { plan, billing_period: period || 'month' });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, interval: period || 'month' }
      });

      if (error) throw error;

      analytics.track('checkout_started', { plan, billing_period: period || 'month' });
      
      // Open in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Best for starting your journey",
      features: [
        "Manual budget uploads (or buy a Livin Salti template)",
        "Habit streaks, challenges, and community feed", 
        "Basic net worth calculator (manual input)",
        "Celebrate wins & build consistency"
      ],
      cta: "Start for Free",
      ctaVariant: "outline" as const,
      plan: "free"
    },
    {
      name: "Pro",
      price: "$4.99",
      yearlyPrice: "$49",
      period: "/month",
      yearlyPeriod: "/year",
      description: "Best for students & young adults who want automation",
      badge: "Most Popular",
      features: [
        "Everything in Free, plus:",
        "Link banks, cards, brokerages, and crypto exchanges (Plaid/Strike/River)",
        "Automated Save n Stack (real savings + compound growth projections)",
        "AI Expense Coach → personalized suggestions",
        "Live net worth + future self dashboard",
        "Invite friends/family to Match Save",
        "Advanced streaks, badges, and group challenges"
      ],
      cta: "Go Pro – Start Saving Smarter",
      ctaVariant: "default" as const,
      plan: "pro",
      popular: true
    },
    {
      name: "Family",
      price: "$9.99",
      period: "/month (up to 5 users)",
      description: "Best for families & accountability groups",
      features: [
        "Everything in Pro, for up to 5 accounts",
        "Shared group goals & streaks",
        "Parent/child \"Match Save\" (parents can double kids' savings)",
        "Family progress dashboard"
      ],
      cta: "Build a Family Streak",
      ctaVariant: "outline" as const,
      plan: "family"
    }
  ];

  const addOns = [
    { name: "Livin Salti Budget Spreadsheet Templates", price: "$9–$15" },
    { name: "Premium Learning Modules (debt payoff, investing basics, Roth IRA starter)", price: "$19–$29" }
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel or pause your subscription anytime through your billing portal. Your data stays safe and you can reactivate later."
    },
    {
      question: "Do students get a discount?",
      answer: "Our Pro plan is already priced with students in mind at just $4.99/month. We also offer a yearly plan for additional savings."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data is never deleted. You'll keep read-only access to your savings history and can reactivate automation anytime by upgrading again."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Build strong money habits. Save small. Stack big.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, or upgrade for automation and full features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {tier.badge && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  {tier.badge}
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tier.description}
                </CardDescription>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-foreground">
                    {tier.price}
                    <span className="text-lg font-normal text-muted-foreground">{tier.period}</span>
                  </div>
                  {tier.yearlyPrice && (
                    <div className="text-sm text-muted-foreground">
                      or {tier.yearlyPrice}{tier.yearlyPeriod} (save 17%)
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {tier.plan === 'free' ? (
                  <Button 
                    variant={tier.ctaVariant} 
                    className="w-full"
                    onClick={() => window.location.href = '/auth'}
                  >
                    {tier.cta}
                  </Button>
                ) : tier.plan === 'pro' ? (
                  <>
                    <Button 
                      variant={tier.ctaVariant} 
                      className="w-full"
                      onClick={() => handleCheckout(tier.plan, 'month')}
                      disabled={loading === tier.plan + 'month'}
                    >
                      {loading === tier.plan + 'month' ? 'Loading...' : `${tier.cta} (Monthly)`}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleCheckout(tier.plan, 'year')}
                      disabled={loading === tier.plan + 'year'}
                    >
                      {loading === tier.plan + 'year' ? 'Loading...' : `${tier.cta} (Yearly)`}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant={tier.ctaVariant} 
                    className="w-full"
                    onClick={() => handleCheckout(tier.plan, 'month')}
                    disabled={loading === tier.plan + 'month'}
                  >
                    {loading === tier.plan + 'month' ? 'Loading...' : tier.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Add-Ons Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">🛠 Add-Ons (One-Time)</h2>
          <div className="space-y-4">
            {addOns.map((addon, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-6">
                  <span className="font-medium">{addon.name}</span>
                  <span className="text-primary font-bold">{addon.price}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;