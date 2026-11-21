import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Field, FormAlert, FormDialog } from "./form/FormKit";

// Every clear, lift, settle or resolve action asks for a reason that goes to audit_log.

type ReasonDialogProps = {
  title: string;
  subtitle?: string;
  confirmLabel: string;
  placeholder?: string;
  /** Field label, hint and validation message; default to the audit-log reason wording. */
  fieldLabel?: string;
  hint?: string;
  requiredMessage?: string;
  isSubmitting?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  children?: React.ReactNode;
};

export default function ReasonDialog({
  title,
  subtitle,
  confirmLabel,
  placeholder = "Why is this being done?",
  fieldLabel = "Reason",
  hint = "Saved to the audit log",
  requiredMessage = "Give a reason of at least 3 characters",
  isSubmitting = false,
  error,
  onClose,
  onConfirm,
  children,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const missing = reason.trim().length < 3;

  return (
    <FormDialog
      title={title}
      subtitle={subtitle}
      icon={MessageSquareText}
      size="md"
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!missing) onConfirm(reason.trim());
      }}
      isSubmitting={isSubmitting}
      submitLabel={confirmLabel}
    >
      {children}
      <Field label={fieldLabel} htmlFor="reason-text" required error={touched && missing ? requiredMessage : undefined} hint={hint}>
        <textarea
          id="reason-text"
          rows={3}
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </Field>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </FormDialog>
  );
}
