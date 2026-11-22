import { useState } from "react";
import { HandCoins, PackageCheck, Receipt, SearchCheck } from "lucide-react";
import type { LiabilityDto, LoanDto } from "../@types/types";
import { useSettleLiability } from "../hooks/userHooks";
import { useStaffReturnLoan } from "../hooks/loanHooks";
import ReasonDialog from "./ReasonDialog";
import { showToast } from "./AppToast";
import { Field, TextInput, getErrorMessage } from "./form/FormKit";
import {
  foundNeedsReturn,
  settlementRequest,
  validateSettlement,
  type SettlementErrors,
  type SettlementOutcome,
} from "../lib/loanDetail";
import { LOAN_DETAIL_CONTENT } from "../constants/loanDetailContent";

// FR-6.7 / FR-6.8 / US-10: record how a loan's liability was settled (paid, replaced or found), with a note.

const T = LOAN_DETAIL_CONTENT.settleDialog;

const OUTCOME_ICON: Record<SettlementOutcome, typeof Receipt> = {
  PAID: HandCoins,
  REPLACED: PackageCheck,
  FOUND: SearchCheck,
};

export default function LiabilitySettleDialog({
  loan,
  liability,
  onClose,
}: {
  loan: Pick<LoanDto, "id" | "loanNo" | "status" | "asset">;
  liability: LiabilityDto;
  onClose: () => void;
}) {
  const settle = useSettleLiability();
  const staffReturn = useStaffReturnLoan();
  // A damage liability is for an item that came back broken, so "found" does not apply.
  const outcomes: SettlementOutcome[] = liability.reason === "DAMAGE" ? ["PAID", "REPLACED"] : ["PAID", "REPLACED", "FOUND"];
  const [outcome, setOutcome] = useState<SettlementOutcome>("PAID");
  const [receiptNo, setReceiptNo] = useState("");
  const [amount, setAmount] = useState(liability.amount.toFixed(2));
  const [errors, setErrors] = useState<SettlementErrors>({});

  const isSubmitting = settle.isPending || staffReturn.isPending;

  const submit = (note: string) => {
    const form = { outcome, receiptNo, amount, note };
    const found = validateSettlement(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const doSettle = (afterReturn: boolean) =>
      settle.mutate(
        { id: liability.id, data: settlementRequest(form, liability.amount) },
        {
          onSuccess: () => {
            showToast.success(T.successTitle, T.success(T.outcomes[outcome].label, loan.asset.assetCode));
            onClose();
          },
          onError: (err) =>
            showToast.error("Not Settled", afterReturn ? T.returnedButNotSettled : getErrorMessage(err, T.error)),
        },
      );

    // Found and still MISSING: close the loan first so the asset is back in storage, then waive the liability.
    if (foundNeedsReturn(form, loan)) {
      staffReturn.mutate(
        { id: loan.id, data: { note: `Item found: ${note}` } },
        {
          onSuccess: () => doSettle(true),
          onError: (err) => showToast.error("Not Settled", getErrorMessage(err, T.error)),
        },
      );
    } else {
      doSettle(false);
    }
  };

  return (
    <ReasonDialog
      title={T.title}
      subtitle={`${loan.asset.assetCode} · ${loan.loanNo}`}
      confirmLabel={T.confirm}
      tone="success"
      fieldLabel={T.noteLabel}
      placeholder={T.notePlaceholder}
      hint={T.noteHint}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onConfirm={submit}
    >
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700">
          {T.outcome} <span className="text-rose-500">*</span>
        </legend>
        <div className={`grid gap-2 ${outcomes.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {outcomes.map((o) => {
            const Icon = OUTCOME_ICON[o];
            const selected = outcome === o;
            return (
              <label
                key={o}
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors ${
                  selected ? "border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="settle-outcome"
                  value={o}
                  checked={selected}
                  onChange={() => { setOutcome(o); setErrors({}); }}
                  className="sr-only"
                />
                <span className={`flex items-center gap-2 font-medium ${selected ? "text-blue-700" : "text-slate-800"}`}>
                  <Icon className="h-4 w-4" />
                  {T.outcomes[o].label}
                </span>
                <span className="text-xs text-slate-500">{T.outcomes[o].description}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {outcome === "PAID" && (
        <Field label={T.receipt} htmlFor="settle-receipt" required error={errors.receiptNo}>
          <TextInput
            id="settle-receipt"
            value={receiptNo}
            maxLength={40}
            onChange={(e) => { setReceiptNo(e.target.value); setErrors((x) => ({ ...x, receiptNo: undefined })); }}
            error={!!errors.receiptNo}
            placeholder={T.receiptPlaceholder}
          />
        </Field>
      )}

      {outcome !== "FOUND" && (
        <Field label={T.amount} htmlFor="settle-amount" error={errors.amount} hint={T.amountHint}>
          <TextInput
            id="settle-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setErrors((x) => ({ ...x, amount: undefined })); }}
            error={!!errors.amount}
          />
        </Field>
      )}

      {outcome === "FOUND" && (
        <p className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <SearchCheck className="mt-0.5 h-4 w-4 shrink-0" />
          {loan.status === "MISSING" ? T.foundReturnNote : T.foundReturnedNote}
        </p>
      )}

      <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <Receipt className="mt-0.5 h-4 w-4 shrink-0" />
        {T.lifts}
      </p>
    </ReasonDialog>
  );
}
