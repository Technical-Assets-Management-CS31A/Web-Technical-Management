import { Link } from "@tanstack/react-router";
import { MonitorSmartphone } from "lucide-react";
import ErrorTable from "../../../components/ErrorTables";
import DashboardActivityChart from "../../../components/DashboardActivityChart";
import DashboardStatusOverview from "../../../components/DashboardStatusOverview";
import LiveStatusBoard from "../../../components/LiveStatusBoard";
import RoomOccupancyCards from "../../../components/RoomOccupancyCards";
import RealtimeStatusPill from "../../../components/RealtimeStatusPill";
import { DASHBOARD_CONTENT as T } from "../../../constants/dashboardContent";
import type { DashboardViewModel } from "../model/dashboard-view-model";

type DashboardViewProps = Omit<DashboardViewModel, "isLoading">;

export default function DashboardView({
  isError,
  error,
  retry,
  greeting,
  today,
  openAnomalies,
  columns,
  moved,
  loans,
  roomCards,
  stationChips,
}: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-8xl space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{greeting}</h1>
            <p className="mt-1 text-sm text-slate-500">{T.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>{today}</span>
            <RealtimeStatusPill />
            {openAnomalies !== undefined && (
              <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <span className={`h-2 w-2 rounded-full ${openAnomalies ? "bg-amber-500" : "bg-emerald-500"}`} />
                {T.openAnomalies(openAnomalies)}
              </span>
            )}
          </div>
        </header>

        {/* ── Live status board ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">{T.board.title}</h2>
            <Link to="/home/loans" className="text-sm font-medium text-blue-600 hover:underline">
              {T.board.viewAll}
            </Link>
          </div>
          {isError ? (
            <div className="rounded-xl border border-slate-200 bg-white">
              <ErrorTable error={error} onRetry={retry} />
            </div>
          ) : (
            <LiveStatusBoard columns={columns} moved={moved} />
          )}
        </section>

        {/* ── Room cards ── */}
        {!isError && (
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{T.rooms.title}</h2>
              <p className="text-sm text-slate-500">{T.rooms.description}</p>
            </div>
            <RoomOccupancyCards rooms={roomCards} />
          </section>
        )}

        {/* ── Station health strip ── */}
        <section className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-5 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MonitorSmartphone className="h-4 w-4 text-slate-400" />
            {T.stations.title}
          </span>
          {stationChips.length === 0 ? (
            <span className="text-sm text-slate-400">{T.stations.empty}</span>
          ) : (
            stationChips.map((station) => (
              <span key={station.id} title={station.tooltip} className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600">
                <span className={`h-2 w-2 rounded-full ${station.dotClass}`} />
                {station.code}
              </span>
            ))
          )}
        </section>

        {/* ── Insights ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardActivityChart records={loans} />
          </div>
          <DashboardStatusOverview records={loans} />
        </div>

      </div>
    </div>
  );
}
