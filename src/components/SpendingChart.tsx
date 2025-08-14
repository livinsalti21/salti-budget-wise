import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SpendingChart = () => {
  const weeklyData = [
    { name: 'Mon', spent: 85, budget: 150 },
    { name: 'Tue', spent: 120, budget: 150 },
    { name: 'Wed', spent: 95, budget: 150 },
    { name: 'Thu', spent: 180, budget: 150 },
    { name: 'Fri', spent: 220, budget: 150 },
    { name: 'Sat', spent: 160, budget: 150 },
    { name: 'Sun', spent: 90, budget: 150 },
  ];

  const categoryData = [
    { name: 'Food & Dining', value: 650, color: 'hsl(var(--accent))' },
    { name: 'Transportation', value: 450, color: 'hsl(var(--primary))' },
    { name: 'Entertainment', value: 320, color: 'hsl(var(--warning))' },
    { name: 'Shopping', value: 580, color: 'hsl(var(--destructive))' },
    { name: 'Bills & Utilities', value: 850, color: 'hsl(var(--success))' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analytics</CardTitle>
        <CardDescription>Your spending patterns visualized</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Weekly Spending Bar Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3">Weekly Spending vs Budget</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="hsl(var(--muted))" name="Daily Budget" />
                <Bar dataKey="spent" fill="hsl(var(--primary))" name="Actual Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3">Spending by Category</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;