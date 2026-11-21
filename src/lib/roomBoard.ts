import type { RoomDto } from "../@types/types";
import type { BoardCard } from "./statusBoard";

// Pure helpers for the room cards on the dashboard (PRD FR-4.1, 6.5).
// Room cards are built from the same live board cards as the status columns (lib/statusBoard.ts),
// so they update from SignalR events the same way and need no request per room.
// There is no class timetable in the schema: the "current class" of a room is read from the loans
// checked out for it (approving instructor, section, class end and grace, PRD 7.6).

export interface RoomClass {
  instructor: { id: string; fullName: string } | null;
  sections: string[];
  classEndsAt: string | null;
  graceMinutes: number | null;
  /** classEndsAt + graceMinutes: when this class's loans become overdue. */
  dueAt: string | null;
}

export interface RoomCardModel {
  room: Pick<RoomDto, "id" | "code" | "name" | "building" | "floor">;
  currentClass: RoomClass | null;
  verified: BoardCard[];
  incoming: BoardCard[];
  anomalies: BoardCard[];
  overdue: BoardCard[];
}

/** Rooms that get a card: active teaching rooms, not storage. */
export const isLabRoom = (room: RoomDto) => !room.isStorage && room.status === "ACTIVE" && !room.deletedAt;

const time = (iso: string | null) => (iso ? Date.parse(iso) : Number.NaN);
const earliest = (values: (string | null)[]) =>
  values.filter((v): v is string => !!v).sort((a, b) => Date.parse(a) - Date.parse(b))[0] ?? null;

/**
 * The class a room is running now: loans that are still in their class (in transit, verified or anomaly),
 * grouped by approving instructor and class end. When two classes overlap, the one with the newest
 * checkout wins. Overdue loans are left out: their class has ended.
 */
export const currentClassOf = (cards: readonly BoardCard[]): RoomClass | null => {
  const groups = new Map<string, BoardCard[]>();
  for (const card of cards) {
    if (card.column === "AT_COUNTER" || card.column === "OVERDUE") continue;
    const key = `${card.instructor?.id ?? ""}|${card.classEndsAt ?? card.dueAt ?? ""}`;
    groups.set(key, [...(groups.get(key) ?? []), card]);
  }
  if (groups.size === 0) return null;

  const newest = (group: BoardCard[]) => Math.max(...group.map((c) => time(c.startedAt) || 0));
  const group = [...groups.values()].sort((a, b) => newest(b) - newest(a))[0];
  const withInfo = (pick: (c: BoardCard) => unknown) => group.find((c) => pick(c) != null);

  return {
    instructor: withInfo((c) => c.instructor)?.instructor ?? null,
    sections: [...new Set(group.map((c) => c.sectionCode).filter((s): s is string => !!s))].sort(),
    classEndsAt: earliest(group.map((c) => c.classEndsAt)),
    graceMinutes: withInfo((c) => c.graceMinutes)?.graceMinutes ?? null,
    dueAt: earliest(group.map((c) => c.dueAt)),
  };
};

/** One card per lab room, rooms with something going on first, then by room code. */
export const buildRoomCards = (rooms: readonly RoomDto[], cards: readonly BoardCard[]): RoomCardModel[] => {
  const byRoom = new Map<string, BoardCard[]>();
  for (const card of cards) {
    if (!card.roomId || card.column === "AT_COUNTER") continue;
    byRoom.set(card.roomId, [...(byRoom.get(card.roomId) ?? []), card]);
  }

  const models = rooms.filter(isLabRoom).map((room): RoomCardModel => {
    const inRoom = byRoom.get(room.id) ?? [];
    const of = (column: BoardCard["column"]) => inRoom.filter((c) => c.column === column);
    return {
      room: { id: room.id, code: room.code, name: room.name, building: room.building, floor: room.floor },
      currentClass: currentClassOf(inRoom),
      verified: of("VERIFIED"),
      incoming: of("IN_TRANSIT").sort((a, b) => time(a.transitDeadlineAt) - time(b.transitDeadlineAt)),
      anomalies: of("ANOMALY"),
      overdue: of("OVERDUE"),
    };
  });

  const busy = (m: RoomCardModel) => m.verified.length + m.incoming.length + m.anomalies.length + m.overdue.length > 0;
  return models.sort((a, b) => Number(busy(b)) - Number(busy(a)) || a.room.code.localeCompare(b.room.code));
};

export type DuePhase = "CLASS" | "GRACE" | "OVERDUE";

/**
 * Where a class is against its due time (FR-4.1): in class until classEndsAt, then in the grace period
 * until dueAt, then overdue. `msLeft` counts down to dueAt, so it already includes the grace minutes.
 */
export const duePhase = (cls: Pick<RoomClass, "classEndsAt" | "dueAt">, now: number): { phase: DuePhase; msLeft: number } | null => {
  const due = time(cls.dueAt);
  if (Number.isNaN(due)) return null;
  const msLeft = due - now;
  if (msLeft <= 0) return { phase: "OVERDUE", msLeft };
  const ends = time(cls.classEndsAt);
  return { phase: !Number.isNaN(ends) && now >= ends ? "GRACE" : "CLASS", msLeft };
};
