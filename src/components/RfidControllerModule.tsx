import { useState } from "react";
import type React from "react";
import { ArrowRight, CircleCheck, Info, Nfc, PackagePlus, Undo2 } from "lucide-react";
import BorrowSessionModal from "./BorrowSessionModal";
import ReturnSessionModal from "./ReturnSessionModal";
import { RFID_CONTROLLER_CONTENT as T } from "../constants/rfidControllerContent";

type ActiveMode = "borrow" | "return" | null;
type ModeColor = "blue" | "green";

type ModeConfig = {
  key: NonNullable<ActiveMode>;
  label: string;
  description: string;
  cta: string;
  steps: readonly string[];
  outcome: string;
  icon: React.ElementType;
  color: ModeColor;
};

const modes: ModeConfig[] = [
  { key: "borrow", ...T.modes.borrow, icon: PackagePlus, color: "blue" },
  { key: "return", ...T.modes.return, icon: Undo2, color: "green" },
];

const colorMap: Record<
  ModeColor,
  { accent: string; iconTile: string; step: string; cta: string; active: string; hoverBorder: string; watermark: string }
> = {
  blue: {
    accent: "from-blue-500 to-indigo-500",
    iconTile: "bg-blue-50 text-blue-600 ring-blue-100",
    step: "bg-blue-50 text-blue-700",
    cta: "text-blue-600",
    active: "border-blue-400 ring-4 ring-blue-100",
    hoverBorder: "hover:border-blue-300",
    watermark: "text-blue-500",
  },
  green: {
    accent: "from-emerald-500 to-teal-500",
    iconTile: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    step: "bg-emerald-50 text-emerald-700",
    cta: "text-emerald-600",
    active: "border-emerald-400 ring-4 ring-emerald-100",
    hoverBorder: "hover:border-emerald-300",
    watermark: "text-emerald-500",
  },
};

export default function RfidControllerModule() {
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);

  const active = modes.find((m) => m.key === activeMode);
  const isListening = !!active;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{T.description}</p>
        </header>

        {/* Station status */}
        <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Subtle dot grid backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage: "radial-gradient(rgb(226 232 240) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              maskImage: "linear-gradient(to left, black, transparent 70%)",
              WebkitMaskImage: "linear-gradient(to left, black, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
            {/* Scanner visual */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              {[0, 1, 2].map((ring) => (
                <span
                  key={ring}
                  className={`absolute inset-0 rounded-full border ${
                    isListening ? "animate-ping border-blue-300" : "border-slate-200"
                  }`}
                  style={{
                    transform: `scale(${0.55 + ring * 0.22})`,
                    animationDuration: "2.4s",
                    animationDelay: `${ring * 0.6}s`,
                  }}
                />
              ))}
              <span
                className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-colors duration-300 ${
                  isListening
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
                    : "bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-slate-900/20"
                }`}
              >
                <Nfc className="h-7 w-7" />
              </span>
            </div>

            {/* Status text */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{T.station.label}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {active ? T.station.activeTitle(active.label) : T.station.idleTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {active ? T.station.activeDescription : T.station.idleDescription}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                isListening ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isListening && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${isListening ? "bg-emerald-500" : "bg-slate-400"}`} />
              </span>
              {isListening ? T.station.activeBadge : T.station.idleBadge}
            </span>
          </div>
        </section>

        {/* Mode cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {modes.map((mode) => {
            const c = colorMap[mode.color];
            const isActive = activeMode === mode.key;

            return (
              <button
                key={mode.key}
                onClick={() => setActiveMode(mode.key)}
                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                  isActive ? c.active : `border-slate-200 ${c.hoverBorder}`
                }`}
              >
                {/* Accent bar */}
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.accent}`} />

                {/* Watermark icon */}
                <mode.icon
                  className={`pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 opacity-[0.04] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${c.watermark}`}
                />

                <div className="flex items-start justify-between gap-4">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${c.iconTile}`}>
                    <mode.icon className="h-6 w-6" />
                  </span>
                  {isActive && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.step}`}>{T.activeBadge}</span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">{mode.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{mode.description}</p>

                {/* Steps */}
                <ol className="mt-5 space-y-2.5">
                  {mode.steps.map((step, i) => (
                    <li key={step} className="flex items-center gap-3 text-sm text-slate-700">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${c.step}`}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm text-slate-500">
                    <CircleCheck className="h-6 w-6 shrink-0 text-slate-300" />
                    {mode.outcome}
                  </li>
                </ol>

                {/* CTA */}
                <span
                  className={`mt-6 inline-flex items-center gap-1.5 border-t border-slate-100 pt-4 text-sm font-semibold ${c.cta}`}
                >
                  {mode.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </section>

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{T.footerHint}</span>
        </p>
      </div>

      {/* Borrow Session Modal */}
      {activeMode === "borrow" && <BorrowSessionModal onClose={() => setActiveMode(null)} />}

      {/* Return Session Modal */}
      {activeMode === "return" && <ReturnSessionModal onClose={() => setActiveMode(null)} />}
    </div>
  );
}
