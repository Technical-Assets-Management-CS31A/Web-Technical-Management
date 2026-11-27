import { Loader2, ShieldAlert } from "lucide-react";
import type { ReportCount, ReportDetailDto } from "../../../@types/types";
import ErrorTable from "../../../components/ErrorTables";
import { formatEnum } from "../../../lib/utils";
import { formatShare, formatStat, isEnumLabel, statFormat } from "../../../lib/reports";
import { REPORTS_CONTENT as T } from "../../../constants/reportsContent";
import type { ReportsViewModel } from "../model/reports-view-model";

const inputClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

const rowLabel = (label: string) => (isEnumLabel(label) ? formatEnum(label) : label);
const breakdownTitle = (name: string) =>
  T.breakdowns[name] ?? formatEnum(name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase());

export default function ReportsView(vm: ReportsViewModel) {
  const { isAdmin, selected, range, customFrom, customTo, isPeriodValid, periodText, listQuery, detailQuery, selectReport, setRange, setCustom } = vm;
  const cards = listQuery.data?.reports ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header and period */}
        <header className="mt-12 flex flex-col gap-4 md:mt-0 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.badge}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{T.description}</p>
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-2 lg:items-end">
              <div className="flex flex-wrap items-center gap-2">
                {range === "custom" && (
                  <>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500">
                      {T.fromLabel}
                      <input type="date" value={customFrom} max={customTo} onChange={(e) => setCustom("from", e.target.value)} className={inputClass} />
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500">
                      {T.toLabel}
                      <input type="date" value={customTo} min={customFrom} onChange={(e) => setCustom("to", e.target.value)} className={inputClass} />
                    </label>
                  </>
                )}
                <div className="inline-flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Report period">
                  {T.ranges.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={range === value}
                      onClick={() => setRange(value)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        range === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs tabular-nums text-slate-500" aria-live="polite">
                {periodText ? (
                  <>
                    <span className="font-medium text-slate-700">{periodText.range}</span>
                    <span className="text-slate-400"> · {T.periodDays(periodText.days)}</span>
                  </>
                ) : (
                  <span className="text-rose-600">{T.customInvalid}</span>
                )}
              </p>
            </div>
          )}
        </header>

        {!isAdmin ? (
          <section className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <ShieldAlert className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-900">{T.adminOnly.title}</p>
            <p className="mt-1 text-sm text-slate-500">{T.adminOnly.description}</p>
          </section>
        ) : listQuery.isError ? (
          <section className="rounded-xl border border-slate-200 bg-white">
            <ErrorTable title={T.listError} error={listQuery.error} onRetry={listQuery.refetch} />
          </section>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">

            {/* Contents: each report with its headline figure */}
            <nav aria-label={T.railTitle} className="lg:sticky lg:top-6">
              <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:block">{T.railTitle}</p>
              <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
                {listQuery.isPending
                  ? Array.from({ length: 7 }, (_, i) => (
                      <li key={i} className="h-10 w-32 shrink-0 animate-pulse rounded-lg bg-slate-200/60 lg:w-full" />
                    ))
                  : cards.map((card) => {
                      const isActive = card.key === selected;
                      return (
                        <li key={card.key} className="shrink-0">
                          <button
                            type="button"
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => selectReport(card.key)}
                            className={`relative flex w-full items-baseline justify-between gap-4 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              isActive
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 lg:before:absolute lg:before:-left-px lg:before:top-2 lg:before:bottom-2 lg:before:w-0.5 lg:before:rounded-full lg:before:bg-blue-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            <span className="font-medium">{card.title}</span>
                            <span className={`tabular-nums ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                              {formatStat(card.headline.value, statFormat(card.key, 0))}
                            </span>
                          </button>
                        </li>
                      );
                    })}
              </ul>
            </nav>

            {/* The selected report */}
            <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white" aria-busy={detailQuery.isFetching}>
              {detailQuery.isError ? (
                <ErrorTable title={T.detailError} error={detailQuery.error} onRetry={detailQuery.refetch} />
              ) : detailQuery.data ? (
                <ReportBody
                  report={detailQuery.data}
                  periodLabel={periodText?.range ?? ""}
                  isRefreshing={detailQuery.isFetching && detailQuery.isPlaceholderData}
                />
              ) : (
                <ReportSkeleton show={isPeriodValid} />
              )}
            </article>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportBody({ report, periodLabel, isRefreshing }: { report: ReportDetailDto; periodLabel: string; isRefreshing: boolean }) {
  const [headline, ...rest] = report.stats;
  const breakdowns = Object.entries(report.breakdowns);
  const isEmpty = report.stats.every((s) => s.value === 0);

  return (
    <div className={`transition-opacity ${isRefreshing ? "opacity-60" : ""}`}>
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{report.title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{report.description}</p>
        </div>
        {isRefreshing && <Loader2 className="mt-1.5 h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label={T.refreshing} />}
      </header>

      {/* Headline, then the supporting figures in one row */}
      <section className="flex flex-col gap-6 px-6 py-6 xl:flex-row xl:items-end xl:gap-12">
        {headline && (
          <div className="shrink-0">
            <p className="text-sm text-slate-500">{headline.label}</p>
            <p className="mt-1 text-5xl font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
              {formatStat(headline.value, statFormat(report.key, 0))}
            </p>
            <p className="mt-2 text-xs text-slate-400">{report.key === "stations" ? T.stationsSnapshot : periodLabel}</p>
          </div>
        )}
        {rest.length > 0 && (
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-4 2xl:flex 2xl:flex-wrap 2xl:gap-x-8">
            {rest.map((stat, i) => (
              <div key={`${i}-${stat.label}`} className="min-w-0 border-l border-slate-200 pl-3">
                <dt className="text-xs text-slate-500">{stat.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
                  {formatStat(stat.value, statFormat(report.key, i + 1))}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {isEmpty && <p className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500">{T.emptyReport}</p>}

      {breakdowns.length > 0 && (
        <div className="grid border-t border-slate-200 xl:grid-cols-2">
          {breakdowns.map(([name, rows]) => (
            <Breakdown key={name} title={breakdownTitle(name)} rows={rows} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A breakdown is a small table: one hue for magnitude, numbers in text ink, share of the breakdown total. */
function Breakdown({ title, rows }: { title: string; rows: ReportCount[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <section className="border-slate-200 px-6 py-5 [&:nth-child(n+2)]:border-t xl:[&:nth-child(2)]:border-t-0 xl:even:border-l">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{T.emptyBreakdown}</p>
      ) : (
        <table className="mt-3 w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[48%] sm:w-[38%]" />
            <col />
            <col className="w-14" />
            <col className="w-12" />
          </colgroup>
          <thead className="sr-only">
            <tr>
              <th scope="col">{title}</th>
              <td />
              <th scope="col">{T.columns.count}</th>
              <th scope="col">{T.columns.share}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} title={`${rowLabel(row.label)}: ${row.count} of ${total}`}>
                <td className="truncate py-1.5 pr-3 text-slate-700">{rowLabel(row.label)}</td>
                <td className="py-1.5" aria-hidden="true">
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${(row.count / max) * 100}%` }} />
                  </div>
                </td>
                <td className="py-1.5 text-right font-medium tabular-nums text-slate-900">{row.count}</td>
                <td className="py-1.5 text-right tabular-nums text-slate-400">{formatShare(row.count, total)}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 1 && (
            <tfoot>
              <tr className="border-t border-slate-100">
                <td className="pt-2 text-xs text-slate-500" colSpan={2}>{T.total}</td>
                <td className="pt-2 text-right text-xs font-medium tabular-nums text-slate-700">{total}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </section>
  );
}

function ReportSkeleton({ show }: { show: boolean }) {
  if (!show) return <div className="h-80" />;
  return (
    <div className="animate-pulse" aria-label="Loading report">
      <div className="space-y-2 border-b border-slate-200 px-6 py-5">
        <div className="h-5 w-40 rounded bg-slate-200/70" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
      </div>
      <div className="flex flex-col gap-6 px-6 py-6 xl:flex-row xl:items-end">
        <div className="h-16 w-32 rounded bg-slate-200/70" />
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-10 rounded bg-slate-100" />)}
        </div>
      </div>
      <div className="grid border-t border-slate-200 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-3 px-6 py-5">
            <div className="h-4 w-28 rounded bg-slate-200/70" />
            {Array.from({ length: 4 }, (_, j) => <div key={j} className="h-3 rounded bg-slate-100" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
