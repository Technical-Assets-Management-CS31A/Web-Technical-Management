import { describe, expect, it } from "vitest";
import type { RoomDto } from "../../@types/types";
import type { BoardCard } from "../statusBoard";
import { buildRoomCards, currentClassOf, duePhase } from "../roomBoard";

const T0 = Date.parse("2026-11-10T08:00:00Z");
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

const room = (over: Partial<RoomDto> = {}): RoomDto => ({
  id: "r1",
  code: "CL10",
  name: "Computer Lab 10",
  building: "Main",
  floor: "2",
  isStorage: false,
  status: "ACTIVE",
  deletedAt: null,
  ...over,
});

let n = 0;
const card = (over: Partial<BoardCard> = {}): BoardCard => {
  n++;
  return {
    id: `loan:l${n}`,
    column: "VERIFIED",
    loanId: `l${n}`,
    loanNo: `L-${n}`,
    sessionId: null,
    assetId: `a${n}`,
    assetCode: `PRJ-${n}`,
    assetName: "Projector",
    holder: "Juan Dela Cruz",
    sectionCode: "BSCS-3A",
    roomId: "r1",
    roomCode: "CL10",
    stationCode: null,
    isEvent: false,
    startedAt: at(0),
    transitDeadlineAt: at(10),
    dueAt: at(105),
    instructor: { id: "i1", fullName: "Maria Santos" },
    classEndsAt: at(90),
    graceMinutes: 15,
    ...over,
  };
};

describe("currentClassOf", () => {
  it("reads instructor, sections and due time from the room's loans", () => {
    const cls = currentClassOf([card(), card({ sectionCode: "BSCS-3B", column: "IN_TRANSIT" }), card({ column: "ANOMALY" })]);
    expect(cls).toEqual({
      instructor: { id: "i1", fullName: "Maria Santos" },
      sections: ["BSCS-3A", "BSCS-3B"],
      classEndsAt: at(90),
      graceMinutes: 15,
      dueAt: at(105),
    });
  });

  it("picks the class with the newest checkout and ignores overdue loans", () => {
    const old = card({ instructor: { id: "i0", fullName: "Old" }, startedAt: at(-120), classEndsAt: at(-30), dueAt: at(-15), column: "VERIFIED" });
    const next = card({ instructor: { id: "i2", fullName: "New" }, startedAt: at(5), classEndsAt: at(95), dueAt: at(110) });
    expect(currentClassOf([old, next])?.instructor?.fullName).toBe("New");
    expect(currentClassOf([card({ column: "OVERDUE" })])).toBeNull();
  });
});

describe("buildRoomCards", () => {
  it("makes one card per lab room, busy rooms first", () => {
    const rooms = [
      room({ id: "r0", code: "CL01" }),
      room(),
      room({ id: "rs", code: "STORE", isStorage: true }),
      room({ id: "rx", code: "OLD", status: "INACTIVE" }),
    ];
    const cards = [
      card(),
      card({ column: "IN_TRANSIT", transitDeadlineAt: at(9) }),
      card({ column: "IN_TRANSIT", transitDeadlineAt: at(3) }),
      card({ column: "ANOMALY" }),
      card({ column: "OVERDUE" }),
      card({ column: "AT_COUNTER" }),
    ];
    const models = buildRoomCards(rooms, cards);
    expect(models.map((m) => m.room.code)).toEqual(["CL10", "CL01"]);
    const [cl10, cl01] = models;
    expect([cl10.verified.length, cl10.incoming.length, cl10.anomalies.length, cl10.overdue.length]).toEqual([1, 2, 1, 1]);
    expect(cl10.incoming.map((c) => c.transitDeadlineAt)).toEqual([at(3), at(9)]);
    expect(cl01.currentClass).toBeNull();
  });
});

describe("duePhase", () => {
  const cls = { classEndsAt: at(90), dueAt: at(105) };
  it("counts down to due time including grace", () => {
    expect(duePhase(cls, T0)).toEqual({ phase: "CLASS", msLeft: 105 * 60_000 });
    expect(duePhase(cls, Date.parse(at(95)))).toEqual({ phase: "GRACE", msLeft: 10 * 60_000 });
    expect(duePhase(cls, Date.parse(at(106)))?.phase).toBe("OVERDUE");
    expect(duePhase({ classEndsAt: null, dueAt: null }, T0)).toBeNull();
  });
});
