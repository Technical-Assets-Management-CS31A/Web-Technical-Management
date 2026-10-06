import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Package, RefreshCw } from "lucide-react";
import type { TItemForm, TItemList, TRfidSession } from "../@types/types";
import { useGetItemInfo, useUpdateItem } from "../hooks/itemHooks";
import { cancelRfidSessionApi, createRfidSessionApi, getRfidSessionApi } from "../api/item_api";
import { showToast } from "./AppToast";
import {
  Field,
  FormAlert,
  FormDialog,
  FormSection,
  SelectInput,
  TextInput,
  controlClass,
  getErrorMessage,
} from "./form/FormKit";
import { RfidRegistrationPanel, useRfidSession } from "./form/RfidRegistration";

type EditItemFormProps = {
  onClose: () => void;
  id: string;
};

type FieldKey = "itemName" | "itemType" | "itemMake" | "itemModel" | "category" | "condition" | "description";

const CATEGORIES = [
  { value: "Electronics", label: "Electronics" },
  { value: "Keys", label: "Keys" },
  { value: "MediaEquipment", label: "Media Equipment" },
  { value: "Tools", label: "Tools" },
  { value: "Miscellaneous", label: "Miscellaneous" },
];

const CONDITIONS = [
  { value: "New", label: "New" },
  { value: "Good", label: "Good" },
  { value: "Defective", label: "Defective" },
  { value: "Refurbished", label: "Refurbished" },
  { value: "NeedRepair", label: "Need Repair" },
];

const REQUIRED: { key: FieldKey; label: string }[] = [
  { key: "itemName", label: "Item name" },
  { key: "itemType", label: "Item type" },
  { key: "itemMake", label: "Make" },
  { key: "itemModel", label: "Model" },
  { key: "category", label: "Category" },
  { key: "condition", label: "Condition" },
  { key: "description", label: "Description" },
];

/** Keeps the item's current value selectable even if it's not in the preset list */
const withCurrent = (options: { value: string; label: string }[], current: string) =>
  current && !options.some((o) => o.value === current) ? [{ value: current, label: current }, ...options] : options;

const EMPTY_FORM: TItemForm = {
  serialNumber: "",
  image: null,
  itemName: "",
  itemType: "",
  itemModel: "",
  itemMake: "",
  description: "",
  category: "Electronics",
  condition: "New",
  preview: "",
};

export const EditItemForm = ({ onClose, id }: EditItemFormProps) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(useGetItemInfo(id));
  const { mutate, isPending } = useUpdateItem();

  const [formData, setFormData] = useState<TItemForm>(EMPTY_FORM);
  const [originalData, setOriginalData] = useState<TItemForm | null>(null);
  const [existingRfidUid, setExistingRfidUid] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState("");

  const rfid = useRfidSession<TRfidSession>({
    createSession: () => createRfidSessionApi(id),
    fetchSession: getRfidSessionApi,
    cancelSession: cancelRfidSessionApi,
    onCompleted: (session) => {
      showToast.success("RFID Registered", `RFID tag assigned to "${session.itemName}" successfully!`);
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  useEffect(() => {
    if (!data) return;
    const item = data as TItemList;
    const itemData: TItemForm = {
      serialNumber: item.serialNumber || "",
      itemName: item.itemName || "",
      itemType: item.itemType || "",
      itemModel: item.itemModel || "",
      itemMake: item.itemMake || "",
      description: item.description || "",
      category: item.category || "Electronics",
      condition: item.condition || "New",
      image: null,
      preview: typeof item.image === "string" ? item.image : "",
    };
    setFormData(itemData);
    setOriginalData(itemData);
    setExistingRfidUid(item.rfidUid || null);
  }, [data]);

  // Release the local preview URL when it's replaced or the form closes
  useEffect(() => {
    const preview = formData.preview;
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [formData.preview]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const files = (e.target as HTMLInputElement).files;

    if (files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file, preview: URL.createObjectURL(file) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setSubmitError("");
  };

  const hasChanges = useMemo(() => {
    if (!originalData) return false;
    return (
      formData.itemName !== originalData.itemName ||
      formData.itemType !== originalData.itemType ||
      formData.itemModel !== originalData.itemModel ||
      formData.itemMake !== originalData.itemMake ||
      formData.description !== originalData.description ||
      formData.category !== originalData.category ||
      formData.condition !== originalData.condition ||
      formData.image !== originalData.image
    );
  }, [formData, originalData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: Partial<Record<FieldKey, string>> = {};
    for (const { key, label } of REQUIRED) {
      if (!formData[key]?.trim()) next[key] = `${label} is required`;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    mutate(
      {
        id,
        data: {
          serialNumber: formData.serialNumber,
          image: formData.image,
          itemName: formData.itemName.trim(),
          itemType: formData.itemType.trim(),
          itemModel: formData.itemModel.trim(),
          itemMake: formData.itemMake.trim(),
          description: formData.description.trim(),
          category: formData.category,
          condition: formData.condition,
        },
      },
      {
        onSuccess: () => {
          showToast.success("Item Updated", "Item updated successfully!");
          onClose();
        },
        onError: (err) => {
          const message = getErrorMessage(err, "Failed to update item. Please try again.");
          setSubmitError(message);
          showToast.error("Update Failed", message);
        },
      },
    );
  };

  const isReady = !isLoading && !error && !!originalData;
  const rfidJustRegistered = rfid.status === "completed";

  return (
    <FormDialog
      title="Edit Item"
      subtitle={originalData?.itemName ? `Update details for ${originalData.itemName}` : "Update item information"}
      icon={Package}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      preventClose={rfid.isActive}
      submitDisabled={!isReady || !hasChanges}
      submitTestId="editItem-button"
      footerNote={
        rfid.isActive
          ? "Finish or cancel the RFID scan before closing."
          : rfidJustRegistered && !hasChanges
            ? "RFID tag saved. You can close this form."
            : isReady && !hasChanges
              ? "No changes yet."
              : <><span className="text-rose-500">*</span> Required fields</>
      }
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          Loading item...
        </div>
      ) : error || !originalData ? (
        <FormAlert tone="error">Failed to load this item. Close the form and try again.</FormAlert>
      ) : (
        <>
          {/* Image + identity */}
          <section className="flex flex-col gap-5 sm:flex-row">
            <label
              htmlFor="image"
              className="group relative flex aspect-square w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-blue-400 sm:w-36"
            >
              {formData.preview ? (
                <>
                  <img src={formData.preview} alt="Item preview" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-slate-900/60 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <RefreshCw className="h-3 w-3" /> Change
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-1.5 text-slate-400">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs font-medium">Add image</span>
                </span>
              )}
              <input id="image" name="image" type="file" accept="image/*" onChange={handleChange} data-testid="edit-image" className="sr-only" />
            </label>

            <div className="grid flex-1 grid-cols-1 content-start gap-4">
              <Field label="Item name" htmlFor="itemName" required error={errors.itemName}>
                <TextInput id="itemName" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g. Epson Projector" error={!!errors.itemName} data-testid="edit-itemName" />
              </Field>
              <Field label="Serial number" htmlFor="serialNumber" hint="Serial numbers can't be changed.">
                <TextInput id="serialNumber" name="serialNumber" value={formData.serialNumber} readOnly className="font-mono" data-testid="edit-serialNumber" />
              </Field>
            </div>
          </section>

          <FormSection title="Classification">
            <Field label="Category" htmlFor="category" required error={errors.category}>
              <SelectInput id="category" name="category" value={formData.category} onChange={handleChange} error={!!errors.category} data-testid="edit-category">
                {withCurrent(CATEGORIES, originalData.category).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Condition" htmlFor="condition" required error={errors.condition}>
              <SelectInput id="condition" name="condition" value={formData.condition} onChange={handleChange} error={!!errors.condition} data-testid="edit-condition">
                {withCurrent(CONDITIONS, originalData.condition).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </SelectInput>
            </Field>
          </FormSection>

          <FormSection title="Specifications" columns={3}>
            <Field label="Type" htmlFor="itemType" required error={errors.itemType}>
              <TextInput id="itemType" name="itemType" value={formData.itemType} onChange={handleChange} placeholder="e.g. Projector" error={!!errors.itemType} data-testid="edit-itemType" />
            </Field>
            <Field label="Make" htmlFor="itemMake" required error={errors.itemMake}>
              <TextInput id="itemMake" name="itemMake" value={formData.itemMake} onChange={handleChange} placeholder="e.g. Epson" error={!!errors.itemMake} data-testid="edit-itemMake" />
            </Field>
            <Field label="Model" htmlFor="itemModel" required error={errors.itemModel}>
              <TextInput id="itemModel" name="itemModel" value={formData.itemModel} onChange={handleChange} placeholder="e.g. EB-X51" error={!!errors.itemModel} data-testid="edit-itemModel" />
            </Field>
            <Field label="Description" htmlFor="description" required error={errors.description} className="sm:col-span-3">
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Notes about the item, accessories included, etc."
                aria-invalid={!!errors.description || undefined}
                data-testid="edit-description"
                className={`${controlClass(!!errors.description)} h-auto resize-y py-2`}
              />
            </Field>
          </FormSection>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">RFID tag</h3>
            <RfidRegistrationPanel
              noun="tag"
              subject="item"
              currentUid={existingRfidUid}
              status={rfid.status}
              expiresAt={rfid.session?.expiresAt}
              waitingHint="Place the tag on the reader."
              onStart={rfid.start}
              onCancel={rfid.cancel}
            />
          </section>

          {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
        </>
      )}
    </FormDialog>
  );
};
