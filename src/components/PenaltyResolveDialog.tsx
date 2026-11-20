import { useState } from "react";
import { AlertTriangle, Receipt, Snowflake } from "lucide-react";
import type { SettleLiabilityRequest } from "../@types/types";
import { useClearMark, useClearWarning, useLiftFreeze, useLiftHold, useSettleLiability } from "../hooks/userHooks";
import ReasonDialog from "./ReasonDialog";
import { showToast } from "./AppToast";
import { Field, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";

// FR-6.8: one dialog for every penalty action. Each one asks for a reason that goes to audit_log (FR-6.10).

export type PenaltyKind = "warning" | "mark" | "hold" | "liability" | "freeze";

export type PenaltyTarget = {
  kind: PenaltyKind;
  id: string;
  /** What is being resolved, e.g. "Warning #2" or "Liability ₱1,200.00" */
  label: string;
  /** Whose penalty it is: the student's or instructor's name */
  subject: string;
};

type SettleStatus = SettleLiabilityRequest["status"];

const COPY: Record<PenaltyKind, { title: string; confirm: string; done: string }> = {
  warning: { title: "Clear warning", confirm: "Clear", done: "cleared" },
  mark: { title: "Clear mark", confirm: "Clear", done: "cleared" },
  hold: { title: "Lift hold", confirm: "Lift hold", done: "lifted" },
  liability: { title: "Settle liability", confirm: "Settle", done: "settled" },
  freeze: { title: "Lift approval freeze", confirm: "Lift freeze", done: "lifted" },
};

export default function PenaltyResolveDialog({
  target,
  onClose,
  onResolved,
}: {
  target: PenaltyTarget;
  onClose: () => void;
  onResolved?: () => void;
}) {
  const clearWarning = useClearWarning();
  const clearMark = useClearMark();
  const liftHold = useLiftHold();
  const settle = useSettleLiability();
  const liftFreeze = useLiftFreeze();
  const [settleStatus, setSettleStatus] = useState<SettleStatus>("SETTLED_PAYMENT");
  const [receiptNo, setReceiptNo] = useState("");

  const copy = COPY[target.kind];
  const isSubmitting = clearWarning.isPending || clearMark.isPending || liftHold.isPending || settle.isPending || liftFreeze.isPending;

  const confirm = (reason: string) => {
    const callbacks = {
      onSuccess: () => {
        showToast.success("Resolved", `${target.label} ${copy.done} for ${target.subject}.`);
        onResolved?.();
        onClose();
      },
      onError: (err: unknown) => showToast.error("Not Resolved", getErrorMessage(err, "Failed to resolve.")),
    };
    const body = { id: target.id, data: { reason } };
    if (target.kind === "warning") clearWarning.mutate(body, callbacks);
    else if (target.kind === "mark") clearMark.mutate(body, callbacks);
    else if (target.kind === "hold") liftHold.mutate(body, callbacks);
    else if (target.kind === "freeze") liftFreeze.mutate(body, callbacks);
    else {
      const receipt = settleStatus === "SETTLED_PAYMENT" ? receiptNo.trim() || null : null;
      settle.mutate({ id: target.id, data: { status: settleStatus, receiptNo: receipt, reason } }, callbacks);
    }
  };

  return (
    <ReasonDialog
      title={copy.title}
      subtitle={`${target.label} · ${target.subject}`}
      confirmLabel={copy.confirm}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onConfirm={confirm}
    >
      {target.kind === "liability" ? (
        <>
          <Field label="Settled by" htmlFor="settle-status">
            <SelectInput id="settle-status" value={settleStatus} onChange={(e) => setSettleStatus(e.target.value as SettleStatus)}>
              <option value="SETTLED_PAYMENT">Payment</option>
              <option value="SETTLED_REPLACEMENT">Replacement</option>
              <option value="WAIVED">Waived</option>
            </SelectInput>
          </Field>
          {settleStatus === "SETTLED_PAYMENT" && (
            <Field label="Receipt No." htmlFor="settle-receipt" optional>
              <TextInput id="settle-receipt" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} placeholder="OR-000123" />
            </Field>
          )}
          <Note icon={Receipt} tone="slate">Settling the liability lifts the student's hold and the approving instructor's freeze for this loan.</Note>
        </>
      ) : target.kind === "mark" ? (
        <Note icon={AlertTriangle} tone="amber">Clearing a mark can change the student's standing.</Note>
      ) : target.kind === "hold" ? (
        <Note icon={Receipt} tone="slate">Lift the hold once the loan is returned or settled.</Note>
      ) : target.kind === "freeze" ? (
        <Note icon={Snowflake} tone="slate">The instructor can approve borrows on mobile again once the freeze is lifted.</Note>
      ) : null}
    </ReasonDialog>
  );
}

function Note({ icon: Icon, tone, children }: { icon: typeof Receipt; tone: "amber" | "slate"; children: React.ReactNode }) {
  const toneClass = tone === "amber" ? "bg-amber-50 text-amber-800" : "bg-slate-50 text-slate-600";
  return (
    <p className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${toneClass}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}
