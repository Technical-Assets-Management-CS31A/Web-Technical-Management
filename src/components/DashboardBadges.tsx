import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type BadgesProps = {
  name: string;
  link: string;
  data: number | null;
  icon: ReactNode;
};

export default function DashboardBadges({ name, link, data, icon }: BadgesProps) {
  return (
    <Link
      to={link}
      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
    >
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{name}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {(data ?? 0).toLocaleString()}
        </p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
        {icon}
      </span>
    </Link>
  );
}
