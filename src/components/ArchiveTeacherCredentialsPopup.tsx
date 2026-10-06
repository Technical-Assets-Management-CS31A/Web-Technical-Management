import { useQuery } from "@tanstack/react-query";
import { useGetArchiveUserInfo } from "../hooks/userHooks";
import type { TArchiveTeacher } from "../@types/types";
import { FormattedPhoneNumber } from "./FormatedPhoneNumber";
import { Mail, Phone, AtSign, BookOpen, Presentation, UserRound } from "lucide-react";
import {
  ArchiveDialog,
  ArchiveError,
  ArchiveLoading,
  ArchivedNotice,
  DetailHeader,
  DetailSection,
  InfoRow,
  InitialsAvatar,
  NeutralBadge,
} from "./ArchiveDetailShell";

type ArchiveTeacherCredentialsPopupProps = {
  teacherId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ArchiveTeacherCredentialsPopup({
  teacherId,
  isOpen,
  onClose,
}: ArchiveTeacherCredentialsPopupProps) {
  const { data, isLoading, error } = useQuery(useGetArchiveUserInfo(teacherId));

  if (!isOpen) return null;
  if (isLoading) return <ArchiveLoading message="Loading teacher details..." />;
  if (error || !data) return <ArchiveError message="Could not load this archived teacher." onClose={onClose} />;

  const teacher = data as TArchiveTeacher;

  const fullName = `${teacher.firstName} ${teacher.middleName ? `${teacher.middleName.charAt(0)}.` : ""} ${teacher.lastName}`
    .replace(/\s+/g, " ")
    .trim();

  const initials =
    teacher.firstName && teacher.lastName
      ? `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase()
      : "T";

  return (
    <ArchiveDialog
      label="Archived Teacher"
      titleId="archive-teacher-title"
      recordId={teacher.originalUserId}
      recordIdLabel="Original user ID"
      onClose={onClose}
    >
      <DetailHeader
        titleId="archive-teacher-title"
        title={fullName}
        subtitle={
          <>
            @{teacher.username}
            {teacher.department && <span className="text-slate-400"> · {teacher.department}</span>}
          </>
        }
        avatar={<InitialsAvatar initials={initials} />}
        badges={
          <>
            <NeutralBadge icon={Presentation}>{teacher.userRole || "Teacher"}</NeutralBadge>
            <NeutralBadge>{teacher.status || "Archived"}</NeutralBadge>
          </>
        }
      />

      <ArchivedNotice archivedAt={teacher.archivedAt} subject="teacher" />

      <DetailSection title="Contact">
        <InfoRow
          icon={Mail}
          label="Email"
          value={teacher.email}
          href={teacher.email ? `mailto:${teacher.email}` : undefined}
          copyable
        />
        <InfoRow
          icon={Phone}
          label="Phone Number"
          value={teacher.phoneNumber ? FormattedPhoneNumber(teacher.phoneNumber) : null}
          copyable
        />
      </DetailSection>

      <DetailSection title="Teaching">
        <InfoRow icon={BookOpen} label="Department" value={teacher.department} />
      </DetailSection>

      <DetailSection title="Account">
        <InfoRow icon={UserRound} label="Full Name" value={fullName || null} />
        <InfoRow icon={AtSign} label="Username" value={teacher.username} copyable />
      </DetailSection>
    </ArchiveDialog>
  );
}
