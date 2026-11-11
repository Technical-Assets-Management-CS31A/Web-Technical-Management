import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCanGoBack, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import {
  AlarmClock,
  ArrowLeft,
  CalendarClock,
  DoorOpen,
  GraduationCap,
  Hash,
  Info,
  Presentation,
  SearchX,
  Timer,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import type { ApprovalDto, LoanDto } from "../@types/types";
import { useChangeLoanRoom, useGetLoan, useMarkLoanMissing } from "../hooks/loanHooks";
import { useAllRooms } from "../hooks/assetHooks";
import { DetailSection, ImageLightbox, InfoRow, NeutralBadge, ZoomableImage } from "../components/ArchiveDetailShell";
import { FormattedDateTime } from "../components/FormattedDateTime";
import { SlugStatus } from "../components/SlugStatus";
import ReasonDialog from "../components/ReasonDialog";
import { showToast } from "../components/AppToast";
import { Field, SelectInput, getErrorMessage } from "../components/form/FormKit";
import { formatEnum } from "../lib/utils";
import { buildLoanTimeline, dueState, minutesToText, type DueState, type TimelineStep } from "../lib/loanDetail";
import { isOpenLoan } from "../lib/loanFilters";
import { UserData } from "../utils/usersData/userData";
import { LOAN_DETAIL_CONTENT as T } from "../constants/loanDetailContent";

// PRD 6.5 Loan detail: checkout photo, class length, due time, destination room and the approval ledger.
// Staff can mark the asset missing or change its room. Loans are created and returned only at the kiosk.

const DUE_TONE: Record<DueState["kind"] | "soon", string> = {
  due: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  soon: "bg-amber-50 text-amber-700 ring-amber-200",
  overdue: "bg-rose-50 text-rose-700 ring-rose-200",
  returned: "bg-slate-100 text-slate-700 ring-slate-200",
  missing: "bg-red-50 text-red-700 ring-red-200",
};

const DECISION_TONE: Record<ApprovalDto["decision"], string> = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-slate-100 text-slate-600",
  DECLINED: "bg-rose-50 text-rose-700",
  EXPIRED: "bg-amber-50 text-amber-700",
};

const STEP_DOT: Record<TimelineStep["state"], string> = {
  done: "bg-emerald-500 ring-emerald-100",
  late: "bg-rose-500 ring-rose-100",
  upcoming: "bg-white ring-slate-200 border border-slate-300",
};

export default function LoanDetail() {
  const { loanId } = useParams({ strict: false }) as { loanId: string };
  const { data: loan, isLoading, isError } = useQuery(useGetLoan(loanId));

  if (isLoading) return <LoanDetailSkeleton />;
  if (isError || !loan) return <LoanNotFound />;
  return <LoanDetailView loan={loan} />;
}

function BackButton() {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  // Going back keeps the list's status/room filters; a direct visit falls back to the list.
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.history.back() : navigate({ to: "/home/loans" }))}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
    >
      <ArrowLeft className="h-4 w-4" />
      {T.back}
    </button>
  );
}

function LoanDetailView({ loan: l }: { loan: LoanDto }) {
  const viewer = UserData();
  const { data: roomsData } = useQuery(useAllRooms());
  const markMissing = useMarkLoanMissing();
  const changeRoom = useChangeLoanRoom();
  const [action, setAction] = useState<"missing" | "room" | null>(null);
  const [newRoomId, setNewRoomId] = useState("");
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
  const isStaff = viewer.role !== "INSTRUCTOR";
  const isEvent = l.type === "EVENT";
  const due = dueState(l, now);
  const timeline = buildLoanTimeline(l, now);
  const classLength = minutesToText(l.classLengthMinutes);
  const approvals = [...(l.approvals ?? [])].sort(
    (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
        <BackButton />

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
              {T.eyebrow(formatEnum(l.type))} · <span className="font-mono normal-case">{l.loanNo}</span>
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">{l.asset.name}</h1>
            <p className="mt-0.5 font-mono text-sm text-slate-500">{l.asset.assetCode}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${SlugStatus(l.status)}`}>{formatEnum(l.status)}</span>
              {isOut && (
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${SlugStatus(l.custodyState)}`}>{formatEnum(l.custodyState)}</span>
              )}
              {l.lateArrivalWarningNo && <NeutralBadge icon={TriangleAlert}>Late warning #{l.lateArrivalWarningNo}</NeutralBadge>}
            </div>
          </div>

          {isStaff && isOut && (
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setNewRoomId(l.destinationRoom?.id ?? ""); setAction("room"); }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {T.actions.changeRoom}
              </button>
              <button
                type="button"
                onClick={() => setAction("missing")}
                className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                {T.actions.markMissing}
              </button>
            </div>
          )}
        </header>

        {/* Photo + key facts */}
        <section className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-3">
            <ZoomableImage
              src={isEvent ? null : l.photoUrl}
              alt={T.photo.alt(l.loanNo)}
              label={T.photo.label}
              emptyLabel={T.photo.empty}
              className="aspect-[4/3] w-full"
              onZoom={setZoomSrc}
            />
            <p className="text-xs text-slate-500">{isEvent ? T.photo.eventCaption : T.photo.caption}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1 lg:content-start">
            {/* Due time */}
            <FactCard icon={AlarmClock} label={T.facts.due}>
              <p className="text-xl font-semibold tracking-tight text-slate-900">{FormattedDateTime(l.dueAt)}</p>
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ring-1 ring-inset ${
                  DUE_TONE[due.kind === "due" && due.soon ? "soon" : due.kind]
                }`}
              >
                {due.label}
              </span>
              <p className="mt-2 text-xs text-slate-500">{T.facts.dueFormula(classLength, l.graceMinutes)}</p>
            </FactCard>

            {/* Class length */}
            <FactCard icon={Timer} label={T.facts.classLength}>
              <p className="text-xl font-semibold tracking-tight text-slate-900">{classLength ?? T.facts.noClassLength}</p>
              <p className="mt-1 text-xs text-slate-500">{T.facts.classEnds(FormattedDateTime(l.classEndsAt) ?? "—")}</p>
            </FactCard>

            {/* Destination room */}
            <FactCard icon={DoorOpen} label={T.facts.room}>
              {l.destinationRoom ? (
                <>
                  <p className="text-xl font-semibold tracking-tight text-slate-900">{l.destinationRoom.code}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {[l.destinationRoom.name, destination?.building, destination?.floor && `Floor ${destination.floor}`].filter(Boolean).join(" · ")}
                  </p>
                </>
              ) : (
                <p className="text-xl font-semibold tracking-tight text-slate-400">{T.facts.noRoom}</p>
              )}
            </FactCard>
          </div>
        </section>

        {/* Borrower + timeline */}
        <section className="grid gap-6 lg:grid-cols-2">
          <DetailSection title={isEvent ? T.sections.event : T.sections.borrower}>
            {isEvent ? (
              <>
                <InfoRow icon={CalendarClock} label={T.fields.event} value={l.event?.title} />
                <InfoRow icon={UserRound} label={T.fields.coordinator} value={l.coordinator?.fullName} />
              </>
            ) : (
              <>
                <InfoRow icon={GraduationCap} label={T.fields.student} value={l.student?.fullName} />
                <InfoRow icon={Hash} label={T.fields.studentNo} value={l.student?.studentNo} mono copyable />
                <InfoRow icon={GraduationCap} label={T.fields.section} value={l.student?.sectionCode} />
                <InfoRow icon={Presentation} label={T.fields.approvedBy} value={l.approvedBy?.fullName} />
              </>
            )}
          </DetailSection>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{T.sections.timeline}</h3>
            <ol className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              {timeline.map((step, i) => (
                <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < timeline.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200" aria-hidden />}
                  <span className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ${STEP_DOT[step.state]}`} aria-hidden />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${step.state === "late" ? "text-rose-700" : step.state === "upcoming" ? "text-slate-500" : "text-slate-900"}`}>
                      {step.label}
                    </p>
                    {step.at && <p className="text-xs text-slate-500">{FormattedDateTime(step.at)}</p>}
                    {step.hint && <p className="text-xs text-amber-700">{step.hint}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </section>

        {/* Approval ledger */}
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{T.sections.ledger}</h3>
          {approvals.length > 0 ? (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {approvals.map((a) => {
                const room = a.destinationRoomId ? roomById.get(a.destinationRoomId) : undefined;
                const roomLabel = room?.code ?? (a.destinationRoomId === l.destinationRoom?.id ? l.destinationRoom?.code : null);
                return (
                  <li key={a.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{a.instructor.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {T.ledger.requested(FormattedDateTime(a.requestedAt) ?? "—")}
                        {a.decidedAt && ` · ${T.ledger.decided(FormattedDateTime(a.decidedAt) ?? "—")}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{T.ledger.room}: <span className="font-medium text-slate-700">{roomLabel ?? "—"}</span></span>
                      <span>{T.ledger.classLength}: <span className="font-medium text-slate-700">{minutesToText(a.classLengthMinutes) ?? "—"}</span></span>
                      {a.decidedDevice && <span>{T.ledger.device}: <span className="font-medium text-slate-700">{a.decidedDevice}</span></span>}
                      <span className={`rounded-md px-2 py-0.5 font-medium ${DECISION_TONE[a.decision]}`}>{formatEnum(a.decision)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">{T.ledger.empty}</p>
          )}
        </section>

        {l.notes && (
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{T.sections.notes}</h3>
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{l.notes}</p>
          </section>
        )}

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
          {T.actions.readOnlyHint}
        </p>
      </div>

      {zoomSrc && <ImageLightbox src={zoomSrc} alt={T.photo.alt(l.loanNo)} onClose={() => setZoomSrc(null)} />}

      {action === "missing" && (
        <ReasonDialog
          title={T.missingDialog.title}
          subtitle={`${l.asset.assetCode} · ${l.loanNo}`}
          confirmLabel={T.missingDialog.confirm}
          isSubmitting={markMissing.isPending}
          onClose={() => setAction(null)}
          onConfirm={(reason) =>
            markMissing.mutate(
              { id: l.id, data: { reason } },
              {
                onSuccess: () => {
                  setAction(null);
                  showToast.warning(T.missingDialog.successTitle, T.missingDialog.success(l.asset.assetCode));
                },
                onError: (err) => showToast.error(T.errorTitle, getErrorMessage(err, T.missingDialog.error)),
              },
            )
          }
        >
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{T.missingDialog.warning}</p>
        </ReasonDialog>
      )}

      {action === "room" && (
        <ReasonDialog
          title={T.roomDialog.title}
          subtitle={`${l.asset.assetCode} · ${l.loanNo}`}
          confirmLabel={T.roomDialog.confirm}
          isSubmitting={changeRoom.isPending}
          onClose={() => setAction(null)}
          onConfirm={(reason) => {
            if (!newRoomId) return;
            changeRoom.mutate(
              { id: l.id, data: { destinationRoomId: newRoomId, reason } },
              {
                onSuccess: () => {
                  setAction(null);
                  showToast.success(T.roomDialog.successTitle, T.roomDialog.success);
                },
                onError: (err) => showToast.error(T.errorTitle, getErrorMessage(err, T.roomDialog.error)),
              },
            );
          }}
        >
          <Field label={T.roomDialog.field} htmlFor="loan-room" required>
            <SelectInput id="loan-room" value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)}>
              <option value="" disabled>{T.roomDialog.placeholder}</option>
              {rooms.filter((room) => !room.isStorage).map((room) => (
                <option key={room.id} value={room.id}>{room.code} — {room.name}</option>
              ))}
            </SelectInput>
          </Field>
        </ReasonDialog>
      )}
    </div>
  );
}

function FactCard({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function LoanNotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:px-8">
        <BackButton />
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <SearchX className="h-5 w-5 text-slate-400" />
          </span>
          <p className="text-sm font-semibold text-slate-900">{T.notFound.title}</p>
          <p className="mt-1 text-sm text-slate-500">{T.notFound.description}</p>
        </div>
      </div>
    </div>
  );
}

const Bone = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;

function LoanDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label={T.loading}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:px-8">
        <Bone className="h-6 w-32" />
        <div className="space-y-2">
          <Bone className="h-3 w-40" />
          <Bone className="h-7 w-72 max-w-full" />
          <Bone className="h-4 w-28" />
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <Bone className="aspect-[4/3] w-full rounded-xl lg:col-span-3" />
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1 lg:content-start">
            {[0, 1, 2].map((i) => <Bone key={i} className="h-28 rounded-xl" />)}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Bone className="h-56 rounded-xl" />
          <Bone className="h-56 rounded-xl" />
        </div>
        <Bone className="h-24 rounded-xl" />
      </div>
    </div>
  );
}
