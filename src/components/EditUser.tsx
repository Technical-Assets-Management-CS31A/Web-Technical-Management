import React, { useState } from "react";
import { UserPen } from "lucide-react";
import type { UserDto } from "../@types/types";
import { useUpdateUser } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { FormAlert, FormDialog, getErrorMessage } from "./form/FormKit";
import { AccountFields } from "./form/AccountFields";
import { validateAccount, type AccountErrors, type AccountValues } from "./form/accountForm";

type EditUserProps = {
  onClose(): void;
  user: UserDto;
};

export default function EditUser({ user, onClose }: EditUserProps) {
  const { mutate, isPending } = useUpdateUser();
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<AccountErrors>({});

  const [values, setValues] = useState<AccountValues>({
    employeeNo: user.employeeNo ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    role: user.role,
    isEventCoordinator: user.isEventCoordinator,
    defaultRoomId: user.defaultRoomId,
    status: user.status,
  });

  const onChange = <K extends keyof AccountValues>(key: K, value: AccountValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "role" && value !== "INSTRUCTOR" ? { defaultRoomId: null } : {}),
    }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next = validateAccount(values);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    mutate(
      {
        id: user.id,
        data: {
          ...values,
          employeeNo: values.employeeNo.trim(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
        },
      },
      {
        onSuccess: () => {
          showToast.success("Account Updated", "The account was updated successfully.");
          onClose();
        },
        onError: (err) => {
          const message = getErrorMessage(err, "Failed to update account.");
          setSubmitError(message);
          showToast.error("Update Failed", message);
        },
      },
    );
  };

  return (
    <FormDialog
      title="Edit account"
      subtitle={`${user.firstName} ${user.lastName}`}
      icon={UserPen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <AccountFields values={values} errors={errors} onChange={onChange} showStatus />
      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
