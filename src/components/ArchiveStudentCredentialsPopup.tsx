import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetArchiveUserInfo } from "../hooks/userHooks";
import type { TArchiveStudent } from "../@types/types";
import { FormattedPhoneNumber } from "./FormatedPhoneNumber";
import { Mail, Phone, MapPin, GraduationCap, AtSign, BookOpen, Hash, Layers, UserRound } from "lucide-react";
import {
  ArchiveDialog,
  ArchiveError,
  ArchiveLoading,
  ArchivedNotice,
  DetailHeader,
  DetailSection,
  ImageLightbox,
  InfoRow,
  InitialsAvatar,
  NeutralBadge,
  ZoomableImage,
} from "./ArchiveDetailShell";

type ArchiveStudentCredentialsPopupProps = {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ArchiveStudentCredentialsPopup({
  studentId,
  isOpen,
  onClose,
}: ArchiveStudentCredentialsPopupProps) {
  const { data, isLoading, error } = useQuery(useGetArchiveUserInfo(studentId));
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  // Cache-bust ID images once per open, so re-renders don't reload them
  const [cacheKey] = useState(() => Date.now());

  if (!isOpen) return null;
  if (isLoading) return <ArchiveLoading message="Loading student details..." />;
  if (error || !data) return <ArchiveError message="Could not load this archived student." onClose={onClose} />;

  const student = data as TArchiveStudent;

  const fullName = `${student.firstName} ${student.middleName ? `${student.middleName.charAt(0)}.` : ""} ${student.lastName}`
    .replace(/\s+/g, " ")
    .trim();

  const initials =
    student.firstName && student.lastName
      ? `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
      : "S";

  const academicSummary = [student.course, student.year, student.section && `Section ${student.section}`]
    .filter(Boolean)
    .join(" · ");

  const fullAddress = [
    student.street,
    student.cityMunicipality,
    [student.province, student.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const withCacheKey = (src?: string | null) => (src ? `${src}?t=${cacheKey}` : null);

  return (
    <ArchiveDialog
      label="Archived Student"
      titleId="archive-student-title"
      recordId={student.originalUserId}
      recordIdLabel="Original user ID"
      onClose={onClose}
      onEscape={() => (lightboxSrc ? setLightboxSrc(null) : onClose())}
    >
      <DetailHeader
        titleId="archive-student-title"
        title={fullName}
        subtitle={
          <>
            @{student.username}
            {academicSummary && <span className="text-slate-400"> · {academicSummary}</span>}
          </>
        }
        avatar={<InitialsAvatar initials={initials} />}
        badges={
          <>
            <NeutralBadge icon={GraduationCap}>{student.userRole || "Student"}</NeutralBadge>
            <NeutralBadge>{student.status || "Archived"}</NeutralBadge>
          </>
        }
      />

      <ArchivedNotice archivedAt={student.archivedAt} subject="student" />

      <DetailSection title="Contact">
        <InfoRow
          icon={Mail}
          label="Email"
          value={student.email}
          href={student.email ? `mailto:${student.email}` : undefined}
          copyable
        />
        <InfoRow
          icon={Phone}
          label="Phone Number"
          value={student.phoneNumber ? FormattedPhoneNumber(student.phoneNumber) : null}
          copyable
        />
        <InfoRow icon={MapPin} label="Address" value={fullAddress || null} copyable />
      </DetailSection>

      <DetailSection title="Academic" columns={2}>
        <InfoRow icon={Hash} label="Student ID" value={student.studentIdNumber} mono copyable />
        <InfoRow icon={BookOpen} label="Course" value={student.course} />
        <InfoRow icon={GraduationCap} label="Year Level" value={student.year} />
        <InfoRow icon={Layers} label="Section" value={student.section} />
      </DetailSection>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Student ID</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ZoomableImage
            src={withCacheKey(student.frontStudentIdPicture)}
            alt="Student ID front"
            label="Front"
            emptyLabel="No front image"
            onZoom={setLightboxSrc}
          />
          <ZoomableImage
            src={withCacheKey(student.backStudentIdPicture)}
            alt="Student ID back"
            label="Back"
            emptyLabel="No back image"
            onZoom={setLightboxSrc}
          />
        </div>
      </section>

      <DetailSection title="Account">
        <InfoRow icon={UserRound} label="Full Name" value={fullName || null} />
        <InfoRow icon={AtSign} label="Username" value={student.username} copyable />
      </DetailSection>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt="Student ID enlarged" onClose={() => setLightboxSrc(null)} />}
    </ArchiveDialog>
  );
}
