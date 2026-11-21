import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, Fingerprint, GraduationCap, Hash, Layers, Lock, ShieldAlert } from "lucide-react";
import type { StudentDto } from "../@types/types";
import { FormattedDateTime } from "./FormattedDateTime";
import { formatEnum, fullName, initials } from "../lib/utils";
import { ArchiveDialog, ArchiveLoading, DeletedNotice, DetailHeader, DetailSection, InfoRow, InitialsAvatar, NeutralBadge } from "./ArchiveDetailShell";
import { useStudentStanding } from "../hooks/userHooks";
import { UserData, canResolvePenalties } from "../utils/usersData/userData";
import StandingPill from "./StandingPill";
import PenaltyResolveDialog, { type PenaltyTarget } from "./PenaltyResolveDialog";

type ViewStudentCredentialsProps = {
  student: StudentDto;
  isOpen: boolean;
  onClose: () => void;
};

// Which penalty the staff member is resolving.
type Pending = Omit<PenaltyTarget, "subject">;

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
  const [pending, setPending] = useState<Pending | null>(null);

  if (!isOpen) return null;
  if (isLoading) return <ArchiveLoading message="Loading standing..." />;

  const canResolve = canResolvePenalties(viewer.role);
  const resolve = canResolve ? (p: Pending) => () => setPending(p) : () => undefined;

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

      {pending && <PenaltyResolveDialog target={{ ...pending, subject: fullName(student) }} onClose={() => setPending(null)} />}
    </ArchiveDialog>
  );
};

export default ViewStudentCredentials;
