import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Calculator, Target, DollarSign, Lightbulb, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBudgetAnalysis, generateDataDrivenScenarios, getBudgetInsights, type BudgetAnalysis, type ScenarioData } from '@/lib/budgetAnalytics';

interface NetWorthProjectionProps {
  currentSavings: number;
  accountSummary?: {
    current_balance_cents: number;
    projected_40yr_value_cents: number;
    total_inflow_cents: number;
  } | null;
}

const NetWorthProjection = ({ currentSavings, accountSummary }: NetWorthProjectionProps) => {
  const { user } = useAuth();
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [targetAmount, setTargetAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(8); // 8% annual return default
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateProjections = () => {
    const monthly = currentSavings + monthlyContribution;
    const annually = currentSavings + (monthlyContribution * 12);
    
    // Compound interest calculations
    const monthlyRate = interestRate / 100 / 12;
    const fiveYearValue = currentSavings * Math.pow(1 + interestRate/100, 5) + 
      monthlyContribution * (Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate;

    return {
      weekly: currentSavings + (monthlyContribution / 4),
      monthly,
      yearly: annually,
      fiveYear: fiveYearValue
    };
  };

  // Load user's budget data and generate scenarios
  useEffect(() => {
    if (user) {
      loadBudgetAnalysis();
    }
  }, [user]);

  const loadBudgetAnalysis = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const analysis = await getUserBudgetAnalysis(user.id);
      setBudgetAnalysis(analysis);
      
      if (analysis) {
        const dataDrivenScenarios = generateDataDrivenScenarios(analysis);
        setScenarios(dataDrivenScenarios);
        setInsights(getBudgetInsights(analysis));
        
        // Update monthly contribution based on current savings
        if (analysis.totalSavings > 0) {
          setMonthlyContribution(Math.round(analysis.totalSavings * 4)); // Weekly to monthly
        }
      } else {
        // Fallback to static scenarios if no budget data
        setScenarios([
          {
            title: 'Conservative Saver',
            monthlyExtra: 200,
            description: 'Cut one dining out per week',
            categories: ['Eating Out'],
            achievability: 'easy',
            color: 'bg-success'
          },
          {
            title: 'Aggressive Saver',
            monthlyExtra: 500,
            description: 'Optimize all categories',
            categories: ['All'],
            achievability: 'moderate',
            color: 'bg-accent'
          },
          {
            title: 'Investment Focused',
            monthlyExtra: 800,
            description: 'Side hustle + optimization',
            categories: ['Income'],
            achievability: 'challenging',
            color: 'bg-primary'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading budget analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const projections = calculateProjections();

  const staticScenarios = [
    {
      title: 'Conservative Saver',
      monthlyExtra: 200,
      description: 'Cut one dining out per week',
      color: 'bg-success'
    },
    {
      title: 'Aggressive Saver',
      monthlyExtra: 500,
      description: 'Optimize all categories',
      color: 'bg-accent'
    },
    {
      title: 'Investment Focused',
      monthlyExtra: 800,
      description: 'Side hustle + optimization',
      color: 'bg-primary'
    }
  ];

  const getScenarioProjection = (extraMonthly: number) => {
    const totalMonthly = monthlyContribution + extraMonthly;
    const monthlyRate = interestRate / 100 / 12;
    return currentSavings * Math.pow(1 + interestRate/100, 5) + 
      totalMonthly * (Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate;
  };

  const getInvestmentType = (rate: number) => {
    const types = [
      {
        name: 'High-Yield Savings',
        range: '1-3%',
        description: 'Safe but low returns. Good for emergency funds.',
        active: rate >= 1 && rate <= 3
      },
      {
        name: 'CDs & Bonds',
        range: '3-5%',
        description: 'Conservative with predictable returns. Lower risk.',
        active: rate > 3 && rate <= 5
      },
      {
        name: 'Conservative Portfolio',
        range: '5-7%',
        description: 'Mix of bonds and stocks. Balanced risk/return.',
        active: rate > 5 && rate <= 7
      },
      {
        name: 'Market Index Funds',
        range: '7-10%',
        description: 'Historical stock market average. Recommended for long-term.',
        active: rate > 7 && rate <= 10
      },
      {
        name: 'Aggressive Growth',
        range: '10-12%',
        description: 'High-growth stocks and sectors. Higher volatility.',
        active: rate > 10 && rate <= 12
      },
      {
        name: 'Speculative Investments',
        range: '12%+',
        description: 'Crypto, individual stocks, startups. Very high risk.',
        active: rate > 12
      }
    ];
    return types;
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Net Worth Projection
          </CardTitle>
          <CardDescription>
            See how your savings grow over time with compound interest
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Projection Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
              <Input
                id="monthly-contribution"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="text-lg font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Goal</Label>
              <Input
                id="target-amount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="text-lg font-medium"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interest-rate">Expected Annual Return: {interestRate}%</Label>
                <Slider
                  id="interest-rate"
                  min={1}
                  max={15}
                  step={0.5}
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>8% (Recommended)</span>
                  <span>15%</span>
                </div>
              </div>
              
              {/* Investment Type Recommendations */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Investment Type Guidance:</p>
                <div className="grid grid-cols-1 gap-2">
                  {getInvestmentType(interestRate).map((type, index) => (
                    <div key={index} className={`p-2 rounded-lg border text-xs ${type.active ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{type.name}</span>
                        <Badge variant={type.active ? "default" : "secondary"} className="text-xs">
                          {type.range}
                        </Badge>
                      </div>
                      {type.active && (
                        <p className="text-muted-foreground mt-1">{type.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Projections</CardTitle>
            <CardDescription>Based on current savings rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-success-light">
                <p className="text-sm text-muted-foreground">Weekly</p>
                <p className="text-xl font-bold text-success">${projections.weekly.toFixed(0)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">Monthly</p>
                <p className="text-xl font-bold text-primary">${projections.monthly.toFixed(0)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/10">
                <p className="text-sm text-muted-foreground">Yearly</p>
                <p className="text-xl font-bold text-accent">${projections.yearly.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-warning/10">
                <p className="text-sm text-muted-foreground">5 Years</p>
                <p className="text-xl font-bold text-warning">${projections.fiveYear.toFixed(0)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg border bg-gradient-to-r from-success/5 to-success/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-success" />
                <span className="font-medium">Goal Progress</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll reach your ${targetAmount.toLocaleString()} goal in approximately{' '}
                <span className="font-medium text-success">
                  {Math.ceil((targetAmount - currentSavings) / monthlyContribution)} months
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Insights */}
      {budgetAnalysis && insights.length > 0 && (
        <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Budget Insights
            </CardTitle>
            <CardDescription>
              Based on your actual spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                  <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What-If Scenarios</CardTitle>
          <CardDescription>
            {budgetAnalysis 
              ? "Personalized scenarios based on your budget" 
              : "See how extra savings impact your 5-year wealth"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg border space-y-3 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
              const projection = getScenarioProjection(scenario.monthlyExtra);
              const difference = projection - projections.fiveYear;
              
              return (
                <div key={scenario.title} className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${scenario.color}`} />
                    <h4 className="font-medium">{scenario.title}</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">+${scenario.monthlyExtra}/month</p>
                      <Badge 
                        variant={scenario.achievability === 'easy' ? 'default' : scenario.achievability === 'moderate' ? 'secondary' : 'outline'}
                        className="text-xs capitalize"
                      >
                        {scenario.achievability}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">${projection.toFixed(0)}</p>
                    <Badge variant="secondary" className="text-xs">
                      +${difference.toFixed(0)} more
                    </Badge>
                    {budgetAnalysis && scenario.categories.length > 0 && scenario.categories[0] !== 'All categories' && (
                      <p className="text-xs text-muted-foreground">
                        Focus: {scenario.categories.slice(0, 2).join(', ')}
                        {scenario.categories.length > 2 && ' +more'}
                      </p>
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    {budgetAnalysis ? 'View Details' : 'Adopt This Plan'}
                  </Button>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetWorthProjection;