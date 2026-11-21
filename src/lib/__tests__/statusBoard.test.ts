import { describe, expect, it } from "vitest";
import type { CheckoutSessionDto, LoanDto } from "../../@types/types";
import type { RealtimeEnvelope } from "../realtime";
import {
  applyBoardEvent,
  applyBoardEvents,
  buildBoardCards,
  columnForLoan,
  formatCountdown,
  formatSpan,
  groupBoard,
  movedCardIds,
} from "../statusBoard";

const T0 = Date.parse("2026-11-10T08:00:00Z");
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

const loan = (over: Partial<LoanDto> = {}): LoanDto =>
  ({
    id: "l1",
    loanNo: "L-2026-000001",
    type: "STANDARD",
    status: "ACTIVE",
    custodyState: "AWAITING_ARRIVAL",
    asset: { id: "a1", assetCode: "PRJ-1", name: "Projector", status: "IN_TRANSIT" },
    student: { id: "s1", studentNo: "2023-0001", fullName: "Juan Dela Cruz", sectionCode: "BSCS-3A" },
    approvedBy: null,
    destinationRoom: { id: "r1", code: "CL10", name: "Computer Lab 10" },
    checkedOutAt: at(0),
    transitDeadlineAt: at(10),
    verifiedAt: null,
    classLengthMinutes: 90,
    classEndsAt: at(90),
    graceMinutes: 15,
    dueAt: at(105),
    returnedAt: null,
    photoUrl: null,
    lateArrivalWarningNo: null,
    ...over,
  }) as LoanDto;

const session = (over: Partial<CheckoutSessionDto> = {}): CheckoutSessionDto =>
  ({
    id: "k1",
    type: "CHECKOUT",
    status: "AWAITING_APPROVAL",
    station: { id: "st1", stationCode: "KIOSK-1" },
    instructor: null,
    student: { id: "s2", fullName: "Ana Reyes" },
    asset: { id: "a2", assetCode: "LP-014", name: "Laptop" },
    photoUrl: null,
    destinationRoom: { id: "r2", code: "CL11", name: "Computer Lab 11" },
    classLengthMinutes: 90,
    fingerprintAttempts: 1,
    lcdLines: ["", "", "", ""],
    failureCode: null,
    loanId: null,
    eventId: null,
    createdAt: at(-1),
    expiresAt: at(2),
    completedAt: null,
    ...over,
  }) as CheckoutSessionDto;

let seq = 0;
const ev = (e: Omit<RealtimeEnvelope, "id" | "receivedAt">, receivedAt = T0): RealtimeEnvelope =>
  ({ ...e, id: ++seq, receivedAt }) as RealtimeEnvelope;

const columns = (cards: ReturnType<typeof buildBoardCards>) => Object.fromEntries(cards.map((c) => [c.assetCode, c.column]));

describe("columnForLoan", () => {
  it("maps asset status to a column", () => {
    expect(columnForLoan(loan())).toBe("IN_TRANSIT");
    expect(columnForLoan(loan({ asset: { ...loan().asset, status: "IN_ROOM_VERIFIED" } }))).toBe("VERIFIED");
    expect(columnForLoan(loan({ asset: { ...loan().asset, status: "LOCATION_ANOMALY" } }))).toBe("ANOMALY");
    expect(columnForLoan(loan({ asset: { ...loan().asset, status: "AT_COUNTER" } }))).toBe("AT_COUNTER");
  });

  it("puts an overdue loan in Overdue whatever the asset status", () => {
    expect(columnForLoan(loan({ status: "OVERDUE", asset: { ...loan().asset, status: "IN_ROOM_VERIFIED" } }))).toBe("OVERDUE");
  });

  it("falls back to custody state", () => {
    const missing = { ...loan().asset, status: "MISSING" as const };
    expect(columnForLoan(loan({ asset: missing, custodyState: "ANOMALY" }))).toBe("ANOMALY");
    expect(columnForLoan(loan({ asset: missing, custodyState: "VERIFIED" }))).toBe("VERIFIED");
  });
});

describe("buildBoardCards", () => {
  it("keeps active loans and checkouts at the counter", () => {
    const cards = buildBoardCards(
      [loan(), loan({ id: "l2", status: "RETURNED", asset: { id: "a9", assetCode: "X", name: "X", status: "IN_STORAGE" } })],
      [session(), session({ id: "k2", asset: null }), session({ id: "k3", status: "COMPLETED", asset: { id: "a3", assetCode: "C", name: "C" } })],
    );
    expect(columns(cards)).toEqual({ "PRJ-1": "IN_TRANSIT", "LP-014": "AT_COUNTER" });
  });

  it("drops a session whose asset already has a loan", () => {
    const cards = buildBoardCards([loan()], [session({ asset: { id: "a1", assetCode: "PRJ-1", name: "Projector" } })]);
    expect(cards.map((c) => c.id)).toEqual(["loan:l1"]);
  });
});

describe("applyBoardEvent", () => {
  const base = () => buildBoardCards([loan()], [session()]);

  it("moves a card on asset.statusChanged and records the room", () => {
    const rooms = new Map([["r5", "CL05"]]);
    const cards = applyBoardEvent(
      base(),
      ev({ name: "asset.statusChanged", payload: { assetId: "a1", oldStatus: "IN_TRANSIT", newStatus: "IN_ROOM_VERIFIED", roomId: "r5" } }),
      rooms,
    );
    const card = cards.find((c) => c.assetId === "a1")!;
    expect(card.column).toBe("VERIFIED");
    expect(card.roomCode).toBe("CL05");
  });

  it("removes a card whose asset left the board", () => {
    const cards = applyBoardEvent(
      base(),
      ev({ name: "asset.statusChanged", payload: { assetId: "a1", oldStatus: "IN_ROOM_VERIFIED", newStatus: "IN_STORAGE", roomId: null } }),
    );
    expect(cards.map((c) => c.assetId)).toEqual(["a2"]);
  });

  it("turns the At Counter card into an In Transit loan card on loan.created", () => {
    const cards = applyBoardEvent(
      base(),
      ev({
        name: "loan.created",
        payload: {
          loanId: "l7",
          loanNo: "L-7",
          asset: { id: "a2", assetCode: "LP-014", name: "Laptop" },
          student: { id: "s2", fullName: "Ana Reyes" },
          destinationRoomId: "r2",
          transitDeadlineAt: at(10),
          dueAt: at(105),
        },
      }),
      new Map([["r2", "CL11"]]),
    );
    expect(cards.filter((c) => c.assetId === "a2")).toEqual([
      expect.objectContaining({ id: "loan:l7", column: "IN_TRANSIT", roomCode: "CL11", transitDeadlineAt: at(10) }),
    ]);
  });

  it("ignores loan.created for a loan already on the board", () => {
    const cards = base();
    const same = applyBoardEvent(
      cards,
      ev({ name: "loan.created", payload: { loanId: "l1", loanNo: "x", asset: loan().asset, student: null, destinationRoomId: null, transitDeadlineAt: null, dueAt: at(1) } }),
    );
    expect(same).toBe(cards);
  });

  it("moves to Overdue and Anomaly, and Overdue outranks Anomaly", () => {
    const overdue = applyBoardEvent(base(), ev({ name: "loan.overdue", payload: { loanId: "l1" } }));
    expect(columns(overdue)["PRJ-1"]).toBe("OVERDUE");
    const stillOverdue = applyBoardEvent(overdue, ev({ name: "anomaly.raised", payload: { anomalyId: "x", type: "WRONG_ROOM", loanId: "l1" } }));
    expect(columns(stillOverdue)["PRJ-1"]).toBe("OVERDUE");
    const anomaly = applyBoardEvent(base(), ev({ name: "anomaly.raised", payload: { anomalyId: "x", type: "TRANSIT_TIMEOUT", assetId: "a1" } }));
    expect(columns(anomaly)["PRJ-1"]).toBe("ANOMALY");
  });

  it("updates destination and deadline on room.occupancyChanged", () => {
    const cards = applyBoardEvent(
      base(),
      ev({
        name: "room.occupancyChanged",
        payload: { roomId: "r3", verifiedCount: 0, incoming: [{ loanId: "l1", asset: loan().asset, transitDeadlineAt: at(20) }] },
      }),
      new Map([["r3", "CL12"]]),
    );
    expect(cards[0]).toEqual(expect.objectContaining({ roomCode: "CL12", transitDeadlineAt: at(20) }));
  });
});

describe("applyBoardEvents", () => {
  it("replays only events after the fetch, oldest first", () => {
    const cards = buildBoardCards([loan()]);
    // Newest first, as the store keeps them.
    const events = [
      ev({ name: "loan.overdue", payload: { loanId: "l1" } }, T0 + 3),
      ev({ name: "asset.statusChanged", payload: { assetId: "a1", oldStatus: "IN_TRANSIT", newStatus: "IN_ROOM_VERIFIED", roomId: null } }, T0 + 2),
      ev({ name: "asset.statusChanged", payload: { assetId: "a1", oldStatus: "IN_TRANSIT", newStatus: "IN_STORAGE", roomId: null } }, T0),
    ];
    expect(columns(applyBoardEvents(cards, events, T0 + 1))["PRJ-1"]).toBe("OVERDUE");
    expect(applyBoardEvents(cards, events, T0 + 3)).toBe(cards);
  });
});

describe("groupBoard", () => {
  it("orders In Transit by the nearest deadline", () => {
    const cards = buildBoardCards([loan({ id: "l1", transitDeadlineAt: at(9) }), loan({ id: "l2", asset: { ...loan().asset, id: "a2" }, transitDeadlineAt: at(3) })]);
    expect(groupBoard(cards).IN_TRANSIT.map((c) => c.loanId)).toEqual(["l2", "l1"]);
  });
});

describe("movedCardIds", () => {
  it("reports new cards and column changes, nothing on first render", () => {
    const cards = buildBoardCards([loan()], [session()]);
    expect(movedCardIds(null, cards)).toEqual([]);
    const prev = new Map([["loan:l1", "AT_COUNTER" as const]]);
    expect(movedCardIds(prev, cards)).toEqual(["loan:l1", "session:k1"]);
  });
});

describe("timers", () => {
  it("formats countdowns and spans", () => {
    expect(formatCountdown(10 * 60_000)).toBe("10:00");
    expect(formatCountdown(61_500)).toBe("01:02");
    expect(formatCountdown(-5)).toBe("00:00");
    expect(formatCountdown(3_725_000)).toBe("1:02:05");
    expect(formatSpan(45 * 60_000)).toBe("45m");
    expect(formatSpan(125 * 60_000)).toBe("2h 5m");
    expect(formatSpan((3 * 1440 + 250) * 60_000)).toBe("3d 4h");
  });
});
