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
    <div className="flex h-full w-full flex-col overflow-auto bg-[#121214] text-[#ededec]">
      <div className="relative overflow-hidden border-b border-[#2a2a2e] px-4 pb-6 pt-5 sm:px-6 sm:pb-7 sm:pt-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 10% -20%, rgba(255,107,74,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(255,150,80,0.12) 0%, transparent 45%)",
          }}
        />
        <div className="relative">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#ff6b4a] uppercase">
                Flux
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                $12,480.00
              </h1>
              <p className="mt-1 text-sm text-[#9b9b98]">Available balance · Aug 2026</p>
            </div>
            <button
              type="button"
              className="w-fit rounded-xl bg-[#ff6b4a] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#ff8266]"
            >
              + Expense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {[
              { label: "This week", value: "$428" },
              { label: "Saved", value: "$1,120" },
              { label: "Goals", value: "3 active" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`rounded-xl bg-white/[0.04] px-3 py-3 ring-1 ring-[#2a2a2e] sm:px-3.5 ${
                  i === 2 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <p className="text-[11px] text-[#9b9b98]">{stat.label}</p>
                <p className="mt-0.5 text-base font-semibold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
        <section>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="text-sm font-semibold">Weekly spend</h2>
            <span className="shrink-0 text-[11px] text-[#9b9b98]">vs last week −8%</span>
          </div>
          <div className="flex h-28 items-end gap-1.5 rounded-2xl bg-[#161618] p-3 ring-1 ring-[#2a2a2e] sm:h-36 sm:gap-2 sm:p-4">
            {BARS.map((h, i) => (
              <div key={DAYS[i] + i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-[#ff6b4a] to-[#ff9a7a] transition-all"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-medium text-[#6a6a67]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Recent</h2>
          <ul className="divide-y divide-[#2a2a2e] overflow-hidden rounded-2xl bg-[#161618] ring-1 ring-[#2a2a2e]">
            {TRANSACTIONS.map((tx) => (
              <li key={tx.name + tx.time} className="flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(255,107,74,0.14)] text-xs font-semibold text-[#ff6b4a]">
                  {tx.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.name}</p>
                  <p className="truncate text-[11px] text-[#9b9b98]">
                    {tx.cat} · {tx.time}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    tx.amount.startsWith("+") ? "text-[#3ecf8e]" : "text-[#ededec]"
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
