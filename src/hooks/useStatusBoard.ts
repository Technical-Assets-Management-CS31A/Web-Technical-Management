import { useMemo, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { activeKioskSessionsApi } from "../api/loan_api";
import { useAllLoans } from "./loanHooks";
import { useAllRooms } from "./assetHooks";
import { useRealtimeStatus } from "./useRealtime";
import { useRealtimeStore } from "../states/realtime-state";
import {
  applyBoardEvents,
  buildBoardCards,
  groupBoard,
  movedCardIds,
  type BoardCard,
  type BoardColumn,
} from "../lib/statusBoard";

/** While the hub is down the board falls back to polling, so it never goes stale silently. */
const OFFLINE_POLL_MS = 30_000;
/** How long a card stays highlighted after it moves. */
export const MOVED_HIGHLIGHT_MS = 4_000;

// Same key as useActiveKioskSessions, so the counter page and the board share one cache entry.
// No 2 s polling here: loan.created and asset.statusChanged refresh "kioskSessions".
const counterSessions = (poll: number | false) =>
  queryOptions({
    queryKey: ["kioskSessions", "active"],
    queryFn: activeKioskSessionsApi,
    staleTime: 0,
    refetchInterval: poll,
  });

/**
 * The live status board (PRD FR-4.2, US-08): active loans plus checkouts at the counter, grouped into
 * At Counter, In Transit, Verified in Room, Anomaly and Overdue.
 *
 * Hub events mark the loans query stale (useRealtimeConnection), and until the refetch lands the events
 * received since the last fetch are replayed on the fetched cards, so a card moves as soon as its event arrives.
 */
export const useStatusBoard = () => {
  const { isLive } = useRealtimeStatus();
  const poll = isLive ? false : OFFLINE_POLL_MS;

  const loansQuery = useQuery({ ...useAllLoans(), refetchInterval: poll });
  const { data: sessions } = useQuery(counterSessions(poll));
  const { data: rooms } = useQuery(useAllRooms());
  const recent = useRealtimeStore((s) => s.recent);

  const loans = useMemo(() => (Array.isArray(loansQuery.data) ? loansQuery.data : []), [loansQuery.data]);
  const fetchedAt = loansQuery.dataUpdatedAt;

  const roomCodes = useMemo(
    () => new Map((Array.isArray(rooms) ? rooms : []).map((r) => [r.id, r.code] as const)),
    [rooms],
  );

  const fetched = useMemo(() => buildBoardCards(loans, Array.isArray(sessions) ? sessions : []), [loans, sessions]);
  const cards = useMemo(() => applyBoardEvents(fetched, recent, fetchedAt, roomCodes), [fetched, recent, fetchedAt, roomCodes]);
  const columns = useMemo(() => groupBoard(cards), [cards]);
  const moved = useMovedCards(cards, loansQuery.isSuccess);

  return {
    columns,
    moved,
    loans,
    isLoading: loansQuery.isLoading,
    isError: loansQuery.isError,
  };
};

/**
 * Card id → time it last moved or appeared. Compares each new card list with the previous one during render
 * (React's "store information from previous renders" pattern), so no effect or timer is needed.
 */
const useMovedCards = (cards: BoardCard[], ready: boolean): ReadonlyMap<string, number> => {
  const [track, setTrack] = useState<{
    cards: BoardCard[] | null;
    /** null until the first load, so the initial cards are not flagged as moved. */
    columns: ReadonlyMap<string, BoardColumn> | null;
    moved: ReadonlyMap<string, number>;
  }>({ cards: null, columns: null, moved: new Map() });

  if (ready && track.cards !== cards) {
    const now = Date.now();
    const moved = new Map([...track.moved].filter(([, t]) => now - t < MOVED_HIGHLIGHT_MS));
    for (const id of movedCardIds(track.columns, cards)) moved.set(id, now);
    setTrack({ cards, columns: new Map(cards.map((c) => [c.id, c.column])), moved });
  }

  return track.moved;
};
