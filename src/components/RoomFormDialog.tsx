import { useState } from "react";
import { DoorOpen } from "lucide-react";
import type { RecordStatus, RoomDto, RoomForm } from "../@types/types";
import { useCreateRoom, useUpdateRoom } from "../hooks/roomHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired } from "./form/validators";

// One form for creating and editing rooms (PRD 7.3 rooms table).

type RoomFormDialogProps = {
  /** Omit to create a new room */
  room?: RoomDto;
  onClose: () => void;
};

type Errors = Partial<Record<keyof RoomForm, string>>;

const toForm = (room?: RoomDto): RoomForm => ({
  code: room?.code ?? "",
  name: room?.name ?? "",
  building: room?.building ?? "",
  floor: room?.floor ?? "",
  isStorage: room?.isStorage ?? false,
  status: room?.status ?? "ACTIVE",
});

export default function RoomFormDialog({ room, onClose }: RoomFormDialogProps) {
  const isNew = !room;
  const create = useCreateRoom();
  const update = useUpdateRoom();
  const isPending = create.isPending || update.isPending;

  const [values, setValues] = useState<RoomForm>(() => toForm(room));
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  const onChange = <K extends keyof RoomForm>(key: K, value: RoomForm[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: Errors = {
      code: validateRequired(values.code, "Room code"),
      name: validateRequired(values.name, "Name"),
      building: validateRequired(values.building, "Building"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const label = `${values.code.trim().toUpperCase()} · ${values.name.trim()}`;
    const callbacks = {
      onSuccess: () => {
        showToast.success(isNew ? "Room Added" : "Room Updated", label);
        onClose();
      },
      onError: (err: unknown) => {
        const message = getErrorMessage(err, isNew ? "Failed to add room." : "Failed to update room.");
        setSubmitError(message);
        showToast.error(isNew ? "Add Failed" : "Update Failed", message);
      },
    };

    if (room) update.mutate({ id: room.id, data: values }, callbacks);
    else create.mutate(values, callbacks);
  };

  return (
    <FormDialog
      title={isNew ? "New room" : "Edit room"}
      subtitle={isNew ? "Classroom or storage room" : `${room.code} · ${room.name}`}
      icon={DoorOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isNew ? "Add room" : "Save changes"}
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <FormSection title="Room">
        <Field label="Room code" htmlFor="room-code" required error={errors.code} hint="Short code on the door, e.g. CL10">
          <TextInput id="room-code" value={values.code} onChange={(e) => onChange("code", e.target.value)} placeholder="CL10" maxLength={20} error={!!errors.code} className="font-mono uppercase" />
        </Field>
        <Field label="Name" htmlFor="room-name" required error={errors.name}>
          <TextInput id="room-name" value={values.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Computer Lab 10" maxLength={120} error={!!errors.name} />
        </Field>
        <Field label="Building" htmlFor="room-building" required error={errors.building}>
          <TextInput id="room-building" value={values.building} onChange={(e) => onChange("building", e.target.value)} placeholder="Main Building" error={!!errors.building} />
        </Field>
        <Field label="Floor" htmlFor="room-floor" optional>
          <TextInput id="room-floor" value={values.floor} onChange={(e) => onChange("floor", e.target.value)} placeholder="3" />
        </Field>
      </FormSection>

      <FormSection title="Use">
        <Field label="Kind" htmlFor="room-kind" hint={values.isStorage ? "Home of borrowable assets; usually has the counter kiosk" : "Destination for borrowed assets; holds fixed assets"}>
          <SelectInput id="room-kind" value={values.isStorage ? "storage" : "classroom"} onChange={(e) => onChange("isStorage", e.target.value === "storage")}>
            <option value="classroom">Classroom</option>
            <option value="storage">Storage room</option>
          </SelectInput>
        </Field>
        <Field label="Status" htmlFor="room-status" hint={values.status === "INACTIVE" ? "Hidden from new checkouts" : undefined}>
          <SelectInput id="room-status" value={values.status} onChange={(e) => onChange("status", e.target.value as RecordStatus)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </SelectInput>
        </Field>
      </FormSection>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
