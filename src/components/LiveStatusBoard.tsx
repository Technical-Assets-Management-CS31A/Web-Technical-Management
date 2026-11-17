import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlarmClock, CheckCircle2, MapPin, Package, TriangleAlert, Truck } from "lucide-react";
import { BOARD_COLUMNS, formatCountdown, formatSpan, type BoardCard, type BoardColumn } from "../lib/statusBoard";
import { MOVED_HIGHLIGHT_MS } from "../hooks/useStatusBoard";
import { DASHBOARD_CONTENT as T } from "../constants/dashboardContent";

const COLUMN_STYLE: Record<BoardColumn, { icon: ReactNode; dot: string; count: string }> = {
  AT_COUNTER: { icon: <Package className="h-4 w-4" />, dot: "bg-indigo-500", count: "bg-indigo-50 text-indigo-700" },
  IN_TRANSIT: { icon: <Truck className="h-4 w-4" />, dot: "bg-blue-500", count: "bg-blue-50 text-blue-700" },
  VERIFIED: { icon: <CheckCircle2 className="h-4 w-4" />, dot: "bg-emerald-500", count: "bg-emerald-50 text-emerald-700" },
  ANOMALY: { icon: <TriangleAlert className="h-4 w-4" />, dot: "bg-amber-500", count: "bg-amber-50 text-amber-700" },
  OVERDUE: { icon: <AlarmClock className="h-4 w-4" />, dot: "bg-rose-500", count: "bg-rose-50 text-rose-700" },
};

/** Current time, ticking every `ms`. */
const useNow = (ms = 1000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
};

type Props = {
  columns: Record<BoardColumn, BoardCard[]>;
  moved: ReadonlyMap<string, number>;
};

/** PRD FR-4.2 status board. Cards move between columns as SignalR events arrive (see useStatusBoard). */
export default function LiveStatusBoard({ columns, moved }: Props) {
  const now = useNow();

  return (
    <section aria-label={T.board.title} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {BOARD_COLUMNS.map((column) => {
        const cards = columns[column];
        const style = COLUMN_STYLE[column];
        return (
          <div key={column} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="text-slate-400">{style.icon}</span>
                {T.board.columns[column].title}
              </h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${style.count}`} aria-live="polite">
                {cards.length}
              </span>
            </header>

            <ul className="flex max-h-[32rem] min-h-32 flex-1 flex-col gap-2 overflow-y-auto p-3">
              {cards.length === 0 ? (
                <li className="flex flex-1 items-center justify-center px-2 py-6 text-center text-xs text-slate-400">
                  {T.board.columns[column].empty}
                </li>
              ) : (
                cards.map((card) => (
                  <li key={card.id}>
                    <StatusCard card={card} dot={style.dot} now={now} justMoved={now - (moved.get(card.id) ?? -Infinity) < MOVED_HIGHLIGHT_MS} />
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function StatusCard({ card, dot, now, justMoved }: { card: BoardCard; dot: string; now: number; justMoved: boolean }) {
  const body = (
    <div
      className={`rounded-lg border px-3 py-2.5 text-left transition-colors duration-700 ${
        justMoved ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900" title={card.assetName}>{card.assetName}</p>
          <p className="font-mono text-xs text-slate-500">{card.assetCode}</p>
        </div>
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
      </div>

      <p className="mt-1.5 truncate text-xs text-slate-600" title={card.holder ?? undefined}>
        {card.holder ?? T.board.noHolder}
        {card.sectionCode && <span className="text-slate-400"> · {card.sectionCode}</span>}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-1 text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{card.roomCode ?? (card.isEvent ? T.board.event : T.board.noRoom)}</span>
        </span>
        <CardTimer card={card} now={now} />
      </div>
    </div>
  );

  if (!card.loanId) return body;
  return (
    <Link to="/home/loans/$loanId" params={{ loanId: card.loanId }} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
      {body}
    </Link>
  );
}

/** The one number that matters for each column. */
function CardTimer({ card, now }: { card: BoardCard; now: number }) {
  const since = (iso: string | null) => (iso ? now - Date.parse(iso) : 0);
  const until = (iso: string | null) => (iso ? Date.parse(iso) - now : 0);

  switch (card.column) {
    case "AT_COUNTER":
      return <span className="shrink-0 text-slate-500">{card.stationCode ?? T.board.counter} · {formatSpan(since(card.startedAt))}</span>;

    case "IN_TRANSIT": {
      // US-08: countdown from the transit window (10:00 by default) to the room check-in deadline.
      if (!card.transitDeadlineAt) return <span className="shrink-0 text-slate-500">{T.board.out(formatSpan(since(card.startedAt)))}</span>;
      const left = until(card.transitDeadlineAt);
      const tone = left <= 0 ? "text-rose-600" : left <= 2 * 60_000 ? "text-amber-600" : "text-blue-700";
      return (
        <span className={`shrink-0 font-mono font-semibold tabular-nums ${tone}`} title={T.board.transitHint} role="timer">
          {left <= 0 ? T.board.windowExpired : formatCountdown(left)}
        </span>
      );
    }

    case "VERIFIED": {
      const left = until(card.dueAt);
      return <span className="shrink-0 text-slate-500">{left > 0 ? T.board.dueIn(formatSpan(left)) : T.board.dueNow}</span>;
    }

    case "ANOMALY":
      return <span className="shrink-0 text-amber-700">{T.board.out(formatSpan(since(card.startedAt)))}</span>;

    case "OVERDUE":
      return <span className="shrink-0 font-medium text-rose-600">{T.board.late(formatSpan(since(card.dueAt)))}</span>;
  }
}
