import { useEffect, useState, type FC } from "react";
import type { TTeacher } from "../@types/types";
import { FormattedPhoneNumber } from "./FormatedPhoneNumber";
import { FormattedDateTime } from "./FormattedDateTime";
import {
  X,
  Mail,
  Phone,
  BookOpen,
  AtSign,
  Layers,
  Presentation,
  Copy,
  Check,
  ShieldAlert,
  UserRound,
  CalendarPlus,
  CalendarClock,
} from "lucide-react";

type ViewTeacherCredentialsProps = {
  teacher: TTeacher;
  isOpen: boolean;
  onClose: () => void;
};

const ViewTeacherCredentials: FC<ViewTeacherCredentialsProps> = ({
  teacher,
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

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

  const fullName = `${teacher.firstName} ${teacher.middleName ? `${teacher.middleName.charAt(0)}.` : ""} ${teacher.lastName}`
    .replace(/\s+/g, " ")
    .trim();

  const initials =
    teacher.firstName && teacher.lastName
      ? `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase()
      : "T";

  const isOnline = ["online", "active"].includes(teacher.status?.toLowerCase());

  const teachingSummary = [teacher.department, teacher.subject].filter(Boolean).join(" · ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="teacher-credentials-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top strip */}
        <div className="relative h-28 shrink-0 border-b border-slate-100 bg-slate-50">
          <span className="absolute left-6 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            <Presentation className="h-3 w-3" />
            Teacher Credentials
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
                  <h2 id="teacher-credentials-title" className="truncate text-lg font-semibold tracking-tight text-slate-900">
                    {fullName}
                  </h2>
                  <p className="truncate text-sm text-slate-500">
                    @{teacher.username}
                    {teachingSummary && <span className="text-slate-400"> · {teachingSummary}</span>}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pb-1">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                  <Presentation className="h-3 w-3" />
                  {teacher.userRole || "Teacher"}
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
                  {teacher.status || "Unknown"}
                </span>
                {teacher.isBlocked && (
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
            {teacher.isBlocked && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div className="text-sm">
                  <p className="font-medium text-rose-800">This account is blocked</p>
                  <p className="mt-0.5 text-rose-700/80">{teacher.blockReason || "No reason provided."}</p>
                  <p className="mt-1 text-xs text-rose-600/80">
                    {teacher.blockedUntil ? `Until ${FormattedDateTime(teacher.blockedUntil)}` : "Permanent block"}
                  </p>
                </div>
              </div>
            )}

            {/* Teaching — highlight tiles */}
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Teaching</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <HighlightTile icon={BookOpen} label="Department" value={teacher.department} tone="bg-blue-50 text-blue-600" />
                <HighlightTile icon={Layers} label="Subject Specialization" value={teacher.subject} tone="bg-violet-50 text-violet-600" />
              </div>
            </section>

            {/* Contact */}
            <Section title="Contact">
              <InfoRow
                icon={Mail}
                label="Email"
                value={teacher.email}
                href={teacher.email ? `mailto:${teacher.email}` : undefined}
                onCopy={() => handleCopy("email", teacher.email)}
                copied={copiedKey === "email"}
              />
              <InfoRow
                icon={Phone}
                label="Phone Number"
                value={teacher.phoneNumber ? FormattedPhoneNumber(teacher.phoneNumber) : null}
                onCopy={() => handleCopy("phone", teacher.phoneNumber)}
                copied={copiedKey === "phone"}
              />
            </Section>

            {/* Account */}
            <Section title="Account">
              <InfoRow icon={UserRound} label="Full Name" value={fullName || null} />
              <InfoRow
                icon={AtSign}
                label="Username"
                value={teacher.username}
                onCopy={() => handleCopy("username", teacher.username)}
                copied={copiedKey === "username"}
              />
              {teacher.createdAt && (
                <InfoRow icon={CalendarPlus} label="Member Since" value={FormattedDateTime(teacher.createdAt)} />
              )}
              {teacher.updatedAt && (
                <InfoRow icon={CalendarClock} label="Last Updated" value={FormattedDateTime(teacher.updatedAt)} />
              )}
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
          <button
            type="button"
            onClick={() => handleCopy("id", teacher.id)}
            title="Copy account ID"
            className="group inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
          >
            <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate font-mono">{teacher.id}</span>
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
    </div>
  );
};

export default ViewTeacherCredentials;

// ── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">{children}</div>
    </section>
  );
}

function HighlightTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        {value ? (
          <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
        ) : (
          <p className="text-sm italic text-slate-400">Not provided</p>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  onCopy,
  copied = false,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  href?: string;
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
            <p className="truncate text-sm font-medium text-slate-900">{value}</p>
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
