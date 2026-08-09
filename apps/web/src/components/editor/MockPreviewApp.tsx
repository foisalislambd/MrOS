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
    <div className="flex h-full w-full flex-col overflow-auto bg-[#f7f5f2] text-[#1a1917]">
      <div className="relative overflow-hidden border-b border-[#e8e3dc] px-6 pb-7 pt-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 10% -20%, #ffd8cc 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, #ffe8c8 0%, transparent 45%)",
          }}
        />
        <div className="relative">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#ff6b4a] uppercase">
                Flux
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">$12,480.00</h1>
              <p className="mt-1 text-sm text-[#6b6760]">Available balance · Aug 2026</p>
            </div>
            <button
              type="button"
              className="rounded-xl bg-[#ff6b4a] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#f05533]"
            >
              + Expense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "This week", value: "$428" },
              { label: "Saved", value: "$1,120" },
              { label: "Goals", value: "3 active" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/70 px-3.5 py-3 backdrop-blur-sm ring-1 ring-[#e8e3dc]"
              >
                <p className="text-[11px] text-[#6b6760]">{stat.label}</p>
                <p className="mt-0.5 text-base font-semibold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-sm font-semibold">Weekly spend</h2>
            <span className="text-[11px] text-[#6b6760]">vs last week −8%</span>
          </div>
          <div className="flex h-36 items-end gap-2 rounded-2xl bg-white p-4 ring-1 ring-[#e8e3dc]">
            {BARS.map((h, i) => (
              <div key={DAYS[i] + i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-[#ff6b4a] to-[#ff9a7a] transition-all"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-medium text-[#9a958c]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Recent</h2>
          <ul className="divide-y divide-[#ece7e0] overflow-hidden rounded-2xl bg-white ring-1 ring-[#e8e3dc]">
            {TRANSACTIONS.map((tx) => (
              <li key={tx.name + tx.time} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0ec] text-xs font-semibold text-[#ff6b4a]">
                  {tx.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.name}</p>
                  <p className="text-[11px] text-[#6b6760]">
                    {tx.cat} · {tx.time}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    tx.amount.startsWith("+") ? "text-[#1f9d6a]" : "text-[#1a1917]"
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
