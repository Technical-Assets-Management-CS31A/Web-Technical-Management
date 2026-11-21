import type { CardStatus } from "../@types/types";
import { formatEnum } from "../lib/utils";

// Instructor authorization cards: LOST can be found again, REVOKED is final.
const CARD_TONE: Record<CardStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  LOST: "bg-amber-50 text-amber-700 ring-amber-200",
  REVOKED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function CardStatusPill({ status }: { status: CardStatus }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CARD_TONE[status] ?? CARD_TONE.REVOKED}`}>
      {formatEnum(status)}
    </span>
  );
}
