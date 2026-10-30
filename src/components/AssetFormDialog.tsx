import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import type { AssetCondition, AssetDto, AssetForm, AssetType } from "../@types/types";
import { useAddAsset, useAllRooms, useGetCategories, useUpdateAsset } from "../hooks/assetHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired } from "./form/validators";

// One form for creating and editing assets (PRD 7.3 assets table).

type AssetFormDialogProps = {
  /** Omit to create a new asset */
  asset?: AssetDto;
  onClose: () => void;
};

type Errors = Partial<Record<keyof AssetForm, string>>;

const HEX_TAG = /^[0-9A-F]+$/;

const toForm = (asset?: AssetDto): AssetForm => ({
  assetCode: asset?.assetCode ?? "",
  name: asset?.name ?? "",
  categoryId: asset?.category?.id ?? "",
  type: asset?.type ?? "BORROWABLE",
  brand: asset?.brand ?? "",
  model: asset?.model ?? "",
  serialNo: asset?.serialNo ?? "",
  rfidTagUid: asset?.rfidTagUid ?? "",
  homeRoomId: asset?.homeRoomId ?? "",
  condition: asset?.condition ?? "GOOD",
  replacementCost: asset?.replacementCost ?? 0,
  acquiredAt: asset?.acquiredAt?.slice(0, 10) ?? "",
  notes: asset?.notes ?? "",
});

export default function AssetFormDialog({ asset, onClose }: AssetFormDialogProps) {
  const isNew = !asset;
  const { data: categories = [] } = useQuery(useGetCategories());
  const { data: rooms = [] } = useQuery(useAllRooms());
  const add = useAddAsset();
  const update = useUpdateAsset();
  const isPending = add.isPending || update.isPending;

  const [values, setValues] = useState<AssetForm>(() => toForm(asset));
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  const onChange = <K extends keyof AssetForm>(key: K, value: AssetForm[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  // FIXED assets live on a room roster; BORROWABLE ones go home to a storage room.
  const homeRooms = rooms.filter((room) => (values.type === "BORROWABLE" ? room.isStorage : !room.isStorage));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tag = values.rfidTagUid.replace(/[^0-9a-f]/gi, "").toUpperCase();
    const next: Errors = {
      assetCode: validateRequired(values.assetCode, "Asset code"),
      name: validateRequired(values.name, "Name"),
      categoryId: validateRequired(values.categoryId, "Category"),
      homeRoomId: validateRequired(values.homeRoomId, "Home room"),
      rfidTagUid:
        values.type === "BORROWABLE" && !tag
          ? "Borrowable assets need an RFID tag"
          : tag && !HEX_TAG.test(tag)
            ? "Use hexadecimal characters only"
            : undefined,
      replacementCost: values.replacementCost < 0 ? "Cost cannot be negative" : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const data: AssetForm = {
      ...values,
      assetCode: values.assetCode.trim(),
      name: values.name.trim(),
      rfidTagUid: tag,
    };
    const callbacks = {
      onSuccess: () => {
        showToast.success(isNew ? "Asset Added" : "Asset Updated", `${data.assetCode} · ${data.name}`);
        onClose();
      },
      onError: (err: unknown) => {
        const message = getErrorMessage(err, isNew ? "Failed to add asset." : "Failed to update asset.");
        setSubmitError(message);
        showToast.error(isNew ? "Add Failed" : "Update Failed", message);
      },
    };

    if (asset) update.mutate({ id: asset.id, data }, callbacks);
    else add.mutate(data, callbacks);
  };

  return (
    <FormDialog
      title={isNew ? "New asset" : "Edit asset"}
      subtitle={isNew ? "Borrowable or fixed asset" : `${asset.assetCode} · ${asset.name}`}
      icon={Package}
      size="xl"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isNew ? "Add asset" : "Save changes"}
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <FormSection title="Identity">
        <Field label="Asset code" htmlFor="asset-code" required error={errors.assetCode} hint="Printed label, e.g. LP-014">
          <TextInput id="asset-code" value={values.assetCode} onChange={(e) => onChange("assetCode", e.target.value)} placeholder="LP-014" error={!!errors.assetCode} className="font-mono" />
        </Field>
        <Field label="Name" htmlFor="asset-name" required error={errors.name}>
          <TextInput id="asset-name" value={values.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Lenovo ThinkPad E14" maxLength={120} error={!!errors.name} />
        </Field>
        <Field label="Category" htmlFor="asset-category" required error={errors.categoryId}>
          <SelectInput id="asset-category" value={values.categoryId} onChange={(e) => onChange("categoryId", e.target.value)} error={!!errors.categoryId}>
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Type" htmlFor="asset-type" hint={values.type === "FIXED" ? "Stays in its room; checked by audits" : "Can be checked out at the kiosk"}>
          <SelectInput id="asset-type" value={values.type} onChange={(e) => { onChange("type", e.target.value as AssetType); onChange("homeRoomId", ""); }}>
            <option value="BORROWABLE">Borrowable</option>
            <option value="FIXED">Fixed</option>
          </SelectInput>
        </Field>
      </FormSection>

      <FormSection title="Tracking">
        <Field label="RFID tag UID" htmlFor="asset-tag" required={values.type === "BORROWABLE"} optional={values.type === "FIXED"} error={errors.rfidTagUid} hint="Uppercase hex, no separators">
          <TextInput id="asset-tag" value={values.rfidTagUid} onChange={(e) => onChange("rfidTagUid", e.target.value)} placeholder="E2801160600002" error={!!errors.rfidTagUid} className="font-mono uppercase" />
        </Field>
        <Field label={values.type === "BORROWABLE" ? "Home storage room" : "Roster room"} htmlFor="asset-room" required error={errors.homeRoomId}>
          <SelectInput id="asset-room" value={values.homeRoomId} onChange={(e) => onChange("homeRoomId", e.target.value)} error={!!errors.homeRoomId}>
            <option value="" disabled>Select a room</option>
            {homeRooms.map((room) => (
              <option key={room.id} value={room.id}>{room.code} — {room.name}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Condition" htmlFor="asset-condition">
          <SelectInput id="asset-condition" value={values.condition} onChange={(e) => onChange("condition", e.target.value as AssetCondition)}>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="DAMAGED">Damaged</option>
          </SelectInput>
        </Field>
        <Field label="Replacement cost (PHP)" htmlFor="asset-cost" error={errors.replacementCost} hint="Used when a liability is issued">
          <TextInput id="asset-cost" type="number" min={0} step="0.01" value={values.replacementCost} onChange={(e) => onChange("replacementCost", Number(e.target.value))} error={!!errors.replacementCost} />
        </Field>
      </FormSection>

      <FormSection title="Details" columns={3}>
        <Field label="Brand" htmlFor="asset-brand" optional>
          <TextInput id="asset-brand" value={values.brand} onChange={(e) => onChange("brand", e.target.value)} placeholder="Lenovo" />
        </Field>
        <Field label="Model" htmlFor="asset-model" optional>
          <TextInput id="asset-model" value={values.model} onChange={(e) => onChange("model", e.target.value)} placeholder="E14 Gen 5" />
        </Field>
        <Field label="Serial No." htmlFor="asset-serial" optional>
          <TextInput id="asset-serial" value={values.serialNo} onChange={(e) => onChange("serialNo", e.target.value)} className="font-mono" />
        </Field>
        <Field label="Acquired" htmlFor="asset-acquired" optional>
          <TextInput id="asset-acquired" type="date" value={values.acquiredAt} onChange={(e) => onChange("acquiredAt", e.target.value)} />
        </Field>
        <Field label="Notes" htmlFor="asset-notes" optional className="sm:col-span-2">
          <TextInput id="asset-notes" value={values.notes} onChange={(e) => onChange("notes", e.target.value)} placeholder="Charger included" />
        </Field>
      </FormSection>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
