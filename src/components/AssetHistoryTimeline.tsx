import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Camera, ExternalLink, History, RefreshCw } from "lucide-react";
import type { LedgerEntryDto, LedgerEvent } from "../@types/types";
import { useAssetHistory } from "../hooks/assetHooks";
import { ASSET_HISTORY_CONTENT as T } from "../constants/assetHistoryContent";
import {
  filterHistory,
  groupHistoryByLoan,
  statusChangeOf,
  summarizeHistory,
  type HistoryFilter,
  type LoanGroup,
  type LoanOutcome,
} from "../lib/assetHistory";
import { ImageLightbox, ZoomableImage } from "./ArchiveDetailShell";
import { FormattedDateTime } from "./FormattedDateTime";
import { SlugStatus } from "./SlugStatus";
import { formatEnum } from "../lib/utils";

// PRD 6.5 asset detail: history timeline with loans, status changes and checkout photos (GET /assets/{id}/history).

const EVENT_DOT: Record<LedgerEvent, string> = {
  CHECKOUT: "bg-blue-500",
  ROOM_VERIFIED: "bg-emerald-500",
  LATE_ARRIVAL_WARNING: "bg-amber-500",
  RETURN: "bg-slate-400",
  OVERDUE: "bg-orange-500",
  MARKED_MISSING: "bg-rose-500",
  SETTLED: "bg-violet-500",
};

const OUTCOME_PILL: Record<LoanOutcome, string> = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-200",
  RETURNED: "bg-slate-50 text-slate-600 ring-slate-200",
  MISSING: "bg-rose-50 text-rose-700 ring-rose-200",
  SETTLED: "bg-violet-50 text-violet-700 ring-violet-200",
};

const FILTERS: HistoryFilter[] = ["ALL", "STATUS", "PHOTOS"];

export default function AssetHistoryTimeline({ assetId }: { assetId: string }) {
  const { data: history = [], isLoading, isError, refetch, isFetching } = useQuery(useAssetHistory(assetId));
  const [filter, setFilter] = useState<HistoryFilter>("ALL");
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  const groups = useMemo(() => groupHistoryByLoan(history), [history]);
  const summary = useMemo(() => summarizeHistory(groups), [groups]);
  const visible = useMemo(() => filterHistory(groups, filter), [groups, filter]);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4 text-slate-400" />
            {T.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{T.subtitle}</p>
          {groups.length > 0 && (
            <p className="mt-1 text-xs font-medium text-slate-600">
              {[T.summary.loans(summary.loans), T.summary.statusChanges(summary.statusChanges), T.summary.photos(summary.photos)].join(" · ")}
            </p>
          )}
        </div>
        {groups.length > 0 && (
          <div role="tablist" aria-label={T.title} className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {T.filters[f]}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label={T.loading}>
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            {T.error}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            {T.retry}
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          {groups.length === 0 ? T.empty : T.emptyFiltered}
        </p>
      ) : (
        <ol className="space-y-4">
          {visible.map((group) => (
            <LoanBlock key={group.loanId} group={group} onZoom={(src) => setZoom({ src, alt: T.photo.alt(group.borrower) })} />
          ))}
        </ol>
      )}

      {zoom && <ImageLightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </section>
  );
}

function LoanBlock({ group, onZoom }: { group: LoanGroup; onZoom: (src: string) => void }) {
  const isLoan = !group.loanId.startsWith("entry:");

  return (
    <li className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        {group.checkoutAt && (
          <div className="sm:w-40 flex-shrink-0">
            {group.photoUrl ? (
              <ZoomableImage
                src={group.photoUrl}
                alt={T.photo.alt(group.borrower)}
                emptyLabel={T.photo.empty}
                className="aspect-[4/3] w-full"
                onZoom={onZoom}
              />
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                <Camera className="h-5 w-5" />
                <span className="text-xs font-medium">{group.approvedBy ? T.photo.empty : T.loan.eventLoan}</span>
              </div>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{group.borrower ?? T.loan.noBorrower}</p>
              {group.approvedBy && (
                <p className="text-xs text-slate-500">
                  {T.loan.approvedBy} {group.approvedBy}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${OUTCOME_PILL[group.outcome]}`}>
                {T.outcome[group.outcome]}
              </span>
              {isLoan && (
                <Link
                  to="/home/loans/$loanId"
                  params={{ loanId: group.loanId }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {T.loan.openLoan}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          <ol className="relative space-y-3 border-l border-slate-200 pl-5">
            {group.entries.map((entry) => (
              <EventRow key={entry.id} entry={entry} />
            ))}
          </ol>
        </div>
      </div>
    </li>
  );
}

function EventRow({ entry }: { entry: LedgerEntryDto }) {
  const change = statusChangeOf(entry);
  const who = entry.actor?.fullName ?? entry.actorStation?.stationCode ?? null;

  return (
    <li className="relative">
      <span
        aria-hidden
        className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${EVENT_DOT[entry.event] ?? "bg-slate-400"}`}
      />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-sm font-medium text-slate-900">{T.event[entry.event] ?? formatEnum(entry.event)}</p>
        {change && (
          <span
            className="inline-flex items-center gap-1 text-xs"
            title={change.inferred ? T.inferredHint : undefined}
            aria-label={`${T.statusTo}: ${change.from ? `${formatEnum(change.from)} to ` : ""}${formatEnum(change.to)}`}
          >
            {change.from && (
              <>
                <span className={`rounded-full px-2 py-0.5 font-medium ${SlugStatus(change.from)}`}>{formatEnum(change.from)}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </>
            )}
            {!change.from && <ArrowRight className="h-3 w-3 text-slate-400" />}
            <span className={`rounded-full px-2 py-0.5 font-medium ${SlugStatus(change.to)}`}>{formatEnum(change.to)}</span>
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        {FormattedDateTime(entry.occurredAt)}
        {who && ` · ${T.by(who)}`}
      </p>
    </li>
  );
}
