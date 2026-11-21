import { useState } from "react";
import { CreditCard } from "lucide-react";
import type { UserDto } from "../@types/types";
import { useAddAuthCard } from "../hooks/userHooks";
import { fullName, normalizeHexUid } from "../lib/utils";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";

// Registers an instructor authorization card. The UID is typed or read off a USB reader that types it.

type AuthCardFormDialogProps = {
  instructors: UserDto[];
  /** Instructor preselected, e.g. from the "without a card" list */
  userId?: string;
  onClose: () => void;
};

const HEX_UID = /^[0-9A-F]{8,20}$/;

export default function AuthCardFormDialog({ instructors, userId = "", onClose }: AuthCardFormDialogProps) {
  const addCard = useAddAuthCard();
  const [instructorId, setInstructorId] = useState(userId);
  const [cardUid, setCardUid] = useState("");
  const [errors, setErrors] = useState<{ instructorId?: string; cardUid?: string }>({});
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const uid = normalizeHexUid(cardUid);
    const next = {
      instructorId: instructorId ? undefined : "Instructor is required",
      cardUid: !uid ? "Card UID is required" : !HEX_UID.test(uid) ? "Use 8 to 20 hexadecimal characters" : undefined,
    };
    setErrors(next);
    if (next.instructorId || next.cardUid) return;

    const instructor = instructors.find((u) => u.id === instructorId);
    addCard.mutate(
      { userId: instructorId, data: { cardUid: uid, status: "ACTIVE" } },
      {
        onSuccess: () => {
          showToast.success("Card Registered", `Card ${uid} is now active for ${fullName(instructor)}.`);
          onClose();
        },
        onError: (err) => {
          const message = getErrorMessage(err, "Failed to register card.");
          setSubmitError(message);
          showToast.error("Card Not Saved", message);
        },
      },
    );
  };

  return (
    <FormDialog
      title="Register card"
      subtitle="Instructor authorization card"
      icon={CreditCard}
      size="md"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={addCard.isPending}
      submitLabel="Register card"
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <FormSection title="Card" columns={1}>
        <Field label="Instructor" htmlFor="card-instructor" required error={errors.instructorId}>
          <SelectInput
            id="card-instructor"
            value={instructorId}
            onChange={(e) => { setInstructorId(e.target.value); setErrors((p) => ({ ...p, instructorId: undefined })); setSubmitError(""); }}
            error={!!errors.instructorId}
          >
            <option value="" disabled>Select an instructor</option>
            {instructors.map((u) => (
              <option key={u.id} value={u.id}>{fullName(u)} · {u.employeeNo}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Card UID" htmlFor="card-uid" required error={errors.cardUid} hint="Uppercase hex, no separators. Tap the card on a USB reader to fill it in.">
          <TextInput
            id="card-uid"
            value={cardUid}
            onChange={(e) => { setCardUid(e.target.value); setErrors((p) => ({ ...p, cardUid: undefined })); setSubmitError(""); }}
            placeholder="04A3B2C1"
            autoComplete="off"
            error={!!errors.cardUid}
            className="font-mono uppercase"
          />
        </Field>
      </FormSection>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
