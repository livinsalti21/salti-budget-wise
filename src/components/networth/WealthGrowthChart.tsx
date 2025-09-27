import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Clock, Calculator } from "lucide-react";
import { format, parseISO } from "date-fns";

interface LedgerEntry {
  id: string;
  transaction_type: 'SAVE' | 'MATCH_RECEIVED' | 'ADJUSTMENT';
  amount_cents: number;
  running_balance_cents: number;
  description?: string;
  future_value_40yr_cents: number;
  created_at: string;
}

interface AccountSummary {
  current_balance_cents: number;
  projected_40yr_value_cents: number;
  total_inflow_cents: number;
}

interface WealthGrowthChartProps {
  ledgerHistory: LedgerEntry[];
  accountSummary: AccountSummary | null;
}

export default function WealthGrowthChart({ ledgerHistory, accountSummary }: WealthGrowthChartProps) {
  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Prepare chart data - show running balance over time
  const chartData = ledgerHistory
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(entry => ({
      date: format(parseISO(entry.created_at), 'MMM dd'),
      balance: entry.running_balance_cents / 100,
      futureValue: entry.future_value_40yr_cents / 100,
      contribution: entry.amount_cents / 100,
      type: entry.transaction_type
    }));

  // Calculate compound growth projections for next 40 years
  const currentBalance = accountSummary?.current_balance_cents || 0;
  const projectionData = [];
  const annualRate = 0.08; // 8% annual return
  
  for (let year = 0; year <= 40; year++) {
    const compoundValue = (currentBalance / 100) * Math.pow(1 + annualRate, year);
    projectionData.push({
      year,
      value: compoundValue,
      label: year === 0 ? 'Today' : `${year}yr`
    });
  }

  if (!accountSummary || ledgerHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your Wealth Growth Journey</h3>
          <p className="text-muted-foreground">
            Start saving to see your wealth compound and grow over time!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Growth Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accountSummary.current_balance_cents)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">40-Year Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(accountSummary.projected_40yr_value_cents)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Multiple</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountSummary.current_balance_cents > 0 
                ? `${(accountSummary.projected_40yr_value_cents / accountSummary.current_balance_cents).toFixed(1)}x`
                : '0x'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accountSummary.total_inflow_cents)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Balance Growth
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your actual balance growth with each save
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'balance' ? 'Balance' : 'Future Value']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 40-Year Compound Growth Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            40-Year Compound Growth Projection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            How your current balance grows with 8% annual returns
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Projected Value']}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Key Milestones</h4>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div>
                <span className="text-muted-foreground">10 Years:</span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(Math.round((currentBalance / 100) * Math.pow(1.08, 10) * 100))}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">20 Years:</span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(Math.round((currentBalance / 100) * Math.pow(1.08, 20) * 100))}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">40 Years:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {formatCurrency(Math.round((currentBalance / 100) * Math.pow(1.08, 40) * 100))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}