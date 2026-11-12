import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Camera, CheckCircle2, Info, Loader2, MonitorSmartphone } from "lucide-react";
import { useActiveKioskSessions } from "../hooks/loanHooks";
import { formatEnum } from "../lib/utils";
import type { CheckoutSessionDto } from "../@types/types";
import { RFID_CONTROLLER_CONTENT as T } from "../constants/rfidControllerContent";

// Counter screen: follows the kiosk sessions. The checkout photo itself is taken automatically by the
// Counter webcam page (/counter-camera), so only one page ever uploads it.

const STEP_ORDER: CheckoutSessionDto["status"][] = [
  "AWAITING_FINGERPRINT",
  "AWAITING_ASSET",
  "AWAITING_PHOTO",
  "AWAITING_APPROVAL",
  "AWAITING_CONFIRM",
  "COMPLETED",
];

function SessionCard({ session }: { session: CheckoutSessionDto }) {
  const needsPhoto = session.status === "AWAITING_PHOTO" && !session.photoUrl;
  const stepIndex = STEP_ORDER.indexOf(session.status);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <MonitorSmartphone className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-sm font-semibold text-slate-900">{session.station.stationCode}</p>
            <p className="text-xs text-slate-500">{formatEnum(session.type)} session</p>
          </div>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${needsPhoto ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-700"}`}>
          {formatEnum(session.status)}
        </span>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div className="space-y-4">
          {/* Progress */}
          {session.type === "CHECKOUT" && (
            <ol className="flex flex-wrap gap-1.5">
              {STEP_ORDER.slice(0, 5).map((step, i) => (
                <li
                  key={step}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    i < stepIndex ? "bg-emerald-50 text-emerald-700" : i === stepIndex ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {T.steps[step as keyof typeof T.steps]}
                </li>
              ))}
            </ol>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">{T.fields.instructor}</dt>
              <dd className="font-medium text-slate-900">{session.instructor?.fullName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{T.fields.student}</dt>
              <dd className="font-medium text-slate-900">{session.student?.fullName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{T.fields.asset}</dt>
              <dd className="font-medium text-slate-900">{session.asset ? `${session.asset.assetCode} · ${session.asset.name}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{T.fields.room}</dt>
              <dd className="font-medium text-slate-900">{session.destinationRoom?.code ?? "—"}</dd>
            </div>
          </dl>

          {/* Mirror of the kiosk's 4-line LCD */}
          {session.lcdLines?.some(Boolean) && (
            <pre className="rounded-lg bg-slate-900 px-4 py-3 font-mono text-xs leading-5 text-emerald-300">{session.lcdLines.join("\n")}</pre>
          )}

          {session.photoUrl && (
            <p className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {T.photoReceived}
            </p>
          )}
        </div>

        {/* Checkout photo, taken by the Counter webcam page */}
        <div>
          {session.photoUrl ? (
            <img src={session.photoUrl} alt={T.photoAlt} className="aspect-video w-full rounded-xl border border-slate-200 bg-slate-100 object-cover" />
          ) : needsPhoto ? (
            <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-center text-sm text-amber-800">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-medium">{T.photoInProgress}</span>
              <Link to="/counter-camera" className="text-xs font-medium underline underline-offset-2">{T.openWebcam}</Link>
            </div>
          ) : (
            <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
              <Camera className="h-6 w-6 text-slate-300" />
              {T.cameraIdle}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function RfidController() {
  const { data, isError } = useQuery(useActiveKioskSessions());
  const sessions = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{T.description}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Link
            to="/counter-display"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <MonitorSmartphone className="h-4 w-4" />
            {T.openDisplay}
          </Link>
          <Link
            to="/counter-camera"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Camera className="h-4 w-4" />
            {T.openWebcam}
          </Link>
          </div>
        </header>

        {isError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{T.error}</p>
        ) : sessions.length === 0 ? (
          <section className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-20 text-center">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <p className="mt-2 text-sm font-semibold text-slate-900">{T.idleTitle}</p>
            <p className="max-w-sm text-sm text-slate-500">{T.idleDescription}</p>
          </section>
        ) : (
          sessions.map((session) => <SessionCard key={session.id} session={session} />)
        )}

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{T.footerHint}</span>
        </p>
      </div>
    </div>
  );
}
