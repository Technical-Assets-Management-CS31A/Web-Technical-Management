import { useMemo } from "react";
import type { TRecentBorrowItemProps } from "../@types/types";
import { SlugStatus } from "./SlugStatus";
import { DASHBOARD_CONTENT as T } from "../constants/dashboardContent";

export default function DashboardStatusOverview({ records }: { records: TRecentBorrowItemProps[] }) {
  const statuses = useMemo(() => {
    const counts = new Map<string, number>();
    records.forEach((record) => {
      if (!record.status) return;
      counts.set(record.status, (counts.get(record.status) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const total = records.length;

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{T.statusOverview.title}</h2>
        <p className="text-sm text-slate-500">
          {total.toLocaleString()} {T.statusOverview.description}
        </p>
      </div>

      {statuses.length > 0 ? (
        <ul className="mt-5 space-y-4">
          {statuses.map(({ status, count }) => {
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <li key={status}>
                <div className="flex items-center justify-between text-sm">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(status)}`}>{status}</span>
                  <span className="text-slate-500 tabular-nums">
                    <span className="font-semibold text-slate-900">{count}</span> · {percent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-400" style={{ width: `${percent}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-center text-sm text-slate-500">{T.statusOverview.empty}</p>
      )}
    </section>
  );
}
