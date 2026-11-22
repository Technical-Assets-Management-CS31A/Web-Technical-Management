import { Link } from "@tanstack/react-router";
import { CheckCheck, CircleCheck, Eye, Info, Search } from "lucide-react";
import type { AnomalyStatus, AnomalyType } from "../../../@types/types";
import SearchBar from "../../../components/SearchBar";
import ErrorTable from "../../../components/ErrorTables";
import ReasonDialog from "../../../components/ReasonDialog";
import { getErrorMessage } from "../../../components/form/FormKit";
import { FormattedDateTime } from "../../../components/FormattedDateTime";
import { UserSkeletonLoader } from "../../../components/UserSkeletonLoader";
import { ANOMALY_TYPES, detectedAtOf, formatAge, type AnomalyTypeFilter } from "../../../lib/anomalies";
import { ANOMALIES_CONTENT as T } from "../../../constants/anomaliesContent";
import { TYPE_STYLE, STATUS_TONE, type AnomaliesViewModel } from "../model/anomalies-view-model";

export default function AnomaliesView(vm: AnomaliesViewModel) {
  const {
    canHandle,
    view,
    type,
    now,
    activeQuery,
    resolve,
    search,
    setSearch,
    toResolve,
    setToResolve,
    active,
    current,
    rows,
    stats,
    setSearchParams,
    onAcknowledge,
    onResolve,
    isAcknowledging,
  } = vm;

  if (activeQuery.isPending) return <UserSkeletonLoader />;

  const headers = view === "active" ? T.activeHeaders : T.resolvedHeaders;
  const showActions = canHandle && view === "active";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header className="mt-12 md:mt-0">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.badge}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{T.description}</p>
        </header>

        {/* Summary: counts are for the active queue */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400" title={stat.sub}>{stat.sub}</p>
              </div>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* Queue */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                {T.views.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSearchParams({ view: value })}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      view === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {label}
                    {value === "active" && <span className="ml-1.5 tabular-nums text-slate-400">{active.length}</span>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">{T.countLabel(rows.length)}</p>
            </div>

            <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center xl:justify-end">
              <div className="inline-flex shrink-0 flex-wrap rounded-lg bg-slate-100 p-1">
                {(["all", ...ANOMALY_TYPES] as AnomalyTypeFilter[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSearchParams({ type: value })}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      type === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {value === "all" ? T.allTypes : T.types[value].label}
                  </button>
                ))}
              </div>
              <SearchBar onChangeValue={setSearch} name={T.searchName} placeholder={T.searchPlaceholder} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
              {current.isError ? (
                <ErrorTable error={current.error} onRetry={() => current.refetch()} />
              ) : current.isPending ? (
                <p className="px-5 py-20 text-center text-sm text-slate-400">Loading…</p>
              ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    {view === "active" && type === "all" && !search ? <CircleCheck className="h-5 w-5 text-emerald-500" /> : <Search className="h-5 w-5 text-slate-400" />}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{T.empty[view].title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">{T.empty[view].description}</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50">
                      {headers.map((col) => (
                        <th key={col} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">{col}</th>
                      ))}
                      {showActions && <th className="border-b border-slate-200 px-5 py-3" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((anomaly) => (
                      <tr key={anomaly.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3"><TypeCell type={anomaly.type} /></td>
                        <td className="px-5 py-3">
                          <p className="font-mono text-xs font-medium text-slate-900">{anomaly.asset.assetCode}</p>
                          <p className="max-w-[220px] truncate text-xs text-slate-500" title={anomaly.asset.name}>{anomaly.asset.name}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-slate-700">{anomaly.room ? anomaly.room.code : T.noRoom}</p>
                          {anomaly.station && <p className="font-mono text-xs text-slate-500">{anomaly.station.stationCode}</p>}
                        </td>
                        <td className="px-5 py-3">
                          {anomaly.loan ? (
                            <Link to="/home/loans/$loanId" params={{ loanId: anomaly.loan.id }} className="font-mono text-xs font-medium text-blue-600 hover:underline">
                              {anomaly.loan.loanNo}
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">{T.noLoan}</span>
                          )}
                        </td>
                        {view === "active" ? (
                          <>
                            <td className="px-5 py-3">
                              <p className="text-slate-700">{FormattedDateTime(detectedAtOf(anomaly))}</p>
                              <p className="text-xs text-slate-500">{T.waiting(formatAge(detectedAtOf(anomaly), now))}</p>
                            </td>
                            <td className="px-5 py-3">
                              <StatusPill status={anomaly.status} />
                              {anomaly.acknowledgedBy && <p className="mt-1 text-xs text-slate-500">{T.by(anomaly.acknowledgedBy.fullName)}</p>}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3">
                              <p className="text-slate-700">{anomaly.resolvedAt ? FormattedDateTime(anomaly.resolvedAt) : "—"}</p>
                              {anomaly.resolvedBy && <p className="text-xs text-slate-500">{T.by(anomaly.resolvedBy.fullName)}</p>}
                            </td>
                            <td className="max-w-[320px] whitespace-normal px-5 py-3 text-slate-600">{anomaly.resolutionNote ?? "—"}</td>
                          </>
                        )}
                        {showActions && (
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-1">
                              {anomaly.status === "OPEN" && (
                                <button
                                  type="button"
                                  onClick={() => onAcknowledge(anomaly)}
                                  disabled={isAcknowledging(anomaly)}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  {T.actions.acknowledge}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  resolve.reset();
                                  setToResolve(anomaly);
                                }}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                                {T.actions.resolve}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {!canHandle && (
            <p className="flex items-start gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{T.readOnly}</span>
            </p>
          )}
        </section>
      </div>

      {toResolve && (
        <ReasonDialog
          title={T.resolveDialog.title}
          subtitle={T.resolveDialog.subtitle}
          confirmLabel={T.resolveDialog.confirm}
          tone="success"
          fieldLabel={T.resolveDialog.fieldLabel}
          hint={T.resolveDialog.hint}
          placeholder={T.resolveDialog.placeholder}
          requiredMessage={T.resolveDialog.error}
          isSubmitting={resolve.isPending}
          error={resolve.isError ? getErrorMessage(resolve.error, T.toast.failedMessage) : undefined}
          onClose={() => setToResolve(null)}
          onConfirm={(note) => onResolve(toResolve, note)}
        >
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <TypeCell type={toResolve.type} />
            <span className="ml-auto text-right text-xs text-slate-500">
              <span className="block font-mono font-medium text-slate-800">{toResolve.asset.assetCode}</span>
              {[toResolve.room?.code, toResolve.station?.stationCode].filter(Boolean).join(" · ")}
            </span>
          </div>
        </ReasonDialog>
      )}
    </div>
  );
}

function TypeCell({ type }: { type: AnomalyType }) {
  const style = TYPE_STYLE[type] ?? TYPE_STYLE.WRONG_ROOM;
  const text = T.types[type] ?? { label: type, hint: "" };
  return (
    <span className="inline-flex items-center gap-2.5" title={text.hint}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.tone}`}>
        <style.icon className="h-4 w-4" />
      </span>
      <span className="font-medium text-slate-900">{text.label}</span>
    </span>
  );
}

function StatusPill({ status }: { status: AnomalyStatus }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_TONE[status] ?? STATUS_TONE.OPEN}`}>
      {T.statuses[status] ?? status}
    </span>
  );
}
