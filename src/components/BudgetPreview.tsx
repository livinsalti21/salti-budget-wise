type Props = {
  data: {
    weeklyBudget: {
      incomeWeekly: number;
      savingsTarget: number;
      categories: { name: string; amount: number; notes?: string }[];
    };
    tips?: string[];
  };
};

export default function BudgetPreview({ data }: Props) {
  const total = data.weeklyBudget.categories.reduce((a, c) => a + c.amount, 0) + data.weeklyBudget.savingsTarget;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 shadow bg-card border">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Weekly Income</span><span>${data.weeklyBudget.incomeWeekly}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Total Planned (spend + savings)</span><span>${total}</span>
        </div>
        <div className="flex justify-between font-medium text-foreground">
          <span>Savings</span><span>${data.weeklyBudget.savingsTarget}</span>
        </div>
      </div>

      <div className="rounded-2xl p-4 shadow bg-card border">
        <h3 className="text-base font-semibold mb-2">Categories</h3>
        <ul className="divide-y divide-border">
          {data.weeklyBudget.categories.map((c, i) => (
            <li key={i} className="py-2 flex justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                {c.notes && <div className="text-xs text-muted-foreground">{c.notes}</div>}
              </div>
              <div className="font-semibold">${c.amount}</div>
            </li>
          ))}
        </ul>
      </div>

      {data.tips?.length ? (
        <div className="rounded-2xl p-4 shadow bg-card border">
          <h3 className="text-base font-semibold mb-2">Tips</h3>
          <ul className="list-disc ml-5 text-sm space-y-1">
            {data.tips.slice(0,3).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}