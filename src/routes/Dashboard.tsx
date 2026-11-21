import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MonitorSmartphone } from "lucide-react";
import { DashboardSkeletonLoader } from "../loader/DashboardSkeletonLoader";
import ErrorTable from "../components/ErrorTables";
import { useDashboardSummary, useStationHealth } from "../hooks/loanHooks";
import { useStatusBoard } from "../hooks/useStatusBoard";
import DashboardActivityChart from "../components/DashboardActivityChart";
import DashboardStatusOverview from "../components/DashboardStatusOverview";
import LiveStatusBoard from "../components/LiveStatusBoard";
import RoomOccupancyCards from "../components/RoomOccupancyCards";
import { buildRoomCards } from "../lib/roomBoard";
import RealtimeStatusPill from "../components/RealtimeStatusPill";
import { UserData } from "../utils/usersData/userData";
import { FormattedDateTime } from "../components/FormattedDateTime";
import { formatEnum } from "../lib/utils";
import { HEALTH_DOT } from "../components/stationHealth";
import { DASHBOARD_CONTENT as T } from "../constants/dashboardContent";

const getGreeting = () => {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Manila" }).format(new Date()));
  if (hour < 12) return T.greetings.morning;
  if (hour < 18) return T.greetings.afternoon;
  return T.greetings.evening;
};

export default function Dashboard() {
  const { firstName } = UserData();
  const { data: summary } = useQuery(useDashboardSummary());
  const { data: stations = [] } = useQuery(useStationHealth());
  // FR-4.2 / US-08: one card per active asset, moved between columns by SignalR events.
  const { columns, cards, rooms, moved, loans, isLoading, isError } = useStatusBoard();
  // FR-4.1: room cards share the board's live cards, so they move with the same events.
  const roomCards = useMemo(() => buildRoomCards(rooms, cards), [rooms, cards]);

  if (isLoading) return <DashboardSkeletonLoader />;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-8xl space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {getGreeting()}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{T.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "Asia/Manila",
              }).format(new Date())}
            </span>
            <RealtimeStatusPill />
            {summary && (
              <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <span className={`h-2 w-2 rounded-full ${summary.openAnomalies ? "bg-amber-500" : "bg-emerald-500"}`} />
                {T.openAnomalies(summary.openAnomalies)}
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
              <ErrorTable />
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
          {stations.length === 0 ? (
            <span className="text-sm text-slate-400">{T.stations.empty}</span>
          ) : (
            stations.map((station) => (
              <span
                key={station.stationId}
                title={`${formatEnum(station.health)}${station.lastHeartbeatAt ? ` · last heartbeat ${FormattedDateTime(station.lastHeartbeatAt)}` : ""}${station.firmwareVersion ? ` · fw ${station.firmwareVersion}` : ""}`}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600"
              >
                <span className={`h-2 w-2 rounded-full ${HEALTH_DOT[station.health] ?? "bg-slate-300"}`} />
                {station.stationCode}
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
