import type { AssetStatus, CheckoutSessionDto, LoanDto, SessionStatus, SessionType } from "../@types/types";
import type { RealtimeEnvelope } from "./realtime";

// Pure helpers for the live status board on the dashboard (PRD FR-4.2, US-08, section 6.5).
// The board is built from the last fetched loans and kiosk sessions, then the SignalR events received
// since that fetch are replayed on top, so cards move the moment an event arrives instead of after the refetch.

export const BOARD_COLUMNS = ["AT_COUNTER", "IN_TRANSIT", "VERIFIED", "ANOMALY", "OVERDUE"] as const;
export type BoardColumn = (typeof BOARD_COLUMNS)[number];

export interface BoardCard {
  /** "loan:<id>" or "session:<id>". A checkout gets a new id when its session becomes a loan. */
  id: string;
  column: BoardColumn;
  loanId: string | null;
  loanNo: string | null;
  sessionId: string | null;
  assetId: string;
  assetCode: string;
  assetName: string;
  holder: string | null;
  sectionCode: string | null;
  roomId: string | null;
  roomCode: string | null;
  stationCode: string | null;
  isEvent: boolean;
  /** When the card entered the board: checkout time, or the session start for At Counter cards. */
  startedAt: string;
  transitDeadlineAt: string | null;
  /** classEndsAt + graceMinutes (PRD 7.6). */
  dueAt: string | null;
  /** Approving instructor: the class the asset was borrowed for. */
  instructor: { id: string; fullName: string } | null;
  classEndsAt: string | null;
  graceMinutes: number | null;
}

/** Asset statuses that place a card on the board. Any other status (IN_STORAGE, MISSING, ...) takes it off. */
const COLUMN_BY_ASSET_STATUS: Partial<Record<AssetStatus, BoardColumn>> = {
  AT_COUNTER: "AT_COUNTER",
  IN_TRANSIT: "IN_TRANSIT",
  IN_ROOM_VERIFIED: "VERIFIED",
  LOCATION_ANOMALY: "ANOMALY",
  OVERDUE: "OVERDUE",
};

export const columnForAssetStatus = (status: AssetStatus): BoardColumn | null => COLUMN_BY_ASSET_STATUS[status] ?? null;

const isOnLoan = (loan: LoanDto) => loan.status === "ACTIVE" || loan.status === "OVERDUE";

/**
 * The column of an active loan. An OVERDUE loan is always Overdue; otherwise the asset status decides,
 * because that is what asset.statusChanged updates. The custody state is the fallback for statuses
 * that do not map to a column.
 */
export const columnForLoan = (loan: LoanDto): BoardColumn => {
  if (loan.status === "OVERDUE") return "OVERDUE";
  const byAsset = columnForAssetStatus(loan.asset.status);
  if (byAsset) return byAsset;
  if (loan.custodyState === "ANOMALY") return "ANOMALY";
  if (loan.custodyState === "VERIFIED") return "VERIFIED";
  return "IN_TRANSIT";
};

const loanCard = (loan: LoanDto): BoardCard => ({
  id: `loan:${loan.id}`,
  column: columnForLoan(loan),
  loanId: loan.id,
  loanNo: loan.loanNo,
  sessionId: null,
  assetId: loan.asset.id,
  assetCode: loan.asset.assetCode,
  assetName: loan.asset.name,
  holder: loan.student?.fullName ?? loan.coordinator?.fullName ?? null,
  sectionCode: loan.student?.sectionCode ?? null,
  roomId: loan.destinationRoom?.id ?? null,
  roomCode: loan.destinationRoom?.code ?? null,
  stationCode: null,
  isEvent: loan.type === "EVENT",
  startedAt: loan.checkedOutAt,
  transitDeadlineAt: loan.transitDeadlineAt,
  dueAt: loan.dueAt,
  instructor: loan.approvedBy,
  classEndsAt: loan.classEndsAt,
  graceMinutes: loan.graceMinutes,
});

const CHECKOUT_TYPES: SessionType[] = ["CHECKOUT", "EVENT_BATCH"];
const FINISHED: SessionStatus[] = ["COMPLETED", "DECLINED", "CANCELLED", "EXPIRED", "FAILED"];

/** A kiosk checkout that has scanned its asset but has not become a loan yet. */
const isAtCounter = (session: CheckoutSessionDto) =>
  CHECKOUT_TYPES.includes(session.type) && !FINISHED.includes(session.status) && !!session.asset && !session.loanId;

const sessionCard = (session: CheckoutSessionDto & { asset: NonNullable<CheckoutSessionDto["asset"]> }): BoardCard => ({
  id: `session:${session.id}`,
  column: "AT_COUNTER",
  loanId: null,
  loanNo: null,
  sessionId: session.id,
  assetId: session.asset.id,
  assetCode: session.asset.assetCode,
  assetName: session.asset.name,
  holder: session.student?.fullName ?? null,
  sectionCode: null,
  roomId: session.destinationRoom?.id ?? null,
  roomCode: session.destinationRoom?.code ?? null,
  stationCode: session.station.stationCode,
  isEvent: session.type === "EVENT_BATCH",
  startedAt: session.createdAt,
  transitDeadlineAt: null,
  dueAt: null,
  instructor: session.instructor,
  classEndsAt: null,
  graceMinutes: null,
});

/** Active loans plus checkouts still at the counter, one card per asset (a loan wins over a session). */
export const buildBoardCards = (loans: readonly LoanDto[], sessions: readonly CheckoutSessionDto[] = []): BoardCard[] => {
  const cards = loans.filter(isOnLoan).map(loanCard);
  const onLoan = new Set(cards.map((c) => c.assetId));
  for (const session of sessions) {
    if (isAtCounter(session) && !onLoan.has(session.asset!.id)) {
      cards.push(sessionCard(session as Parameters<typeof sessionCard>[0]));
      onLoan.add(session.asset!.id);
    }
  }
  return cards;
};

// ── Live updates ─────────────────────────────────────────────────────────────

type RoomCodes = ReadonlyMap<string, string>;

const moveWhere = (cards: BoardCard[], match: (c: BoardCard) => boolean, column: BoardColumn): BoardCard[] =>
  cards.map((c) => (match(c) && c.column !== column ? { ...c, column } : c));

/** Applies one hub event to the cards. Events the board cannot act on return the same array. */
export const applyBoardEvent = (cards: BoardCard[], event: RealtimeEnvelope, roomCodes: RoomCodes = new Map()): BoardCard[] => {
  switch (event.name) {
    case "asset.statusChanged": {
      const { assetId, newStatus, roomId } = event.payload;
      const column = columnForAssetStatus(newStatus);
      // Returned, missing, sent to maintenance...: the asset leaves the board.
      if (!column) return cards.filter((c) => c.assetId !== assetId);
      return cards.map((c) => {
        if (c.assetId !== assetId) return c;
        // A verified scan reports the room the asset is in now.
        const room = column === "VERIFIED" && roomId ? { roomId, roomCode: roomCodes.get(roomId) ?? c.roomCode } : {};
        return { ...c, column, ...room };
      });
    }

    case "loan.created": {
      const p = event.payload;
      if (cards.some((c) => c.loanId === p.loanId)) return cards;
      // The checkout's At Counter card turns into the loan's card.
      const previous = cards.find((c) => c.assetId === p.asset.id);
      const card: BoardCard = {
        id: `loan:${p.loanId}`,
        column: previous && previous.column !== "AT_COUNTER" ? previous.column : "IN_TRANSIT",
        loanId: p.loanId,
        loanNo: p.loanNo,
        sessionId: null,
        assetId: p.asset.id,
        assetCode: p.asset.assetCode,
        assetName: p.asset.name,
        holder: p.student?.fullName ?? previous?.holder ?? null,
        sectionCode: previous?.sectionCode ?? null,
        roomId: p.destinationRoomId ?? previous?.roomId ?? null,
        roomCode: (p.destinationRoomId && roomCodes.get(p.destinationRoomId)) || previous?.roomCode || null,
        stationCode: null,
        isEvent: previous?.isEvent ?? false,
        startedAt: new Date(event.receivedAt).toISOString(),
        transitDeadlineAt: p.transitDeadlineAt,
        dueAt: p.dueAt,
        // The event has no class details; the approving instructor is known from the kiosk session.
        instructor: previous?.instructor ?? null,
        classEndsAt: previous?.classEndsAt ?? null,
        graceMinutes: previous?.graceMinutes ?? null,
      };
      return [...cards.filter((c) => c.assetId !== p.asset.id), card];
    }

    case "loan.overdue":
      return moveWhere(cards, (c) => c.loanId === event.payload.loanId, "OVERDUE");

    case "anomaly.raised": {
      const { loanId, assetId } = event.payload;
      if (!loanId && !assetId) return cards;
      // An overdue loan stays Overdue; that is the more serious state.
      return moveWhere(
        cards,
        (c) => c.column !== "OVERDUE" && ((!!loanId && c.loanId === loanId) || (!!assetId && c.assetId === assetId)),
        "ANOMALY",
      );
    }

    case "room.occupancyChanged": {
      // A room change gives the loan a new destination and transit deadline.
      const { roomId, incoming } = event.payload;
      const byLoan = new Map(incoming.map((i) => [i.loanId, i]));
      return cards.map((c) => {
        const entry = c.loanId ? byLoan.get(c.loanId) : undefined;
        if (!entry) return c;
        return { ...c, transitDeadlineAt: entry.transitDeadlineAt, roomId, roomCode: roomCodes.get(roomId) ?? c.roomCode };
      });
    }

    // anomaly.resolved does not say where the asset is now; the asset.statusChanged that follows it does.
    default:
      return cards;
  }
};

/**
 * Replays events received after `since` (the fetch time of the board data), oldest first.
 * `events` is newest first, as the realtime store keeps it. Once the refetch lands, `since` moves past
 * these events and the fetched data takes over.
 */
export const applyBoardEvents = (
  cards: BoardCard[],
  events: readonly RealtimeEnvelope[],
  since: number,
  roomCodes: RoomCodes = new Map(),
): BoardCard[] => {
  let result = cards;
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].receivedAt > since) result = applyBoardEvent(result, events[i], roomCodes);
  }
  return result;
};

/** Cards per column, each column ordered by the most urgent first. */
export const groupBoard = (cards: readonly BoardCard[]): Record<BoardColumn, BoardCard[]> => {
  const board = Object.fromEntries(BOARD_COLUMNS.map((col) => [col, [] as BoardCard[]])) as Record<BoardColumn, BoardCard[]>;
  for (const card of cards) board[card.column].push(card);
  const time = (iso: string | null) => (iso ? Date.parse(iso) : Number.POSITIVE_INFINITY);
  board.AT_COUNTER.sort((a, b) => time(a.startedAt) - time(b.startedAt));
  board.IN_TRANSIT.sort((a, b) => time(a.transitDeadlineAt) - time(b.transitDeadlineAt));
  board.VERIFIED.sort((a, b) => time(a.dueAt) - time(b.dueAt));
  board.ANOMALY.sort((a, b) => time(a.startedAt) - time(b.startedAt));
  board.OVERDUE.sort((a, b) => time(a.dueAt) - time(b.dueAt));
  return board;
};

/**
 * Ids of cards that are new or changed column compared with `previous` (card id → column).
 * Used to highlight a card after a live move. Returns an empty list when there is no previous board.
 */
export const movedCardIds = (previous: ReadonlyMap<string, BoardColumn> | null, cards: readonly BoardCard[]): string[] =>
  previous ? cards.filter((c) => previous.get(c.id) !== c.column).map((c) => c.id) : [];

// ── Timers ───────────────────────────────────────────────────────────────────

/** "09:41" for a positive span, "00:00" once it has run out. Hours are added past 60 minutes. */
export const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
};

/** "45m", "2h 5m", "3d 4h". Rounds down to whole minutes, minimum "0m". */
export const formatSpan = (ms: number): string => {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
