import { Info, Loader2, ShieldAlert } from "lucide-react";
import type { ReportCount, ReportDetailDto } from "../../../@types/types";
import ErrorTable from "../../../components/ErrorTables";
import { formatEnum } from "../../../lib/utils";
import { formatStat, isEnumLabel, statFormat } from "../../../lib/reports";
import { REPORT_TONES, REPORTS_CONTENT as T } from "../../../constants/reportsContent";
import { REPORT_ICONS, type ReportsViewModel } from "../model/reports-view-model";

const inputClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

export default function ReportsView(vm: ReportsViewModel) {
  const { isAdmin, selected, range, customFrom, customTo, isPeriodValid, periodText, listQuery, detailQuery, selectReport, setRange, setCustom } = vm;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header and period */}
        <header className="mt-12 flex flex-col gap-4 md:mt-0 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.badge}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{T.description}</p>
          </div>
          {isAdmin && (
            <div className="flex flex-col gap-2 lg:items-end">
              <div className="inline-flex self-start rounded-lg bg-slate-100 p-1 lg:self-auto" role="group" aria-label="Report period">
                {T.ranges.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={range === value}
                    onClick={() => setRange(value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      range === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {range === "custom" && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="flex items-center gap-1.5 text-slate-600">
                    {T.fromLabel}
                    <input type="date" value={customFrom} max={customTo} onChange={(e) => setCustom("from", e.target.value)} className={inputClass} />
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-600">
                    {T.toLabel}
                    <input type="date" value={customTo} min={customFrom} onChange={(e) => setCustom("to", e.target.value)} className={inputClass} />
                  </label>
                </div>
              )}
              <p className="flex items-center gap-1.5 text-xs text-slate-500" aria-live="polite">
                {isPeriodValid ? periodText : <span className="text-rose-600">{T.customInvalid}</span>}
                {listQuery.isFetching && listQuery.isPlaceholderData && <Loader2 className="h-3 w-3 animate-spin" aria-label={T.refreshing} />}
              </p>
            </div>
          )}
        </header>

        {!isAdmin ? (
          <section className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900">{T.adminOnly.title}</p>
            <p className="mt-1 text-sm text-slate-500">{T.adminOnly.description}</p>
          </section>
        ) : (
          <>
            {/* Report cards: one headline each */}
            {listQuery.isError ? (
              <section className="rounded-xl border border-slate-200 bg-white">
                <ErrorTable title={T.listError} error={listQuery.error} onRetry={listQuery.refetch} />
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Reports">
                {listQuery.isPending
                  ? Array.from({ length: 7 }, (_, i) => <div key={i} className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white" />)
                  : listQuery.data?.reports.map((card) => {
                      const Icon = REPORT_ICONS[card.key] ?? Info;
                      const isActive = card.key === selected;
                      return (
                        <button
                          key={card.key}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => selectReport(card.key)}
                          className={`flex items-start justify-between gap-3 rounded-xl border bg-white p-4 text-left transition-all hover:shadow-sm ${
                            isActive ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{card.title}</p>
                            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                              {formatStat(card.headline.value, statFormat(card.key, 0))}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{card.headline.label}</p>
                          </div>
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${REPORT_TONES[card.key]?.tile ?? "bg-slate-100 text-slate-500"}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                        </button>
                      );
                    })}
              </section>
            )}

            {/* Selected report */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {detailQuery.isError ? (
                <ErrorTable title={T.detailError} error={detailQuery.error} onRetry={detailQuery.refetch} />
              ) : !detailQuery.data ? (
                <div className="flex h-64 items-center justify-center">
                  {isPeriodValid && <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-label="Loading report" />}
                </div>
              ) : (
                <ReportDetail report={detailQuery.data} isRefreshing={detailQuery.isFetching && detailQuery.isPlaceholderData} />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ReportDetail({ report, isRefreshing }: { report: ReportDetailDto; isRefreshing: boolean }) {
  const breakdowns = Object.entries(report.breakdowns);
  const bar = REPORT_TONES[report.key]?.bar ?? "bg-slate-400";

  return (
    <div className={isRefreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          {report.title}
          {isRefreshing && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" aria-label={T.refreshing} />}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">{report.description}</p>
        {report.key === "stations" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Info className="h-3.5 w-3.5" /> {T.stationsSnapshot}
          </p>
        )}
      </div>

      {/* Stats: the first is the headline */}
      <dl className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-4">
        {report.stats.map((stat, i) => (
          <div key={`${i}-${stat.label}`} className="bg-white px-5 py-4">
            <dt className="truncate text-xs text-slate-500" title={stat.label}>{stat.label}</dt>
            <dd className={`mt-1 font-semibold tracking-tight tabular-nums text-slate-900 ${i === 0 ? "text-2xl" : "text-xl"}`}>
              {formatStat(stat.value, statFormat(report.key, i))}
            </dd>
          </div>
        ))}
      </dl>

      {breakdowns.length > 0 && (
        <div className="border-t border-slate-200 px-5 py-5">
          <h3 className="text-sm font-semibold text-slate-900">{T.breakdownsTitle}</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {breakdowns.map(([name, rows]) => (
              <Breakdown key={name} title={T.breakdowns[name] ?? formatEnum(name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase())} rows={rows} bar={bar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Breakdown({ title, rows, bar }: { title: string; rows: ReportCount[]; bar: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm italic text-slate-400">{T.emptyBreakdown}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-slate-700" title={row.label}>
                  {isEnumLabel(row.label) ? formatEnum(row.label) : row.label}
                </span>
                <span className="shrink-0 tabular-nums text-slate-900">
                  {row.count}
                  <span className="ml-1.5 text-xs text-slate-400">{Math.round((row.count / total) * 100)}%</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${(row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
