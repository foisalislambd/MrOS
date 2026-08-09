import { Button } from "@/components/ui/button";

const TRANSACTIONS = [
  { name: "Blue Bottle", cat: "Coffee", amount: "-$6.40", time: "9:14 AM" },
  { name: "Metro Transit", cat: "Travel", amount: "-$2.75", time: "8:02 AM" },
  { name: "Payroll", cat: "Income", amount: "+$2,400", time: "Yesterday" },
  { name: "Grocery Market", cat: "Food", amount: "-$54.20", time: "Yesterday" },
];

const BARS = [42, 68, 35, 80, 55, 72, 48];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function MockPreviewApp() {
  return (
    <div className="flex h-full w-full flex-col overflow-auto bg-preview-canvas text-foreground">
      <div className="border-b border-border px-4 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-[0.06em] text-fg-faint uppercase">
              Flux · Finance
            </p>
            <h1 className="mt-1.5 text-[1.75rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">
              $12,480.00
            </h1>
            <p className="mt-1 text-[13px] text-fg-subtle">Available balance · Aug 2026</p>
          </div>
          <Button type="button" size="sm" className="w-fit px-3">
            + Expense
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          {[
            { label: "This week", value: "$428" },
            { label: "Saved", value: "$1,120" },
            { label: "Goals", value: "3 active" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-[var(--radius-control)] bg-bg-elevated px-3 py-3 ring-1 ring-border sm:px-3.5 ${
                i === 2 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <p className="text-[11px] text-fg-subtle">{stat.label}</p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
        <section>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
              Weekly spend
            </h2>
            <span className="shrink-0 text-[11px] text-fg-subtle">vs last week −8%</span>
          </div>
          <div className="flex h-28 items-end gap-1.5 rounded-[var(--radius-panel)] bg-bg-elevated p-3 ring-1 ring-border sm:h-36 sm:gap-2 sm:p-4">
            {BARS.map((h, i) => (
              <div key={DAYS[i] + i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-[4px] bg-accent/85"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-medium text-fg-faint">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[13px] font-semibold tracking-[-0.01em] text-foreground">
            Recent
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-panel)] bg-bg-elevated ring-1 ring-border">
            {TRANSACTIONS.map((tx) => (
              <li
                key={tx.name + tx.time}
                className="flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-muted text-[11px] font-semibold text-fg-muted ring-1 ring-border">
                  {tx.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{tx.name}</p>
                  <p className="truncate text-[11px] text-fg-subtle">
                    {tx.cat} · {tx.time}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[13px] font-semibold tabular-nums ${
                    tx.amount.startsWith("+") ? "text-success" : "text-foreground"
                  }`}
                >
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
