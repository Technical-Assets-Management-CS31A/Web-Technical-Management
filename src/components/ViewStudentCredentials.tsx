import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarPlus,
  Fingerprint,
  GraduationCap,
  Hash,
  Layers,
  Lock,
  Receipt,
  ShieldAlert,
} from "lucide-react";
import type { StudentDto } from "../@types/types";
import { FormattedDateTime } from "./FormattedDateTime";
import { formatEnum, fullName, initials } from "../lib/utils";
import { ArchiveDialog, ArchiveLoading, DeletedNotice, DetailHeader, DetailSection, InfoRow, InitialsAvatar, NeutralBadge } from "./ArchiveDetailShell";
import { useClearMark, useClearWarning, useLiftHold, useSettleLiability, useStudentStanding } from "../hooks/userHooks";
import { UserData, canResolvePenalties } from "../utils/usersData/userData";
import StandingPill from "./StandingPill";
import ReasonDialog from "./ReasonDialog";
import { showToast } from "./AppToast";
import { Field, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";

type ViewStudentCredentialsProps = {
  student: StudentDto;
  isOpen: boolean;
  onClose: () => void;
};

// Which penalty the staff member is resolving.
type Pending = { kind: "warning" | "mark" | "hold" | "liability"; id: string; label: string };

const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

function PenaltyRow({ title, detail, active, onResolve, actionLabel }: {
  title: string;
  detail: string;
  active: boolean;
  onResolve?: () => void;
  actionLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${active ? "text-slate-900" : "text-slate-400 line-through"}`}>{title}</p>
        <p className="truncate text-xs text-slate-500">{detail}</p>
      </div>
      {active && onResolve && (
        <button type="button" onClick={onResolve} className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const ViewStudentCredentials = ({ student, isOpen, onClose }: ViewStudentCredentialsProps) => {
  const viewer = UserData();
  const { data: standing, isLoading } = useQuery(useStudentStanding(student.id));
  const clearWarning = useClearWarning();
  const clearMark = useClearMark();
  const liftHold = useLiftHold();
  const settle = useSettleLiability();
  const [pending, setPending] = useState<Pending | null>(null);
  const [settleStatus, setSettleStatus] = useState<"SETTLED_PAYMENT" | "SETTLED_REPLACEMENT" | "WAIVED">("SETTLED_PAYMENT");
  const [receiptNo, setReceiptNo] = useState("");

  if (!isOpen) return null;
  if (isLoading) return <ArchiveLoading message="Loading standing..." />;

  const canResolve = canResolvePenalties(viewer.role);
  const resolve = canResolve ? (p: Pending) => () => setPending(p) : () => undefined;

  const confirm = (reason: string) => {
    if (!pending) return;
    const callbacks = {
      onSuccess: () => {
        setPending(null);
        setReceiptNo("");
        showToast.success("Resolved", `${pending.label} resolved.`);
      },
      onError: (err: unknown) => showToast.error("Not Resolved", getErrorMessage(err, "Failed to resolve.")),
    };
    const body = { id: pending.id, data: { reason } };
    if (pending.kind === "warning") clearWarning.mutate(body, callbacks);
    else if (pending.kind === "mark") clearMark.mutate(body, callbacks);
    else if (pending.kind === "hold") liftHold.mutate(body, callbacks);
    else settle.mutate({ id: pending.id, data: { status: settleStatus, receiptNo: receiptNo.trim() || null, reason } }, callbacks);
  };

  const isResolving = clearWarning.isPending || clearMark.isPending || liftHold.isPending || settle.isPending;
  const warnings = standing?.warnings ?? [];
  const marks = standing?.marks ?? [];
  const holds = standing?.holds ?? [];
  const liabilities = standing?.liabilities ?? [];

  return (
    <ArchiveDialog label="Student" icon={GraduationCap} titleId="student-detail-title" recordId={student.id} recordIdLabel="Student ID" onClose={onClose}>
      <DetailHeader
        titleId="student-detail-title"
        title={fullName(student)}
        subtitle={<span className="font-mono">{student.studentNo}</span>}
        avatar={<InitialsAvatar initials={initials(student) || "?"} />}
        badges={
          <>
            <StandingPill standing={standing?.standing ?? student.standing} />
            {student.hasActiveHold && <NeutralBadge icon={Lock}>Profile hold</NeutralBadge>}
            <NeutralBadge>{formatEnum(student.status)}</NeutralBadge>
          </>
        }
      />

      {student.deletedAt && <DeletedNotice deletedAt={student.deletedAt} subject="student" />}

      <DetailSection title="Roster" columns={2}>
        <InfoRow icon={Hash} label="Student No." value={student.studentNo} mono copyable />
        <InfoRow icon={Layers} label="Section" value={student.section ? `${student.section.code} · ${student.section.program} ${student.section.yearLevel}` : null} />
        <InfoRow icon={CalendarPlus} label="School year" value={student.section?.schoolYear} />
        <InfoRow icon={Fingerprint} label="Fingerprints" value={student.enrolledFingerCount ? `${student.enrolledFingerCount} enrolled` : "Not enrolled"} />
      </DetailSection>

      {/* Standing — penalties are issued by the system; staff clear them with a reason */}
      <DetailSection title={`Late arrival warnings (${student.activeWarningCount} this term)`}>
        {warnings.length === 0 && <p className="bg-white px-4 py-3 text-sm italic text-slate-400">None</p>}
        {warnings.map((w) => (
          <PenaltyRow
            key={w.id}
            title={`Warning #${w.warningNo}${w.triggeredPenalty ? " · triggered a mark" : ""}`}
            detail={`${w.schoolTerm} · ${FormattedDateTime(w.issuedAt)}`}
            active={w.status === "ACTIVE"}
            actionLabel="Clear"
            onResolve={resolve({ kind: "warning", id: w.id, label: `Warning #${w.warningNo}` })}
          />
        ))}
      </DetailSection>

      <DetailSection title={`Non-compliance marks (${student.activeMarkCount} active)`}>
        {marks.length === 0 && <p className="bg-white px-4 py-3 text-sm italic text-slate-400">None</p>}
        {marks.map((m) => (
          <PenaltyRow
            key={m.id}
            title={formatEnum(m.reason)}
            detail={FormattedDateTime(m.issuedAt) ?? ""}
            active={m.status === "ACTIVE"}
            actionLabel="Clear"
            onResolve={resolve({ kind: "mark", id: m.id, label: `${formatEnum(m.reason)} mark` })}
          />
        ))}
      </DetailSection>

      {(holds.length > 0 || liabilities.length > 0) && (
        <DetailSection title="Holds and liabilities">
          {holds.map((h) => (
            <PenaltyRow
              key={h.id}
              title="Profile hold"
              detail={`Placed ${FormattedDateTime(h.placedAt)}`}
              active={h.status === "ACTIVE"}
              actionLabel="Lift"
              onResolve={resolve({ kind: "hold", id: h.id, label: "Profile hold" })}
            />
          ))}
          {liabilities.map((l) => (
            <PenaltyRow
              key={l.id}
              title={`Liability ${php.format(l.amount)}`}
              detail={`${formatEnum(l.status)}${l.receiptNo ? ` · OR ${l.receiptNo}` : ""}`}
              active={l.status === "OUTSTANDING"}
              actionLabel="Settle"
              onResolve={resolve({ kind: "liability", id: l.id, label: `Liability ${php.format(l.amount)}` })}
            />
          ))}
        </DetailSection>
      )}

      {!canResolve && (warnings.length > 0 || marks.length > 0) && (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="h-3.5 w-3.5" />
          Only admins and technical staff can clear penalties.
        </p>
      )}

      {pending && (
        <ReasonDialog
          title={pending.kind === "liability" ? "Settle liability" : pending.kind === "hold" ? "Lift hold" : "Clear penalty"}
          subtitle={`${pending.label} · ${fullName(student)}`}
          confirmLabel={pending.kind === "liability" ? "Settle" : pending.kind === "hold" ? "Lift hold" : "Clear"}
          isSubmitting={isResolving}
          onClose={() => setPending(null)}
          onConfirm={confirm}
        >
          {pending.kind === "liability" ? (
            <>
              <Field label="Settled by" htmlFor="settle-status">
                <SelectInput id="settle-status" value={settleStatus} onChange={(e) => setSettleStatus(e.target.value as typeof settleStatus)}>
                  <option value="SETTLED_PAYMENT">Payment</option>
                  <option value="SETTLED_REPLACEMENT">Replacement</option>
                  <option value="WAIVED">Waived</option>
                </SelectInput>
              </Field>
              {settleStatus === "SETTLED_PAYMENT" && (
                <Field label="Receipt No." htmlFor="settle-receipt" optional>
                  <TextInput id="settle-receipt" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} placeholder="OR-000123" />
                </Field>
              )}
            </>
          ) : pending.kind === "mark" ? (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Clearing a mark can change the student's standing.
            </p>
          ) : pending.kind === "hold" ? (
            <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Receipt className="mt-0.5 h-4 w-4 shrink-0" />
              Lift the hold once the loan is returned or settled.
            </p>
          ) : null}
        </ReasonDialog>
      )}
    </ArchiveDialog>
  );
};

export default ViewStudentCredentials;
