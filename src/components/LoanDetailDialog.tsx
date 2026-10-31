import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlarmClock,
  CalendarClock,
  CheckCircle2,
  Clock,
  DoorOpen,
  GraduationCap,
  Hash,
  ImageOff,
  Package,
  Presentation,
  Timer,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import type { LoanDto } from "../@types/types";
import { useChangeLoanRoom, useGetLoan, useMarkLoanMissing } from "../hooks/loanHooks";
import { useAllRooms } from "../hooks/assetHooks";
import { ArchiveDialog, ArchiveError, ArchiveLoading, DetailHeader, DetailSection, ImageLightbox, InfoRow, NeutralBadge, ZoomableImage } from "./ArchiveDetailShell";
import { FormattedDateTime } from "./FormattedDateTime";
import { SlugStatus } from "./SlugStatus";
import ReasonDialog from "./ReasonDialog";
import { showToast } from "./AppToast";
import { Field, SelectInput, getErrorMessage } from "./form/FormKit";
import { formatEnum } from "../lib/utils";
import { UserData } from "../utils/usersData/userData";

// Loan detail (PRD 7.6 LoanDto): checkout photo, class length, due time, custody and the approval ledger.
// Staff actions: mark missing, change room. Loans are created and returned only at the kiosk.

type LoanDetailDialogProps = {
  loanId: string;
  onClose: () => void;
};

const minutesToText = (minutes: number | null) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

export default function LoanDetailDialog({ loanId, onClose }: LoanDetailDialogProps) {
  const viewer = UserData();
  const { data: loan, isLoading, error } = useQuery(useGetLoan(loanId));
  const { data: rooms = [] } = useQuery(useAllRooms());
  const markMissing = useMarkLoanMissing();
  const changeRoom = useChangeLoanRoom();
  const [action, setAction] = useState<"missing" | "room" | null>(null);
  const [newRoomId, setNewRoomId] = useState("");
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  if (isLoading) return <ArchiveLoading message="Loading loan..." />;
  if (error || !loan) return <ArchiveError message="Could not load this loan." onClose={onClose} />;

  const l: LoanDto = loan;
  const isOut = l.status === "ACTIVE" || l.status === "OVERDUE";
  const isStaff = viewer.role !== "INSTRUCTOR";
  const isEvent = l.type === "EVENT";

  return (
    <ArchiveDialog label={`${formatEnum(l.type)} loan`} icon={Package} titleId="loan-detail-title" recordId={l.loanNo} recordIdLabel="Loan No." onClose={onClose}>
      <DetailHeader
        titleId="loan-detail-title"
        title={l.asset.name}
        subtitle={<span className="font-mono">{l.asset.assetCode}</span>}
        avatar={
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-inset ring-slate-200">
            {l.photoUrl ? (
              <img src={l.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-slate-400"><ImageOff className="h-5 w-5" /></span>
            )}
          </div>
        }
        badges={
          <>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${SlugStatus(l.status)}`}>{formatEnum(l.status)}</span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${SlugStatus(l.custodyState)}`}>{formatEnum(l.custodyState)}</span>
            {l.lateArrivalWarningNo && <NeutralBadge icon={TriangleAlert}>Late warning #{l.lateArrivalWarningNo}</NeutralBadge>}
          </>
        }
      />

      {/* Checkout photo from the counter webcam */}
      {!isEvent && (
        <ZoomableImage
          src={l.photoUrl}
          alt={`Checkout photo for ${l.loanNo}`}
          label="Checkout photo"
          emptyLabel="No checkout photo"
          onZoom={setZoomSrc}
        />
      )}
      {zoomSrc && <ImageLightbox src={zoomSrc} alt={`Checkout photo for ${l.loanNo}`} onClose={() => setZoomSrc(null)} />}

      <DetailSection title={isEvent ? "Event" : "Borrower"} columns={2}>
        {isEvent ? (
          <>
            <InfoRow icon={CalendarClock} label="Event" value={l.event?.title} />
            <InfoRow icon={UserRound} label="Coordinator" value={l.coordinator?.fullName} />
          </>
        ) : (
          <>
            <InfoRow icon={GraduationCap} label="Student" value={l.student?.fullName} />
            <InfoRow icon={Hash} label="Student No." value={l.student?.studentNo} mono />
            <InfoRow icon={GraduationCap} label="Section" value={l.student?.sectionCode} />
            <InfoRow icon={Presentation} label="Approved by" value={l.approvedBy?.fullName} />
          </>
        )}
      </DetailSection>

      <DetailSection title="Timing" columns={2}>
        <InfoRow icon={Clock} label="Checked out" value={FormattedDateTime(l.checkedOutAt)} />
        <InfoRow icon={DoorOpen} label="Destination room" value={l.destinationRoom ? `${l.destinationRoom.code} — ${l.destinationRoom.name}` : null} />
        <InfoRow icon={Timer} label="Transit deadline" value={l.transitDeadlineAt ? FormattedDateTime(l.transitDeadlineAt) : null} />
        <InfoRow icon={CheckCircle2} label="Verified in room" value={l.verifiedAt ? FormattedDateTime(l.verifiedAt) : null} />
        <InfoRow icon={CalendarClock} label="Class length" value={minutesToText(l.classLengthMinutes)} />
        <InfoRow icon={CalendarClock} label="Class ends" value={FormattedDateTime(l.classEndsAt)} />
        <InfoRow icon={AlarmClock} label={`Due (${l.graceMinutes} min grace)`} value={FormattedDateTime(l.dueAt)} />
        <InfoRow icon={CheckCircle2} label="Returned" value={l.returnedAt ? FormattedDateTime(l.returnedAt) : null} />
      </DetailSection>

      {/* Approval ledger */}
      {l.approvals && l.approvals.length > 0 && (
        <DetailSection title="Approvals">
          {l.approvals.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 bg-white px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{a.instructor.fullName}</p>
                <p className="text-xs text-slate-500">
                  Requested {FormattedDateTime(a.requestedAt)}
                  {a.decidedAt && ` · decided ${FormattedDateTime(a.decidedAt)}`}
                  {a.decidedDevice && ` · ${a.decidedDevice}`}
                </p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${a.decision === "APPROVED" ? "bg-emerald-50 text-emerald-700" : a.decision === "PENDING" ? "bg-slate-100 text-slate-600" : "bg-rose-50 text-rose-700"}`}>
                {formatEnum(a.decision)}
              </span>
            </div>
          ))}
        </DetailSection>
      )}

      {l.notes && <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{l.notes}</p>}

      {isStaff && isOut && (
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => { setNewRoomId(l.destinationRoom?.id ?? ""); setAction("room"); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Change room
          </button>
          <button type="button" onClick={() => setAction("missing")} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
            Mark missing
          </button>
        </div>
      )}

      {action === "missing" && (
        <ReasonDialog
          title="Mark asset missing"
          subtitle={`${l.asset.assetCode} · ${l.loanNo}`}
          confirmLabel="Mark missing"
          isSubmitting={markMissing.isPending}
          onClose={() => setAction(null)}
          onConfirm={(reason) =>
            markMissing.mutate(
              { id: l.id, data: { reason } },
              {
                onSuccess: () => {
                  setAction(null);
                  showToast.warning("Marked Missing", `${l.asset.assetCode} is now MISSING. A hold and liability are issued to the borrower.`);
                },
                onError: (err) => showToast.error("Not Updated", getErrorMessage(err, "Failed to mark missing.")),
              },
            )
          }
        >
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">This places a profile hold and a liability on the borrower.</p>
        </ReasonDialog>
      )}

      {action === "room" && (
        <ReasonDialog
          title="Change destination room"
          subtitle={`${l.asset.assetCode} · ${l.loanNo}`}
          confirmLabel="Change room"
          isSubmitting={changeRoom.isPending}
          onClose={() => setAction(null)}
          onConfirm={(reason) => {
            if (!newRoomId) return;
            changeRoom.mutate(
              { id: l.id, data: { destinationRoomId: newRoomId, reason } },
              {
                onSuccess: () => {
                  setAction(null);
                  showToast.success("Room Changed", "The room station will now expect this asset.");
                },
                onError: (err) => showToast.error("Not Updated", getErrorMessage(err, "Failed to change room.")),
              },
            );
          }}
        >
          <Field label="New room" htmlFor="loan-room" required>
            <SelectInput id="loan-room" value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)}>
              <option value="" disabled>Select a room</option>
              {rooms.filter((room) => !room.isStorage).map((room) => (
                <option key={room.id} value={room.id}>{room.code} — {room.name}</option>
              ))}
            </SelectInput>
          </Field>
        </ReasonDialog>
      )}
    </ArchiveDialog>
  );
}
