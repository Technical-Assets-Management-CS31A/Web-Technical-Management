import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useCreateUser } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, TextInput, getErrorMessage } from "./form/FormKit";
import { AccountFields } from "./form/AccountFields";
import { validateAccount, type AccountErrors, type AccountValues } from "./form/accountForm";

// Admins create staff and instructor accounts here (FR-9.2). Students are roster records, not accounts.

type AddUserProps = {
  onClose: () => void;
};

const EMPTY: AccountValues = {
  employeeNo: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "" as AccountValues["role"],
  isEventCoordinator: false,
  defaultRoomId: null,
  status: "ACTIVE",
};

export const AddUsers = ({ onClose }: AddUserProps) => {
  const { mutate, isPending } = useCreateUser();
  const [values, setValues] = useState<AccountValues>(EMPTY);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<AccountErrors>({});
  const [submitError, setSubmitError] = useState("");

  const onChange = <K extends keyof AccountValues>(key: K, value: AccountValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
      // Only instructors carry a default room
      ...(key === "role" && value !== "INSTRUCTOR" ? { defaultRoomId: null } : {}),
    }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: AccountErrors = {
      ...validateAccount(values),
      password: password.length < 8 ? "Password must be at least 8 characters" : undefined,
      confirmPassword: password !== confirmPassword ? "Passwords do not match" : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    mutate(
      {
        employeeNo: values.employeeNo.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        role: values.role,
        isEventCoordinator: values.isEventCoordinator,
        defaultRoomId: values.defaultRoomId,
        password,
      },
      {
        onSuccess: () => {
          showToast.success("Account Created", `${values.firstName} ${values.lastName} can now sign in.`);
          onClose();
        },
        onError: (err) => {
          const message = getErrorMessage(err, "Failed to create account.");
          setSubmitError(message);
          showToast.error("Create Failed", message);
        },
      },
    );
  };

  return (
    <FormDialog
      title="New account"
      subtitle="Staff, custodian or instructor"
      icon={UserPlus}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel="Create account"
      submitTestId="create-account"
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <AccountFields values={values} errors={errors} onChange={onChange} />

      <FormSection title="Password">
        <Field label="Password" htmlFor="account-password" required error={errors.password} hint="At least 8 characters">
          <TextInput id="account-password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }} error={!!errors.password} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" htmlFor="account-confirmPassword" required error={errors.confirmPassword}>
          <TextInput id="account-confirmPassword" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }} error={!!errors.confirmPassword} autoComplete="new-password" />
        </Field>
      </FormSection>

      {values.role === "INSTRUCTOR" && (
        <FormAlert tone="success">Register the instructor's RFID card from their account details after saving.</FormAlert>
      )}
      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
};
