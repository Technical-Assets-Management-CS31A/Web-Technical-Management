import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlarmClock, CheckCircle2, TriangleAlert, Truck, UserRound } from "lucide-react";
import { duePhase, type RoomCardModel, type RoomClass } from "../lib/roomBoard";
import { formatCountdown, type BoardCard } from "../lib/statusBoard";
import { useNow } from "../hooks/useNow";
import { FormattedDateTime } from "./FormattedDateTime";
import { DASHBOARD_CONTENT as T } from "../constants/dashboardContent";

const MAX_CHIPS = 8;

/** PRD FR-4.1: one card per lab room. Data comes from the live status board, so it updates with it. */
export default function RoomOccupancyCards({ rooms }: { rooms: RoomCardModel[] }) {
  const now = useNow();

  if (rooms.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400">{T.rooms.empty}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {rooms.map((model) => (
        <RoomCard key={model.room.id} model={model} now={now} />
      ))}
    </div>
  );
}

function RoomCard({ model, now }: { model: RoomCardModel; now: number }) {
  const { room, currentClass, verified, incoming, anomalies, overdue } = model;
  const idle = !currentClass && verified.length + incoming.length + anomalies.length + overdue.length === 0;

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{room.code}</h3>
          <p className="truncate text-xs text-slate-500" title={room.name}>{room.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {anomalies.length > 0 && <CountPill tone="bg-amber-50 text-amber-700" icon={<TriangleAlert className="h-3 w-3" />} value={anomalies.length} label={T.rooms.anomalies} />}
          {overdue.length > 0 && <CountPill tone="bg-rose-50 text-rose-700" icon={<AlarmClock className="h-3 w-3" />} value={overdue.length} label={T.rooms.overdue} />}
        </div>
      </header>

      {idle ? (
        <p className="px-4 py-5 text-sm text-slate-400">{T.rooms.idle}</p>
      ) : (
        <div className="space-y-3 px-4 py-3">
          {currentClass ? <ClassPanel cls={currentClass} now={now} /> : <p className="text-sm text-slate-400">{T.rooms.noClass}</p>}

          <ItemGroup icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />} label={T.rooms.verified} items={verified} empty={T.rooms.noneVerified} />

          {incoming.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <Truck className="h-3.5 w-3.5 text-blue-600" />
                {T.rooms.incoming} · <span className="font-medium tabular-nums text-slate-700">{incoming.length}</span>
              </p>
              <ul className="space-y-1">
                {incoming.map((card) => {
                  const left = card.transitDeadlineAt ? Date.parse(card.transitDeadlineAt) - now : null;
                  return (
                    <li key={card.id} className="flex items-center justify-between gap-3 text-sm">
                      <CardLink card={card} className="truncate text-slate-700">
                        <span className="font-mono text-xs text-slate-500">{card.assetCode}</span> {card.assetName}
                      </CardLink>
                      {left !== null && (
                        <span role="timer" className={`shrink-0 font-mono text-xs font-semibold tabular-nums ${left <= 0 ? "text-rose-600" : left <= 2 * 60_000 ? "text-amber-600" : "text-blue-700"}`}>
                          {left <= 0 ? T.board.windowExpired : formatCountdown(left)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {anomalies.length > 0 && <ItemGroup icon={<TriangleAlert className="h-3.5 w-3.5 text-amber-600" />} label={T.rooms.anomalies} items={anomalies} tone="border-amber-200 bg-amber-50 text-amber-800" />}
          {overdue.length > 0 && <ItemGroup icon={<AlarmClock className="h-3.5 w-3.5 text-rose-600" />} label={T.rooms.overdue} items={overdue} tone="border-rose-200 bg-rose-50 text-rose-800" />}
        </div>
      )}
    </article>
  );
}

/** Current class and the countdown to its due time, grace included (FR-4.1). */
function ClassPanel({ cls, now }: { cls: RoomClass; now: number }) {
  const due = duePhase(cls, now);
  const tone =
    due?.phase === "OVERDUE" ? "text-rose-600" : due?.phase === "GRACE" ? "text-amber-600" : "text-slate-900";

  return (
    <div className="flex items-end justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-800">
          <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{cls.instructor?.fullName ?? T.rooms.noInstructor}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {cls.sections.length > 0 ? cls.sections.join(", ") : T.rooms.noSection}
          {cls.classEndsAt && <> · {T.rooms.classEnds} {FormattedDateTime(cls.classEndsAt)}</>}
        </p>
      </div>
      {due && (
        <div className="shrink-0 text-right">
          <p role="timer" className={`font-mono text-lg font-semibold leading-tight tabular-nums ${tone}`}>
            {due.phase === "OVERDUE" ? T.board.dueNow : formatCountdown(due.msLeft)}
          </p>
          <p className="text-[11px] text-slate-500">
            {due.phase === "GRACE" ? T.rooms.inGrace : T.rooms.untilDue(cls.graceMinutes)}
          </p>
        </div>
      )}
    </div>
  );
}

function ItemGroup({ icon, label, items, empty, tone = "border-slate-200 bg-white text-slate-700" }: {
  icon: ReactNode;
  label: string;
  items: BoardCard[];
  empty?: string;
  tone?: string;
}) {
  if (items.length === 0 && !empty) return null;
  const shown = items.slice(0, MAX_CHIPS);
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">
        {icon}
        {label} · <span className="font-medium tabular-nums text-slate-700">{items.length}</span>
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {shown.map((card) => (
            <li key={card.id}>
              <CardLink card={card} className={`inline-block rounded border px-1.5 py-0.5 font-mono text-xs hover:opacity-80 ${tone}`} title={`${card.assetName}${card.holder ? ` · ${card.holder}` : ""}`}>
                {card.assetCode}
              </CardLink>
            </li>
          ))}
          {items.length > shown.length && <li className="px-1 py-0.5 text-xs text-slate-500">{T.rooms.more(items.length - shown.length)}</li>}
        </ul>
      )}
    </div>
  );
}

function CardLink({ card, className, title, children }: { card: BoardCard; className?: string; title?: string; children: ReactNode }) {
  if (!card.loanId) return <span className={className} title={title}>{children}</span>;
  return (
    <Link to="/home/loans/$loanId" params={{ loanId: card.loanId }} className={className} title={title}>
      {children}
    </Link>
  );
}

function CountPill({ tone, icon, value, label }: { tone: string; icon: ReactNode; value: number; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`} title={label}>
      {icon}
      {value}
    </span>
  );
}
