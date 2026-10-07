import { useEffect, useState, type FC } from "react";
import type { TStudent } from "../@types/types";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  KeyRound,
  AtSign,
  BookOpen,
  Hash,
  Layers,
  CreditCard,
  ImageOff,
  ZoomIn,
  Copy,
  Check,
  ShieldAlert,
  UserRound,
  Nfc,
} from "lucide-react";
import { FormattedPhoneNumber } from "./FormatedPhoneNumber";
import { FormattedDateTime } from "./FormattedDateTime";

type ViewStudentCredentialsProps = {
  student: TStudent;
  isOpen: boolean;
  onClose: () => void;
};

const ViewStudentCredentials: FC<ViewStudentCredentialsProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Cache-bust ID images once per open, so re-renders don't reload them
  const [cacheKey] = useState(() => Date.now());

  // Escape closes the lightbox first, then the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightboxSrc) setLightboxSrc(null);
      else onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, lightboxSrc, onClose]);

  // Reset the "Copied" indicator after a moment
  useEffect(() => {
    if (!copiedKey) return;
    const id = setTimeout(() => setCopiedKey(null), 1500);
    return () => clearTimeout(id);
  }, [copiedKey]);

  if (!isOpen) return null;

  const handleCopy = async (key: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore silently
    }
  };

  const fullName = `${student.firstName} ${student.middleName ? `${student.middleName.charAt(0)}.` : ""} ${student.lastName}`
    .replace(/\s+/g, " ")
    .trim();

  const initials =
    student.firstName && student.lastName
      ? `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
      : "S";

  const isOnline = ["online", "active"].includes(student.status?.toLowerCase());

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-credentials-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top strip */}
        <div className="relative h-28 shrink-0 border-b border-slate-100 bg-slate-50">
          <span className="absolute left-6 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            <GraduationCap className="h-3 w-3" />
            Student Credentials
          </span>
          <button
            type="button"
            onClick={onClose}
            data-testid="closebutton"
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {/* Identity */}
          <div className="px-6">
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="relative shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-2xl font-semibold text-white shadow-lg ring-4 ring-white">
                    {initials}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-4 ring-white ${isOnline ? "bg-emerald-500" : "bg-slate-300"}`}
                  />
                </div>
                <div className="min-w-0 pb-1">
                  <h2 id="student-credentials-title" className="truncate text-lg font-semibold tracking-tight text-slate-900">
                    {fullName}
                  </h2>
                  <p className="truncate text-sm text-slate-500">
                    @{student.username}
                    {academicSummary && <span className="text-slate-400"> · {academicSummary}</span>}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pb-1">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <GraduationCap className="h-3 w-3" />
                  {student.userRole || "Student"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    {isOnline && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                  </span>
                  {student.status || "Unknown"}
                </span>
                {student.rfidUid && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                    <Nfc className="h-3 w-3" />
                    RFID linked
                  </span>
                )}
                {student.isBlocked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                    <ShieldAlert className="h-3 w-3" />
                    Blocked
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 px-6 pb-6 pt-6">
            {/* Blocked notice */}
            {student.isBlocked && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div className="text-sm">
                  <p className="font-medium text-rose-800">This account is blocked</p>
                  <p className="mt-0.5 text-rose-700/80">{student.blockReason || "No reason provided."}</p>
                  <p className="mt-1 text-xs text-rose-600/80">
                    {student.blockedUntil ? `Until ${FormattedDateTime(student.blockedUntil)}` : "Permanent block"}
                  </p>
                </div>
              </div>
            )}

            {/* Contact */}
            <Section title="Contact">
              <InfoRow
                icon={Mail}
                label="Email"
                value={student.email}
                href={student.email ? `mailto:${student.email}` : undefined}
                onCopy={() => handleCopy("email", student.email)}
                copied={copiedKey === "email"}
              />
              <InfoRow
                icon={Phone}
                label="Phone Number"
                value={student.phoneNumber ? FormattedPhoneNumber(student.phoneNumber) : null}
                onCopy={() => handleCopy("phone", student.phoneNumber)}
                copied={copiedKey === "phone"}
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={fullAddress || null}
                onCopy={() => handleCopy("address", fullAddress)}
                copied={copiedKey === "address"}
              />
            </Section>

            {/* Academic */}
            <Section title="Academic">
              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
                <InfoRow
                  icon={Hash}
                  label="Student ID"
                  value={student.studentIdNumber}
                  mono
                  onCopy={() => handleCopy("studentId", student.studentIdNumber)}
                  copied={copiedKey === "studentId"}
                />
                <InfoRow icon={BookOpen} label="Course" value={student.course} />
                <InfoRow icon={GraduationCap} label="Year Level" value={student.year} />
                <InfoRow icon={Layers} label="Section" value={student.section} />
              </div>
              <InfoRow
                icon={CreditCard}
                label="RFID Card"
                value={student.rfidUid}
                mono
                onCopy={() => handleCopy("rfid", student.rfidUid)}
                copied={copiedKey === "rfid"}
              />
            </Section>

            {/* ID Images */}
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Student ID</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <IdImageCard label="Front" src={withCacheKey(student.frontStudentIdPicture)} onZoom={setLightboxSrc} />
                <IdImageCard label="Back" src={withCacheKey(student.backStudentIdPicture)} onZoom={setLightboxSrc} />
              </div>
            </section>

            {/* Login */}
            <Section title="Login">
              <InfoRow
                icon={AtSign}
                label="Username"
                value={student.username}
                onCopy={() => handleCopy("username", student.username)}
                copied={copiedKey === "username"}
              />
              <div className="group flex items-center gap-3 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Generated Password</p>
                  {student.generatedPassword ? (
                    <p className="truncate font-mono text-sm font-medium tracking-wide text-slate-900">
                      {showPassword ? student.generatedPassword : "•".repeat(Math.min(student.generatedPassword.length, 12))}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">Not available</p>
                  )}
                </div>
                {student.generatedPassword && (
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleCopy("password", student.generatedPassword)}
                      title="Copy password"
                      active={copiedKey === "password"}
                    >
                      {copiedKey === "password" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </IconButton>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
          <button
            type="button"
            onClick={() => handleCopy("id", student.id)}
            title="Copy account ID"
            className="group inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
          >
            <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate font-mono">{student.id}</span>
            {copiedKey === "id" ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxSrc(null);
          }}
        >
          <div className="relative w-full max-w-3xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              aria-label="Close preview"
              className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition-colors hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={lightboxSrc} alt="Student ID enlarged" className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStudentCredentials;

// ── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">{children}</div>
    </section>
  );
}

function IconButton({
  onClick,
  title,
  active = false,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        active ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  mono = false,
  onCopy,
  copied = false,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  href?: string;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50/70">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        {value ? (
          href ? (
            <a href={href} className="block truncate text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline">
              {value}
            </a>
          ) : (
            <p className={`truncate text-sm font-medium text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</p>
          )
        ) : (
          <p className="text-sm italic text-slate-400">Not provided</p>
        )}
      </div>
      {value && onCopy && (
        <button
          type="button"
          onClick={onCopy}
          title={`Copy ${label.toLowerCase()}`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
            copied
              ? "bg-emerald-50 text-emerald-600"
              : "text-slate-400 opacity-0 hover:bg-white hover:text-slate-700 hover:shadow-sm focus:opacity-100 group-hover:opacity-100"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

function IdImageCard({
  label,
  src,
  onZoom,
}: {
  label: string;
  src: string | null;
  onZoom: (src: string) => void;
}) {
  if (!src) {
    return (
      <div className="flex aspect-[1.6] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
        <ImageOff className="h-6 w-6" />
        <span className="text-xs font-medium">No {label.toLowerCase()} image</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onZoom(src)}
      className="group relative aspect-[1.6] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
    >
      <img
        src={src}
        alt={`Student ID ${label.toLowerCase()}`}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
        {label}
      </span>
      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors group-hover:bg-slate-900/30">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-5 w-5" />
        </span>
      </span>
    </button>
  );
}
