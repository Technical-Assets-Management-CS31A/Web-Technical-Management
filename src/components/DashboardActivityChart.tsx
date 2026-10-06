import { useMemo } from "react";
import type { TRecentBorrowItemProps } from "../@types/types";
import { DASHBOARD_CONTENT as T } from "../constants/dashboardContent";

const DAYS = 7;

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export default function DashboardActivityChart({ records }: { records: TRecentBorrowItemProps[] }) {
  const days = useMemo(() => {
    const counts = new Map<string, number>();
    records.forEach((record) => {
      if (!record.lentAt) return;
      const lentAt = new Date(record.lentAt);
      if (Number.isNaN(lentAt.getTime())) return;
      const key = toDayKey(lentAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const today = new Date();
    return Array.from({ length: DAYS }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1 - i));
      return {
        key: toDayKey(date),
        label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
        fullLabel: new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(date),
        count: counts.get(toDayKey(date)) ?? 0,
        isToday: i === DAYS - 1,
      };
    });
  }, [records]);

  const total = days.reduce((sum, day) => sum + day.count, 0);
  const max = Math.max(...days.map((day) => day.count), 1);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{T.activity.title}</h2>
          <p className="text-sm text-slate-500">{T.activity.description}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{total}</p>
          <p className="text-xs text-slate-500">{T.activity.totalLabel}</p>
        </div>
      </div>

      <div className="mt-6 flex h-44 items-end gap-3 border-b border-slate-200" role="img" aria-label={T.activity.title}>
        {days.map((day) => (
          <div key={day.key} className="group flex h-full flex-1 items-end justify-center">
            <div
              className="relative w-full max-w-10"
              style={{ height: day.count > 0 ? `${(day.count / max) * 100}%` : "2px" }}
            >
              <div
                className={`h-full w-full rounded-t transition-colors ${
                  day.count > 0 ? "bg-blue-600 group-hover:bg-blue-700" : "bg-slate-200"
                }`}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {day.fullLabel}: <span className="font-semibold">{day.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-3">
        {days.map((day) => (
          <span
            key={day.key}
            className={`flex-1 text-center text-xs ${day.isToday ? "font-semibold text-slate-900" : "text-slate-500"}`}
          >
            {day.isToday ? T.activity.today : day.label}
          </span>
        ))}
      </div>
    </section>
  );
}
