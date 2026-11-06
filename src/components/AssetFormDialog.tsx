import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2, Nfc, Package, Printer, QrCode, RotateCcw } from "lucide-react";
import type { AssetCondition, AssetDto, AssetForm, AssetType } from "../@types/types";
import { useAddAsset, useAllAssets, useAllRooms, useGetCategories, useUpdateAsset } from "../hooks/assetHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired } from "./form/validators";
import { assetQrQuery, printQrLabel } from "./qrLabel";
import { formatEnum } from "../lib/utils";

// One form for creating and editing assets (PRD 7.3 assets table).
// Creating is one flow (US-11, FR-7.1): register the asset, attach its RFID tag, print its QR label.

type AssetFormDialogProps = {
  /** Omit to create a new asset */
  asset?: AssetDto;
  onClose: () => void;
};

type Errors = Partial<Record<keyof AssetForm, string>>;
type Step = "details" | "tag" | "label";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "details", label: "Details", icon: Package },
  { id: "tag", label: "RFID tag", icon: Nfc },
  { id: "label", label: "QR label", icon: QrCode },
];

const HEX_TAG = /^[0-9A-F]+$/;
// assets.rfid_tag_uid is varchar(20) (PRD 7.3).
const TAG_MAX_LENGTH = 20;

// Desk readers type the UID like a keyboard; drop separators and whitespace, keep anything else so it can be flagged.
const cleanTag = (value: string) => value.replace(/[\s:-]/g, "").toUpperCase();

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

// "Register another" keeps the batch context (category, type, room, condition) and clears the rest.
const nextForm = (prev: AssetForm): AssetForm => ({
  ...toForm(),
  categoryId: prev.categoryId,
  type: prev.type,
  homeRoomId: prev.homeRoomId,
  condition: prev.condition,
});

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-2" aria-label="Registration steps">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const Icon = done ? Check : step.icon;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className={`text-sm ${active ? "font-medium text-slate-900" : "text-slate-500"}`}>{step.label}</span>
            {index < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export default function AssetFormDialog({ asset, onClose }: AssetFormDialogProps) {
  const isNew = !asset;
  const { data: categories = [] } = useQuery(useGetCategories());
  const { data: rooms = [] } = useQuery(useAllRooms());
  // rfid_tag_uid is UNIQUE across soft-deleted rows too, so check against those as well.
  const { data: assets = [] } = useQuery(useAllAssets(true));
  const add = useAddAsset();
  const update = useUpdateAsset();
  const isPending = add.isPending || update.isPending;

  const [step, setStep] = useState<Step>("details");
  const [values, setValues] = useState<AssetForm>(() => toForm(asset));
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [tagCaptured, setTagCaptured] = useState(false);
  const [created, setCreated] = useState<AssetDto | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const qr = useQuery(assetQrQuery(created?.id));

  const onChange = <K extends keyof AssetForm>(key: K, value: AssetForm[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  // FIXED assets live on a room roster; BORROWABLE ones go home to a storage room.
  const homeRooms = rooms.filter((room) => (values.type === "BORROWABLE" ? room.isStorage : !room.isStorage));
  const roomLabel = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    return room ? `${room.code} — ${room.name}` : "—";
  };
  const categoryLabel = categories.find((c) => c.id === values.categoryId)?.name ?? "—";

  const tag = cleanTag(values.rfidTagUid);
  const tagOwner = tag ? assets.find((a) => a.rfidTagUid === tag && a.id !== asset?.id) : undefined;
  const duplicateTagError = tagOwner
    ? `Tag is already attached to ${tagOwner.assetCode} · ${tagOwner.name}${tagOwner.deletedAt ? " (archived)" : ""}`
    : undefined;

  const validateDetails = (): Errors => ({
    assetCode: validateRequired(values.assetCode, "Asset code"),
    name: validateRequired(values.name, "Name"),
    categoryId: validateRequired(values.categoryId, "Category"),
    homeRoomId: validateRequired(values.homeRoomId, "Home room"),
    replacementCost: values.replacementCost < 0 ? "Cost cannot be negative" : undefined,
  });

  const validateTag = (): string | undefined => {
    if (values.type === "BORROWABLE" && !tag) return "Borrowable assets need an RFID tag";
    if (tag && !HEX_TAG.test(tag)) return "Use hexadecimal characters only";
    if (tag.length > TAG_MAX_LENGTH) return `Tag UID can be at most ${TAG_MAX_LENGTH} characters`;
    if (duplicateTagError) return duplicateTagError;
    return undefined;
  };

  const showErrors = (next: Errors) => {
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const payload = (): AssetForm => ({
    ...values,
    assetCode: values.assetCode.trim(),
    name: values.name.trim(),
    rfidTagUid: tag,
  });

  // ── Edit: a single form ──────────────────────────────────────────────────
  const saveEdit = () => {
    if (!asset || !showErrors({ ...validateDetails(), rfidTagUid: validateTag() })) return;
    const data = payload();
    update.mutate(
      { id: asset.id, data },
      {
        onSuccess: () => {
          showToast.success("Asset Updated", `${data.assetCode} · ${data.name}`);
          onClose();
        },
        onError: (err: unknown) => {
          const message = getErrorMessage(err, "Failed to update asset.");
          setSubmitError(message);
          showToast.error("Update Failed", message);
        },
      },
    );
  };

  // ── New: details → tag (creates the asset) → label ─────────────────────────
  const register = () => {
    if (!showErrors({ rfidTagUid: validateTag() })) return;
    const data = payload();
    add.mutate(data, {
      onSuccess: (newAsset: AssetDto) => {
        showToast.success("Asset Added", `${data.assetCode} · ${data.name}`);
        setCreated(newAsset);
        setStep("label");
      },
      onError: (err: unknown) => {
        const message = getErrorMessage(err, "Failed to add asset.");
        setSubmitError(message);
        showToast.error("Add Failed", message);
      },
    });
  };

  const print = async () => {
    if (!created || !qr.data) return;
    setIsPrinting(true);
    try {
      await printQrLabel(qr.data, created);
    } catch (err) {
      showToast.error("QR Label", getErrorMessage(err, "Could not print the QR label."));
    } finally {
      setIsPrinting(false);
    }
  };

  const registerAnother = () => {
    setValues((prev) => nextForm(prev));
    setErrors({});
    setSubmitError("");
    setTagCaptured(false);
    setCreated(null);
    setStep("details");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNew) return saveEdit();
    if (step === "details") {
      if (showErrors(validateDetails())) setStep("tag");
    } else if (step === "tag") {
      register();
    } else {
      void print();
    }
  };

  // ── Field groups ─────────────────────────────────────────────────────────

  const tagField = (autoFocus = false) => (
    <Field
      label="RFID tag UID"
      htmlFor="asset-tag"
      required={values.type === "BORROWABLE"}
      optional={values.type === "FIXED"}
      // A scanned duplicate is flagged immediately; the rest waits for submit.
      error={errors.rfidTagUid ?? duplicateTagError}
      hint={autoFocus ? "Scan the tag with a desk reader, or type the UID (uppercase hex, e.g. 04A2B91C6E5F80)" : "Uppercase hex, no separators"}
    >
      <TextInput
        id="asset-tag"
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        value={values.rfidTagUid}
        onChange={(e) => {
          onChange("rfidTagUid", cleanTag(e.target.value));
          setTagCaptured(false);
        }}
        // Readers end a scan with Enter; capture it instead of submitting the form.
        onKeyDown={(e) => {
          if (e.key === "Enter" && autoFocus) {
            e.preventDefault();
            setTagCaptured(!!tag);
          }
        }}
        placeholder="04A2B91C6E5F80"
        error={!!errors.rfidTagUid || !!duplicateTagError}
        className={`font-mono uppercase ${autoFocus ? "h-12 text-base tracking-wider" : ""}`}
      />
    </Field>
  );

  const detailSections = (
    <>
      <FormSection title="Identity">
        <Field label="Asset code" htmlFor="asset-code" required error={errors.assetCode} hint="Printed on the QR label, e.g. LP-014">
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
        {!isNew && tagField()}
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
    </>
  );

  const summary = (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm sm:grid-cols-4">
      {[
        ["Asset code", values.assetCode.trim(), "font-mono"],
        ["Name", values.name.trim(), ""],
        ["Category", categoryLabel, ""],
        [values.type === "BORROWABLE" ? "Home room" : "Roster room", roomLabel(values.homeRoomId), ""],
      ].map(([label, value, cls]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-slate-500">{label}</dt>
          <dd className={`truncate font-medium text-slate-900 ${cls}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );

  const tagStep = (
    <>
      {summary}
      <FormSection
        title="Attach RFID tag"
        description={
          values.type === "BORROWABLE"
            ? "Stick the tag on the asset, then scan it. The kiosk and room stations read this tag. Use an anti-metal tag on metal items."
            : "Fixed assets can be registered without a tag and tagged later from Edit."
        }
        columns={1}
      >
        {tagField(true)}
      </FormSection>
      {tagCaptured && tag && !validateTag() && (
        <FormAlert tone="success">
          Tag <span className="font-mono font-medium">{tag}</span> read. Register the asset to attach it.
        </FormAlert>
      )}
    </>
  );

  const labelStep = created && (
    <>
      <FormAlert tone="success">
        <span className="font-mono font-medium">{created.assetCode}</span> registered as {formatEnum(created.status)}
        {created.rfidTagUid ? <> with tag <span className="font-mono font-medium">{created.rfidTagUid}</span></> : " without an RFID tag"}.
        Print its QR label and stick it on the asset.
      </FormAlert>
      <div className="flex justify-center">
        <figure className="flex w-60 flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white p-5">
          <div className="flex h-44 w-44 items-center justify-center">
            {qr.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading QR label" />
            ) : qr.data ? (
              <img src={qr.data} alt={`QR label for ${created.assetCode}`} className="h-44 w-44 [image-rendering:pixelated]" />
            ) : (
              <div className="text-center">
                <p className="text-sm text-rose-600">{getErrorMessage(qr.error, "Could not load the QR label.")}</p>
                <button type="button" onClick={() => qr.refetch()} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            )}
          </div>
          <figcaption className="mt-3 text-center">
            <p className="font-mono text-base font-semibold tracking-wide text-slate-900">{created.assetCode}</p>
            <p className="text-xs text-slate-500">{created.name}</p>
          </figcaption>
        </figure>
      </div>
      <p className="text-center text-xs text-slate-500">You can reprint this label any time from the asset's page.</p>
    </>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  if (!isNew) {
    return (
      <FormDialog
        title="Edit asset"
        subtitle={`${asset.assetCode} · ${asset.name}`}
        icon={Package}
        size="xl"
        onClose={onClose}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Save changes"
        footerNote={<><span className="text-rose-500">*</span> Required fields</>}
      >
        {detailSections}
        {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
      </FormDialog>
    );
  }

  const footer = {
    details: {
      submitLabel: "Next: RFID tag",
      submitIcon: ArrowRight,
      footerNote: <><span className="text-rose-500">*</span> Required fields</>,
    },
    tag: {
      submitLabel: tag ? "Register & attach tag" : "Register without tag",
      submitIcon: Nfc,
      footerNote: "The asset is saved when you register it.",
    },
    label: {
      submitLabel: isPrinting ? "Printing..." : "Print label",
      submitIcon: Printer,
      footerNote: (
        <button type="button" onClick={registerAnother} className="font-medium text-blue-600 hover:text-blue-700">
          + Register another asset
        </button>
      ),
    },
  }[step];

  return (
    <FormDialog
      title="New asset"
      subtitle={step === "label" ? "Registered — print the QR label" : "Register, tag, and label a borrowable or fixed asset"}
      icon={Package}
      size="xl"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      headerExtra={<StepIndicator current={step} />}
      onBack={step === "tag" ? () => { setSubmitError(""); setStep("details"); } : undefined}
      cancelLabel={step === "label" ? "Done" : "Cancel"}
      submitDisabled={step === "label" && (!qr.data || isPrinting)}
      {...footer}
    >
      {step === "details" && detailSections}
      {step === "tag" && tagStep}
      {step === "label" && labelStep}
      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
