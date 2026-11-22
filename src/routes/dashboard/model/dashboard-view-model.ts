import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardSummary, useStationHealth } from "../../../hooks/loanHooks";
import { useStatusBoard } from "../../../hooks/useStatusBoard";
import { buildRoomCards } from "../../../lib/roomBoard";
import { UserData } from "../../../utils/usersData/userData";
import { FormattedDateTime } from "../../../components/FormattedDateTime";
import { formatEnum } from "../../../lib/utils";
import { HEALTH_DOT } from "../../../components/stationHealth";
import { DASHBOARD_CONTENT as T } from "../../../constants/dashboardContent";

const TIME_ZONE = "Asia/Manila";

const getGreeting = (now: Date) => {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  if (hour < 12) return T.greetings.morning;
  if (hour < 18) return T.greetings.afternoon;
  return T.greetings.evening;
};

const formatToday = (now: Date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: TIME_ZONE }).format(now);

export type StationChip = { id: string; code: string; dotClass: string; tooltip: string };

export const useDashboardViewModel = () => {
  const { firstName } = UserData();
  const { data: summary } = useQuery(useDashboardSummary());
  const { data: stations = [] } = useQuery(useStationHealth());
  // FR-4.2 / US-08: one card per active asset, moved between columns by SignalR events.
  const { columns, cards, rooms, moved, loans, isLoading, isError, error, refetch } = useStatusBoard();
  // FR-4.1: room cards share the board's live cards, so they move with the same events.
  const roomCards = useMemo(() => buildRoomCards(rooms, cards), [rooms, cards]);

  const now = new Date();
  const stationChips: StationChip[] = stations.map((station) => ({
    id: station.stationId,
    code: station.stationCode,
    dotClass: HEALTH_DOT[station.health] ?? "bg-slate-300",
    tooltip: `${formatEnum(station.health)}${station.lastHeartbeatAt ? ` · last heartbeat ${FormattedDateTime(station.lastHeartbeatAt)}` : ""}${station.firmwareVersion ? ` · fw ${station.firmwareVersion}` : ""}`,
  }));

  return {
    isLoading,
    isError,
    error,
    retry: refetch,
    greeting: `${getGreeting(now)}${firstName ? `, ${firstName}` : ""}`,
    today: formatToday(now),
    openAnomalies: summary?.openAnomalies,
    columns,
    moved,
    loans,
    roomCards,
    stationChips,
  };
};

export type DashboardViewModel = ReturnType<typeof useDashboardViewModel>;
