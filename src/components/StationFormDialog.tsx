import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MonitorSmartphone } from "lucide-react";
import type { StationDto, StationForm, StationType } from "../@types/types";
import { useAllRooms } from "../hooks/assetHooks";
import { useCreateStation, useUpdateStation } from "../hooks/roomHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired } from "./form/validators";

// One form for registering and editing RFID stations (PRD 7.3 stations table).

type StationFormDialogProps = {
  /** Omit to register a new station */
  station?: StationDto;
  /** Room preselected for a new station */
  roomId?: string;
  onClose: () => void;
};

type Errors = Partial<Record<keyof StationForm, string>>;

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

const toForm = (station?: StationDto, roomId = ""): StationForm => ({
  stationCode: station?.stationCode ?? "",
  type: station?.type ?? "ROOM_STATION",
  roomId: station?.roomId ?? roomId,
  ipAddress: station?.ipAddress ?? "",
});

export default function StationFormDialog({ station, roomId, onClose }: StationFormDialogProps) {
  const isNew = !station;
  const { data: rooms = [] } = useQuery(useAllRooms());
  const create = useCreateStation();
  const update = useUpdateStation();
  const isPending = create.isPending || update.isPending;

  const [values, setValues] = useState<StationForm>(() => toForm(station, roomId));
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  const onChange = <K extends keyof StationForm>(key: K, value: StationForm[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ip = values.ipAddress.trim();
    const next: Errors = {
      stationCode: validateRequired(values.stationCode, "Station code"),
      roomId: validateRequired(values.roomId, "Room"),
      ipAddress: ip && !IPV4.test(ip) ? "Enter an IPv4 address, e.g. 192.168.1.40" : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const code = values.stationCode.trim().toUpperCase();
    const callbacks = {
      onSuccess: () => {
        showToast.success(isNew ? "Station Registered" : "Station Updated", code);
        onClose();
      },
      onError: (err: unknown) => {
        const message = getErrorMessage(err, isNew ? "Failed to register station." : "Failed to update station.");
        setSubmitError(message);
        showToast.error(isNew ? "Register Failed" : "Update Failed", message);
      },
    };

    if (station) update.mutate({ id: station.id, data: values }, callbacks);
    else create.mutate(values, callbacks);
  };

  return (
    <FormDialog
      title={isNew ? "New station" : "Edit station"}
      subtitle={isNew ? "Counter kiosk or room station" : station.stationCode}
      icon={MonitorSmartphone}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isNew ? "Register station" : "Save changes"}
      footerNote="Health, heartbeat and firmware are reported by the station."
    >
      <FormSection title="Station">
        <Field label="Station code" htmlFor="station-code" required error={errors.stationCode} hint="Set on the device, e.g. RS-CL10">
          <TextInput id="station-code" value={values.stationCode} onChange={(e) => onChange("stationCode", e.target.value)} placeholder="RS-CL10" maxLength={30} error={!!errors.stationCode} className="font-mono uppercase" />
        </Field>
        <Field label="Type" htmlFor="station-type" hint={values.type === "COUNTER_KIOSK" ? "Checkout and return at the counter" : "Verifies arrivals in its room"}>
          <SelectInput id="station-type" value={values.type} onChange={(e) => onChange("type", e.target.value as StationType)}>
            <option value="ROOM_STATION">Room station</option>
            <option value="COUNTER_KIOSK">Counter kiosk</option>
          </SelectInput>
        </Field>
        <Field label="Room" htmlFor="station-room" required error={errors.roomId}>
          <SelectInput id="station-room" value={values.roomId} onChange={(e) => onChange("roomId", e.target.value)} error={!!errors.roomId}>
            <option value="" disabled>Select a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>{room.code} — {room.name}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="IP address" htmlFor="station-ip" optional error={errors.ipAddress}>
          <TextInput id="station-ip" value={values.ipAddress} onChange={(e) => onChange("ipAddress", e.target.value)} placeholder="192.168.1.40" error={!!errors.ipAddress} className="font-mono" />
        </Field>
      </FormSection>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
