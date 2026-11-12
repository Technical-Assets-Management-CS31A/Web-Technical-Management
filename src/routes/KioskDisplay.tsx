import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock,
  Hand,
  Info,
  Loader2,
  MonitorSmartphone,
  ShieldX,
  XCircle,
} from "lucide-react";
import type { CheckoutSessionDto } from "../@types/types";
import { useKioskDisplay, type KioskDisplay as Display } from "../hooks/useKioskDisplay";
import { useAllStations } from "../hooks/roomHooks";
import {
  IDLE_LCD,
  currentStepIndex,
  describeSession,
  secondsLeft,
  stepsFor,
  toLcdLines,
  type DisplayTone,
} from "../lib/kioskDisplay";
import { formatEnum } from "../lib/utils";
import { KIOSK_DISPLAY_CONTENT as T } from "../constants/kioskDisplayContent";

// Kiosk confirmation view (PRD 6.2, 6.7) for the counter computer, next to the kiosk.
// Shows the step the kiosk session is on and how it ended (approved, declined, denied with reason),
// with a mirror of the 20x4 LCD. Read-only: the kiosk's own buttons confirm or cancel.

const TONE: Record<DisplayTone | "idle", { panel: string; icon: React.ElementType; iconClass: string }> = {
  idle: { panel: "border-slate-200 bg-white", icon: MonitorSmartphone, iconClass: "bg-slate-100 text-slate-500" },
  progress: { panel: "border-blue-200 bg-blue-50/60", icon: Loader2, iconClass: "bg-blue-100 text-blue-700" },
  action: { panel: "border-amber-200 bg-amber-50/70", icon: Hand, iconClass: "bg-amber-100 text-amber-700" },
  success: { panel: "border-emerald-200 bg-emerald-50/70", icon: CheckCircle2, iconClass: "bg-emerald-100 text-emerald-700" },
  declined: { panel: "border-rose-200 bg-rose-50/70", icon: XCircle, iconClass: "bg-rose-100 text-rose-700" },
  denied: { panel: "border-rose-300 bg-rose-50", icon: ShieldX, iconClass: "bg-rose-100 text-rose-700" },
  neutral: { panel: "border-slate-200 bg-slate-50", icon: Ban, iconClass: "bg-slate-200 text-slate-600" },
};

export default function KioskDisplay() {
  const navigate = useNavigate();
  const { station } = useSearch({ strict: false }) as { station?: string };
  const { display, now, holdUntil, isError } = useKioskDisplay(station);
  const { data: stationsData } = useQuery(useAllStations());

  const counterStations = useMemo(
    () =>
      (Array.isArray(stationsData) ? stationsData : [])
        .filter((s) => s.type === "COUNTER_KIOSK" && !s.deletedAt)
        .sort((a, b) => a.stationCode.localeCompare(b.stationCode)),
    [stationsData],
  );

  const session = display.kind === "idle" ? null : display.session;
  const lcd = toLcdLines(session ? session.lcdLines : IDLE_LCD);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Link to="/home/rfid-controller" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              {T.back}
            </Link>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
              {T.station}
              <select
                value={station ?? ""}
                onChange={(e) =>
                  navigate({ to: "/counter-display", search: e.target.value ? { station: e.target.value } : {}, replace: true })
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">{T.allStations}</option>
                {counterStations.map((s) => (
                  <option key={s.id} value={s.stationCode}>{s.stationCode}</option>
                ))}
                {station && !counterStations.some((s) => s.stationCode === station) && <option value={station}>{station}</option>}
              </select>
            </label>
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${isError ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
              {!isError && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
              {isError ? T.connection.offline : T.connection.live}
            </span>
          </div>
        </header>

        {isError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">{T.loadError}</p>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <StatusPanel display={display} now={now} holdUntil={holdUntil} />

          <div className="space-y-4">
            <LcdMirror lines={lcd} showButtons={session?.status === "AWAITING_CONFIRM" && display.kind === "running"} />
            {session && <SessionDetails session={session} />}
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{T.footerHint}</span>
        </p>
      </div>
    </div>
  );
}

function StatusPanel({ display, now, holdUntil }: { display: Display; now: number; holdUntil: number | null }) {
  if (display.kind === "idle") {
    const tone = TONE.idle;
    return (
      <section className={`flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border px-8 py-12 text-center ${tone.panel}`} aria-live="polite">
        <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tone.iconClass}`}>
          <tone.icon className="h-8 w-8" />
        </span>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{T.idle.title}</p>
          <p className="mx-auto mt-2 max-w-md text-base text-slate-600">{T.idle.detail}</p>
        </div>
      </section>
    );
  }

  const { session } = display;
  const ending = display.kind === "ending";
  const state = ending
    ? { tone: "neutral" as const, title: T.ending.title, detail: display.failed ? T.ending.failed : T.ending.checking }
    : describeSession(session);
  const tone = TONE[state.tone];
  const steps = stepsFor(session.type);
  const stepIndex = ending ? -1 : currentStepIndex(session);
  const expires = display.kind === "running" ? secondsLeft(session, now) : null;
  const spin = state.tone === "progress" || (ending && !display.failed);
  const holdLeft = holdUntil ? Math.max(0, Math.ceil((holdUntil - now) / 1000)) : null;

  return (
    <section className={`flex min-h-80 flex-col gap-6 rounded-2xl border px-6 py-8 sm:px-8 ${tone.panel}`} aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
        <span className="font-mono">{session.station.stationCode} · {T.sessionType(formatEnum(session.type))}</span>
        {expires !== null && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 tabular-nums ${expires <= 15 ? "bg-rose-100 text-rose-700" : "bg-white/80 text-slate-600"}`}>
            <Clock className="h-3.5 w-3.5" />
            {T.expiresIn(expires)}
          </span>
        )}
        {holdLeft !== null && (
          <span className="rounded-full bg-white/80 px-2 py-0.5 tabular-nums text-slate-600">{T.backToIdle(holdLeft)}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tone.iconClass}`}>
          {ending ? (
            spin ? <Loader2 className="h-8 w-8 animate-spin" /> : <Info className="h-8 w-8" />
          ) : (
            <tone.icon className={`h-8 w-8 ${spin ? "animate-spin" : ""}`} />
          )}
        </span>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{state.title}</p>
          {state.detail && <p className="mx-auto mt-2 max-w-md text-base text-slate-600">{state.detail}</p>}
        </div>
      </div>

      <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Session steps">
        {steps.map((step, i) => {
          const failedHere = display.kind === "result" && session.status !== "COMPLETED";
          return (
            <li
              key={step.status}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                i < stepIndex
                  ? "bg-emerald-100 text-emerald-800"
                  : i === stepIndex && !failedHere
                    ? "bg-blue-600 text-white"
                    : "bg-white/80 text-slate-500 ring-1 ring-inset ring-slate-200"
              }`}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LcdMirror({ lines, showButtons }: { lines: string[]; showButtons: boolean }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{T.lcd.title}</p>
        <p className="text-xs text-slate-500">{T.lcd.caption}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border-4 border-slate-800 bg-[#1e3a8a] p-3 shadow-inner">
        <pre className="font-mono text-[13px] leading-6 text-sky-100 sm:text-sm" aria-label={lines.map((l) => l.trim()).filter(Boolean).join(". ")}>
          {lines.join("\n")}
        </pre>
      </div>
      {showButtons && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
            <span className="font-mono text-sm font-bold">{T.lcd.ok}</span> · {T.lcd.okHint}
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
            <span className="font-mono text-sm font-bold">{T.lcd.cancel}</span> · {T.lcd.cancelHint}
          </div>
        </div>
      )}
    </section>
  );
}

function SessionDetails({ session }: { session: CheckoutSessionDto }) {
  const rows: [string, string | null][] = [
    [T.fields.instructor, session.instructor?.fullName ?? null],
    [T.fields.student, session.student?.fullName ?? null],
    [T.fields.asset, session.asset ? `${session.asset.assetCode} · ${session.asset.name}` : null],
    [T.fields.room, session.destinationRoom ? `${session.destinationRoom.code} — ${session.destinationRoom.name}` : null],
    [T.fields.classLength, session.classLengthMinutes ? T.classLength(session.classLengthMinutes) : null],
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className={`truncate font-medium ${value ? "text-slate-900" : "text-slate-400"}`} title={value ?? undefined}>{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {session.photoUrl && (
        <img src={session.photoUrl} alt={T.photoAlt} className="mt-4 aspect-video w-full rounded-lg border border-slate-200 bg-slate-100 object-cover" />
      )}
    </section>
  );
}
