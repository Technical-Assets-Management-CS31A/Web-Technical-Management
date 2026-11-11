import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeletonLoader } from "../loader/DashboardSkeletonLoader";
import DashboardBadges from "../components/DashboardBadges";
import ErrorTable from "../components/ErrorTables";
import { SlugStatus } from "../components/SlugStatus";
import { useAllLoans, useDashboardSummary, useStationHealth } from "../hooks/loanHooks";
import { CheckCircle2, MonitorSmartphone, Package, AlarmClock, TriangleAlert, Truck } from "lucide-react";
import DashboardActivityChart from "../components/DashboardActivityChart";
import DashboardStatusOverview from "../components/DashboardStatusOverview";
import { UserData } from "../utils/usersData/userData";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormattedDateTime } from "../components/FormattedDateTime";
import { formatEnum } from "../lib/utils";
import { HEALTH_DOT } from "../components/stationHealth";
import { DASHBOARD_CONTENT as T } from "../constants/dashboardContent";

const TABLE_HEADERS = T.tableHeaders;

const getGreeting = () => {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Manila" }).format(new Date()));
  if (hour < 12) return T.greetings.morning;
  if (hour < 18) return T.greetings.afternoon;
  return T.greetings.evening;
};

export default function Dashboard() {
  const { firstName } = UserData();
  const navigate = useNavigate();
  const { data: summary } = useQuery(useDashboardSummary());
  const { data: stations = [] } = useQuery(useStationHealth());
  const { data: loanData, isLoading, isError } = useQuery(useAllLoans());
  const loans = useMemo(() => (Array.isArray(loanData) ? loanData : []), [loanData]);

  // Status board columns from PRD 6.5
  const badges = [
    { name: T.badges.atCounter, data: summary?.atCounter ?? null, link: "/home/loans", icon: <Package className="h-5 w-5" /> },
    { name: T.badges.inTransit, data: summary?.inTransit ?? null, link: "/home/loans", icon: <Truck className="h-5 w-5" /> },
    { name: T.badges.inRoomVerified, data: summary?.inRoomVerified ?? null, link: "/home/loans", icon: <CheckCircle2 className="h-5 w-5" /> },
    { name: T.badges.anomaly, data: summary?.locationAnomaly ?? null, link: "/home/loans", icon: <TriangleAlert className="h-5 w-5" /> },
    { name: T.badges.overdue, data: summary?.overdue ?? null, link: "/home/loans", search: { status: "OVERDUE" }, icon: <AlarmClock className="h-5 w-5" /> },
  ];

  const recentLoans = useMemo(
    () =>
      loans
        .filter((loan) => loan.status === "ACTIVE" || loan.status === "OVERDUE")
        .sort((a, b) => new Date(b.checkedOutAt).getTime() - new Date(a.checkedOutAt).getTime())
        .slice(0, 5),
    [loans],
  );

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
            {summary && (
              <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <span className={`h-2 w-2 rounded-full ${summary.openAnomalies ? "bg-amber-500" : "bg-emerald-500"}`} />
                {T.openAnomalies(summary.openAnomalies)}
              </span>
            )}
          </div>
        </header>

        {/* ── Status board ── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {badges.map((item) => (
            <DashboardBadges key={item.name} name={item.name} link={item.link} search={item.search} data={item.data} icon={item.icon} />
          ))}
        </section>

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

        {/* ── Recent loans ── */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{T.recentBorrows.title}</h2>
              <p className="text-sm text-slate-500">{T.recentBorrows.description}</p>
            </div>
            <Link
              to="/home/loans"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {T.recentBorrows.viewAll}
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isError ? (
              <ErrorTable />
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200">
                    {TABLE_HEADERS.map((h) => (
                      <th key={h} className="px-5 py-3 font-medium text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLoans.length > 0 ? (
                    recentLoans.map((loan) => (
                      <tr
                        key={loan.id}
                        onClick={() => navigate({ to: "/home/loans/$loanId", params: { loanId: loan.id } })}
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        <td className="px-5 py-3">
                          <p className="text-slate-900">{loan.asset.name}</p>
                          <p className="font-mono text-xs text-slate-500">{loan.asset.assetCode}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-700">{loan.student?.fullName ?? loan.coordinator?.fullName ?? "-"}</td>
                        <td className="px-5 py-3 text-slate-700">{loan.destinationRoom?.code ?? "-"}</td>
                        <td className="px-5 py-3 text-slate-700">{FormattedDateTime(loan.checkedOutAt)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(loan.custodyState)}`}>
                            {formatEnum(loan.custodyState)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-700">{FormattedDateTime(loan.dueAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={TABLE_HEADERS.length} className="px-5 py-12 text-center">
                        <p className="text-sm font-medium text-slate-700">{T.recentBorrows.empty.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{T.recentBorrows.empty.description}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
