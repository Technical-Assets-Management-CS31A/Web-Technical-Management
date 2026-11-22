import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import type { ApprovalDto, LiabilityDto, LoanDto } from "../../../@types/types";
import { useChangeLoanRoom, useGetLoan, useMarkLoanMissing } from "../../../hooks/loanHooks";
import { useAllRooms, useGetAsset } from "../../../hooks/assetHooks";
import { isOpenLoan } from "../../../lib/loanFilters";
import { UserData, canManageLoans, canResolvePenalties } from "../../../utils/usersData/userData";
import { useStudentStanding } from "../../../hooks/userHooks";
import { amountError, buildLoanTimeline, dueState, loanLiability, minutesToText, type DueState, type TimelineStep } from "../../../lib/loanDetail";

export const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export const LIABILITY_TONE: Record<LiabilityDto["status"], string> = {
  OUTSTANDING: "bg-rose-50 text-rose-700 ring-rose-200",
  SETTLED_PAYMENT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  SETTLED_REPLACEMENT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  WAIVED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const DUE_TONE: Record<DueState["kind"] | "soon", string> = {
  due: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  soon: "bg-amber-50 text-amber-700 ring-amber-200",
  overdue: "bg-rose-50 text-rose-700 ring-rose-200",
  returned: "bg-slate-100 text-slate-700 ring-slate-200",
  missing: "bg-red-50 text-red-700 ring-red-200",
};

export const DECISION_TONE: Record<ApprovalDto["decision"], string> = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-slate-100 text-slate-600",
  DECLINED: "bg-rose-50 text-rose-700",
  EXPIRED: "bg-amber-50 text-amber-700",
};

export const STEP_DOT: Record<TimelineStep["state"], string> = {
  done: "bg-emerald-500 ring-emerald-100",
  late: "bg-rose-500 ring-rose-100",
  upcoming: "bg-white ring-slate-200 border border-slate-300",
};

// The loan DTO has no liability, so it is read from the borrower's standing (one liability per loan).
export const useLoanLiability = (studentId: string, loanId: string) => {
  const query = useQuery(useStudentStanding(studentId));
  return { ...query, liability: loanLiability(query.data?.liabilities, loanId) };
};

export const useLoanDetailViewModel = () => {
  const { loanId } = useParams({ strict: false }) as { loanId: string };
  const { data: loan, isLoading, isError } = useQuery(useGetLoan(loanId));

  return {
    loanId,
    loan,
    isLoading,
    isError,
  };
};

export type LoanDetailViewModel = ReturnType<typeof useLoanDetailViewModel>;

/** Everything the loan page needs once the loan has loaded: actions, permissions and derived timing. */
export const useLoanDetailContentViewModel = (l: LoanDto) => {
  const viewer = UserData();
  const { data: roomsData } = useQuery(useAllRooms());
  const markMissing = useMarkLoanMissing();
  const changeRoom = useChangeLoanRoom();
  const [action, setAction] = useState<"missing" | "room" | "settle" | null>(null);
  const [newRoomId, setNewRoomId] = useState("");
  const [missingAmount, setMissingAmount] = useState("");
  const [missingAmountTouched, setMissingAmountTouched] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Keep the due countdown and timeline live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const rooms = useMemo(() => (Array.isArray(roomsData) ? roomsData : []), [roomsData]);
  const roomById = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);
  const destination = l.destinationRoom ? roomById.get(l.destinationRoom.id) : undefined;

  const isOut = isOpenLoan(l);
  // The backend allows mark missing, change room and settlement for ADMIN and TECH_STAFF only.
  const isStaff = canManageLoans(viewer.role);
  const canSettle = canResolvePenalties(viewer.role);
  // Replacement cost is the default liability (FR-6.7); the loan only carries an asset reference.
  const { data: asset } = useQuery({ ...useGetAsset(l.asset.id), enabled: isStaff && isOut && !!l.asset.id });
  const showLiability = canSettle && (l.status === "MISSING" || l.status === "RETURNED");
  const missingAmountError = missingAmountTouched ? amountError(missingAmount) : undefined;

  const openMarkMissing = () => {
    setMissingAmount(asset ? asset.replacementCost.toFixed(2) : "");
    setMissingAmountTouched(false);
    setAction("missing");
  };
  const isEvent = l.type === "EVENT";
  const due = dueState(l, now);
  const timeline = buildLoanTimeline(l, now);
  const classLength = minutesToText(l.classLengthMinutes);
  const approvals = [...(l.approvals ?? [])].sort(
    (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime(),
  );

  return {
    viewer,
    markMissing,
    changeRoom,
    action,
    setAction,
    newRoomId,
    setNewRoomId,
    missingAmount,
    setMissingAmount,
    missingAmountTouched,
    setMissingAmountTouched,
    zoomSrc,
    setZoomSrc,
    now,
    rooms,
    roomById,
    destination,
    isOut,
    isStaff,
    canSettle,
    asset,
    showLiability,
    missingAmountError,
    openMarkMissing,
    isEvent,
    due,
    timeline,
    classLength,
    approvals,
  };
};
